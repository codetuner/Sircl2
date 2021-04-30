/////////////////////////////////////////////////////////////////
// Sircl 2.0 - Core
// www.getsircl.com
// Copyright (c) 2019-2021 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Key features:
// - Leverages serverside coding with any language/framework
// - Easy learning
// - Designer friendly, no coding in design, separation of concerns
//   Required skills: html, adding classes and attributes, urls, css selectors
// - No Javascript coding required
// - SPA support, loading via Ajax
// - Routing / browser history support
// - Dirty forms support
// - Dialogs support
// - Bootstrap 4 & 5
// - Extensible
// - 

// Coding conventions:
// - Within selectors, write tagnames capitalized, i.e: "A[href]".
// - Variablenames holding selector strings end with '$', i.e: var selector$ = ".class";
// - Variablenames holding jQuery selection objects start with '$', i.e: var $selection = $(".class");
// - Strings are surrounded by double-quotes.

// Todo:
// * Must:
// - Collapse "notch" to change with hidden/unhidden style. Also support Bootstraps "Collapse".
// - 
// * Should:
// - ondrag / ondrop event-actions
// - Store settings in LocalStorage/SessionStorage/Cookies, i.e. to remember cookie preferences or other. Ability to clear settings.
// - Use LocalStorage/SessionStorage as cache for partial views
// - 
// * Could:
// - Character count feedback (as counter, remaining counter or progressbar)
// - Formatting numbers and setting time in local timezone
// - 
// * Examples for extensions:
// - Extension to return timezone/local time and number formatting in headers (only on POST requests?)
// - Countdown timer with timer action
// - 
// * Not:
// - Keep-Alive
// - 
// - 
// - 
// - 

//#region Prerequisites

// Check JQuery is installed:
if (typeof jQuery === "undefined") console.error("Sircl requires jQuery to be executed before Sircl libraries. Please add the jQuery script or move it before Sircl scripts.");

//#endregion

//#region jQuery Overrides

//$.ajaxSetup({
//    cache: false
//});

// Form submit() overwrite:
sircl_originalSubmit = HTMLFormElement.prototype.submit;
HTMLFormElement.prototype.submit = function (event) {

    // Form submission with target "_*" is always handled natively:
    if (sircl.ext.isInternalTarget(this.getAttribute("target") || "*") === false) {
        // Navigate link through default behavior
        sircl_originalSubmit.apply(this, arguments);
        return;
    } else {
        // Forward to the server side rendering handler:
        var $trigger = (this._formTrigger) ? $(this._formTrigger) : $(this);
        sircl._submitForm($trigger, $(this), event);
    }
}

// jQuery html() override:
sircl_originalJqHtml = $.fn.html;
$.fn.html = function (htmlStringOrFx) {
    var $t = this;
    if (htmlStringOrFx === undefined) {
        return sircl_originalJqHtml.call($t);
    } else {
        $t.each(function () { sircl._beforeUnload(this); });
        sircl_originalJqHtml.call($t, htmlStringOrFx);
        if (htmlStringOrFx !== null) {
            $t.each(function () { sircl._afterLoad(this); });
        }
    }
};

// jQuery load() override:
sircl_originalJqLoad = $.fn.load;
$.fn.load = function (url, data, callback) {
    // Build request data:
    var req = {
        $trigger: $(this),
        $initialTarget: $(this),
        action: url,
        method: "get",
        enctype: null,
        formData: data,
    };

    // Process submission:
    sircl._processRequest(req, callback);
};

// Add a jQuery "hasAttr(name)" function:
$.fn.hasAttr = function (name) {
    return this.attr(name) !== undefined;
};

//#endregion

//#region Sircl root object

// Sircl root object:
if (typeof sircl === "undefined") sircl = {};
sircl.version = 2.0;
console.info("Sircl v." + sircl.version+ " running.");

//#endregion

//#region Miscellaneous settings

sircl.html_spinner = '<i class="sircl-spinner sircl-spinning"></i> ';

sircl.$mainTargetSelector = ".main-target";

//#endregion

//#region Sircl extensions library

sircl.ext = {};

/**
 * Returns the first element of the given array, or null if array undefined or empty.
 * @param {any} array The array.
 */
sircl.ext.firstOrNull = function (array) { if (array) { if (array.length > 0) return array[0]; else return null; } else return null; };

/**
 * Get current visible state or set visible state of given element or selector.
 * @param {any} elementOrSelector Element or selector.
 * @param {any} visible True to make it visible, false to make it hidden. Absent to get current visible state.
 */
sircl.ext.visible = function (elementOrSelector, visible) {
    if (visible === undefined) {
        return !$(elementOrSelector).hasAttr("hidden");
    } else if (visible) {
        $(elementOrSelector).removeAttr("hidden");
    } else {
        $(elementOrSelector).attr("hidden", "hidden");
    }
};

/**
 * Returns the id of the given element or selector.
 * @param {any} elementOrSelector Element or selector.
 * @param {any} createIdIfMissing True to create and id if none exists yet.
 */
sircl.ext.getId = function (elementOrSelector, createIdIfMissing) {
    var $elements = $(elementOrSelector);
    if ($elements.length > 0) {
        var id = $elements[0].id;
        if ((id === "" || id === undefined) && createIdIfMissing === true) {
            id = $elements[0].id = "id-" + new Date().getTime();
        }
        return id;
    } else {
        return null;
    }
};

/**
 * Returns the main target of the page.
 */
sircl.ext.$mainTarget = function () {
    var $mainTarget = $(sircl.$mainTargetSelector);
    return $mainTarget;
}

/**
 * Returns whether the value should be interpreted as an internal target as opposed to an external target to a browser window, frame or tab.
 * Targets starting with any of these characters is considered internal: #, ., *, :, <, >, &, [, space.
 * External targets typically start with an underscore (as _self, _top, _blank) or are alphanumeric.
 * @param {any} targetValue
 */
sircl.ext.isInternalTarget = function (targetValue) {
    if (targetValue == null || targetValue.length == 0) return false;
    switch (targetValue.charAt(0)) {
        case "#": return true;
        case ".": return true;
        case "*": return true;
        case ":": return true;
        case "<": return true;
        case ">": return true;
        case "&": return true;
        case "[": return true;
        case " ": return true;
        default: return false;
    }
};

/**
 * Convenience function, inverse of isInternalTarget.
 * @param {any} targetValue
 */
sircl.ext.isExternalTarget = function (targetValue) { return !sircl.ext.isInternalTarget(targetValue); };

/**
 * Resolves an absolute or relative selector in the given context.
 * @param {any} $context Context in which to resolve the selector.
 * @param {any} selector$ Absolute or relative selector string.
 */
sircl.ext.$select = function ($context, selector$) {
    if (selector$ === undefined || selector$ === null) {
        return $([]);
    } else if (selector$.indexOf("|") >= 0 && selector$.indexOf("|=") < selector$.indexOf("|")) { // Break on "|" but not on "|=" as in https://api.jquery.com/attribute-contains-prefix-selector/
        var breakpos = selector$.indexOf("|");
        return sircl.ext.$select(sircl.ext.$select($context, selector$.substr(0, breakpos)), selector$.substr(breakpos + 1));
    } else {
        var selectorParts$ = selector$.split(",");
        var $result = $([]);
        for (var i = 0; i < selectorParts$.length; i++) {
            var sel$ = selectorParts$[i].trim();
            if (sel$.length == 0) {
                // Ignore
            } else if (sel$ === ":this") {
                $result = $result.add($context);
            } else if (sel$ === ":form") {
                if ($context.hasAttr("form")) {
                    $result = $result.add(sircl.ext.$select($context, $context.attr("form")));
                } else {
                    $result = $result.add($context.closest("FORM"));
                }
            } else if (sel$.indexOf(">") === 0) {
                $result = $result.add($context.find(sel$.substr(1)));
            } else if (sel$.indexOf("&gt;") === 0) {
                $result = $result.add($context.find(sel$.substr(4)));
            } else if (sel$.indexOf("<") === 0) {
                $result = $result.add($context.closest(sel$.substr(1)));
            } else if (sel$.indexOf("&lt;") === 0) {
                $result = $result.add($context.closest(sel$.substr(4)));
            } else {
                $result = $result.add($(sel$));
            }
        }
        return $result;
    }
};

/**
 * Returns the value in CSS escaped format.
 * @param {any} value
 */
