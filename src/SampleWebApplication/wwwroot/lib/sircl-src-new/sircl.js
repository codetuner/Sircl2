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

//#region HTML and jQuery Overrides

//$.ajaxSetup({
//    cache: false
//});

// Form submit() overwrite:
sircl_originalSubmit = HTMLFormElement.prototype.submit;
HTMLFormElement.prototype.submit = function (event) {
    if ($(this).is("FORM:not([download]):not([method=dialog])")) {
        // Find target of submit request:
        var $trigger = (this._formTrigger) ? $(this._formTrigger) : $(this);
        var target = null;
        var $targetScope = $(this);
        if ($trigger.hasAttr("formtarget")) {
            target = $trigger.attr("formtarget");
            $targetScope = $trigger;
        } else if ($trigger.closest("[target]").length > 0) {
            target = $trigger.closest("[target]").attr("target");
            $targetScope = $trigger.closest("[target]");
        }
        if ((target != null && sircl.ext.isInternalTarget(target)) || (target == null && sircl.singlePageMode == true)) {
            // Forward to the server side rendering handler:
            var $target = (target != null) ? sircl.ext.$select($targetScope, target) : sircl.ext.$mainTarget();
            sircl._submitForm($trigger, $(this), $target, event);
        } else {
            // Navigate link through default behavior
            sircl_originalSubmit.apply(this, arguments);
        }
    } else {
        // Navigate link through default behavior
        sircl_originalSubmit.apply(this, arguments);
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
        isForeground: false
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

sircl.mainTargetSelector$ = ".main-target";

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
    var $mainTarget = $(sircl.mainTargetSelector$);
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
                    $result = $result.add($("#" + $context.attr("form")));
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
 * @param {any} $target The initial target of the request.
 * @param {any} loadComplete Optional. Called when load is complete.
 */
sircl._loadUrl = function ($trigger, url, $target, loadComplete) {
    // Build request data:
    var req = {
        $trigger: $trigger,
        $initialTarget: $target,
        action: url,
        method: "get",
        accept: $trigger.attr("type"),
        isForeground: true
    };

    // Process submission:
    this._processRequest(req, loadComplete);
};

/**
 * Initiates an Ajax request submitting a form.
 * @param {any} $trigger The trigger (submit button) triggering the request.
 * @param {any} $form The form to be submitted.
 * @param {any} $target The initial target of the request.
 * @param {any} event The submit event.
 * @param {any} loadComplete Optional. Called when load is complete.
 */
sircl._submitForm = function ($trigger, $form, $target, event, loadComplete) {
    // Build request data:
    var req = {
        $form: $form,
        $trigger: $trigger,
        $initialTarget: $target,
        event: event,
        action: ($trigger.attr("formaction") || $form.attr("action") || window.location.href),
        method: ($trigger.attr("formmethod") || $form.attr("method") || "get").toLowerCase(),
        enctype: ($trigger.attr("formenctype") || $form.attr("enctype") || "application/x-www-form-urlencoded").toLowerCase(),
        charset: $form.attr("accept-charset"),
        getAttr: function (attrName) {
            return (this.$trigger.attr(attrName) || this.$form.attr(attrName));
        },
        isForeground: true
    };

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

    // Add files if any:
    if ($trigger.length > 0 && $trigger[0]._files != null && req.formData != null && req.method == "post" && req.enctype == "multipart/form-data") {
        for (var f = 0; f < $trigger[0]._files.length; f++) {
            req.formData.append($trigger[0]._filesName, $trigger[0]._files[f]);
        }
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
    // Initialize final target:
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
        // Check for abort reload:
        var reloadAfter = req.xhr.getResponseHeader("X-Sircl-ReloadAfter");
        if (reloadAfter != null) {
            if (parseFloat(reloadAfter) <= 0) {
                clearInterval(req.$initialTarget[0]._onloadInterval);
            }
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
            // Then for document language:
            req.documentLanguage = req.xhr.getResponseHeader("X-Sircl-Document-Language");
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
                    $trigger: null,
                    $initialTarget: sircl.ext.$mainTarget(),
                    action: window.location.href,
                    method: "get",
                    isForeground: true,
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
        var $response = $("<div/>").append(req.responseText);
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
    // Set document language:
    if (req.documentLanguage != null) {
        $("HTML").attr("lang", req.documentLanguage);
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
    sircl.singlePageMode = $(sircl.mainTargetSelector$).length > 0;
    console.info("sircl.singlePageMode = " + sircl.singlePageMode + "");

    /// Any element having a href attribute (and no download attribute):
    /// Handles special href values
    $(document).on("click", "*[href]:not([download])", function (event) {
        // Get href:
        var href = this.getAttribute("href");
        // In href, substitute "[...]" by form values:
        var hrefHasSubstitutions = false;
        if ($(this).hasClass("substitute-fields")) {
            var $formscope = $(this).closest("FORM");
            if ($formscope.length == 0) $formscope = $(document);
            var fieldparser = new RegExp(/(\[[a-z0-9\.\-\_]+?\])|(\%5B[a-z0-9\.\-\_]+?\%5D)/gi);
            var fieldnames = [];
            do {
                var fieldname = fieldparser.exec(href);
                if (fieldname !== null) fieldnames.push(fieldname[0]);
                else break;
            } while (true);
            for (var f = 0; f < fieldnames.length; f++) {
                hrefHasSubstitutions = true;
                var fieldvalue = (fieldnames[f].charAt(0) === "[")
                    ? $formscope.find("[name='" + fieldnames[f].substr(1, fieldnames[f].length - 2) + "']").val()
                    : $formscope.find("[name='" + fieldnames[f].substr(3, fieldnames[f].length - 6) + "']").val();
                if (fieldvalue === undefined)
                    href = href.replace(fieldnames[f], "");
                else if (fieldnames[f].charAt(0) === "[")
                    href = href.replace(fieldnames[f], fieldvalue);
                else
                    href = href.replace(fieldnames[f], encodeURIComponent(fieldvalue));
            }
        }
        // Process href:
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
                if (hrefHasSubstitutions && target === null) {
                    window.location.href = href;
                } else if (hrefHasSubstitutions) {
                    window.open(href, target);
                } else if (this.tagName === "A") {
                    return; // navigate link through default behavior
                } else if (target == null) {
                    window.location.href = href;
                } else {
                    window.open(href, target);
                }
            } else {
                // Forward to the server side rendering handler:
                sircl._loadUrl($(this), href, (target != null) ? $(target) : sircl.ext.$mainTarget());
            }
        }
        // If not returned earlier, stop event propagation:
        event.preventDefault();
        event.stopPropagation();
    });

    /// Clicking a submit element may submit a form:
    $(document).on("click", "form *:submit, *:submit[form]", function (event) {
        // To not interfer with form validation, we let default behavior happen.
        // But we want to know the form trigger element, and unfortunately there's no but a dirty way to get it...
        var form = (this.hasAttribute("form")) ? document.getElementById(this.getAttribute("form")) : $(this).closest("FORM")[0];
        clearTimeout(form._formTriggerTimer);
        form._formTrigger = this;
        form._formTriggerTimer = setTimeout(function () { form._formTrigger = null; }, 700);
    });

    /// Submitting a form:
    $(document).on("submit", "form:not([download]):not([method=dialog])", function (event) {
        this.submit();
        event.preventDefault();
        event.stopPropagation();
    });

    /// Defines default submit or cancel buttons.
    /// Pass an empty selector to disable default form submission.
    /// I.e:
    ///   <form default-submit-button="#save-button" method="post">...</form>
    $(document).on("keydown", "FORM[default-submit-button] INPUT", function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            var $form = $(this).closest("FORM");
            var $target = sircl.ext.$select($form, $form.attr("default-submit-button"));
            if ($target.length > 0) $target[0].click(); // See: http://goo.gl/lGftqn
        } else if (event.keyCode == 27) {
            event.preventDefault();
            var $form = $(this).closest("FORM");
            var $target = sircl.ext.$select($form, $form.attr("default-cancel-button"));
            if ($target.length > 0) $target[0].click(); // See: http://goo.gl/lGftqn
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
                    $trigger: null,
                    $initialTarget: sircl.ext.$mainTarget(),
                    action: state.url,
                    method: "get",
                    isForeground: true,
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
            req._spinner_to_restore = req.$trigger[0].innerHTML;
            $spinners[0].outerHTML = sircl.html_spinner;
        }
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function (req) {
    // Hide spinner if any:
    if (req._spinner_to_restore) {
        req.$trigger[0].innerHTML = req._spinner_to_restore;
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
    $(document).addClass("body-loading");
    req.$initialTarget.addClass("loading");
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function (req) {
    // Reset classes to loading state:
    $(document).removeClass("body-loading");
    req.$initialTarget.removeClass("loading");
    // Move to next handler:
    this.next(req);
});

$(document).ready(function () {
    $(window).on("beforeunload", function (event) {
        // Ensure load status items are shown:
        $(document).addClass("body-loading");
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

//#region Reload by server

sircl.addRequestHandler("afterRender", function (req) {
    // If reloadAfter header is set with value > 0, reload after timeout:
    var reloadAfter = req.xhr.getResponseHeader("X-Sircl-ReloadAfter");
    if (reloadAfter) {
        // Parse delay ("seconds" or "[hh:]mm:ss"):
        var delaypart = reloadAfter.split(":");
        var delay = 0;
        for (var i = 0; i < delaypart.length; i++) delay = parseFloat(delaypart[i]) + (60 * delay);
        // Set timer:
        if (reloadAfter > 0 && req.method == "get") {
            setTimeout(function () {
                req.$finalTarget.load(req.url)
            }, delay * 1000);
        }
    }
    // Move to next handler:
    this.next(req);
});

//#endregion

//#region HTML5 Dialog handling

sircl.addAttributeAlias(".onclick-closedialog", "onclick-closedialog", "<DIALOG");

$(function () {

    /// Opens the given dialog when clicked:
    /// <* onclick-showdialog="selector" >
    $(document).on("click", "[onclick-showdialog]", function (event) {
        var $dlg = sircl.ext.$select($(this), $(this).attr("onclick-showdialog"));
        if ($dlg.length > 0) {
            // If final dialog is exclusive, close all other open dialogs:
            if ($dlg.is(".dialog-exclusive")) {
                $("DIALOG[open]").each(function () {
                    if (!$dlg.is($(this))) {
                        // Close dialog:
                        this.close();
                        //// Restore content:
                        //var originalContent = this._originalContent;
                        //if (originalContent !== undefined) $(this).html(originalContent);
                    }
                });
            }
            // Open the dialog:
            if ($dlg.hasClass("dialog-modal")) {
                $dlg[0].showModal();
            } else {
                $dlg[0].show();
            }
        }
    });

    /// Closes the given dialog when clicked:
    /// <* onclick-closedialog="selector" >
    $(document).on("click", "[onclick-closedialog]", function (event) {
        var $dlg = sircl.ext.$select($(this), $(this).attr("onclick-closedialog"));
        if ($dlg.length > 0) {
            // Close dialog:
            $dlg[0].close();
        //    // Restore content:
        //    var originalContent = $dlg[0]._originalContent;
        //    if (originalContent !== undefined) $dlg.html(originalContent);
        }
    });

});

sircl.addRequestHandler("beforeSend", function (req) {
    var processor = this;
    // Open any non-open dialog holding the initial target and having class "onload-showdialog":
    req._dialogOpened = req.$initialTarget.closest("DIALOG.onload-showdialog:not([open])");
    if (req._dialogOpened.length > 0) {
        // If initial dialog is exclusive, close all other open dialogs:
        if (req._dialogOpened.is(".dialog-exclusive")) {
            $("DIALOG[open]").each(function () {
                if (!$(this).is(req.$finalTarget)) {
                    // Close dialog:
                    this.close();
                //    // Restore content:
                //    var originalContent = this._originalContent;
                //    if (originalContent !== undefined) $(this).html(originalContent);
                }
            });
        }
        // Open the dialog:
        if (req._dialogOpened.hasClass("dialog-modal")) {
            req._dialogOpened[0].showModal();
        } else {
            req._dialogOpened[0].show();
        }
    }
    // Move to next handler:
    processor.next(req);
});

sircl.addRequestHandler("afterSend", function (req) {
    var processor = this;
    // On error, undo opened dialogs:
    if (!req.succeeded && req._dialogOpened.length > 0) {
        // Close dialog:
        req._dialogOpened[0].close();
        req._dialogOpened = $([]);
    } else if (req.xhr.status == "204") {
        // Else, if status "204" (no content), close target dialog:
        var $dlg = req.$initialTarget.closest("DIALOG[open]");
        if ($dlg.length > 0) {
            // Close dialog:
            $dlg[0].close();
        //    // Restore content:
        //    var originalContent = $dlg[0]._originalContent;
        //    if (originalContent !== undefined) $dlg.html(originalContent);
        }
    }
    // Move to next handler:
    processor.next(req);
});

sircl.addRequestHandler("beforeRender", function (req) {
    var processor = this;
    // Undo opened dialog if target has changed:
    if (req.targetHasChanged && req._dialogOpened.length > 0) {
        if (!req.$finalTarget.has(req._dialogOpened)) {
            // Close dialog:
            req._dialogOpened[0].close();
            req._dialogOpened = $([]);
        //    // Restore content:
        //    var originalContent = req._dialogOpened[0]._originalContent;
        //    if (originalContent !== undefined) req._dialogOpened.html(originalContent);
        }
    }
    // If final dialog is exclusive, close all other open dialogs:
    var $targetDlg = req.$finalTarget.closest("DIALOG");
    if ($targetDlg.is(".dialog-exclusive")) {
        $("DIALOG[open]").each(function () {
            if (!$targetDlg.is($(this))) {
                // Close dialog:
                this.close();
                //// Restore content:
                //var originalContent = this._originalContent;
                //if (originalContent !== undefined) $(this).html(originalContent);
            }
        });
    }
    // Move to next handler:
    processor.next(req);
});

sircl.addRequestHandler("afterRender", function (req) {
    var processor = this;
    // Open modal on final target:
    var $dlg = req.$finalTarget.closest("DIALOG:not([open])");
    if ($dlg.length > 0) {
        if ($dlg.hasClass("dialog-modal")) {
            $dlg[0].showModal();
        } else {
            $dlg[0].show();
        }
    }
    // Move to next handler:
    processor.next(req);
});

$$(function () {
    // Backup original content of onclose-restore dialogs to be able to reset on close:
    $(this).find("DIALOG.onclose-restore").each(function (index, elem) {
        elem._originalContent = $(elem).html();
        // Reset content of a dialog with onclose-restore when closing the dialog:
        elem.addEventListener("close", function (event) {
            var originalContent = this._originalContent;
            if (originalContent !== undefined) {
                $(this).html(originalContent);
            }
        });
    });

    $(this).find("DIALOG[open-after]").each(function () {
        // Parse delay ("seconds" or "[hh:]mm:ss"):
        var delay = 0;
        var delaypart = $(this).attr("open-after").split(":");
        for (var i = 0; i < delaypart.length; i++) delay = parseFloat(delaypart[i]) + (60 * delay);
        // Set timer:
        setTimeout(function (dlg) {
            var $dlg = $(dlg);
            // If final dialog is exclusive, close all other open dialogs:
            if ($dlg.is(".dialog-exclusive")) {
                $("DIALOG[open]").each(function () {
                    if (!$dlg.is($(this))) {
                        // Close dialog:
                        this.close();
                        //// Restore content:
                        //var originalContent = this._originalContent;
                        //if (originalContent !== undefined) $(this).html(originalContent);
                    }
                });
            }
            // Open dialog:
            if ($dlg.hasClass("dialog-modal")) {
                dlg.showModal();
            } else {
                dlg.show();
            }
        }, (delay * 1000), this);
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
    $(document).on("change", "[onchange-submit]", function (event) {
        if ($(event.target).closest(".onchange-nosubmit").length == 0 && $(event.target).closest(".sircl-content-processing").length == 0) {
            var $form = sircl.ext.$select($(this), $(this).attr("onchange-submit"));
            if ($form.length > 0) $form[0].submit();
        }
    });

    /// <input oninput-changeafter="0.8"> On input on the element, triggers a change event.
    $(document).on("input", "INPUT[oninput-changeafter], TEXTAREA[oninput-changeafter]", function (event) {
        var timeout = 1000 * $(this).attr("oninput-changeafter");
        if (this._oninput_changeafter_timeout) {
            clearTimeout(this._oninput_changeafter_timeout);
        }
        this._oninput_changeafter_timeout = setTimeout(function (elem) {
            $(elem).change();
        }, timeout, this);
    });
    /// Prevent change event if value has not really changed since last change event:
    $(document.body).on("change", "INPUT[oninput-changeafter], TEXTAREA[oninput-changeafter]", function (event) {
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
        sircl.ext.$select($(this), $(this).attr("onload-click"))[0].click(); // See: http://goo.gl/lGftqn
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
            // Parse delay ("seconds" or "[hh:]mm:ss"):
            var delaypart = loadRefresh.split(":");
            var delay = 0;
            for (var i = 0; i < delaypart.length; i++) delay = parseFloat(delaypart[i]) + (60 * delay);
            // Set timer:
            $(this)[0]._onloadInterval = window.setInterval(function ($target) { $target.load(url.replace("{rnd}", Math.random())); }, delay * 1000, $(this));
        } else {
            //$(this).removeAttr("onload-load"); Do not remove otherwise onload-reload does not work...
        }
    });

    /// <* onload-reload="selector"> Instructs the matches of the selector to reload their content (provided they have an [onload-load] attribute).
    $(this).find("[onload-reload]").each(function () {
        $($(this).attr("onload-reload")).filter("[onload-load]").each(function () {
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