sircl.ext.cssEscape = function (value) {
    try {
        return CSS.escape(value);
    } catch (ex) {
        // MSIE does noet support CSS.escape:
        return value
            .replace(/\./g, "\\.")
            .replace(/\,/g, "\\.")
            .replace(/\:/g, "\\.")
            .replace(/\*/g, "\\.")
            .replace(/\#/g, "\\.")
            .replace(/\(/g, "\\.")
            .replace(/\)/g, "\\.")
            .replace(/\[/g, "\\[")
            .replace(/\]/g, "\\]");
    }
};

/**
 * Helper method to perform an action on given scopes.
 * @param {any} $scope A scope.
 * @param {string} expression An expression consisting of comma-separated parts that may contain an "on" clausule.
 * @param {scopedDoCallback} action The action to perform.
 */
sircl.ext.scopedDo = function ($scope, expression, action) {
    var part0 = null;
    expression.split(",").forEach(function (exprItem) {
        var parts = exprItem.split(" on ").map(function (value) { return value.trim(); });
        if (parts.length === 1) {
            if (part0 == null) {
                action($scope, parts[0]);
            } else {
                action(sircl.ext.$select($scope, parts[0]), part0);
            }
        } else {
            action(sircl.ext.$select($scope, parts[1]), part0 = parts[0]);
        }
    });
};

/**
  * Add class to a given scope.
  * @param {any} $scope
  * @param {string} classExpression Class name to add. Can contain an "on" clausule. Supports comma-separated list. I.e. "active, highlighted on < li" : make scope active and closest li highlighted.
  */
sircl.ext.addClass = function ($scope, classExpression) {
    sircl.ext.scopedDo($scope, classExpression, function ($s, c) { $s.addClass(c); })
};

/**
 * Remove class from a given scope.
 * @param {any} $scope
 * @param {string} classExpression Class name to remove. Can contain an "on" clausule. Supports comma-separated list. I.e. "active, highlighted on < li" : remove active from scpe and highlighted from closest li.
 */
sircl.ext.removeClass = function ($scope, classExpression) {
    sircl.ext.scopedDo($scope, classExpression, function ($s, c) { $s.removeClass(c); })
};

/**
 * Toggle class on a given scope.
 * @param {any} $scope
 * @param {string} classExpression Class name to toggle. Can contain an "on" clausule. Supports comma-separated list. I.e. "active, highlighted on < li" : toggle active on scope and highlighted on closest li.
 */
sircl.ext.toggleClass = function ($scope, classExpression) {
    sircl.ext.scopedDo($scope, classExpression, function ($s, c) { $s.toggleClass(c); })
};

/**
 * Shows an alert message.
 * @param {any} $subject Sender of the alert request.
 * @param {any} message Message to show.
 * @param {any} event Event that triggered the confirm request.
 * @param {any} allowAsync Whether async handling (returning before the alert is closed) is allowed.
 */
sircl.ext.alert = function ($subject, message, event, allowAsync) {
    window.alert(message);
};

/**
 * Shows a confirm message.
 * @param {any} $subject Sender of the confirm request.
 * @param {any} message Message to show.
 * @param {any} event Event that triggered the confirm request.
 * @returns True if confirmed, false otherwise.
 */
sircl.ext.confirm = function ($subject, message, event, callback) {
    if (window.confirm(message)) {
        return true;
    } else {
        return false;
    }
};

/**
 * Retrieves the value of the named querystring parameter.
 * @param {any} name Name of the querystring parameter.
 */
sircl.ext.getUrlParameter = function (name) {
    // Note: in v3 replace this by URLSearchParams (not supported by MSIE).
    name = name.replace(/[\[]/g, '\\[').replace(/[\]]/g, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

//#endregion

//#region Web load functions

sircl.urlParser = /^(.*?)(\?.*?)?(\#.*)?$/;

/**
 * Request pipeline handler arrays.
 */
sircl._requestHandlers = {};
sircl._requestHandlers.beforeSend = [];
sircl._requestHandlers.afterSend = [];
sircl._requestHandlers.onError = [];
sircl._requestHandlers.beforeRender = [];
sircl._requestHandlers.afterRender = [];

/**
 * Add a request pipeline handler for "beforeSend", "afterSend", "onError", "beforeRender" or "afterRender".
 */
sircl.addRequestHandler = function (phase, handler) {
    this._requestHandlers[phase].push(handler);
};

/**
 * Initiates an Ajax request to load an URL.
 * @param {any} $trigger The href holding element triggering the request.
 * @param {any} url The URL to be requested.
 * @param {any} loadComplete Optional. Called when load is complete.
 */
sircl._loadUrl = function ($trigger, url, loadComplete) {
    // Build request data:
    var req = {
        $trigger: $trigger,
        action: url,
        method: "get",
        accept: $trigger.attr("type")
    };

    // Process submission:
    this._processRequest(req, loadComplete);
};

/**
 * Initiates an Ajax request submitting a form.
 * @param {any} $form The form to be submitted.
 * @param {any} $trigger The trigger (submit button) triggering the request.
 * @param {any} loadComplete Optional. Called when load is complete.
 */
sircl._submitForm = function ($trigger, $form, event, loadComplete) {
    // Build request data:
    var req = {
        $form: $form,
        $trigger: $trigger,
        event: event,
        action: ($trigger.attr("formaction") || $form.attr("action") || window.location.href),
        method: ($trigger.attr("formmethod") || $form.attr("method") || "get").toLowerCase(),
        enctype: ($trigger.attr("formenctype") || $form.attr("enctype") || "application/x-www-form-urlencoded").toLowerCase(),
        charset: $form.attr("accept-charset"),
        getAttr: function (attrName) {
            return (this.$trigger.attr(attrName) || this.$form.attr(attrName));
        }
    };

    // Check for a target:
    if ($trigger.hasAttr("formtarget")) {
        req.$initialTarget = sircl.ext.$select($trigger, $trigger.attr("formtarget"))
    }

    // Encode form data:
    if (req.method == "post") {
        if (req.enctype == "multipart/form-data") {
            req.formData = new FormData($form[0]);
            if ($trigger != null && $trigger.attr("name") != null) req.formData.append($trigger.attr("name"), $trigger.attr("value"));
        } else if (req.enctype == "text/plain") {
            req.formData = $form.serialize(); // TODO: test and eventually change, should be one line per variable, unencoded
            if ($trigger != null && $trigger.attr("name") != null) req.formData = encodeURIComponent($trigger.attr("name")) + "=" + encodeURIComponent($trigger.attr("value")) + "&" + req.formData;
        } else {
            req.formData = $form.serialize();
            if ($trigger != null && $trigger.attr("name") != null) req.formData = encodeURIComponent($trigger.attr("name")) + "=" + encodeURIComponent($trigger.attr("value")) + "&" + req.formData;
        }
    } else {
        // Extend req.action url with serialized form parameters, keeping hash (if any) at the end:
        var actionParsed = sircl.urlParser.exec(req.action); // [1]=base url, [2]=query string, [3]=hash
        req.action = actionParsed[1] + ((actionParsed[2]) ? actionParsed[2] + "&" : "?") + $form.serialize() + ((actionParsed[3]) ? actionParsed[3] : "");
        req.formData = null;
    }

    // Process submission:
    this._processRequest(req, loadComplete);
};

/**
 * Processes the given Ajax request.
 * @param {any} req A request data object.
 * @param {any} loadComplete Optional callback called after full processing.
 */
sircl._processRequest = function (req, loadComplete) {
    // Determine target:
    if (req.$initialTarget == null || req.$initialTarget.length == 0) {
        if (req.$trigger != null && req.$trigger.length > 0) {
            var $targetHolder = req.$trigger.closest("[target]");
            if ($targetHolder.length > 0) {
                req.$initialTarget = sircl.ext.$select($targetHolder, $targetHolder.attr("target"));
            }
        }
    }
    if (req.$initialTarget == null || req.$initialTarget.length == 0) req.$initialTarget = sircl.ext.$mainTarget();
    req.$finalTarget = req.$initialTarget;
    req.targetHasChanged = false;

    // Add getAttr(attrName) function:
    if (req.getAttr == null) {
        req.getAttr = function (attrName) {
            return (this.$trigger != null) ? this.$trigger.attr(attrName) : null;
        };
    }

    // Retrieve caching info:
    var cache = false;
    if (req.$trigger != null && req.$trigger.attr("browser-cache") != null) {
        cache = (req.$trigger.attr("browser-cache").toLowerCase() == "on");
    } else if (req.$form != null && req.$form.attr("browser-cache") != null) {
        cache = (req.$form.attr("browser-cache").toLowerCase() == "on");
    }

    // Configure HTTP request object:
    req.xhr = new XMLHttpRequest();
    req.xhr.open(req.method, req.action);
    if (typeof req.formData === "object") {
        // Leave Content-Type to be set by FormData.
    } else if (req.enctype == null && req.charset == null) {
        req.xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    } else if (req.enctype == null && req.charset != null) {
        req.xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded" + "; charset=" + req.charset);
    } else if (req.enctype != null && req.charset == null) {
        req.xhr.setRequestHeader("Content-Type", req.enctype);
    } else {
        req.xhr.setRequestHeader("Content-Type", req.enctype + "; charset=" + rec.charset);
    }
    if (cache == false) {
        req.xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
        req.xhr.setRequestHeader("Pragma", "no-cache");
    }
    req.xhr.setRequestHeader("Accept", (req.accept) ? req.accept : "text/html");
    req.xhr.setRequestHeader("X-Sircl-Request-Type", "Partial");

    // Start processing:
    var processor = new SirclRequestProcessor(loadComplete);
    processor.next(req);
};

/**
 * SirclRequestProcessor class handles request pipeline for a web request.
 * @param {any} sircl
 */
function SirclRequestProcessor(loadComplete) {
    this._steps = [];
    this._steps = this._steps.concat(sircl._requestHandlers.beforeSend);
    this._sendIndex = this._steps.length;
    this._steps.push(this._send);
    this._steps = this._steps.concat(sircl._requestHandlers.afterSend);
    this._processIndex = this._steps.length;
    this._steps.push(this._process);
    this._steps = this._steps.concat(sircl._requestHandlers.beforeRender);
    this._renderIndex = this._steps.length;
    this._steps.push(this._render);
    this._steps = this._steps.concat(sircl._requestHandlers.afterRender);
    this._loadComplete = loadComplete; // Callback of the load() method.
};

/**
 * Get or set the sender function. Allows overwriting the regular sender function
 * i.e. to retrieve pagedata from cache.
 * @param {any} value If given, new sender function, of not, returns the current sender function.
 */
SirclRequestProcessor.prototype.send = function (value) {
    if (arguments.length == 0) {
        return this._steps[this._sendIndex];
    } else {
        this._steps[this._sendIndex] = value;
    }
};

/**
 * Get or set the process function. Allows overwriting the regular process function.
 * @param {any} value If given, new process function, of not, returns the current process function.
 */
SirclRequestProcessor.prototype.process = function (value) {
    if (arguments.length == 0) {
        return this._steps[this._processIndex];
    } else {
        this._steps[this._processIndex] = value;
    }
};

/**
 * Get or set the render function. Allows overwriting the regular render function.
 * @param {any} value If given, new render function, of not, returns the current render function.
 */
SirclRequestProcessor.prototype.render = function (value) {
    if (arguments.length == 0) {
        return this._steps[this._renderIndex];
    } else {
        this._steps[this._renderIndex] = value;
    }
};

SirclRequestProcessor.prototype._send = function (req) {
    var processor = this;
    // If abort requested, set aborted and proceed with next.
    if (req.abort == true) {
        req.succeeded = false;
        req.aborted = true;
        processor.next(req);
        return;
    }
    // Otherwise, add after-send event handlers:
    req.xhr.addEventListener("abort", function (e) {
        // Keep track of the event and response on the req object:
        req.loadEvent = e;
        req.status = req.xhr.status;
        req.statusText = req.xhr.statusText;
        req.responseText = req.xhr.responseText;
        // Proceed with next (afterSend):
        req.aborted = true;
        req.succeeded = false;
        processor.next(req);
    });
    req.xhr.addEventListener("error", function (e) {
        // Keep track of the event and response on the req object:
        req.loadEvent = e;
        req.status = req.xhr.status;
        req.statusText = req.xhr.statusText;
        req.responseText = req.xhr.responseText;
        // Proceed with next (afterSend):
        req.aborted = false;
        req.succeeded = false;
        processor.next(req);
    });
    req.xhr.addEventListener("load", function (e) {
        // Keep track of the event and response on the req object:
        req.loadEvent = e;
        req.status = req.xhr.status;
        req.statusText = req.xhr.statusText;
        req.responseText = req.xhr.responseText;
        // Check for reload sections:
        var reloadSection = req.xhr.getResponseHeader("X-Sircl-Load");
        // Execute additional reload requests:
        if (reloadSection != null) {
            $(reloadSection).filter("[onload-load]").each(function () {
                $(this).load($(this).attr("onload-load"));
            });
        }
        // If a Location header is given, redirect to that location:
        var newLocation = req.xhr.getResponseHeader("Location"); // Redirect
        if (newLocation !== null) {
            // If a "_self" target is given, let browser window load the new location:
            if (req.xhr.getResponseHeader("X-Sircl-Target") == "_self") {
                window.location.href = newLocation;
            } else {
                // Else, check redirect count (avoid endless redirection loops):
                if (req.redirects === undefined) req.redirects = 0;
                req.redirects++;
                if (req.redirects > 20) {
                    sircl.handleError("S104", "Too many redirects.", req);
                    req.aborted = true;
                    req.succeeded = false;
                    processor.next(req);
                } else {
                    // Then request for new location:
                    req.action = newLocation;
                    req.method = "get";
                    req.xhr.open(req.method, req.action);
                    req.xhr.setRequestHeader("Accept", (req.accept) ? req.accept : "text/html");
                    req.xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
                    req.xhr.setRequestHeader("Pragma", "no-cache");
                    req.xhr.setRequestHeader("X-Sircl-Request-Type", "Partial");
                    req.xhr.send();
                    // Xhr's load event should be fired again (recursively).
                }
            }
        } else {
            // Else, check for target override:
            var newTarget$ = req.xhr.getResponseHeader("X-Sircl-Target");
            if (newTarget$ == "_self") {
                if (req.method == "get") {
                    req.$finalTarget = null;
                    req.targetHasChanged = true;
                } else {
                    console.warn("X-Sircl-Target response header value '_self' is only vaid for 'get' requests.");
                }
            } else if (newTarget$ == "main") {
                req.$finalTarget = sircl.ext.$mainTarget();
                req.targetHasChanged = true;
            } else if (newTarget$ != null) {
                req.$finalTarget = sircl.ext.$select(req.$trigger, newTarget$);
                req.targetHasChanged = true;
            }
            // Then for document title:
            req.documentTitle = req.xhr.getResponseHeader("X-Sircl-Document-Title");
            // Then for alert message header:
            req.alertMsg = req.xhr.getResponseHeader("X-Sircl-Alert-Message");
            // Then for history header:
            var history = req.xhr.getResponseHeader("X-Sircl-History");
            if (history == "back") {
                req.action = "history:back";
            } else if (history == "back-uncached") {
                req.action = "history:back-uncached";
            } else if (history == "refresh") {
                req.action = "history:refresh";
            }
            // Then for history-replace header:
            req.historyReplace = req.xhr.getResponseHeader("X-Sircl-History-Replace");
            // Then, if successful:
            if (req.xhr.status <= 299) {
                // Proceed with next (afterSend):
                req.aborted = false;
                req.succeeded = true;
                processor.next(req);
            } else {
                // Else proceed with error (onError):
                req.aborted = false;
                req.succeeded = false;
                processor.error(req);
            }
        }
    });
    // Send the request:
    req.xhr.send(req.formData);
};

SirclRequestProcessor.prototype._process = function (req) {
    // Handle 'History-Replace' header if any:
    if (req.historyReplace) {
        var state = window.history.state;
        if (state != null) {
            state.url = req.historyReplace;
        }
        window.history.replaceState(state, document.title, req.historyReplace);
    }
    // Handle 'Alert-Message' header if any:
    if (req.alertMsg) sircl.ext.alert(req.$trigger, req.alertMsg, null, false);
    // Only proceed with next (rendering) if succeeded and not "204":
    if (req.succeeded) {
        // Check for history navigation:
        if (req.action == "history:back") {
            window.history.back();
        } else if (req.action == "history:back-uncached") {
            sircl.ext.$mainTarget().addClass("sircl-history-nocache-once");
            window.history.back();
        } else if (req.action == "history:refresh") {
            // If X-Sircl-Target=_self header was set, or in MultiPage mode, perform a full page refresh:
            if (sircl.singlePageMode == false || req.$finalTarget == null) {
                window.location.href = req.action;
            } else {
                // Else refresh main target:
                //sircl.ext.$mainTarget().load(window.location.href);
                sircl._processRequest({
                    $trigger: null,//sircl.ext.$mainTarget(),
                    $initialTarget: sircl.ext.$mainTarget(),
                    action: window.location.href,
                    method: "get",
                    _historyMode: "skip"
                });
            }
        } else if (req.status != "204") {
            // Proceed with next (beforeRender):
            this.next(req);
        }
    } else {
        sircl.handleError("S100", "Error processing request.", req);
    }
};

SirclRequestProcessor.prototype._render = function (req) {
    var $realTarget = req.$finalTarget;
    var realResponseText = req.responseText;
    // Apply sub-target if any:
    var subTarget$ = req.getAttr("sub-target");
    var $subTarget = req.$finalTarget.find(subTarget$);
    // If the sub-target is found in the finalTarget:
    if (subTarget$ != null && $subTarget.length > 0) {
        // Parse the responseText:
        var $response = $('<div/>').append(req.responseText);
        var subResponseText = $response.find(subTarget$).html();
        // If the responseText also contains the sub-target:
        if (subResponseText != null) {
            // Use the sub-target instead, and use the sub-responseText:
            $realTarget = $subTarget;
            realResponseText = subResponseText;
        }
    }
    // Set document title:
    if (req.documentTitle != null) {
        window.document.title = req.documentTitle;
    }
    // Render, applying correct render mode:
    req.renderMode = req.xhr.getResponseHeader("X-Sircl-Render-Mode");
    if (req.renderMode === "append") {
        // If append mode, append responseText and force afterLoad:
        $realTarget.append(realResponseText);
        $realTarget.each(function () { sircl._afterLoad(this); });
    } else {
        // Else, replace html of target:
        $realTarget.html(realResponseText);
    }
    // Make sure target is visible:
    req.$finalTarget.each(function () { sircl.ext.visible(this, true); });
    // Proceed with next (afterRender):
    this.next(req);
};

SirclRequestProcessor.prototype.next = function (req) {
    // If steps available, execute next step:
    if (this._steps.length > 0) {
        var step = this._steps[0];
        this._steps.splice(0, 1);
        try {
            step.apply(this, arguments);
        } catch (ex) {
            console.error(ex);
            sircl.handleError("S100", "Error executing a RequestProcessor step: " + ex, { exception: ex, fx: step });
            this.next(req);
        }
    } else if (this._loadComplete) {
        // Else, if loadComplete defined, execute it:
        this._loadComplete(req.xhr.responseText, req.xhr.statusText, req.xhr);
    }
};

SirclRequestProcessor.prototype.error = function (req) {
    // Inject onError handlers in place:
    this._steps = sircl._requestHandlers.onError.concat(this._steps);
    // Then, proceed with next step:
    this.next(req);
};

// On document ready, install event handlers to handle hyperlinks and form submissions:
$(document).ready(function () {

    // Detect SinglePage modus:
    sircl.singlePageMode = $(sircl.$mainTargetSelector).length > 0;
    console.info("sircl.singlePageMode = " + sircl.singlePageMode + "");

    /// Any element having a href attribute (and no download attribute):
    /// Handles special href values
    $(document.body).on("click", "*[href]:not([download])", function (event) {
        var href = this.getAttribute("href");
        if (href === "null" || href === "") {
            // Ignore
        } else if (href === "history:back") {
            window.history.back();
        } else if (href === "history:back-uncached") {
            sircl.ext.$mainTarget().addClass("sircl-history-nocache-once");
            window.history.back();
        } else if (href === "history:refresh") {
            location.reload();
        } else if (href.indexOf("alert:") === 0) {
            sircl.ext.alert($(this), href.substr(6), null, true);
        } else if (href.indexOf("javascript:") === 0) {
            var nonce = this.getAttribute("nonce");
            if (nonce) {
                jQuery.globalEval(href.substr(11), { nonce: nonce });
            } else {
                jQuery.globalEval(href.substr(11));
            }
        } else if (this.tagName === "A" && href.indexOf("#") === 0) {
            return; // navigate link through default behavior
        } else if (href.indexOf("#") === 0) {
            window.location.hash = href;
        } else {
            var target = this.getAttribute("target");
            if ((target == null && !sircl.singlePageMode) || (target != null && sircl.ext.isExternalTarget(target))) {
                if (this.tagName === "A") {
                    return; // navigate link through default behavior
                } else if (target == null) {
                    window.location.href = href;
                } else {
                    window.open(href, target);
                }
            } else {
                // Forward to the server side rendering handler:
                sircl._loadUrl($(this), href);
            }
        }
        // If not returned earlier, stop event propagation:
        event.preventDefault();
        event.stopPropagation();
    });

    /// Clicking a submit element may submit a form:
    $(document.body).on("click", "form *:submit, *:submit[form]", function (event) {
        // To not interfer with form validation, we let default behavior happen.
        // But we want to know the form trigger element, and unfortunately there's no but a dirty way to get it...
        var form = (this.hasAttribute("form")) ? document.getElementById(this.getAttribute("form")) : $(this).closest("FORM")[0];
        clearTimeout(form._formTriggerTimer);
        form._formTrigger = this;
        form._formTriggerTimer = setTimeout(function () { form._formTrigger = null; }, 700);
    });

    /// Submitting a form:
    $(document.body).on("submit", "form:not([download]):not([method=dialog])", function (event) {
        var $trigger = (this._formTrigger) ? $(this._formTrigger) : $(this);
        var target = null;
        var targetHolder$ = $trigger.closest("[target]");
        if (targetHolder$.length > 0) target = targetHolder$.attr("target");
        if ((target == null && !sircl.singlePageMode) || (target != null && sircl.ext.isExternalTarget(target))) {
            return; // navigate link through default behavior
        } else {
            // Forward to the server side rendering handler:
            sircl._submitForm($trigger, $(this), event);
            event.preventDefault();
            event.stopPropagation();
        }
    });

    /// Disable ENTER key to submit forms. I.e. useful when multiple submit buttons and first
    /// one is not necessarily the default one.
    /// I.e:
    ///   <form default-submit-button="#save-button" method="post">...</form>
    $(document.body).on("keydown", "FORM[default-submit-button]", function (event) {
        if (event.keyCode == 13) {
            var target = $(this).find($(this).attr("default-submit-button"))[0];
            if (target != null) target.click(); // See: http://goo.gl/lGftqn
            event.preventDefault();
        }
        else if (event.keyCode == 27) {
            var target = $(this).find($(this).attr("default-cancel-button"))[0];
            if (target != null) target.click(); // See: http://goo.gl/lGftqn
            event.preventDefault();
        }
    });

});

//#endregion

//#region Content Ready handlers

/**
 * ContentReadyHandlers are executed before/after updating the content of a web page part.
 */
sircl._contentReadyHandlers = { };
sircl._contentReadyHandlers.before = [];
sircl._contentReadyHandlers.content = [];
sircl._contentReadyHandlers.enrich = [];
sircl._contentReadyHandlers.process = [];

/**
 * Adds a content ready handler.
 * @param {string} phase Phase at which the handler is to be called: "before", "content", "enrich" or "process".
 * @param {any} handler Handler function.
 */
sircl.addContentReadyHandler = function (phase, handler) {
    this._contentReadyHandlers[phase].push(handler);
};

/**
 * Convenience method to add a content ready handler.
 * Either pass a "process" handler, or pass phase ("before", "content", "enrich" or "process") and handler.
 */
function $$() {
    if (arguments.length >= 2)
        sircl.addContentReadyHandler(arguments[0], arguments[1]);
    else
        sircl.addContentReadyHandler("process", arguments[0]);
}

/**
 * Defines an class alias for an attribute with specific value.
 * @param {any} aliasClass$ The class that is the alias.
 * @param {any} attributeName The attribute name.
 * @param {any} attributeValue The default attribute value.
 */
sircl.addAttributeAlias = function (aliasClass$, attributeName, attributeValue) {
    sircl.addContentReadyHandler("enrich", function () {
        $(this).find(aliasClass$).each(function () {
            $(this).attr(attributeName, attributeValue);
        });
    });
};

/**
 * To be called before unloading a web page part.
 * @param {any} scope Element that will be unloaded.
 */
sircl._beforeUnload = function (scope) {
    // Execute all "before" content ready handlers:
    sircl._contentReadyHandlers.before.forEach(function (handler) {
        try {
        handler.call(scope);
        } catch (ex) {
            console.error(ex);
            sircl.handleError("S100", "Error executing a BeforeUnLoad handler: " + ex, { exception: ex, fx: handler });
        }
    });
};

/**
 * To be called after loading a web page part.
 * @param {any} scope Element that saw it's content loaded.
 */
sircl._afterLoad = function (scope) {
    // Add "sircl-content-processing" class:
    $(scope).addClass("sircl-content-processing");
    // Execute all "content" content ready handlers:
    sircl._contentReadyHandlers.content.forEach(function (handler) {
        try {
            handler.call(scope);
        } catch (ex) {
            console.error(ex);
            sircl.handleError("S100", "Error executing an AfterLoad content handler: " + ex, { exception: ex, fx: handler });
        }
    });
    // Execute all "enrich" afterLoad handlers:
    sircl._contentReadyHandlers.enrich.forEach(function (handler) {
        try {
        handler.call(scope);
        } catch (ex) {
            console.error(ex);
            sircl.handleError("S100", "Error executing an AfterLoad enrich handler: " + ex, { exception: ex, fx: handler });
        }
    });
    // Execute all "process" afterLoad handlers:
    sircl._contentReadyHandlers.process.forEach(function (handler) {
        try {
        handler.call(scope);
        } catch (ex) {
            console.error(ex);
            sircl.handleError("S100", "Error executing an AfterLoad process handler: " + ex, { exception: ex, fx: handler });
        }
    });
    // Remove "sircl-content-processing" class:
    $(scope).removeClass("sircl-content-processing");
};

//#endregion

//#region Default Content Ready handlers

$$("content", function () {
    /// <* onload-moveto="selector"> Moves the content to the given selector.
    $(this).find("*[onload-moveto]").each(function () {
        $($(this).attr("onload-moveto")).html($(this).html());
        $(this).html("");
    });
});

$$(function () {
    /// <* document-title="document title"> Sets the document title.
    var documentTitleElement = $(this).find("[document-title]");
    if (documentTitleElement.length > 0) {
        document.title = documentTitleElement[0].getAttribute("document-title");
    };

    // <* autofocus> Fix autofocus for lazy-loaded html.
    $(this).find("*[autofocus]:first").each(function (index) {
        try { this.focus(); } catch (x) { }
        try { this.select(); } catch (x) { }
    });
});

//#endregion

//#region Convenience classes

sircl.addAttributeAlias(".target", "target", ":this");

//#endregion

//#region Error handling

/**
 * Error handlers.
 */
sircl._errorHandlers = [],

/**
 * Add an error handler.
 * Handlers have following arguments: code, message, [data].
 */
sircl.addErrorHandler = function (handler) {
    this._errorHandlers.push(handler);
};

/**
 * Handles an error. Arguments to pass: code, message, [data].
 */
sircl.handleError = function (code, message, data) {
    data = data || {};
    this._errorHandlers.forEach(function (handler) {
        try {
            handler(code, message, data);
        } catch (ex) { }
    });
};

//#endregion

//#region Default error handlers

/**
 * Add a default error handler logging to console.
 */
sircl.addErrorHandler(function (code, message, data) {
    console.error("Sircl " + code + " - " + message, data);
});

//#endregion

//#region History handling

sircl._afterHistoryHandlers = [];

/**
 * Registers an afterHistory handler.
 * @param {any} handler
 */
sircl.addAfterHistoryHandler = function (handler) {
    this._afterHistoryHandlers.push(handler);
};

/**
 * Call afterHistory handlers.
 */
sircl._afterHistory = function () {
    this._afterHistoryHandlers.forEach(function (handler) {
        handler();
    });
};

sircl.addRequestHandler("beforeRender", function (req) {
    // If request is a "get" request on the main target and history handling is not to be skipped:
    if (req._historyMode != "skip" && req.method === "get" && req.$finalTarget.is(sircl.ext.$mainTarget())) {
        // Store the current state in history:
        req._historyMode = req.getAttr("history") || "push";
        req._historyCached = req._historyMode.indexOf("cache") >= 0;
        var initialState = {
            url: window.location.href,
            html: (req._historyCached) ? req.$finalTarget.html() : "",
            cached: req._historyCached
        };
        window.history.replaceState(initialState, document.title, initialState.url);
    }
    this.next(req);
});

sircl.addRequestHandler("afterRender", function (req) {
    if (req._historyMode) {
        // Push or replace new state in history:
        var finalState = {
            url: req.action,
            html: "",
            cached: false
        };
        if (req._historyMode.indexOf("push") >= 0) {
            window.history.pushState(finalState, document.title, finalState.url);
            sircl._afterHistory();
        } else if (req._historyMode.indexOf("replace") >= 0) {
            window.history.replaceState(finalState, document.title, finalState.url);
            sircl._afterHistory();
        }
    }
    this.next(req);
});

$(function () {
    // On browser back or forward:
    window.onpopstate = function (event) {
        var state = event.state;
        var callback = null;
        if (state) {
            if (state.cached && sircl.ext.$mainTarget().hasClass("sircl-history-nocache-once")) {
                // Remove "sircl-history-nocache-once" class:
                sircl.ext.$mainTarget().removeClass("sircl-history-nocache-once");
                // Set caching off:
                state.cached = false;
                // Restore cache after issuing the request:
                callback = function () {
                    var refreshedState = {
                        url: window.location.href,
                        html: sircl.ext.$mainTarget().html(),
                        cached: true
                    };
                    window.history.replaceState(refreshedState, document.title, refreshedState.url);
                    sircl._afterHistory();
                };
            } else {
                callback = function () {
                    sircl._afterHistory();
                };
            }
            if (state.cached) {
                // Retrieve content from cache:
                sircl.ext.$mainTarget().html(state.html);
                sircl._afterHistory();
            } else {
                // Retrieve content by issuing a new request, skipping further history handling:
                sircl._processRequest({
                    $trigger: null,//sircl.ext.$mainTarget(),
                    action: state.url,
                    method: "get",
                    _historyMode: "skip"
                }, callback);
            }
        } else {
            window.history.go(0);
        }
    };

    sircl._afterHistory();
});

//#endregion

//#region Spinner handling

sircl.addRequestHandler("beforeSend", function (req) {
    // Show spinner if any:
    req._spinner = false;
    if (req.$trigger != null && req.$trigger.length == 1 && req.$trigger[0].tagName != "FORM") {
        var $spinners = req.$trigger.find(".spinner");
        if ($spinners.length > 0) {
            req._spinner_to_restore = $spinners[0].outerHTML;
            $spinners[0].outerHTML = sircl.html_spinner;
        }
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function (req) {
    // Hide spinner if any:
    if (req._spinner_to_restore) {
        req.$trigger.find(".sircl-spinner")[0].outerHTML = req._spinner_to_restore;
    }
    // Move to next handler:
    this.next(req);
});

//#endregion

//#region Overlay handling

sircl.addRequestHandler("beforeSend", function (req) {
    // Make overlays visible:
    req.$initialTarget.find(".overlay").each(function () {
        $(this).parent().css("position", "relative");
        sircl.ext.visible(this, true);
    });
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function (req) {
    // Make overlays visible:
    req.$initialTarget.find(".overlay").each(function () {
        sircl.ext.visible(this, false);
    });
    // Move to next handler:
    this.next(req);
});

//#endregion

//#region Loading status handling

sircl.addRequestHandler("beforeSend", function (req) {
    // Set classes to loading state:
    $(document.body).addClass("body-loading");
    req.$initialTarget.addClass("loading");
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function (req) {
    // Reset classes to loading state:
    $(document.body).removeClass("body-loading");
    req.$initialTarget.removeClass("loading");
    // Move to next handler:
    this.next(req);
});

$(document).ready(function () {
    $(window).on("beforeunload", function (event) {
        // Ensure load status items are shown:
        $(document.body).addClass("body-loading");
    });
});

//#endregion

//#region Load progress handling

sircl.addRequestHandler("beforeSend", function (req) {
    req._progressToResetAfterSend = []
    req._progressToHideAfterSend = []
    // Show and add event handler to upload progresses:
    var $uploadProgresses = sircl.ext.$select(req.$initialTarget, req.$initialTarget.attr("upload-progress")).filter("PROGRESS");
    if ($uploadProgresses.length > 0) {
        $uploadProgresses.each(function () {
            // Set initial value:
            this.removeAttribute("value");
            req._progressToResetAfterSend.push(this);
            // Make hidden progresses visible:
            if (!sircl.ext.visible(this)) {
                req._progressToHideAfterSend.push(this);
                sircl.ext.visible(this, true);
            }
        });
        // Add event handler to show upload progress:
        req.xhr.upload.addEventListener("progress", function (e) {
            if (e.lengthComputable) {
                $uploadProgresses.each(function () {
                    this.value = e.loaded / e.total;
                });
            }
        });
    }
    // Show and add event handler to download progresses:
    var $downloadProgresses = sircl.ext.$select(req.$initialTarget, req.$initialTarget.attr("download-progress")).filter("PROGRESS");
    if ($downloadProgresses.length > 0) {
        $downloadProgresses.each(function () {
            // Set initial value:
            this.removeAttribute("value");
            req._progressToResetAfterSend.push(this);
            // Make hidden progresses visible:
            if (!sircl.ext.visible(this)) {
                req._progressToHideAfterSend.push(this);
                sircl.ext.visible(this, true);
            }
        });
        // Add event handler to show download progress:
        req.xhr.addEventListener("progress", function (e) {
            if (e.lengthComputable) {
                $downloadProgresses.each(function () {
                    this.value = e.loaded / e.total;
                });
            }
        });
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function (req) {
    // Hide progresses that were hidden before send:
    req._progressToHideAfterSend.forEach(function (elem) {
        sircl.ext.visible(elem, false);
    });
    // Reset progresses to 0:
    req._progressToResetAfterSend.forEach(function (elem) {
        elem.value = 0;
    });
    // Move to next handler:
    this.next(req);
});

//#endregion

//#region HTML5 Dialog handling

sircl.addRequestHandler("beforeSend", function (req) {
    // Open any non-open dialog holding the initial target and having class "onload-showdialog":
    req._dialogHtml5Opened = req.$initialTarget.closest("DIALOG.onload-showdialog:not([open])");
    if (req._dialogHtml5Opened.length > 0) {
        if (req._dialogHtml5Opened.hasClass("modal-dialog")) {
            req._dialogHtml5Opened[0].showModal();
        } else {
            req._dialogHtml5Opened[0].show();
        }
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function (req) {
    // On error, undo opened dialogs:
    if (!req.succeeded && req._dialogHtml5Opened.length > 0) {
        req._dialogHtml5Opened[0].close();
    } else if (req.xhr.status == "204") {
        // Else, if status "204" (no content), close target dialog:
        var $dlg = req.$initialTarget.closest("DIALOG[open]");
        if ($dlg.length > 0) {
            $dlg[0].close();
        }
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("beforeRender", function (req) {
    // If target has changed, close any previously opened dialog:
    if (req.targetHasChanged && req._dialogHtml5Opened.length > 0) {
        req._dialogHtml5Opened[0].close();
    }
    // Open dialog on final target:
    var $dlg = req.$finalTarget.closest("DIALOG:not([open])");
    if ($dlg.length > 0) {
        if ($dlg.hasClass("modal-dialog")) {
            $dlg[0].showModal();
        } else {
            $dlg[0].show();
        }
    }
    // Move to next handler:
    this.next(req);
});

$(document).ready(function () {
    // Reset content of a modal with onclose-reset when closing the modal:
    $(document.body).on("close", "DIALOG.onclose-restore", function (event) {
        var originalContent = $(this)[0]._originalContent;
        if (originalContent !== undefined) $(this).html(originalContent);
    });
});

$$(function () {
    // Backup original content of onclose-reset dialogs to be able to reset on close:
    $(this).find("DIALOG.onclose-restore").each(function (index, elem) {
        elem._originalContent = $(elem).html();
    });
});

//#endregion

//#region Core event-actions

// Change and Input event-actions:
//////////////////////////////////

sircl.addAttributeAlias(".oninput-change", "oninput-changeafter", "0.8");
sircl.addAttributeAlias(".onchange-submit", "onchange-submit", ":form");

$(function () {

    /// <* onchange-submit="form-selector"> Triggers form submission on change.
    $(document.body).on("change", "[onchange-submit]", function (event) {
        if ($(event.target).closest(".onchange-nosubmit").length == 0 && $(event.target).closest(".sircl-content-processing").length == 0) {
            var $form = sircl.ext.$select($(this), $(this).attr("onchange-submit"));
            if ($form.length > 0) $form[0].submit();
        }
    });

    /// <input oninput-changeafter="0.8"> On input on the element, triggers a change event.
    $(document.body).on("input", "INPUT[oninput-changeafter], TEXTAREA[oninput-changeafter]", function (event) {
        var timeout = 1000 * $(this).attr("oninput-changeafter");
        if (this._oninput_changeafter_timeout) {
            clearTimeout(this._oninput_changeafter_timeout);
        }
        this._oninput_changeafter_timeout = setTimeout(function (elem) {
            $(elem).change();
        }, timeout, this);
    });
    /// Prevent change event if value has not really changed since last change event:
    $(document.body).children().on("change", "INPUT[oninput-changeafter], TEXTAREA[oninput-changeafter]", function (event) {
        var currentValue = $(this).val();
        var previousValue = this._previousChangeValue;
        if (currentValue === previousValue) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            this._previousChangeValue = currentValue;
        }
    });
});

// Submit event-actions:
////////////////////////

sircl.addAttributeAlias(".onsubmit-disable", "onsubmit-disable", ">:submit");

/// <form onsubmit-disable="selector"> On submit of the form, disable selector elements.
sircl.addRequestHandler("beforeSend", function (req) {
    // Disable requested elements:
    if (req.$form) {
        if (req.$form.hasAttr("onsubmit-disable")) {
            req._formSubmitsToReenable = [];
            sircl.ext.$select(req.$form, req.$form.attr("onsubmit-disable")).filter(":enabled").each(function () {
                req._formSubmitsToReenable.push(this);
                this.disabled = true;
            });
        }
    }
    // Move to next handler:
    this.next(req);
});
sircl.addRequestHandler("afterSend", function (req) {
    // Re-enable previously disabled elements:
    if (req._formSubmitsToReenable) {
        req._formSubmitsToReenable.forEach(function (elem) {
            elem.disabled = false;
        });
    }
    // Move to next handler:
    this.next(req);
});


// Load event-actions:
//////////////////////

sircl.addAttributeAlias(".onload-click", "onload-click", ":this");

$$("enrich", function () {
    $(this).find(".onload-setvaluefromquery").each(function () {
        $(this).attr("onload-setvaluefromquery", this.name);
    });
});

$$(function () {

    /// <* class="onload-show"> Set on the target or a parent of the target, will make that element visible on load.
    $(this).closest(".onload-show").each(function () {
        sircl.ext.visible(this, true);
    });

    /// <* class="onload-hide"> Set on the target or a parent of the target, will make that element invisible on load.
    $(this).closest(".onload-hide").each(function () {
        sircl.ext.visible(this, false);
    });

    /// <* onload-click="selector"> On load, triggers a click event on the selector matches.
    $(this).closest("[onload-click]").each(function () {
        sircl.ext.$select($(this), $(this).attr("onload-click")).click();
    });

    /// <* onload-load="url" [onload-reloadafter="seconds"]> Loads the given URL.
    /// Optionally, a "[onload-reloadafter]" indicates the time (in seconds) after which to continuously refresh the content.
    /// The url can contain a "{rnd}" literal that will then be replaced by a random number to force reloading.
    /// I.e: <div onload-load="/Home/News/?x={rnd}" onload-reloadafter="10"></div>
    $(this).find("[onload-load]").each(function () {
        var url = $(this).attr("onload-load") + "";
        var loadRefresh = $(this).attr("onload-reloadafter");
        $(this).load(url.replace("{rnd}", Math.random()));
        if (loadRefresh) {
            window.setInterval(function ($target) { $target.load(url.replace("{rnd}", Math.random())); }, loadRefresh * 1000, $(this));
        } else {
            //$(this).removeAttr("onload-load"); Do not remove otherwise onload-reload does not work...
        }
    });

    /// <* onload-reload="selector"> Instructs the matches of the selector to reload their content (provided they have an [onload-load] attribute).
    $(this).find("[onload-reload]").each(function () {
        sircl.ext.$select($(this).attr("onload-reload")).filter("[onload-load]").each(function () {
            var url = $(this).attr("onload-load") + "";
            $(this).load(url.replace("{rnd}", Math.random()));
        });
    });

    /// <input onload-setvaluefromquery="age"> Sets the value of the input to the named querystring parameter.
    $(this).find("[onload-setvaluefromquery]").each(function () {
        $(this).attr("value", sircl.ext.getUrlParameter($(this).attr("onload-setvaluefromquery")));
    });
});

//
////////////////////////////

//
////////////////////////////

//#endregion

//#region 
//#endregion

//#region Document ready handler executing initial afterLoad

$(document).ready(function () {
    /// Document is loaded:
    sircl._afterLoad(this);
});

//#endregion

/////////////////////////////////////////////////////////////////
// Sircl 2.0 - Core extension
// www.getsircl.com
// Copyright (c) 2019-2021 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The file 'sircl-extended' component should be registered after the 'sircl' component. Please review order of script files.");

//#region Extended event-actions

/// Load event-actions:
///////////////////////

$$(function () {
    /// <* onload-removeclass="classname [on selector]"> When loaded, removes the class to self or the given selector.
    $(this).find("[onload-removeclass]").each(function () {
        sircl.ext.removeClass($(this), $(this).attr("onload-removeclass"));
    });

    /// <* onload-addclass="classname [on selector]"> When loaded, adds the class to self or the given selector.
    $(this).find("[onload-addclass]").each(function () {
        sircl.ext.addClass($(this), $(this).attr("onload-addclass"));
    });

    /// <* onload-toggleclass="classname [on selector]"> When loaded, toggles the class to self or the given selector.
    $(this).find("[onload-toggleclass]").each(function () {
        sircl.ext.toggleClass($(this), $(this).attr("onload-toggleclass"));
    });

    /// <SELECT onload-select="value"> When loaded, will automatically select the corresponding item if the select had an empty value.
    /// The value of the onload-select attribute is either:
    /// - ":singleton" to select the only element with a non-empty value, if there is only one;
    /// - ":first" to select the first non-empty value;
    /// - any other value, to select the item with that value.
    $(this).find("SELECT[onload-select]").each(function () {
        if ($(this).val() != "") return; // Select already has a value.
        var value = $(this).attr("onload-select") + "";
        var options = $("option", this);
        if (value.toLowerCase() == ":singleton") {
            var singleton = -1;
            for (var i = 0; i < options.length; i++) {
                if (options[i].value != "" && singleton == -1) singleton = i;
                else if (options[i].value != "") return;
            }
            if (singleton != -1) {
                $(this).val(options[singleton].value);
                $(this).change();
            }
        } else if (value.toLowerCase() == ":first") {
            var first = -1;
            for (var i = 0; i < options.length; i++) {
                if (options[i].value != "") {
                    $(this).val(options[i].value);
                    $(this).change();
                    break;
                }
            }
        } else {
            $(this).val(value);
            $(this).change();
        }
    });
});

// Click event-actions:
///////////////////////

$(function () {

    // <* onclick-click="selector"> On click, triggers a click event on the elements matching the given selector.
    $(document.body).on("click", "*[onclick-click]", function (event) {
        var targetSelector = $(this).attr("onclick-click");
        sircl.ext.$select($(this), targetSelector)[0].click(); // See: http://goo.gl/lGftqn
        //event.preventDefault();
    });

    // <* onclick-clear="selector"> On click clears the elements matching the given selector.
    $(document.body).on("click", "[onclick-clear]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-clear")).html("");
    });

    // <* onclick-show="selector"> On click shows the elements matching the given selector.
    $(document.body).on("click", "[onclick-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onclick-show")), true);
    });

    // <* onclick-hide="selector"> On click hides the elements matching the given selector.
    $(document.body).on("click", "[onclick-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onclick-hide")), false);
    });

    // <* onclick-toggleshow="selector"> On click shows/hides the elements matching the given selector.
    $(document.body).on("click", "[onclick-toggleshow]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-toggleshow")).each(function () {
            sircl.ext.visible($(this), !sircl.ext.visible($(this)));
        });
    });

    /// <* onclick-removeclass="class [on selector]"> On click, removes the class.
    $(document.body).on("click", "[onclick-removeclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("onclick-removeclass"));
    });

    /// <* onclick-addclass="class [on selector]"> On click, adds the class.
    $(document.body).on("click", "[onclick-addclass]", function (event) {
        sircl.ext.addClass($(this), $(this).attr("onclick-addclass"));
    });

    /// <* onclick-toggleclass="class [on selector]"> On click, toggles the class.
    $(document.body).on("click", "[onclick-toggleclass]", function (event) {
        sircl.ext.toggleClass($(this), $(this).attr("onclick-toggleclass"));
    });

    // <* onclick-disable="selector"> On click disables the elements matching the given selector.
    $(document.body).on("click", "[onclick-disable]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-disable")).prop("disabled", true);
    });

    // <* onclick-enable="selector"> On click enables the elements matching the given selector.
    $(document.body).on("click", "[onclick-enable]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-enable")).prop("disabled", false);
    });

    // <* onclick-readonly="selector"> On click makes the elements matching the given selector readonly.
    $(document.body).on("click", "[onclick-readonly]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-readonly")).prop("readonly", true);
    });

    // <* onclick-readwrite="selector"> On click makes the elements matching the given selector non-readonly.
    $(document.body).on("click", "[onclick-readwrite]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-readwrite")).prop("readonly", false);
    });

    // <* onclick-clearvalue="selector"> On click clears the value of the elements matching the given selector.
    $(document.body).on("click", "[onclick-clearvalue]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-clearvalue")).each(function () {
            $(this).val("");
            $(this).change();
        });
    });

    // <* onclick-check="selector"> On click checks matching checkbox inputs.
    $(document.body).on("click", "[onclick-check]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-check")).filter("INPUT[type=checkbox]").each(function () {
            this.checked = true;
            $(this).change();
        });
    });

    // <* onclick-uncheck="selector"> On click unchecks matching checkbox inputs.
    $(document.body).on("click", "[onclick-uncheck]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-uncheck")).filter("INPUT[type=checkbox]").each(function () {
            this.checked = false;
            $(this).change();
        });
    });

    // <* onclick-togglecheck="selector"> On click changes the checked/unchecked state of matching checkbox inputs.
    $(document.body).on("click", "[onclick-togglecheck]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-togglecheck")).filter("INPUT[type=checkbox]").each(function () {
            this.checked = !this.checked;
            $(this).change();
        });
    });
});

/// Hover event-actions:
////////////////////////

$(function () {
    /// <* onhover-show="selector"> On hover, displays elements matching the given selector.
    $(document.body).on("mouseenter", "*[onhover-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-show")), true);
    });
    $(document.body).on("mouseleave", "*[onhover-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-show")), false);
    });

    /// <* onhover-hide="selector"> On hover, hides elements matching the given selector.
    $(document.body).on("mouseenter", "*[onhover-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-hide")), false);
    });
    $(document.body).on("mouseleave", "*[onhover-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-hide")), true);
    });

    /// <* onhover-removeclass="class [on selector]"> On hover, removes the class, on leave, adds the class.
    $(document.body).on("mouseenter", "*[onhover-removeclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("onhover-removeclass"));
    });
    $(document.body).on("mouseleave", "*[onhover-removeclass]", function (event) {
        sircl.ext.addClass($(this), $(this).attr("onhover-removeclass"));
    });

    /// <* onhover-addclass="class [on selector]"> On hover, adds the class, on leave, removes the class.
    $(document.body).on("mouseenter", "*[onhover-addclass]", function (event) {
        sircl.ext.addClass($(this), $(this).attr("onhover-addclass"));
    });
    $(document.body).on("mouseleave", "*[onhover-addclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("onhover-addclass"));
    });

    /// <* onhover-toggleclass="class [on selector]"> On hover, toggles the class, on leave, toggles the class back.
    $(document.body).on("mouseenter", "*[onhover-toggleclass]", function (event) {
        sircl.ext.toggleClass($(this), $(this).attr("onhover-toggleclass"));
    });
    $(document.body).on("mouseleave", "*[onhover-toggleclass]", function (event) {
        sircl.ext.toggleClass($(this), $(this).attr("onhover-toggleclass"));
    });
});

/// Submit event-actions:
/////////////////////////

/// Change event-actions:
/////////////////////////

/// Checked event-actions:
//////////////////////////

$(function () {
    // <* onchecked-click="selector"> When checked (only by event, not initially), triggers a click event on the elements matching the given selector.
    $(document.body).children().on("change", "*[onchecked-click]:checked", function (event) {
        var targetSelector = $(this).attr("onclick-click");
        sircl.ext.$select($(this), targetSelector)[0].click(); // See: http://goo.gl/lGftqn
    });

    $(document.body).children().on("change", "[ifchecked-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-show")), this.checked);
    });

    $(document.body).children().on("change", "[ifchecked-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-hide")), !this.checked);
    });

    $(document.body).children().on("change", "[ifchecked-enable]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-enable")).prop("disabled", !this.checked);
    });

    $(document.body).children().on("change", "[ifchecked-disable]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-disable")).prop("disabled", this.checked);
    });

    $(document.body).children().on("change", "[ifchecked-readonly]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-readonly")).prop("readonly", this.checked);
    });

    $(document.body).children().on("change", "[ifchecked-readwrite]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-readwrite")).prop("readonly", !this.checked);
    });

    $(document.body).children().on("change", "[ifchecked-clearvalue]", function (event) {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-clearvalue")).each(function () {
            $(this).val("");
            $(this).change();
        });
    });

    $(document.body).children().on("change", "[ifunchecked-clearvalue]", function (event) {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("ifunchecked-clearvalue")).each(function () {
            $(this).val("");
            $(this).change();
        });
    });

    $(document.body).children().on("change", "[ifchecked-check]", function (event) {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-check")).filter(":not(:checked)").each(function () {
            $(this).prop("checked", true);
            $(this).change();
        });
    });

    $(document.body).children().on("change", "[ifchecked-uncheck]", function (event) {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-uncheck")).filter(":checked").each(function () {
            $(this).prop("checked", false);
            $(this).change();
        });
    });

    $(document.body).children().on("change", "[ifunchecked-check]", function (event) {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("ifunchecked-check")).filter(":not(:checked)").each(function () {
            $(this).prop("checked", true);
            $(this).change();
        });
    });

    $(document.body).children().on("change", "[ifunchecked-uncheck]", function (event) {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("ifunchecked-uncheck")).filter(":checked").each(function () {
            $(this).prop("checked", false);
            $(this).change();
        });
    });

    $(document.body).children().on("change", ".byvalue-events", function (event) {
        var $scope = $("BODY");
        var tocheck = [];
        var touncheck = [];
        var name = sircl.ext.cssEscape(this.name);
        // Handle ".ifvalue<name>" classes:
        var ifvaluename = ".ifvalue" + name;
        $scope.find(ifvaluename + "-show").each(function () {
            sircl.ext.visible($(this), true);
        });
        $scope.find(ifvaluename + "-hide").each(function () {
            sircl.ext.visible($(this), false);
        });
        $scope.find(ifvaluename + "-enable").each(function () {
            $(this).prop("disabled", false);
        });
        $scope.find(ifvaluename + "-disable").each(function () {
            $(this).prop("disabled", true);
        });
        $scope.find(ifvaluename + "-readonly").each(function () {
            $(this).prop("readonly", true);
        });
        $scope.find(ifvaluename + "-readwrite").each(function () {
            $(this).prop("readonly", false);
        });
        $scope.find(ifvaluename + "-clearvalue").each(function () {
            $(this).val("");
            $(this).change();
        });
        $scope.find(ifvaluename + "-check").each(function () {
            if (!this.checked) tocheck.push(this);
        });
        $scope.find(ifvaluename + "-uncheck").each(function () {
            if (this.checked) touncheck.push(this);
        });
        // Handle ".ifvalue<name>is<value>" classes:
        var values = $(this).val();
        if (values == null) values = [];
        if (!Array.isArray(values)) values = [values];
        for (var v = 0; v < values.length; v++) {
            var value = sircl.ext.cssEscape(values[v]);
            var ifvaluenameisvalue = ifvaluename + "is" + value;
            $scope.find(ifvaluenameisvalue + "-show").each(function () {
                sircl.ext.visible($(this), true);
            });
            $scope.find(ifvaluenameisvalue + "-hide").each(function () {
                sircl.ext.visible($(this), false);
            });
            $scope.find(ifvaluenameisvalue + "-enable").each(function () {
                $(this).prop("disabled", false);
            });
            $scope.find(ifvaluenameisvalue + "-disable").each(function () {
                $(this).prop("disabled", true);
            });
            $scope.find(ifvaluenameisvalue + "-readonly").each(function () {
                $(this).prop("readonly", true);
            });
            $scope.find(ifvaluenameisvalue + "-readwrite").each(function () {
                $(this).prop("readonly", false);
            });
            $scope.find(ifvaluenameisvalue + "-clearvalue").each(function () {
                $(this).val("");
                $(this).change();
            });
            $scope.find(ifvaluenameisvalue + "-check").each(function () {
                if (touncheck.indexOf(this) >= 0) touncheck.splice(touncheck.indexOf(this), 1);
                if (!this.checked && tocheck.indexOf(this) === -1) tocheck.push(this);
            });
            $scope.find(ifvaluenameisvalue + "-uncheck").each(function () {
                if (tocheck.indexOf(this) >= 0) tocheck.splice(tocheck.indexOf(this), 1);
                if (this.checked && touncheck.indexOf(this) === -1) touncheck.push(this);
            });
        }
        // Perform only net check/unchecks and trigger change event:
        tocheck.forEach(function (elem) {
            elem.checked = true;
            $(elem).change();
        });
        touncheck.forEach(function (elem) {
            elem.checked = false;
            $(elem).change();
        });
    });
});

$$(function () {

    $(this).find("[ifchecked-show]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-show")), this.checked);
    });

    $(this).find("[ifchecked-hide]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-hide")), !this.checked);
    });

    $(this).find("[ifchecked-enable]").each(function () {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-enable")).prop("disabled", !this.checked);
    });

    $(this).find("[ifchecked-disable]").each(function () {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-disable")).prop("disabled", this.checked);
    });

    $(this).find("[ifchecked-readonly]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-readonly")).prop("readonly", this.checked);
    });

    $(this).find("[ifchecked-readwrite]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-readwrite")).prop("readonly", !this.checked);
    });

    $(this).find("[ifchecked-clearvalue]", function (event) {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-clearvalue")).each(function () {
            $(this).val("");
            $(this).change();
        });
    });

    $(this).find("[ifunchecked-clearvalue]", function (event) {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("ifunchecked-clearvalue")).each(function () {
            $(this).val("");
            $(this).change();
        });
    });

    $(this).find("[ifchecked-check]").each(function () {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-check")).filter(":not(:checked)").each(function () {
            $(this).prop("checked", true);
            $(this).change();
        });
    });

    $(this).find("[ifchecked-uncheck]").each(function () {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-uncheck")).filter(":checked").each(function () {
            $(this).prop("checked", false);
            $(this).change();
        });
    });

    $(this).find("[ifunchecked-check]").each(function () {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("ifunchecked-check")).filter(":not(:checked)").each(function () {
            $(this).prop("checked", true);
            $(this).change();
        });
    });

    $(this).find("[ifunchecked-uncheck]").each(function () {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("ifunchecked-uncheck")).filter(":checked").each(function () {
            $(this).prop("checked", false);
            $(this).change();
        });
    });

    $(this).find(".byvalue-events").each(function () {
        var $scope = $("BODY");
        var tocheck = [];
        var touncheck = [];
        var name = sircl.ext.cssEscape(this.name);
        // Handle ".ifvalue<name>" classes:
        var ifvaluename = ".ifvalue" + name;
        $scope.find(ifvaluename + "-show").each(function () {
            sircl.ext.visible($(this), true);
        });
        $scope.find(ifvaluename + "-hide").each(function () {
            sircl.ext.visible($(this), false);
        });
        $scope.find(ifvaluename + "-enable").each(function () {
            $(this).prop("disabled", false);
        });
        $scope.find(ifvaluename + "-disable").each(function () {
            $(this).prop("disabled", true);
        });
        $scope.find(ifvaluename + "-readonly").each(function () {
            $(this).prop("readonly", true);
        });
        $scope.find(ifvaluename + "-readwrite").each(function () {
            $(this).prop("readonly", false);
        });
        $scope.find(ifvaluename + "-clearvalue").each(function () {
            $(this).val("");
            $(this).change();
        });
        $scope.find(ifvaluename + "-check").each(function () {
            if (!this.checked) tocheck.push(this);
        });
        $scope.find(ifvaluename + "-uncheck").each(function () {
            if (this.checked) touncheck.push(this);
        });
        // Handle ".ifvalue<name>is<value>" classes:
        var values = $(this).val();
        if (values == null) values = [];
        if (!Array.isArray(values)) values = [values];
        for (var v = 0; v < values.length; v++) {
            var value = sircl.ext.cssEscape(values[v]);
            var ifvaluenameisvalue = ifvaluename + "is" + value;
            $scope.find(ifvaluenameisvalue + "-show").each(function () {
                sircl.ext.visible($(this), true);
            });
            $scope.find(ifvaluenameisvalue + "-hide").each(function () {
                sircl.ext.visible($(this), false);
            });
            $scope.find(ifvaluenameisvalue + "-enable").each(function () {
                $(this).prop("disabled", false);
            });
            $scope.find(ifvaluenameisvalue + "-disable").each(function () {
                $(this).prop("disabled", true);
            });
            $scope.find(ifvaluenameisvalue + "-readonly").each(function () {
                $(this).prop("readonly", true);
            });
            $scope.find(ifvaluenameisvalue + "-readwrite").each(function () {
                $(this).prop("readonly", false);
            });
            $scope.find(ifvaluenameisvalue + "-clearvalue").each(function () {
                $(this).val("");
                $(this).change();
            });
            $scope.find(ifvaluenameisvalue + "-check").each(function () {
                if (touncheck.indexOf(this) >= 0) touncheck.splice(touncheck.indexOf(this), 1);
                if (!this.checked && tocheck.indexOf(this) === -1) tocheck.push(this);
            });
            $scope.find(ifvaluenameisvalue + "-uncheck").each(function () {
                if (tocheck.indexOf(this) >= 0) tocheck.splice(tocheck.indexOf(this), 1);
                if (this.checked && touncheck.indexOf(this) === -1) touncheck.push(this);
            });
        }
        // Perform only net check/unchecks and trigger change event:
        tocheck.forEach(function (elem) {
            elem.checked = true;
            $(elem).change();
        });
        touncheck.forEach(function (elem) {
            elem.checked = false;
            $(elem).change();
        });
    });

    /// <* enable-ifchecked="selection"> If any of the selection is checked, enable, else disable this.
    $(this).find("[enable-ifchecked]").each(function () {
        var $this = $(this);
        sircl.ext.$select($this, $this.attr("enable-ifchecked")).on("change", function () {
            $this.prop("disabled", !sircl.ext.$select($this, $this.attr("enable-ifchecked")).filter(":checked").length > 0);
        });
        $this.prop("disabled", !sircl.ext.$select($this, $this.attr("enable-ifchecked")).filter(":checked").length > 0);
    });
});

/// Valid event-actions:
////////////////////////

sircl.ext.isValid = function ($scope) {
    var validatable = ["BUTTON", "FIELDSET", "INPUT", "OUTPUT", "SELECT", "TEXTAREA"];
    var validatable$ = "BUTTON,FIELDSET,INPUT,OUTPUT,SELECT,TEXTAREA";
    for (var i = 0; i < $scope.length; i++) {
        if (validatable.indexOf($scope[i].tagName) >= 0) {
            if (!$scope[i].validity.valid) return false;
        } else {
            var $validatables = $($scope[i]).find(validatable$);
            for (var j = 0; j < $validatables.length; j++) {
                if (!$validatables[j].validity.valid) return false;
            }
        }
    }
    return true;
};

$$(function () {
    $(this).find("[ifvalid-show]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifvalid-show")), sircl.ext.isValid($(this)));
    });
    $(this).find("[ifinvalid-show]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifinvalid-show")), !sircl.ext.isValid($(this)));
    });
    $(this).find("[ifvalid-addclass]").each(function () {
        if (sircl.ext.isValid($(this)))
            sircl.ext.addClass($(this), this.getAttribute("ifvalid-addclass"));
        else
            sircl.ext.removeClass($(this), this.getAttribute("ifvalid-addclass"));
    });
    $(this).find("[ifinvalid-addclass]").each(function () {
        if (sircl.ext.isValid($(this)))
            sircl.ext.removeClass($(this), this.getAttribute("ifinvalid-addclass"));
        else
            sircl.ext.addClass($(this), this.getAttribute("ifinvalid-addclass"));
    });
    $(this).find("[ifvalid-enable]").each(function () {
        sircl.ext.$select($(this), this.getAttribute("ifvalid-enable")).prop("disabled", !sircl.ext.isValid($(this)));
    });
    $(this).find("[ifinvalid-enable]").each(function () {
        sircl.ext.$select($(this), this.getAttribute("ifinvalid-enable")).prop("disabled", sircl.ext.isValid($(this)));
    });
});

$(function () {
    $(document.body).on("change", "[ifvalid-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifvalid-show")), sircl.ext.isValid($(this)));
    });
    $(document.body).on("change", "[ifinvalid-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifinvalid-show")), !sircl.ext.isValid($(this)));
    });
    $(document.body).on("change", "[ifvalid-addclass]", function (event) {
        if (sircl.ext.isValid($(this)))
            sircl.ext.addClass($(this), this.getAttribute("ifvalid-addclass"));
        else
            sircl.ext.removeClass($(this), this.getAttribute("ifvalid-addclass"));
    });
    $(document.body).on("change", "[ifinvalid-addclass]", function (event) {
        if (sircl.ext.isValid($(this)))
            sircl.ext.removeClass($(this), this.getAttribute("ifinvalid-addclass"));
        else
            sircl.ext.addClass($(this), this.getAttribute("ifinvalid-addclass"));
    });
    $(document.body).on("change", "[ifvalid-enable]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifvalid-enable")).prop("disabled", !sircl.ext.isValid($(this)));
    });
    $(document.body).on("change", "[ifinvalid-enable]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifinvalid-enable")).prop("disabled", sircl.ext.isValid($(this)));
    });
});

/// Focus event-actions:
////////////////////////

/// <INPUT class="onfocus-select"> Select all text when element gets focus:
$(document.body).on("focus", "INPUT.onfocus-select:not([type=checkbox]):not([type=radio]:not([type=button])", function (event) {
    $(this)[0].select();
});

/// Key event-actions:
//////////////////////

/// Timer event-actions:
////////////////////////

/// Propagate event-actions:
////////////////////////////

$(function () {
    /// <* on<click|dblclick|change|input>-propagate="on|off"> If off, blocks propagation of the event.
    $(document.body).children().on("click", "*[onclick-propagate=off]", function (event) { event.stopPropagation(); });
    $(document.body).children().on("dblclick", "*[ondblclick-propagate=off]", function (event) { event.stopPropagation(); });
    $(document.body).children().on("change", "*[onchange-propagate=off]", function (event) { event.stopPropagation(); });
    $(document.body).children().on("input", "*[oninput-propagate=off]", function (event) { event.stopPropagation(); });
});

/// Scroll/Viewport event-actions:
/////////////////////////

// From: https://stackoverflow.com/a/7557433/323122
sircl.isElementInViewport = function(el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
};

$(function () {

    $(window).on('DOMContentLoaded load resize scroll', function () {

        /// <* class="onscrolltop-fade"> Makes the element visible when scrolling down (using a fading animation), hidden when scrolled at top.
        if ($(this).scrollTop() > 100) {
            $('.onscrolltop-fade').fadeIn(800);
        } else {
            $('.onscrolltop-fade').fadeOut(400);
        }

        /// <* ifinviewport-load="url"> Loads the given URL and places the result in the element when the element is visible in the viewport.
        $("[ifinviewport-load]").each(function () {
            if (sircl.isElementInViewport(this)) {
                var url = $(this).attr("ifinviewport-load");
                $(this).removeAttr("ifinviewport-load");
                $(this).load(url);
            }
        });
    });

    /// <* class="onclick-scrolltop"> If clicked, scrolls the page to top (in slow, animaged way).
    $(document.body).on("click", ".onclick-scrolltop", function (event) {
        $('body,html').animate({
            scrollTop: 0
        }, 500);
        return false;
    });
});

$$(function () {
    /// <* ifinviewport-load="url"> Loads the given URL and places the result in the element when the element is visible in the viewport.
    $("[ifinviewport-load]").each(function () {
        if (sircl.isElementInViewport(this)) {
            var url = $(this).attr("ifinviewport-load");
            $(this).removeAttr("ifinviewport-load");
            $(this).load(url);
        }
    });
});

//#endregion

//#region Actions

/// <input|textarea oninput-action="" name="">

//#endregion

//#region Confirmation dialogs

$(function () {
    /// Buttons and link can have a confirmation dialog;
    /// <a href="http://www.example.com" onclick-confirm="Are you sure ?">...</a>
    $(document.body).children().on("click", "*[onclick-confirm]", function (event) {
        var confirmMessage = $(this).attr("onclick-confirm");
        if (confirmMessage) {
            if (!sircl.ext.confirm($(this), confirmMessage, event)) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    });
});



//#endregion

//#region Form changed state handling

// On initial load, if onchange-set input is true, add .form-changed class to form:
$$(function () {
    $(this).find("FORM[onchange-set]").each(function () {
        var $input = $(this).find("INPUT[name=" + $(this).attr("onchange-set") + "]");
        if ($input.length > 0 && (["true", "on"].indexOf(($input.val() || "false").toLowerCase()) >= 0)) {
            $(this).addClass("form-changed");
        }
    });
});

// On change event on a form with [onchange-set], add .form-changed class and set corresponding input to true:
$(function () {
    $(document.body).on("change", "FORM[onchange-set]", function (event) {
        if ($(event.target).closest(".sircl-content-processing").length == 0) {
            $(this).addClass("form-changed");
            var $input = $(this).find("INPUT[name=" + $(this).attr("onchange-set") + "]");
            if ($input.length > 0) {
                $input.val(true);
            }
        }
    });

    // onunloadchanged-confirm

    // A click on a hyperlink anywhere in the page triggers the onunloadchanged-confirm of the first changed form:
    $(document.body).children().on("click", "*[href]:not(.onunloadchanged-allow):not([download])", function (event) {
        // Find any form having [onunloadchanged-confirm] and being changed, anywhere in the page:
        var $changedForm = $("FORM.form-changed[onunloadchanged-confirm]");
        if ($changedForm.length > 0) {
            var confirmMessage = $changedForm[0].getAttribute("onunloadchanged-confirm");
            if (!sircl.ext.confirm($(this), confirmMessage, event)) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    });


    $(document.body).children().on("click", "FORM.form-changed *[onclickchanged-confirm]", function (event) {
        var confirmMessage = $(this).attr("onclickchanged-confirm");
        if (!sircl.ext.confirm($(this), confirmMessage, event)) {
            event.stopPropagation();
            event.preventDefault();
        }
    });
});

//#endregion

//#region Protected forms (onbeforeunload)

//$(function () {
//    window.onbeforeunload = function (event) {
//        if ($("FORM.form-changed[protect-message]").length > 0) {
//            event.preventDefault();
//            event.returnValue = "";
//        }
//    };
//});

//sircl.addRequestHandler("beforeSend", function (req) {
//    if ((req.$initialTarget == null) && !req.$trigger.is(".protect-ignore")) {
//        var $protectedForms = $("FORM.form-changed[protect-message]");
//        if ($protectedForms.length > 0) {
//            if (!confirm($protectedForms.attr("protect-message"))) {
//                req.abort = true;
//            }
//        }
//    }
//    this.next(req);
//});

//#endregion



/////////////////////////////////////////////////////////////////
// Sircl 2.0 - ChangeActions extension
// www.getsircl.com
// Copyright (c) 2019-2021 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The file 'sircl-changeactions' component should be registered after the 'sircl' component. Please review order of script files.");

/**
 * Allow controls to be disabled during action call.
 * Note that if this is true, natural focus flow may be broken.
 */
sircl.disableOnAction = false;

/**
 * Change action handlers declaration.
 */
sircl._changeActionHandlers = {};
sircl._changeActionHandlers.beforeSend = [];
sircl._changeActionHandlers.afterSend = [];
sircl._changeActionHandlers.onError = [];
sircl._changeActionHandlers.beforeRender = [];
sircl._changeActionHandlers.afterRender = [];

/**
 * Adds a change action handler.
 * @param {any} phase Phase to execute the handler. "beforeSend", "afterSend", "onError", "beforeRender" or "afterRender".
 * @param {any} handler Handler function.
 */
sircl.addChangeActionHandler = function (phase, handler) {
    sircl._changeActionHandlers[phase].push(handler);
};

/**
 * Runs the change action handlers for the given phase.
 */
sircl._runChangeActionHandlers = function (phase, subject, req) {
    sircl._changeActionHandlers[phase].forEach(function (handler) { handler.apply(subject, [req]); });
};

/**
 * Performs the call to the action url.
 */
sircl._actionCall = function (triggerElement, $subjects, $scope, url, name, value, event, onJson, onHtml, onFailure, onDone) {
    // Ignore if change event is issued from a processing section:
    if ($(event.target).closest(".sircl-content-processing").length > 0) return;
    // Get method:
    var method = (($(triggerElement).closest("[method]").attr("method") || "get").toUpperCase() == "POST") ? "POST" : "GET";
    // In url, substitute "[...]" by form values:
    var fieldparser = new RegExp(/\%5B[a-z0-9\.\-\_]+?\%5D/gi);
    var fieldnames = [];
    do {
        var fieldname = fieldparser.exec(url);
        if (fieldname !== null) fieldnames.push(fieldname[0]);
        else break;
    } while (true);
    for (var f = 0; f < fieldnames.length; f++) {
        var fieldvalue = $("[name=" + fieldnames[f].substr(3, fieldnames[f].length - 6) + "]").val();
        if (fieldvalue === undefined)
            url = url.replace(fieldnames[f], "");
        else
            url = url.replace(fieldnames[f], encodeURIComponent(fieldvalue));
    }
    // Build data:
    if (value === null || value === undefined) value = [];
    if (!Array.isArray(value)) value = [value];
    var data = "name=" + encodeURIComponent(name);
    for (var i = 0; i < value.length; i++) {
        data += "&value=" + encodeURIComponent(value[i]);
        if (name != "") data += "&" + encodeURIComponent(name) + "=" + encodeURIComponent(value[i]);
    }
    // If GET, add data to url:
    if (method === "GET") {
        url = url + ((url.indexOf("?") < 0) ? "?" : "&") + data;
        data = null;
    }
    // Perform request:
    var cache = false;
    if ($(triggerElement).attr("browser-cache") != null) cache = ($(triggerElement).attr("browser-cache").toLowerCase() == "on");
    var req = { $trigger: $(triggerElement), $subjects: $subjects, $scope: $scope, event: event };
    var jqxhr = $.ajax({
        url: url,
        method: method,
        data: data,
        cache: cache,
        beforeSend: function (xhr, settings) {
            req.xhr = xhr;
            sircl._runChangeActionHandlers("beforeSend", triggerElement, req);
        }
    }).done(function (data, statusText, xhr) {
        if (req.xhr.status <= 299) {
            req.succeeded = true;
        } else {
            req.succeeded = false;
        }
        req.data = data;
        sircl._runChangeActionHandlers("afterSend", triggerElement, req);
        sircl._runChangeActionHandlers("beforeRender", triggerElement, req);
        if (!req.succeeded) sircl._runChangeActionHandlers("onError", triggerElement, req);
        if (req.succeeded) {
            if ((xhr.getResponseHeader("Content-Type") || "").indexOf("text/html") == 0) {
                if (onHtml) onHtml.apply(triggerElement, [req]);
            } else {
                if (onJson) onJson.apply(triggerElement, [req]);
            }
        } else {
            if (onFailure) onFailure.apply(triggerElement);
        }
        sircl._runChangeActionHandlers("afterRender", triggerElement, req);
        if (!req.succeeded) sircl.handleError("S101", "Change action request failed.", req);
    }).fail(function (xhr, statusText, ex) {
        req.succeeded = false;
        req.data = null;
        sircl._runChangeActionHandlers("afterSend", triggerElement, req);
        sircl._runChangeActionHandlers("beforeRender", triggerElement, req);
        if (!req.succeeded) sircl._runChangeActionHandlers("onError", triggerElement, req);
        if (req.succeeded) {
            if ((xhr.getResponseHeader("Content-Type") || "").indexOf("text/html") == 0) {
                if (onHtml) onHtml.apply(triggerElement, [req]);
            } else {
                if (onJson) onJson.apply(triggerElement, [req]);
            }
        } else {
            if (onFailure) onFailure.apply(triggerElement);
        }
        sircl._runChangeActionHandlers("afterRender", triggerElement, req);
        if (!req.succeeded) sircl.handleError("S101", "Change action request failed.", req);
    }).always(function () {
        if (onDone) onDone.apply(triggerElement);
    });
};

$(function () {
    // On change of an ungrouped radio:
    $(document.body).on("change", "INPUT[type=radio][onchange-action]", function (event) {
        var $this = $(this);
        sircl._actionCall(this, $this, $this, $this.attr("onchange-action"), this.name, $this.prop("checked"), event, function (req) {
            this._previousActionValue = $this.prop("checked");
        }, function (req) {
                sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        }, function (req) {
            $this.prop("checked", !$this.prop("checked"));
        });
    });
    // On change of a grouped radio:
    $(document.body).on("change", "[onchange-action] INPUT[type=radio]:not([onchange-action])", function (event) {
        var $this = $(this);
        var $scope = $this.closest("[onchange-action]");
        var $subjects = $scope.find("INPUT[type=radio][name=" + this.name + "]:not([onchange-action])");
        sircl._actionCall(this, $subjects, $scope, $scope.attr("onchange-action"), this.name, jQuery.makeArray($subjects.filter(":checked")).map(function (elem) { return elem.value; }), event, function (req) {
            var newValue = req.data;
            if (Array.isArray(newValue) && newValue.length > 0) newValue = newValue[0];
            if (newValue === undefined) {
                $subjects[0]._previousActionValue = this.value;
            } else if (newValue == null || newValue == "") {
                $subjects.prop("checked", false);
                $subjects[0]._previousActionValue = null;
            } else {
                $subjects.filter("[value=" + newValue + "]").prop("checked", true);
                $subjects[0]._previousActionValue = newValue;
            }
        }, function (req) {
                sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        }, function (req) {
            var previousActionValue = $scope.find("INPUT[type=radio][name=" + this.name + "]:not([onchange-action]):first")[0]._previousActionValue;
            if (previousActionValue) {
                $scope.find("INPUT[type=radio][name=" + this.name + "][value=" + previousActionValue + "]:not([onchange-action])").prop("checked", true);
            } else {
                $scope.find("INPUT[type=radio][name=" + this.name + "]:not([onchange-action])").prop("checked", false);
            }
        });
    });
    // On change of an ungrouped checkbox:
    $(document.body).on("change", "INPUT[type=checkbox][onchange-action]", function (event) {
        var $this = $(this);
        sircl._actionCall(this, $this, $this, $this.attr("onchange-action"), this.name, $this.prop("checked"), event, function (req) {
            this._previousActionValue = $this.prop("checked");
        }, function (req) {
            sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        }, function (req) {
            $this.prop("checked", !$this.prop("checked"));
        });
    });
    // On change of a grouped checkbox:
    $(document.body).on("change", "[onchange-action] INPUT[type=checkbox]:not([onchange-action])", function (event) {
        var $this = $(this);
        var $scope = $this.closest("[onchange-action]");
        var $subjects = $scope.find("INPUT[type=checkbox][name=" + this.name + "]:not([onchange-action])");
        sircl._actionCall(this, $subjects, $scope, $scope.attr("onchange-action"), this.name, jQuery.makeArray($scope.find("INPUT[type=checkbox][name=" + this.name + "]:checked:not([onchange-action])")).map(function (elem) { return elem.value; }), event, function (req) {
            var newValue = req.data;
            if (typeof newValue === "string") newValue = [newValue];
            if (Array.isArray(newValue)) {
                $subjects.each(function () {
                    var checked = (newValue.indexOf(this.value) >= 0);
                    $(this).prop("checked", checked);
                    this._previousActionValue = checked;
                });
            } else {
                this._previousActionValue = $this.prop("checked");
            }
        }, function (req) {
            sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        }, function (req) {
            $this.prop("checked", !$this.prop("checked"));
        });
    });
    // On change of other INPUT, TEXTAREA or SELECT:
    $(document.body).on("change", "INPUT[onchange-action]:not([type=checkbox]):not([type=radio]), [onchange-action] INPUT:not([type=checkbox]):not([type=radio]):not([onchange-action]), SELECT[onchange-action], [onchange-action] SELECT:not([onchange-action]), TEXTAREA[onchange-action], [onchange-action] TEXTAREA:not([onchange-action])", function (event) {
        var $this = $(this);
        var $scope = $this.closest("[onchange-action]");
        sircl._actionCall(this, $this, $scope, $scope.attr("onchange-action"), this.name, $this.val(), event, function (req) {
            var newValue = req.data;
            if (newValue) {
                $this.val(newValue);
            }
            this._previousActionValue = $this.val();
        }, function (req) {
            sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        }, function (req) {
            $this.val(this._previousActionValue);
        });
    });

    // On focus of textual INPUT or TEXTAREA:
    $(document.body).on("focusin", "INPUT[onfocusin-action]:not([type=checkbox]):not([type=radio]), [onfocusin-action] INPUT:not([type=checkbox]):not([type=radio]):not([onfocusout-action]), TEXTAREA[onfocusin-action], [onfocusin-action] TEXTAREA:not([onfocusout-action])", function (event) {
        var $this = $(this);
        var $scope = $this.closest("[onfocusin-action]");
        sircl._actionCall(this, $this, $scope, $scope.attr("onfocusin-action"), this.name, $this.val(), event, function (req) {
            var newValue = req.data;
            if (newValue) {
                $this.val(newValue);
                try { this.select(); } catch (ex) { };
            }
        }, function (req) {
            sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        });
    });
    $(document.body).on("focusout", "INPUT[onfocusout-action]:not([type=checkbox]):not([type=radio]), [onfocusout-action] INPUT:not([type=checkbox]):not([type=radio]):not([onfocusout-action]), TEXTAREA[onfocusout-action], [onfocusout-action] TEXTAREA:not([onfocusout-action])", function (event) {
        var $this = $(this);
        var $scope = $this.closest("[onfocusout-action]");
        sircl._actionCall(this, $this, $scope, $scope.attr("onfocusout-action"), this.name, $this.val(), event, function (req) {
            var newValue = req.data;
            if (newValue) {
                $this.val(newValue);
            }
        }, function (req) {
            sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        });
    });
});

$$(function () {
    // On load, store the initial value of the input element having [onchange-action]:
    // For grouped radio's, store the value of the checked element on the first memeber of the group.
    // For all checkboxes and ungrouped radios, store the checked state.
    // For all other INPUTs, SELECTs and TEXTAREAs, store the value.
    $(this).find("INPUT[onchange-action]").each(function () {
        if ($(this).is("[type=radio]")) {
            this._previousActionValue = $(this).prop("checked");
        } else if ($(this).is("[type=checkbox]")) {
            this._previousActionValue = $(this).prop("checked");
        } else {
            this._previousActionValue = $(this).val();
        }
    });
    $(this).find("[onchange-action] INPUT:not([onchange-action])").each(function () {
        var $scope = $(this).closest("[onchange-action]");
        if ($(this).is("[type=radio]")) {
            $scope.find("INPUT[type=radio][name=" + this.name + "]:not([onchange-action]):first")[0]._previousActionValue = $("INPUT[type=radio][name=" + this.name + "]:not([onchange-action]):checked").val();
        } else if ($(this).is("[type=checkbox]")) {
            this._previousActionValue = $(this).prop("checked");
        } else {
            this._previousActionValue = $(this).val();
        }
    });
    $(this).find("TEXTAREA[onchange-action], [onchange-action] TEXTAREA:not([onchange-action])").each(function () {
        this._previousActionValue = $(this).val();
    });
    $(this).find("SELECT[onchange-action], [onchange-action] SELECT:not([onchange-action])").each(function () {
        this._previousActionValue = $(this).val();
    });
});

/**
 * Show alert message if X-Sircl-Alert-Message header set.
 */
sircl.addChangeActionHandler("afterSend", function (req) {
    var alertMessage = req.xhr.getResponseHeader("X-Sircl-Alert-Message");
    if (alertMessage) sircl.ext.alert(req.$trigger, alertMessage, null, true);
});

/**
 * Disable inputs while sending.
 */
sircl.addChangeActionHandler("beforeSend", function (req) {
    if (sircl.disableOnAction && req.event.type != "focusin" && req.event.type != "focusout" && req.event.type != "input") {
        req._elemetsDisabled = req.$subjects.filter(":not(:disabled)");
    } else {
        req._elemetsDisabled = $(null);
    }
    req._elemetsDisabled.prop("disabled", true);
});
sircl.addChangeActionHandler("afterSend", function (req) {
    req._elemetsDisabled.prop("disabled", false);
});

/**
 * Add class ".action-pending" while sending.
 */
sircl.addChangeActionHandler("beforeSend", function (req) {
    req.$scope.addClass("action-pending");
});
sircl.addChangeActionHandler("afterSend", function (req) {
    req.$scope.removeClass("action-pending");
});

/////////////////////////////////////////////////////////////////
// Sircl 2.0 - ContextMenu extension
// www.getsircl.com
// Copyright (c) 2019-2021 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The file 'sircl-contextmenu' component should be registered after the 'sircl' component. Please review order of script files.");

//#region Handling contextmenus

// BeforeSend request handler to hide open contextmenus:
sircl.addRequestHandler("beforeSend", function (req) {
    // Hide contextmenus when starting load:
    $(".contextmenu").css("display", "none");
    // Move to next handler:
    this.next(req);
});

// AfterLoad handler to register context menu event handlers:
$$(function () {
    // Add handler on parent of a .contextmenu element to show/hide context menu:
    $(this).find(".contextmenu").each(function () {
        var cm = $(this);
        var target = $($(this).attr('contextmenu-for'));
        if (target.length == 0) target = $(this).parent();
        target.on("contextmenu", function (event) {
            // Hides any currently visible context menu:
            var wasVisible = false;
            $(".contextmenu").each(function () {
                if ($(this).css("display") != "none") {
                    $(this).css("display", "none");
                    wasVisible = true;
                }
            });

            // If no context menu was currently visible, show current:
            if (!wasVisible) {
                cm
                    .css("top", (event.pageY - window.pageYOffset) + "px")
                    .css("left", (event.pageX - window.pageXOffset) + "px")
                    .css("position", "fixed")
                    .css("display", "block");
            }

            // Event is handled:
            event.stopPropagation();
            event.preventDefault();
        });
        target.on("click", function (event) {
            // On regular click, hide context menu:
            $(".contextmenu").each(function () {
                if ($(this).css("display") != "none") {
                    $(this).css("display", "none");
                }
            });
        });
    });
});

//#endregion