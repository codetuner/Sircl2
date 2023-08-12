/////////////////////////////////////////////////////////////////
// Sircl 2.x - Core
// www.getsircl.com
// Copyright (c) 2019-2022 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Coding conventions:
// - Within selectors, write tagnames capitalized, i.e: "A[href]".
// - Variablenames holding selector strings end with '$', i.e: var selector$ = ".class";
// - Variablenames holding jQuery selection objects start with '$', i.e: var $selection = $(".class");
// - Strings are surrounded by double-quotes.

//#region Prerequisites

// Check JQuery is installed:
if (typeof jQuery === "undefined") console.error("Sircl requires jQuery to be executed before Sircl libraries. Please add the jQuery script or move it before Sircl scripts.");

//#endregion

//#region jQuery Overrides

//$.ajaxSetup({
//    cache: false
//});

// jQuery html() override:
sircl_originalJqHtml = $.fn.html;
$.fn.html = function (htmlStringOrFx) {
    var $t = this;
    if (htmlStringOrFx === undefined) {
        return sircl_originalJqHtml.call($t);
    } else {
        $t.each(function () { sircl._beforeUnload(this); });
        var response = sircl_originalJqHtml.call($t, htmlStringOrFx);
        if (htmlStringOrFx !== null) {
            $t.each(function () { sircl._afterLoad(this); });
        }
        return response;
    }
};

// jQuery load() override:
sircl_originalJqLoad = $.fn.load;
$.fn.load = function (url, data, callback) {
    // Adjust params:
    if (callback === undefined && typeof data == "function") {
        callback = data;
        data = null;
    }
    // Build request data:
    var req = {
        $trigger: this,
        $initialTarget: this,
        targetMethod: this.attr("target-method") || null,
        action: url,
        method: "get",
        enctype: null,
        formData: data,
        isForeground: false
    };

    // Process submission:
    sircl._processRequest(req, callback);

    // Return this for chaining:
    return this;
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
console.info("Sircl v." + sircl.version + " running.");

/**
 * Defines an class alias for an attribute with specific value.
 * @param {any} aliasClass$ The class that is the alias.
 * @param {any} attributeName The attribute name.
 * @param {any} attributeValue The default attribute value.
 */
sircl.addAttributeAlias = function (aliasClass$, attributeName, attributeValue) {
    sircl.addContentReadyHandler("enrich", function sircl_addAttributeAlias() {
        $(this).find(aliasClass$).each(function () {
            $(this).attr(attributeName, attributeValue);
        });
    });
};

//#endregion

//#region Miscellaneous settings

sircl.html_spinner = '<i class="sircl-spinner sircl-spinning"></i> ';

sircl.max_redirects = 20;

sircl.mainTargetSelector$ = ".main-target";

sircl.lastPageNavigationObject = null;

//#endregion

//#region Sircl extensions library

sircl.ext = {};

/**
 * Returns the first element of the given array, or null if array undefined or empty.
 * @param {any} array The array.
 */
sircl.ext.firstOrNull = function sircl_ext_firstOrNull(array) { if (array) { if (array.length > 0) return array[0]; else return null; } else return null; };

/**
 * Get current visible state or set visible state of given element or selector.
 * @param {any} elementOrSelector Element or selector.
 * @param {any} visible True to make it visible, false to make it hidden. Absent to get current visible state.
 */
sircl.ext.visible = function sircl_ext_visible(elementOrSelector, visible) {
    if (visible === undefined) {
        return !$(elementOrSelector).hasAttr("hidden");
    } else if (visible) {
        $(elementOrSelector).removeAttr("hidden");
    } else {
        $(elementOrSelector).attr("hidden", "hidden");
    }
};

/**
 * Get current enabled state or set enabled state of given element or selector.
 * @param {any} elementOrJqObject Element or jQuery object.
 * @param {any} enabled True to make it enabled, false to make it disabled. Absent to get current enabled state.
 */
sircl.ext.enabled = function sircl_ext_enabled(elementOrJqObject, enabled) {
    var $selector = $(elementOrJqObject);
    if (enabled === undefined) {
        if ($selector.length > 0) {
            if ($selector[0].hasAttribute("href")) {
                return !$selector[0].hasAttribute("disabled");
            } else {
                return !$selector.prop("disabled");
            }
        } else {
            return false;
        }
    } else {
        $selector.each(function () {
            if (this.hasAttribute("href")) {
                if (enabled) {
                    $selector.removeAttr("disabled");
                } else {
                    $selector.attr("disabled", "disabled");
                }
            } else {
                $selector.prop("disabled", !enabled);
            }
        });
    }
}

/**
 * Returns the id of the given element or selector.
 * @param {any} elementOrSelector Element or selector.
 * @param {any} createIdIfMissing True to create and id if none exists yet.
 */
sircl.ext.getId = function sircl_ext_getId(elementOrSelector, createIdIfMissing) {
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
 * Returns the effective value of the form control element. For checkboxes and radios: there value if they are
 * checked, empty string otherwise, for other controls, their current value.
 * For multiselects, an array is returned. For all other controls, a string is returned.
 * @param {any} element Form control element to get the value from.
 */
sircl.ext.effectiveValue = function sircl_ext_effectivValue(element) {
    if (element.tagName == "INPUT" && element.getAttribute('type') == 'checkbox') {
        return (element.checked) ? element.value : "";
    } else if (element.tagName == "INPUT" && element.getAttribute('type') == 'radio') {
        return (element.checked) ? element.value : "";
    } else {
        return $(element).val() || "";
    }
}

/**
 * Returns the main target of the page.
 */
sircl.ext.$mainTarget = function sircl_ext_$mainTarget() {
    var $mainTarget = $(sircl.mainTargetSelector$);
    return $mainTarget;
}

/**
 * Returns whether the value should be interpreted as an internal target as opposed to an external target to a browser window, frame or tab.
 * Targets starting with any of these characters is considered internal: #, ., *, :, <, >, &, [, space.
 * External targets typically start with an underscore (as _self, _top, _blank) or are alphanumeric.
 * @param {any} targetValue
 */
sircl.ext.isInternalTarget = function sircl_ext_isInternalTarget(targetValue) {
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
sircl.ext.isExternalTarget = function sircl_ext_isExternalTarget(targetValue) { return !sircl.ext.isInternalTarget(targetValue); };

/**
 * Resolves an absolute or relative selector in the given context.
 * @param {any} $context Context in which to resolve the selector.
 * @param {any} selector$ Absolute or relative selector string.
 */
sircl.ext.$select = function sircl_ext_$select($context, selector$) {
    if (selector$ === undefined || selector$ === null) {
        return $([]);
    } else {
        var selectorParts$ = selector$.split(",");
        var $result = $([]);
        for (var i = 0; i < selectorParts$.length; i++) {
            var sel$ = selectorParts$[i].trim();
            if (sel$.length == 0) {
                // Ignore
            } else if (sel$.indexOf("|") >= 0 && sel$.indexOf("|=") < sel$.indexOf("|")) { // Break on "|" but not on "|=" as in https://api.jquery.com/attribute-contains-prefix-selector/
                var breakpos = sel$.indexOf("|");
                $result = $result.add(sircl.ext.$select(sircl.ext.$select($context, sel$.substr(0, breakpos)), sel$.substr(breakpos + 1)));
            } else if (sel$ === ":this") {
                $result = $result.add($context);
            } else if (sel$ === ":parent") {
                $result = $result.add($context).parent();
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
sircl.ext.cssEscape = function sircl_ext_cssEscape(value) {
    try {
        return CSS.escape(value);
    } catch (ex) {
        // MSIE does not support CSS.escape:
        return value
            .replace(/\./g, "\\.")
            .replace(/\,/g, "\\,")
            .replace(/\:/g, "\\:")
            .replace(/\*/g, "\\*")
            .replace(/\#/g, "\\#")
            .replace(/\(/g, "\\(")
            .replace(/\)/g, "\\)")
            .replace(/\[/g, "\\[")
            .replace(/\\/g, "\\\\")
            .replace(/\//g, "\\/")
            .replace(/\%/g, "\\%")
            .replace(/\]/g, "\\]");
    }
};

/**
 * Helper method to perform an action on given scopes.
 * @param {any} $scope A scope.
 * @param {string} expression An expression consisting of comma-separated parts that may contain an "on" clausule.
 * @param {scopedDoCallback} action The action to perform.
 */
sircl.ext.scopedDo = function sircl_ext_scopedDo($scope, expression, action) {
    try {
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
    } catch (ex) {
        var el = null;
        if ($scope != null && $scope.length > 0) el = $scope[0];
        sircl.handleError("S151", "Error evaluating class action value \"" + expression + "\" : " + ex, { exception: ex, element: el });
    }
};

/**
  * Add class to a given scope.
  * @param {any} $scope
  * @param {string} classExpression Class name to add. Can contain an "on" clausule. Supports comma-separated list. I.e. "active, highlighted on < li" : make scope active and closest li highlighted.
  */
sircl.ext.addClass = function sircl_ext_addClass($scope, classExpression) {
    sircl.ext.scopedDo($scope, classExpression, function ($s, c) { $s.addClass(c); })
};

/**
 * Remove class from a given scope.
 * @param {any} $scope
 * @param {string} classExpression Class name to remove. Can contain an "on" clausule. Supports comma-separated list. I.e. "active, highlighted on < li" : remove active from scpe and highlighted from closest li.
 */
sircl.ext.removeClass = function sircl_ext_removeClass($scope, classExpression) {
    sircl.ext.scopedDo($scope, classExpression, function ($s, c) { $s.removeClass(c); })
};

/**
 * Toggle class on a given scope.
 * @param {any} $scope
 * @param {string} classExpression Class name to toggle. Can contain an "on" clausule. Supports comma-separated list. I.e. "active, highlighted on < li" : toggle active on scope and highlighted on closest li.
 */
sircl.ext.toggleClass = function sircl_ext_toggleClass($scope, classExpression) {
    sircl.ext.scopedDo($scope, classExpression, function ($s, c) { $s.toggleClass(c); })
};

/**
 * Shows an alert message.
 * @param {any} subject Sender of the alert request.
 * @param {any} message Message to show.
 * @param {any} event Event that triggered the confirm request.
 */
sircl.ext.alert = function sircl_ext_alert(subject, message, event) {
    window.alert(message);
};

/**
 * Shows a confirm message.
 * @param {any} subject Sender element of the confirm request.
 * @param {any} message Message to show.
 * @param {any} event Event that triggered the confirm request.
 * @returns True if confirmed, false otherwise.
 */
sircl.ext.confirm = function sircl_ext_confirm(subject, message, event) {
    return window.confirm(message);
};

/**
 * Retrieves the value of the named querystring parameter.
 * @param {any} name Name of the querystring parameter.
 */
sircl.ext.getUrlParameter = function sircl_ext_getUrlParameter(name) {
    // Note: in v3 replace this by URLSearchParams (not supported by MSIE).
    name = name.replace(/[\[]/g, '\\[').replace(/[\]]/g, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

/**
 * Submits a form.
 * @param {any} event Event initiating the submit request.
 */
sircl.ext.submit = function sircl_ext_submit(form, event, fallback) {
    if ($(form).is("FORM:not([download]):not([method=dialog])")) {
        // Find target of submit request:
        var $trigger = (form._formTrigger) ? $(form._formTrigger) : $(form);
        var target = null;
        var targetMethod = null;
        var $targetScope = $(form);
        if ($trigger.hasAttr("formtarget")) {
            $targetScope = $trigger;
            target = $targetScope.attr("formtarget");
            targetMethod = $targetScope.attr("target-method");
        } else if ($trigger.closest("[target]").length > 0) {
            $targetScope = $trigger.closest("[target]");
            target = $targetScope.attr("target");
            targetMethod = $targetScope.attr("target-method");
        }
        if ((target != null && sircl.ext.isInternalTarget(target)) || (target == null && sircl.singlePageMode == true)) {
            // Forward to the server side rendering handler:
            var $target = (target != null) ? sircl.ext.$select($targetScope, target) : sircl.ext.$mainTarget();
            sircl._submitForm($trigger, $(form), $target, targetMethod, event);
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
        } else {
            // Perform page navigation preparation:
            sircl._onPageNavigate(event, $trigger, $(form));
            // Invoke fallback:
            if (fallback) fallback();
        }
    } else {
        // Invoke fallback:
        if (fallback) fallback();
    }
}

/**
 * Returns the URL with substituted fields (form field references between [ and ]).
 * @param {any} url The url to substitute.
 * @param {any} $source The source of the substitution, usually the element holding the URL reference.
 * @param {any} mustHaveSubstituteFieldsClass Whether to check for ".substitute-fields" class.
 */
sircl.ext.subtituteFields = function sircl_ext_substituteFields(url, $source, mustHaveSubstituteFieldsClass) {
    if (mustHaveSubstituteFieldsClass == false || $source.hasClass("substitute-fields")) {
        var $formscope = $source.closest("FORM");
        if ($formscope.length == 0) $formscope = $(document);
        var fieldparser = new RegExp(/(\[[a-z0-9\.\-\_]+?\])|(\%5B[a-z0-9\.\-\_]+?\%5D)/gi);
        var fieldnames = [];
        do {
            var fieldname = fieldparser.exec(url);
            if (fieldname !== null) fieldnames.push(fieldname[0]);
            else break;
        } while (true);
        var fieldvalue;
        for (var f = 0; f < fieldnames.length; f++) {
            var fieldname = (fieldnames[f].charAt(0) === "[")
                ? fieldnames[f].substr(1, fieldnames[f].length - 2)  // Fieldname surrounded by '[' and ']'
                : fieldnames[f].substr(3, fieldnames[f].length - 6); // Fieldname surrounded by '%5B' and '%5D'
            var fields = $formscope.find("[name='" + fieldname + "']");
            if (fields.length == 1) {
                fieldvalue = sircl.ext.effectiveValue(fields[0]);
            } else if (fields.length > 1) {
                fieldvalue = [];
                for (var v = 0; v < fields.length; v++) {
                    var vval = sircl.ext.effectiveValue(fields[v]);
                    if (vval != "") fieldvalue.push(vval);
                }
                fieldvalue = fieldvalue.join();
            } else {
                fieldvalue = null;
            }
            if (fieldvalue === null)
                url = url.replace(fieldnames[f], "");
            else
                url = url.replace(fieldnames[f], encodeURIComponent(fieldvalue));
        }
    }
    return url;
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
 * @param [any] targetMethod The method to use to fill the target ('content', 'prepend', 'append', 'replace'). Null for default.
 * @param {any} loadComplete Optional. Called when load is complete.
 */
sircl._loadUrl = function ($trigger, url, $target, targetMethod, loadComplete) {
    // Build request data:
    var req = {
        $trigger: $trigger,
        $initialTarget: $target,
        targetMethod: targetMethod,
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
 * @param {any} targetMethod The method to use to fill the target.
 * @param {any} event The submit event.
 * @param {any} loadComplete Optional. Called when load is complete.
 */
sircl._submitForm = function ($trigger, $form, $target, targetMethod, event, loadComplete) {
    // Build request data:
    var req = {
        $form: $form,
        $trigger: $trigger,
        $initialTarget: $target,
        targetMethod: targetMethod,
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
    var triggerIsFormField = ($trigger != null) && ($trigger.is("INPUT:not([type=submit]), SELECT, TEXTAREA"));
    if (req.method == "post") {
        if (req.enctype == "multipart/form-data") {
            req.formData = new FormData($form[0]);
            if (!triggerIsFormField && $trigger != null && $trigger.attr("name") != null) req.formData.append($trigger.attr("name"), $trigger.val());
            // Add files if any:
            if ($trigger.length > 0 && $trigger[0]._files != null) {
                for (var f = 0; f < $trigger[0]._files.length; f++) {
                    req.formData.append($trigger[0]._filesName, $trigger[0]._files[f]);
                }
            }
        } else if (req.enctype == "text/plain") {
            req.formData = $form.serialize(); // TODO: test and eventually change, should be one line per variable, unencoded
            if (!triggerIsFormField && $trigger != null && $trigger.attr("name") != null) req.formData = encodeURIComponent($trigger.attr("name")) + "=" + encodeURIComponent($trigger.val()) + "&" + req.formData;
        } else {
            req.formData = $form.serialize();
            if (!triggerIsFormField && $trigger != null && $trigger.attr("name") != null) req.formData = encodeURIComponent($trigger.attr("name")) + "=" + encodeURIComponent($trigger.val()) + "&" + req.formData;
        }
    } else {
        // Extend req.action url with serialized form parameters, keeping hash (if any) at the end:
        var actionParsed = sircl.urlParser.exec(req.action); // [1]=base url, [2]=query string, [3]=hash
        var triggerPair = (!triggerIsFormField && $trigger != null && $trigger.attr("name") != null) ? encodeURIComponent($trigger.attr("name")) + "=" + encodeURIComponent($trigger.val()) + "&" : "";
        req.action = actionParsed[1] + ((actionParsed[2]) ? actionParsed[2] + "&" : "?") + triggerPair + $form.serialize() + ((actionParsed[3]) ? actionParsed[3] : "");
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
    if (Intl) req.xhr.setRequestHeader("X-Sircl-Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
    req.xhr.setRequestHeader("X-Sircl-Timezone-Offset", new Date().getTimezoneOffset());

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
        var reloadAfter = req.xhr.getResponseHeader("X-Sircl-Reload-After");
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
                if (req.redirects > sircl.max_redirects) {
                    sircl.handleError("S141", "Too many redirects.", { request: req });
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
                    req.xhr.setRequestHeader("X-Sircl-Timezone-Offset", new Date().getTimezoneOffset());
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
                    req.targetMethod = null;
                    req.targetHasChanged = true;
                } else {
                    console.warn("X-Sircl-Target response header value '_self' is only vaid for 'get' requests.");
                }
            } else if (newTarget$ == "main") {
                req.$finalTarget = sircl.ext.$mainTarget();
                req.targetMethod = null;
                req.targetHasChanged = true;
            } else if (newTarget$ != null) {
                req.$finalTarget = sircl.ext.$select(req.$trigger, newTarget$);
                req.targetMethod = null;
                req.targetHasChanged = true;
            }
            // Then for document title:
            req.documentTitle = req.xhr.getResponseHeader("X-Sircl-Document-Title");
            // Then for document language:
            req.documentLanguage = req.xhr.getResponseHeader("X-Sircl-Document-Language");
            // Then for alert message header:
            req.alertMsg = req.xhr.getResponseHeader("X-Sircl-Alert-Message");
            // Then for target method:
            if (req.xhr.getResponseHeader("X-Sircl-Target-Method") !== null) {
                req.targetMethod = req.xhr.getResponseHeader("X-Sircl-Target-Method");
            } else if (req.xhr.getResponseHeader("X-Sircl-Render-Mode") !== null) {
                // DEPRECATED: "X-Sircl-Render-Mode" has been replaced by "X-Sircl-Target-Method":
                req.targetMethod = req.xhr.getResponseHeader("X-Sircl-Render-Mode");
                console.warn("X-Sircl-Render-Mode response header is deprecated and replaced by X-Sircl-Target-Method.");
            } else if (req.targetMethod == null && req.$finalTarget != null) {
                req.targetMethod = req.$finalTarget.attr("target-method");
            }
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
    if (req.alertMsg) sircl.ext.alert(sircl.ext.firstOrNull(req.$trigger), req.alertMsg, null);
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
                    targetMethod: null,
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
        // Do not proceed with next: abort the pipeline.
    }
};

SirclRequestProcessor.prototype._render = function (req) {
    // Set document title:
    if (req.documentTitle != null) {
        window.document.title = req.documentTitle;
    }
    // Set document language:
    if (req.documentLanguage != null) {
        $("HTML").attr("lang", req.documentLanguage);
    }
    // Retrieve target and responseText:
    var $realTarget = req.$finalTarget;
    var realResponseText = req.responseText;
    // Apply sub-target if any:
    var subTarget$ = req.xhr.getResponseHeader("X-Sircl-Sub-Target") || req.getAttr("sub-target");
    var $subTarget = req.$finalTarget.find(subTarget$);
    // If the sub-target is found in the finalTarget:
    if (subTarget$ != null && $subTarget.length > 0) {
        var subTargetSucceeded = true;
        // Parse the responseText:
        var $response = $("<div/>").append(req.responseText);
        var $responseSubTargets = $response.find(subTarget$);
        // If same count of subTargets and all have matching ids:
        if ($subTarget.length == $responseSubTargets.length) {
            for (var s = 0; s < $subTarget.length; s++) {
                for (var r = 0; r < $responseSubTargets.length; r++) {
                    if ($subTarget[s].hasAttribute("id") && $subTarget[s].id === $responseSubTargets[r].id) {
                        // Substitute subtarget (only if different):
                        var responseSubTargetText = $($responseSubTargets[r]).html();
                        if ($($subTarget[s]).html() != responseSubTargetText) $($subTarget[s]).html(responseSubTargetText);
                        break; // This loop can now safely be aborted, outer loop will proceed
                    }
                }
                if (r >= $responseSubTargets.length) {
                    // No matching substitution was found:
                    subTargetSucceeded = false;
                }
            }
            // Proceed with next (afterRender) and abort:
            if (subTargetSucceeded) {
                this.next(req);
                return;
            }
        }
    }
    // Render, applying correct render mode:
    if (req.targetMethod === "append") {
        // If append mode, append responseText and force afterLoad:
        var initialLength = $realTarget.children().length;
        $realTarget.append(realResponseText);
        $realTarget.children().slice(initialLength).each(function () { sircl._afterLoad(this); });
    } else if (req.targetMethod === "prepend") {
        // If prepend mode, prepend responseText and force afterLoad:
        var initialLength = $realTarget.children().length;
        $realTarget.prepend(realResponseText);
        var finalLength = $realTarget.children().length;
        $realTarget.children().slice(0, finalLength - initialLength).each(function () { sircl._afterLoad(this); });
    } else if (req.targetMethod === "replace") {
        // If replace mode, replaces responseText and force afterLoad on the parents:
        var realTargetId = ($realTarget.length == 1) ? sircl.ext.getId($realTarget[0], false) : null;
        var $realTargetParent = $realTarget.parent();
        var $realTargetSiblings = $realTargetParent.children();
        var initialLength = $realTargetSiblings.length;
        // Retrieve position of element to be replaced:
        var id = sircl.ext.getId($realTarget, true);
        var pos = -1;
        for (var i = 0; i < initialLength; i++) {
            if ($realTargetSiblings[i].id === id) {
                pos = i;
                break;
            }
        }
        // Perform replacement:
        $realTarget.replaceWith(realResponseText);
        var finalLength = $realTargetParent.children().length;
        // If replaced by a single element with no id, copy id from original:
        if (pos > -1 && initialLength === finalLength && realTargetId !== null) {
            var elem = $realTargetParent.children()[pos];
            if (elem.id == null || elem.id == "") elem.id = realTargetId;
        }
        // If if replaced by one or more elements, apply afterLoad to the new elements:
        if (pos > -1 && finalLength >= initialLength) {
            $realTargetParent.children().slice(pos, pos + finalLength - initialLength + 1).each(function () { sircl._afterLoad(this); });
            // Otherwise, replace just removed the element, no afterLoad needed.
        }
    } else {
        // Else, replace inner html of target:
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
            sircl.handleError("S131", "Error executing a RequestProcessor step: " + ex, { exception: ex, fx: step, request: req });
            this.next(req);
        }
    } else if (this._loadComplete) {
        // Else, if loadComplete defined, execute it:
        this._loadComplete(req.responseText, req.statusText, req.xhr);
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

    // Disable disabled hyperlinks:
    $(document).on("click", "*[href][disabled], [onclick-load][disabled]", function (event) {
        // If not returned earlier, stop event propagation:
        event.preventDefault();
        event.stopPropagation();
    });

    /// Any element having a href attribute (and no download attribute), or an onclick-load attribute:
    /// Handles special href values
    $(document).on("click", "*[href]:not([download]), [onclick-load]", function (event) {
        // Check disabled:
        if ($(this).is("[disabled]")) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        // Get href:
        var href, canBeHandledByBrowser;
        if (this.hasAttribute("onclick-load")) {
            href = this.getAttribute("onclick-load");
            canBeHandledByBrowser = false;
        } else {
            href = this.getAttribute("href");
            canBeHandledByBrowser = (this.tagName === "A");
        }
        // In href, substitute "[...]" by form values:
        var hrefBefore = href;
        href = sircl.ext.subtituteFields(href, $(this), true);
        var hrefHasSubstitutions = (href != hrefBefore);
        // Process href:
        if (href === "null" || href === "") {
            // Ignore
        } else if (href === "history:back") {
            window.history.back();
        } else if (href === "history:back-uncached") {
            sircl.ext.$mainTarget().addClass("sircl-history-nocache-once");
            window.history.back();
        } else if (href === "history:refresh") {
            // Perform page navigation preparation:
            sircl._onPageNavigate(event, $(this));
            // Reload page:
            location.reload();
        } else if (href.indexOf("alert:") === 0) {
            sircl.ext.alert(this, href.substr(6), event);
        } else if (href.indexOf("javascript:") === 0) {
            var nonce = this.getAttribute("nonce");
            if (nonce) {
                jQuery.globalEval(href.substr(11), { nonce: nonce });
            } else {
                jQuery.globalEval(href.substr(11));
            }
        } else if (canBeHandledByBrowser && href.indexOf("#") === 0) {
            // Perform page navigation preparation:
            sircl._onPageNavigate(event, $(this));
            // Navigate link through default behavior:
            return; 
        } else if (href.indexOf("#") === 0) {
            // Perform page navigation preparation:
            sircl._onPageNavigate(event, $(this));
            // Load page:
            window.location.hash = href;
        } else {
            var target = this.getAttribute("target");
            if ((target == null && !sircl.singlePageMode) || (target != null && sircl.ext.isExternalTarget(target))) {
                // Perform page navigation preparation:
                sircl._onPageNavigate(event, $(this));
                // Load whole page:
                if (hrefHasSubstitutions && target === null) {
                    window.location.href = href;
                } else if (hrefHasSubstitutions) {
                    window.open(href, target);
                } else if (canBeHandledByBrowser) {
                    return; // navigate link through default behavior
                } else if (target == null) {
                    window.location.href = href;
                } else {
                    window.open(href, target);
                }
            } else {
                // Forward to the server side rendering handler:
                var $target = (target != null) ? sircl.ext.$select($(this), target) : sircl.ext.$mainTarget();
                var targetMethod = this.getAttribute("target-method") || null;
                sircl._loadUrl($(this), href, $target, targetMethod);
            }
        }
        // If not returned earlier, stop event propagation:
        event.preventDefault();
        event.stopPropagation();
    });

    /// Performs a reload of an element having an onload-load attribute:
    $(document).on("click", "*[onclick-reload]", function (event) {
        // Check disabled:
        if ($(this).is("[disabled]")) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        // Perform reload:
        sircl.ext.$select($(this), $(this).attr("onclick-reload")).filter("[onload-load]").each(function () {
            var url = $(this).attr("onload-load") + "";
            $(this).load(url.replace("{rnd}", Math.random()));
        });
    });

    /// Clicking a submit element may submit a form:
    $(document).on("click", "form *:submit, *:submit[form]", function (event) {
        // Check disabled:
        if ($(this).is("[disabled]")) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        // To not interfer with form validation, we let default behavior happen.
        // But we want to know the form trigger element, and unfortunately there's no but a dirty way to get it...
        var form = (this.hasAttribute("form")) ? document.getElementById(this.getAttribute("form")) : $(this).closest("FORM")[0];
        clearTimeout(form._formTriggerTimer);
        form._formTrigger = this;
        form._formTriggerTimer = setTimeout(function () { form._formTrigger = null; }, 700);
    });

    sircl.addAttributeAlias(".onclick-submit", "onclick-submit", ":form");

    /// Clicking an element to submit a form:
    $(document).on("click", "*[onclick-submit]", function sircl_onclickSubmit(event) {
        // Event is hereby handled:
        event.preventDefault();
        event.stopPropagation();
        // Check disabled:
        if ($(this).is("[disabled]")) {
            return;
        }
        // Search for form:
        var $this = $(this);
        var $form = sircl.ext.$select($this, $this.attr("onclick-submit"));
        if ($form.length >= 1) {
            var form = $form[0];
            clearTimeout(form._formTriggerTimer);
            form._formTrigger = this;
            form._formTriggerTimer = setTimeout(function () { form._formTrigger = null; }, 700);
            sircl.ext.submit(form, event, function () {
                form.submit();
            });
        }
    });

    /// Submitting a form:
    $(document).on("submit", "form:not([download]):not([method=dialog])", function (event) {
        sircl.ext.submit(this, event);
    });

    /// Handle onkeyenter-click:
    $(document).on("keydown", "[onkeyenter-click]", function (event) {
        if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
            event.preventDefault();
            var $this = $(this);
            var $target = sircl.ext.$select($this, $this.attr("onkeyenter-click"));
            if ($target.length > 0) $target[0].click(); // See: http://goo.gl/lGftqn
        }
    });

    /// Handle onkeyescape-click:
    $(document).on("keydown", "[onkeyescape-click]", function (event) {
        if (event.key === "Escape") {
            event.preventDefault();
            var $this = $(this);
            var $target = sircl.ext.$select($this, $this.attr("onkeyescape-click"));
            if ($target.length > 0) $target[0].click(); // See: http://goo.gl/lGftqn
        }
    });

    /// DEPRECATED: replaced by onkeyenter-click and onkeycancel-click:
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
sircl._contentReadyHandlers = {};
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
 * To be called before unloading a web page part.
 * @param {any} scope Element that will be unloaded.
 */
sircl._beforeUnload = function (scope) {
    // Execute all "before" content ready handlers:
    sircl._contentReadyHandlers.before.forEach(function (handler) {
        try {
            handler.call(scope);
        } catch (ex) {
            sircl.handleError("S121", "Error executing a BeforeUnLoad handler: " + ex, { exception: ex, fx: handler });
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
            sircl.handleError("S122", "Error executing an AfterLoad content handler: " + ex, { exception: ex, fx: handler });
        }
    });
    // Execute all "enrich" afterLoad handlers:
    sircl._contentReadyHandlers.enrich.forEach(function (handler) {
        try {
            handler.call(scope);
        } catch (ex) {
            sircl.handleError("S123", "Error executing an AfterLoad enrich handler: " + ex, { exception: ex, fx: handler });
        }
    });
    // Execute all "process" afterLoad handlers:
    sircl._contentReadyHandlers.process.forEach(function (handler) {
        try {
            handler.call(scope);
        } catch (ex) {
            sircl.handleError("S124", "Error executing an AfterLoad process handler: " + ex, { exception: ex, fx: handler });
        }
    });
    // Remove "sircl-content-processing" class:
    $(scope).removeClass("sircl-content-processing");
};

//#endregion

//#region PageNavigate handlers

sircl._pageNavigateHandlers = {};
sircl._pageNavigateHandlers.initiate = [];
sircl._pageNavigateHandlers.cancel = [];

sircl.addPageNavigateHandler = function sircl_addPageNavigateHandler(phase, handler) {
    sircl._pageNavigateHandlers[phase].push(handler);
};

sircl._onPageNavigate = function sircl__onPageNavigate(event, $trigger, $form) {
    if ($trigger != null && $trigger.length >= 1 && $trigger.closest(".onnavigate").length > 0) {
        // Execute all page navigate handlers:
        var nav = { event: event, $trigger: $trigger, $form: $form };
        sircl.lastPageNavigationObject = nav;
        sircl._pageNavigateHandlers.initiate.forEach(function (handler) {
            try {
                handler.call(null, nav);
            } catch (ex) {
                sircl.handleError("S161", "Error executing a Page Navigate handler: " + ex, { exception: ex, fx: handler });
            }
        });
    }
};

sircl.cancelPageNavigate = function sircl_cancelPageNavigate() {
    if (sircl.lastPageNavigationObject !== null) {
        // Execute all page navigate handlers:
        var nav = sircl.lastPageNavigationObject;
        sircl._pageNavigateHandlers.cancel.forEach(function (handler) {
            try {
                handler.call(null, nav);
            } catch (ex) {
                sircl.handleError("S162", "Error executing a Page Navigate cancellation handler: " + ex, { exception: ex, fx: handler });
            }
        });
        sircl.lastPageNavigationObject = null;
    }
};

//#endregion

//#region Default Content Ready handlers

$$("content", function sircl_default_contentHandler() {
    /// <* onload-copyto="selector"> Copies the content to the given selector.
    $(this).filter("[onload-copyto]").add($(this).find("*[onload-copyto]")).each(function () {
        var html = $(this).html();
        sircl.ext.$select($(this), $(this).attr("onload-copyto")).html(html);
    });

    /// <* onload-moveto="selector"> Moves the content to the given selector.
    $(this).filter("[onload-moveto]").add($(this).find("*[onload-moveto]")).each(function () {
        var html = $(this).html();
        $(this).html(null);
        sircl.ext.$select($(this), $(this).attr("onload-moveto")).html(html);
    });
});

$$(function sircl_default_processHandler() {
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
        } catch (ex) {
            console.error("Sircl S999 - Error in error handler.", { exception: ex, fx: handler });
        }
    });
};

//#endregion

//#region Default error handlers

/**
 * Add a default error handler logging to console.
 */
sircl.addErrorHandler(function sircl_defaultLogging_errorHandler(code, message, data) {
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
        try {
            handler();
        } catch (ex) {
            sircl.handleError("S125", "Error executing an After history handler: " + ex, { exception: ex, fx: handler });
        }
    });
};

sircl.addRequestHandler("beforeRender", function sircl_history_beforeRender_requestHandler(req) {
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

sircl.addRequestHandler("afterRender", function sircl_history_afterRender_requestHandler(req) {
    if (req._historyMode) {
        // Push or replace new state in history:
        var finalState = {
            url: req.action,
            html: "",
            cached: false
        };
        if (req._historyMode.indexOf("skip") >= 0) {
            // Do nothing
        } else if (req._historyMode.indexOf("replace") >= 0) {
            window.history.replaceState(finalState, document.title, finalState.url);
            sircl._afterHistory();
        } else { // if "push":
            window.history.pushState(finalState, document.title, finalState.url);
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
                    targetMethod: null,
                    action: state.url,
                    method: "get",
                    isForeground: true,
                    _historyMode: "skip"
                }, callback);
            }
        } else {
            // Is this needed ? With this line of code, an <a href="#pagelocation"> triggers a full page load instead of just scrolling to the right place...
            //window.history.go(0);
        }
    };

    sircl._afterHistory();
});

//#endregion

//#region Disabled handling

sircl.addRequestHandler("beforeSend", function sircl_disable_beforeSend_requestHandler(req) {
    // Make "disabled":
    if (req.$trigger != null && req.$trigger.length == 1 && req.$trigger.is(".onclick-disable")) {
        if (req.$trigger[0].tagName == "BUTTON" || req.$trigger[0].tagName == "INPUT") {
            req._disabled_to_restore = req.$trigger[0];
            req._disabled_to_restore.disabled = true;
        } else {
            req._disabledclass_to_restore = req.$trigger;
            sircl.ext.enabled(req._disabledclass_to_restore, false);
        }
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function sircl_disable_afterSend_requestHandler(req) {
    // Undo "disabled":
    if (req._disabled_to_restore) {
        req._disabled_to_restore.disabled = false;
    }
    if (req._disabledclass_to_restore) {
        sircl.ext.enabled(req._disabledclass_to_restore, true);
    }
    // Move to next handler:
    this.next(req);
});


sircl.addPageNavigateHandler("initiate", function sircl_disable_initiatePageNavigate_requestHandler(nav) {
    // Make "disabled":
    if (nav.$trigger != null && nav.$trigger.length == 1 && nav.$trigger.is(".onclick-disable")) {
        if (nav.$trigger[0].tagName == "BUTTON" || nav.$trigger[0].tagName == "INPUT") {
            nav._disabled_to_restore = nav.$trigger[0];
            nav._disabled_to_restore.disabled = true;
        } else {
            nav._disabledclass_to_restore = nav.$trigger;
            sircl.ext.enabled(nav._disabledclass_to_restore, false);
        }
    }
});

sircl.addPageNavigateHandler("cancel", function sircl_disable_cancelPageNavigate_requestHandler(nav) {
    // Undo "disabled":
    if (nav._disabled_to_restore) {
        nav._disabled_to_restore.disabled = false;
    }
    if (nav._disabledclass_to_restore) {
        sircl.ext.enabled(nav._disabledclass_to_restore, true);
    }
});

//#endregion

//#region Spinner handling

sircl.addRequestHandler("beforeSend", function sircl_spinner_beforeSend_requestHandler(req) {
    // Show spinner if any:
    if (req.$trigger != null && req.$trigger.length == 1 && req.$trigger[0].tagName != "FORM") {
        var $spinners = req.$trigger.find("> .spinner");
        if ($spinners.length > 0) {
            req._spinner_to_restore = req.$trigger[0].innerHTML;
            $spinners[0].outerHTML = sircl.html_spinner;
        }
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function sircl_spinner_afterSend_requestHandler(req) {
    // Hide spinner if any:
    if (req._spinner_to_restore) {
        req.$trigger[0].innerHTML = req._spinner_to_restore;
    }
    // Move to next handler:
    this.next(req);
});

sircl.addPageNavigateHandler("initiate", function sircl_spinner_initiatePageNavigate_requestHandler(nav) {
    // Show spinner if any:
    if (nav.$trigger != null && nav.$trigger.length == 1 && nav.$trigger[0].tagName != "FORM") {
        var $spinners = nav.$trigger.find(".spinner");
        if ($spinners.length > 0) {
            nav._spinner_to_restore = nav.$trigger[0].innerHTML;
            $spinners[0].outerHTML = sircl.html_spinner;
        }
    }
});

sircl.addPageNavigateHandler("cancel", function sircl_spinner_cancelPageNavigate_requestHandler(req) {
    // Hide spinner if any:
    if (req._spinner_to_restore) {
        req.$trigger[0].innerHTML = req._spinner_to_restore;
    }
});


//#endregion

//#region Overlay handling

sircl.addRequestHandler("beforeSend", function sircl_overlay_beforeSend_requestHandler(req) {
    // Search for overlays:
    var $overlays = req.$initialTarget.find(".overlay");
    if ($overlays.length > 0) {
        // Only take "root overlays" into account, ignore nested overlays:
        var $rootoverlays = $overlays.first();
        for (var o = 1; o < $overlays.length; o++) {
            var isroot = true;
            var $oparents = $($overlays[o]).parents();
            for (var r = 0; r < $rootoverlays.length; r++) {
                var $rparent = $($rootoverlays[r]).parent();
                if ($oparents.is($rparent)) {
                    isroot = false;
                    break;
                }
            }
            if (isroot) $rootoverlays = $rootoverlays.add($overlays[o]);
        }
        // Make rootoverlays visible:
        $rootoverlays.each(function () {
            $(this).parent().css("position", "relative");
            sircl.ext.visible(this, true);
        });
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function sircl_overlay_afterSend_requestHandler(req) {
    // Search for overlays:
    var $overlays = req.$initialTarget.find(".overlay");
    if ($overlays.length > 0) {
        // Only take "root overlays" into account, ignore nested overlays:
        var $rootoverlays = $overlays.first();
        for (var o = 1; o < $overlays.length; o++) {
            var isroot = true;
            var $oparents = $($overlays[o]).parents();
            for (var r = 0; r < $rootoverlays.length; r++) {
                var $rparent = $($rootoverlays[r]).parent();
                if ($oparents.is($rparent)) {
                    isroot = false;
                    break;
                }
            }
            if (isroot) $rootoverlays = $rootoverlays.add($overlays[o]);
        }
        // Make rootoverlays hidden:
        $rootoverlays.each(function () {
            sircl.ext.visible(this, false);
        });
    }
    // Move to next handler:
    this.next(req);
});

//#endregion

//#region Loading status handling

sircl.addRequestHandler("beforeSend", function sircl_loadingStatus_beforeSend_requestHandler(req) {
    // Set classes to loading state:
    $(document).addClass("body-loading");
    req.$initialTarget.addClass("loading");
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function sircl_loadingStatus_afterSend_requestHandler(req) {
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

sircl.addRequestHandler("beforeSend", function sircl_loadProgress_beforeSend_requestHandler(req) {
    req._progressToResetAfterSend = []
    req._progressToHideAfterSend = []
    if (req.xhr != null) {
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
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function sircl_loadProgress_afterSend_requestHandler(req) {
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

//#region Load with diffcheck

sircl.addRequestHandler("afterSend", function sircl_diffcheck_afterSend_requestHandler(req) {
    // If diffcheck:
    if (req.$finalTarget.is(".diffcheck")) {
        // If call succeeded:
        if (req.succeeded && req.$finalTarget.length == 1) {
            // And if cached data same as response text:
            var cached = req.$finalTarget[0].sirclDiffCheckCached;
            if (cached == req.responseText) {
                // Simulate an abort:
                req.succeeded = false;
                req.aborted = true;
            } else {
                // Else set or update the cache:
                req.$finalTarget[0].sirclDiffCheckCached = req.responseText;
            }
        }
    }
    // Move to next handler:
    this.next(req);
});

//#endregion

//#region Reload by server

sircl.addRequestHandler("afterRender", function sircl_reloadAfter_afterRender_requestHandler(req) {
    if (req.xhr != null) {
        // If reloadAfter header is set with value > 0, reload after timeout:
        var reloadAfter = req.xhr.getResponseHeader("X-Sircl-Reload-After");
        if (reloadAfter) {
            // Parse delay (in seconds):
            var delay = parseFloat(reloadAfter);
            // Set timer:
            if (reloadAfter > 0 && req.method == "get") {
                setTimeout(function () {
                    req.$finalTarget.load(req.url)
                }, delay * 1000);
            }
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
        // Close all matching dialogs:
        for (var i = 0; i < $dlg.length; i++) {
            $dlg[i].close();
        }
    });

});

sircl.addRequestHandler("beforeSend", function sircl_dialogs_beforeSend_requestHandler(req) {
    var processor = this;
    // Open any non-open dialog holding the initial target and having class "beforeload-showdialog":
    req._dialogOpened = req.$initialTarget.closest("DIALOG.beforeload-showdialog:not([open])");
    if (req._dialogOpened.length > 0) {
        // If initial dialog is exclusive, close all other open dialogs:
        if (req._dialogOpened.is(".dialog-exclusive")) {
            $("DIALOG[open]").each(function () {
                if (!$(this).is(req.$finalTarget)) {
                    // Close dialog:
                    this.close();
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

sircl.addRequestHandler("afterSend", function sircl_dialogs_afterSend_requestHandler(req) {
    var processor = this;
    // On error, undo opened dialogs:
    if (!req.succeeded && req._dialogOpened.length > 0) {
        // Close dialog:
        req._dialogOpened[0].close();
        req._dialogOpened = $([]);
    } else if (req.status == "204") {
        // Else, if status "204" (no content), close target dialog:
        var $dlg = req.$initialTarget.closest("DIALOG[open]");
        if ($dlg.length > 0) {
            // Close dialog:
            $dlg[0].close();
        }
    }
    // Move to next handler:
    processor.next(req);
});

sircl.addRequestHandler("beforeRender", function sircl_dialogs_beforeRender_requestHandler(req) {
    var processor = this;
    // Undo opened dialog if target has changed:
    if (req.targetHasChanged && req._dialogOpened.length > 0) {
        if (!req.$finalTarget.has(req._dialogOpened)) {
            // Close dialog:
            req._dialogOpened[0].close();
            req._dialogOpened = $([]);
        }
    }
    // If final dialog is exclusive, close all other open dialogs:
    var $targetDlg = req.$finalTarget.closest("DIALOG");
    if ($targetDlg.is(".dialog-exclusive")) {
        $("DIALOG[open]").each(function () {
            if (!$targetDlg.is($(this))) {
                // Close dialog:
                this.close();
            }
        });
    }
    // If trigger of foreground request is in dialog, but target not, close dialog:
    if (req.isForeground == true && $targetDlg.length == 0 && req.$trigger != null && req.$trigger.length > 0 && req.$trigger.closest("DIALOG").length > 0) {
        req.$trigger.closest("DIALOG")[0].close();
    }
    // Move to next handler:
    processor.next(req);
});

sircl.addRequestHandler("afterRender", function sircl_dialogs_afterRender_requestHandler(req) {
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

$$(function sircl_dialogs_processHandler() {
    // Disable cancelling of dialog with .dialog-nocancel:
    $(this).find("DIALOG").each(function (index, elem) {
        elem.addEventListener("cancel", function (event) {
            if ($(this).is(".dialog-nocancel")) {
                event.preventDefault();
            }
        });
    });

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

    $(this).find("DIALOG[onload-showdialogafter]").each(function () {
        // Parse delay ("seconds" or "[hh:]mm:ss"):
        var delay = 0;
        var delaypart = $(this).attr("onload-showdialogafter").split(":");
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
            if ($form.length > 0) {
                $form[0]._formTrigger = this;
                $form[0]._formTriggerTimer = setTimeout(function () { $form[0]._formTrigger = null; }, 700);
                sircl.ext.submit($form[0], null, function () {
                    $form[0].submit();
                });

            }
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
sircl.addRequestHandler("beforeSend", function sircl_submit_beforeSend_requestHandler(req) {
    // Disable requested elements:
    if (req.$form) {
        if (req.$form.hasAttr("onsubmit-disable")) {
            req._formSubmitsToReenable = [];
            sircl.ext.$select(req.$form, req.$form.attr("onsubmit-disable")).filter(":not([disabled])").each(function () {
                req._formSubmitsToReenable.push(this);
                sircl.ext.enabled(this, false);
            });
        }
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function sircl_submit_afterSend_requestHandler(req) {
    // Re-enable previously disabled elements:
    if (req._formSubmitsToReenable) {
        req._formSubmitsToReenable.forEach(function (elem) {
            sircl.ext.enabled(elem, true);
        });
    }
    // Move to next handler:
    this.next(req);
});

sircl.addPageNavigateHandler("initiate", function sircl_submit_initiatePageNavigate_requestHandler(nav) {
    // Disable requested elements:
    if (nav.$form) {
        if (nav.$form.hasAttr("onsubmit-disable")) {
            nav._formSubmitsToReenable = [];
            sircl.ext.$select(nav.$form, nav.$form.attr("onsubmit-disable")).filter(":not([disabled])").each(function () {
                nav._formSubmitsToReenable.push(this);
                sircl.ext.enabled(this, false);
            });
        }
    }
});

sircl.addPageNavigateHandler("cancel", function sircl_submit_cancelPageNavigate_requestHandler(nav) {
    // Re-enable previously disabled elements:
    if (nav._formSubmitsToReenable) {
        nav._formSubmitsToReenable.forEach(function (elem) {
            sircl.ext.enabled(elem, true);
        });
    }
});

/// Propagate event-actions:
////////////////////////////

$(function () {
    /// <* on<click|dblclick|change|input>-propagate="on|off"> If off, blocks propagation of the event.
    $(document.body).on("click", "*[onclick-propagate=off]", function (event) { event.stopPropagation(); });
    $(document.body).on("dblclick", "*[ondblclick-propagate=off]", function (event) { event.stopPropagation(); });
    $(document.body).on("change", "*[onchange-propagate=off]", function (event) { event.stopPropagation(); });
    $(document.body).on("input", "*[oninput-propagate=off]", function (event) { event.stopPropagation(); });
});

// Init event-action:
/////////////////////

sircl.addAttributeAlias(".onload-click", "onload-click", ":this");

$$(function sircl_onload_processHandler() {

    /// <* onload-click="selector"> On init, triggers a click event on the selector matches.
    $(this).find("[onload-click]").each(function () {
        sircl.ext.$select($(this), $(this).attr("onload-click")).each(function () {
            this.click(); // See: http://goo.gl/lGftqn
        });
    });

    /// <* onload-load="url" [onload-reloadafter="seconds"]> Loads the given URL.
    /// Optionally, a "[onload-reloadafter]" indicates the time (in seconds) after which to continuously refresh the content.
    /// The url can contain a "{rnd}" literal that will then be replaced by a random number to force reloading.
    /// I.e: <div onload-load="/Home/News/?x={rnd}" onload-reloadafter="10"></div>
    $(this).find("[onload-load]").each(function () {
        var url = $(this).attr("onload-load") + "";
        // Perform field substitution:
        url = sircl.ext.subtituteFields(url, $(this), true);
        // Actually load the URL (and replace '{rnd}'):
        $(this).load(url.replace("{rnd}", Math.random()));
        // Hande onload-refreshafter and noreload:
        var loadRefresh = $(this).attr("onload-reloadafter");
        if (loadRefresh) {
            // Parse delay ("seconds" or "[hh:]mm:ss"):
            var delaypart = loadRefresh.split(":");
            var delay = 0;
            for (var i = 0; i < delaypart.length; i++) delay = parseFloat(delaypart[i]) + (60 * delay);
            // Set timer:
            $(this)[0]._onloadInterval = window.setInterval(function ($target) { $target.load(url.replace("{rnd}", Math.random())); }, delay * 1000, $(this));
        } else if ($(this).is(".noreload")) {
            $(this).removeAttr("onload-load"); // Note: onload-reload will not work anymore...
        }
    });

    /// <* onload-reload="selector"> Instructs the matches of the selector to reload their content (provided they have an [onload-load] attribute).
    $(this).find("[onload-reload]").each(function () {
        $($(this).attr("onload-reload")).filter("[onload-load]").each(function () {
            var url = $(this).attr("onload-load") + "";
            $(this).load(url.replace("{rnd}", Math.random()));
        });
    });
});

//#endregion

//#region Form changed state handling

// On initial load, if onchange-set input is true, add .form-changed class to form:
$$(function sircl_formState_processHandler() {
    $(this).find("FORM[onchange-set]").each(function () {
        var $input = $(this).find("INPUT[name='" + $(this).attr("onchange-set") + "']");
        if ($input.length > 0 && (["true", "on"].indexOf(($input.val() || "false").toLowerCase()) >= 0)) {
            $(this).addClass("form-changed");
        }
    });
});

// When loading part of a form, if response has header "X-Sircl-Form-Changed", set form changed:
sircl.addRequestHandler("afterRender", function (req) {
    // If response has "X-Sircl-Form-Changed" header "true", mark closest form channged:
    if (req != null && req.xhr != null) {
        var reloadSection = req.xhr.getResponseHeader("X-Sircl-Form-Changed");
        if (reloadSection !== null && reloadSection.toLowerCase() === "true") {
            req.$finalTarget.closest("FORM[onchange-set]").each(function () {
                $(this).addClass("form-changed");
                var $input = $(this).find("INPUT[name='" + $(this).attr("onchange-set") + "']");
                if ($input.length > 0) {
                    $input.val(true);
                }
            });
        }
    }
    // Move to next handler:
    this.next(req);
});

// On change event on a form with [onchange-set], add .form-changed class and set corresponding input to true:
$(function () {
    $(document).on("change", "FORM[onchange-set]", function (event) {
        if ($(event.target).closest(".sircl-content-processing").length == 0) {
            $(this).addClass("form-changed");
            var $input = $(this).find("INPUT[name='" + $(this).attr("onchange-set") + "']");
            if ($input.length > 0) {
                $input.val(true);
            }
        }
    });

    // A click on a hyperlink anywhere in the page triggers the onunloadchanged-confirm of the first changed form:
    $(document.body).on("click", "*[href]:not(.onunloadchanged-allow):not([download])", function (event) {
        // Find any form having [onunloadchanged-confirm] and being changed, anywhere in the page:
        var $changedForm = $("FORM.form-changed[onunloadchanged-confirm]");
        if ($changedForm.length > 0) {
            var confirmMessage = $changedForm[0].getAttribute("onunloadchanged-confirm");
            if (!sircl.ext.confirm(this, confirmMessage, event)) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    });

    // A click on an element within the form triggers the onclickchanged-confirm:
    $(document.body).on("click", "FORM.form-changed *[onclickchanged-confirm]", function (event) {
        var confirmMessage = $(this).attr("onclickchanged-confirm");
        if (!sircl.ext.confirm(this, confirmMessage, event)) {
            event.stopPropagation();
            event.preventDefault();
        }
    });
});

//#endregion

//#region Document ready handler executing initial afterLoad

$(document).ready(function () {
    /// Document is loaded; delay afterLoad untill all document ready handlers have run (also those in extended and other libraries):
    setTimeout(function (t) {
        $("BODY").addClass("sircl-content-processing");
        sircl._afterLoad(t);
        $("BODY").removeClass("sircl-content-processing");
    }, 0, this);
});

//#endregion

/////////////////////////////////////////////////////////////////
// Sircl 2.x - Core extension
// www.getsircl.com
// Copyright (c) 2019-2022 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-extended' component should be registered after the 'sircl' component. Please review order of script files.");

//#region Extended event-actions

/// Load event-actions:
///////////////////////

sircl.addAttributeAlias(".beforeload-show", "beforeload-show", ":this");
sircl.addAttributeAlias(".beforeload-hide", "beforeload-hide", ":this");

sircl.addRequestHandler("beforeSend", function sircl_ext_beforeSend_requestHandler(req) {

    req.$initialTarget.find("[beforeload-hide]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("beforeload-hide")), false);
    });

    req.$initialTarget.find("[beforeload-show]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("beforeload-show")), true);
    });

    req.$initialTarget.find("[beforeload-removeclass]").each(function () {
        sircl.ext.removeClass($(this), $(this).attr("beforeload-removeclass"));
    });

    req.$initialTarget.find("[beforeload-addclass]").each(function () {
        sircl.ext.addClass($(this), $(this).attr("beforeload-addclass"));
    });

    req.$initialTarget.find("[beforeload-toggleclass]").each(function () {
        sircl.ext.toggleClass($(this), $(this).attr("beforeload-toggleclass"));
    });

    // Move to next handler:
    this.next(req);
});

/// Init event-actions:
///////////////////////

sircl.addAttributeAlias(".onload-show", "onload-show", ":this");
sircl.addAttributeAlias(".onload-hide", "onload-hide", ":this");

$$("enrich", function sircl_ext_onload_enrichHandler() {
    $(this).find(".onload-setvaluefromquery").each(function () {
        $(this).attr("onload-setvaluefromquery", this.name);
    });
});

$$(function sircl_ext_onload_processHandler() {

    /// <* onload-hide="selector"> Will make that element invisible on init.
    $(this).find("[onload-hide]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onload-hide")), false);
    });

    /// <* onload-show="selector"> Will make that element visible on init.
    $(this).find("[onload-show]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onload-show")), true);
    });

    /// <* onload-removeclass="classname [on selector]"> When initializing, removes the class to self or the given selector.
    $(this).find("[onload-removeclass]").each(function () {
        sircl.ext.removeClass($(this), $(this).attr("onload-removeclass"));
    });

    /// <* onload-addclass="classname [on selector]"> When initializing, adds the class to self or the given selector.
    $(this).find("[onload-addclass]").each(function () {
        sircl.ext.addClass($(this), $(this).attr("onload-addclass"));
    });

    /// <* onload-toggleclass="classname [on selector]"> When initializing, toggles the class to self or the given selector.
    $(this).find("[onload-toggleclass]").each(function () {
        sircl.ext.toggleClass($(this), $(this).attr("onload-toggleclass"));
    });

    /// <input onload-setvalue="javascript-expression"> When initializing, evaluates the javascript expression to set the value.
    $(this).find("[onload-setvalue]").each(function () {
        var jsexpr = this.getAttribute("onload-setvalue");
        var value = eval(jsexpr);
        this.value = value;
        this.removeAttribute("onload-setvalue");
        $(this).change();
    });

    /// <input onload-setvaluefromquery="age"> Sets the value of the input to the named querystring parameter.
    $(this).find("[onload-setvaluefromquery]").each(function () {
        $(this).attr("value", sircl.ext.getUrlParameter($(this).attr("onload-setvaluefromquery")));
        $(this).change();
    });

    /// <SELECT onload-defaultselect="value"> When initializing, will automatically select the corresponding item if the select had an empty value.
    /// The value of the onload-defaultselect attribute is either:
    /// - ":singleton" to select the only element with a non-empty value, if there is only one;
    /// - ":first" to select the first non-empty value;
    /// - any other value, to select the item with that value.
    $(this).find("SELECT[onload-defaultselect]").each(function () {
        if ($(this).val() != "") return; // Select already has a value.
        var value = $(this).attr("onload-defaultselect") + "";
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
            for (var i = 0; i < options.length; i++) {
                if (options[i].value == value) {
                    $(this).val(value);
                    $(this).change();
                    break;
                }
            }
        }
    });
});

// Change event-actions:
////////////////////////

$(function () {
    // <* onchange-check="selector"> On change, checks the matching checkbox.
    $(document).on("change", "[onchange-check]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onchange-check")).each(function () {
            if (!this.checked) {
                this.checked = true;
                $(this).change();
            }
        });
    });

    // <* onchange-click="selector"> On change, triggers a click event on the elements matching the given selector.
    $(document).on("change", "*[onchange-click]", function (event) {
        var targetSelector = $(this).attr("onchange-click");
        sircl.ext.$select($(this), targetSelector).each(function () {
            this.click(); // See: http://goo.gl/lGftqn
        });
        //event.preventDefault();
    });

    // <* onchange-enable="selector"> On change, enables the elements matching the given selector.
    $(document).on("change", "*[onchange-enable]", function (event) {
        sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onchange-enable")), true);
    });

    // <* onchange-hide="selector"> On change, hides the elements matching the given selector.
    $(document).on("change", "*[onchange-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onchange-hide")), false);
    });

    // <* onchange-show="selector"> On change, shows the elements matching the given selector.
    $(document).on("change", "*[onchange-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onchange-show")), true);
    });

});

// Key event-actions:
/////////////////////

// Key event-actions take as value the pressed key in the format "[Alt+][Ctrl+][Shift+]Key".
// I.e: "a", "+", "Ctrl+ArrowLeft", "Enter", "Escape" or "F1"

$(function () {
    // <* onkeydown-click="<key>"> On key down of the given key on the page (not a form element), clicks the decorated element.
    $(document).on("keydown", function (e) {
        if (e.isComposing || e.keyCode === 229) return; // Ignore compositions
        if (e.key === "Alt" || e.key === "AltGraph" || e.key === "Control" || e.key === "Shift") return; // Ignore Alt, Control or Shift alone
        if (e.altKey || e.ctrlKey || ["BODY", "A", "BUTTON"].indexOf(e.target.nodeName) != -1 || ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"].indexOf(e.key) != -1) { // Ignore keys in form control elements, except for F1-F12
            var key = (e.altKey ? "Alt+" : "") + (e.ctrlKey ? "Ctrl+" : "") + (e.shiftKey ? "Shift+" : "") + e.key;
            if (e.key == "F1") console.log(key, e.target);
            var $targets;
            try {
                $targets = $("[onkeydown-click='" + key + "' i]");
            } catch (e) {
                // In case of failure with the case-insensitive selector, try case sensitive version:
                // (case insensitive selectors not supported on all browsers: https://caniuse.com/css-case-insensitive)
                $targets = $("[onkeydown-click='" + key + "']");
            }
            $targets.each(function () {
                this.click();
                e.preventDefault();
            });
        }
    });
});

// Click event-actions:
///////////////////////

$(function () {

    // <* onclick-click="selector"> On click, triggers a click event on the elements matching the given selector.
    $(document).on("click", "*[onclick-click]", function (event) {
        var targetSelector = $(this).attr("onclick-click");
        sircl.ext.$select($(this), targetSelector).each(function () {
            this.click(); // See: http://goo.gl/lGftqn
        });
        //event.preventDefault();
    });

    // <* onclick-remove="selector"> On click removes the elements matching the given selector.
    $(document).on("click", "[onclick-remove]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-remove")).remove();
    });

    // <* onclick-clear="selector"> On click clears the elements matching the given selector.
    $(document).on("click", "[onclick-clear]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-clear")).html(null);
    });

    // <* onclick-hide="selector"> On click hides the elements matching the given selector.
    $(document).on("click", "[onclick-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onclick-hide")), false);
    });

    // <* onclick-show="selector"> On click shows the elements matching the given selector.
    $(document).on("click", "[onclick-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onclick-show")), true);
    });

    // <* onclick-toggleshow="selector"> On click shows/hides the elements matching the given selector.
    $(document).on("click", "[onclick-toggleshow]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-toggleshow")).each(function () {
            sircl.ext.visible($(this), !sircl.ext.visible($(this)));
        });
    });

    /// <* onclick-removeclass="class [on selector]"> On click, removes the class.
    $(document).on("click", "[onclick-removeclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("onclick-removeclass"));
    });

    /// <* onclick-addclass="class [on selector]"> On click, adds the class.
    $(document).on("click", "[onclick-addclass]", function (event) {
        sircl.ext.addClass($(this), $(this).attr("onclick-addclass"));
    });

    /// <* onclick-toggleclass="class [on selector]"> On click, toggles the class.
    $(document).on("click", "[onclick-toggleclass]", function (event) {
        sircl.ext.toggleClass($(this), $(this).attr("onclick-toggleclass"));
    });

    // <* onclick-disable="selector"> On click disables the elements matching the given selector.
    $(document).on("click", "[onclick-disable]", function (event) {
        sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onclick-disable")), false);
    });

    // <* onclick-enable="selector"> On click enables the elements matching the given selector.
    $(document).on("click", "[onclick-enable]", function (event) {
        sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onclick-enable")), true);
    });

    // <* onclick-readonly="selector"> On click makes the elements matching the given selector readonly.
    $(document).on("click", "[onclick-readonly]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-readonly")).prop("readonly", true);
    });

    // <* onclick-readwrite="selector"> On click makes the elements matching the given selector non-readonly.
    $(document).on("click", "[onclick-readwrite]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-readwrite")).prop("readonly", false);
    });

    // <* onclick-clearvalue="selector"> On click clears the value of the elements matching the given selector.
    $(document).on("click", "[onclick-clearvalue]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-clearvalue")).each(function () {
            $(this).val("");
            $(this).change();
        });
    });

    // <* onclick-uncheck="selector"> On click unchecks matching checkbox or radio inputs.
    $(document).on("click", "[onclick-uncheck]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-uncheck")).filter("INPUT[type=checkbox], INPUT[type=radio]").each(function () {
            this.checked = false;
            $(this).change();
        });
    });

    // <* onclick-check="selector"> On click checks matching checkbox or radio inputs.
    $(document).on("click", "[onclick-check]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-check")).filter("INPUT[type=checkbox], INPUT[type=radio]").each(function () {
            this.checked = true;
            $(this).change();
        });
    });

    // <* onclick-togglecheck="selector"> On click changes the checked/unchecked state of matching checkbox or radio inputs.
    $(document).on("click", "[onclick-togglecheck]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-togglecheck")).filter("INPUT[type=checkbox], INPUT[type=radio]").each(function () {
            this.checked = !this.checked;
            $(this).change();
        });
    });

    // <* onclick-scrollintoview="selector"> On click scrolls the (first) match of the selector into the view.
    $(document).on("click", "[onclick-scrollintoview]", function (event) {
        var $target = sircl.ext.$select($(this), $(this).attr("onclick-scrollintoview"));
        if ($target.length > 0) $target[0].scrollIntoView();
    });

    // <* onclick-focus="selector"> On click gives the elements matching the given selector the focus.
    $(document).on("click", "[onclick-focus]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-focus")).focus();
    });

    // <* onclick-copyto="selector"> On click copies the content of the current element to the target.
    $(document).on("click", "[onclick-copyto]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-copyto")).html($(this).html());
    });

    // <* onclick-alert="selector"> On click shows an alert.
    $(document).on("click", "[onclick-alert]", function (event) {
        sircl.ext.alert(this, $(this).attr("onclick-alert"), event);
    });

    // <* onclick-copytext="text"> Copies the given text to the clipboard.
    $(document).on("click", "[onclick-copytext]", function (event) {
        var text = this.getAttribute("onclick-copytext");
        navigator.clipboard.writeText(text);
    });

    // <* onclick-copyinnertext="selector"> Copies the innerText of the matching element to the clipboard.
    $(document).on("click", "[onclick-copyinnertext]", function (event) {
        var text = sircl.ext.$select($(this), $(this).attr("onclick-copyinnertext")).text();
        navigator.clipboard.writeText(text);
    });

    // <* onclick-copyinnerhtml="selector"> Copies the innerHTML of the matching element to the clipboard.
    $(document).on("click", "[onclick-copyinnerhtml]", function (event) {
        var text = sircl.ext.$select($(this), $(this).attr("onclick-copyinnerhtml")).html();
        navigator.clipboard.writeText(text);
    });

    // <* onclick-copyvalue="selector"> Copies the value of the (first) matching (INPUT) element to the clipboard.
    $(document).on("click", "[onclick-copyvalue]", function (event) {
        var $elem = sircl.ext.$select($(this), $(this).attr("onclick-copyvalue"));
        if ($elem.length > 0) {
            var text = sircl.ext.effectiveValue($elem[0]);
            navigator.clipboard.writeText(text);
        }
    });

    // Hide element if clipboard is not supported:
    $(this).find("[onclick-copytext], [onclick-copyinnertext], [onclick-copyinnerhtml], [onclick-copyvalue]").each(function () {
        if (!('clipboard' in navigator)) {
            sircl.ext.visible(this, false);
        }
    });
});

// Dblclick event-actions:
//////////////////////////

$(function () {

    // <* ondblclick-load="url"> On doubleclick, calls the given URL.
    $(document).on("dblclick", "*[ondblclick-load]", function (event) {
        var href = this.getAttribute("ondblclick-load");
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
            sircl.ext.alert(this, href.substr(6), event);
        } else if (href.indexOf("javascript:") === 0) {
            var nonce = this.getAttribute("nonce");
            if (nonce) {
                jQuery.globalEval(href.substr(11), { nonce: nonce });
            } else {
                jQuery.globalEval(href.substr(11));
            }
        } else if (href.indexOf("#") === 0) {
            window.location.hash = href;
        } else {
            var target = this.getAttribute("target");
            if ((target == null && !sircl.singlePageMode) || (target != null && sircl.ext.isExternalTarget(target))) {
                if (target == null) {
                    window.location.href = href;
                } else {
                    window.open(href, target);
                }
            } else {
                // Forward to the server side rendering handler:
                var $target = (target != null) ? sircl.ext.$select($(this), target) : sircl.ext.$mainTarget();
                var targetMethod = this.getAttribute("target-method") || null;
                sircl._loadUrl($(this), href, $target, targetMethod);
            }
        }
        // If not returned earlier, stop event propagation:
        event.preventDefault();
        event.stopPropagation();
    });

    // <* ondblclick-click="selector"> On doubleclick, triggers a click event on the elements matching the given selector.
    $(document).on("dblclick", "*[ondblclick-click]", function (event) {
        var targetSelector = $(this).attr("ondblclick-click");
        sircl.ext.$select($(this), targetSelector).each(function () {
            this.click(); // See: http://goo.gl/lGftqn
        });
        //event.preventDefault();
    });


    // <* ondblclick-remove="selector"> On doubleclick removes the elements matching the given selector.
    $(document).on("dblclick", "[ondblclick-remove]", function (event) {
        sircl.ext.$select($(this), $(this).attr("ondblclick-remove")).remove();
    });

    // <* ondblclick-clear="selector"> On doubleclick clears the elements matching the given selector.
    $(document).on("dblclick", "[ondblclick-clear]", function (event) {
        sircl.ext.$select($(this), $(this).attr("ondblclick-clear")).html(null);
    });

    // <* ondblclick-hide="selector"> On doubleclick hides the elements matching the given selector.
    $(document).on("dblclick", "[ondblclick-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("ondblclick-hide")), false);
    });

    // <* ondblclick-show="selector"> On doubleclick shows the elements matching the given selector.
    $(document).on("dblclick", "[ondblclick-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("ondblclick-show")), true);
    });

    // <* ondblclick-toggleshow="selector"> On doubleclick shows/hides the elements matching the given selector.
    $(document).on("dblclick", "[ondblclick-toggleshow]", function (event) {
        sircl.ext.$select($(this), $(this).attr("ondblclick-toggleshow")).each(function () {
            sircl.ext.visible($(this), !sircl.ext.visible($(this)));
        });
    });

    /// <* ondblclick-removeclass="class [on selector]"> On doubleclick, removes the class.
    $(document).on("dblclick", "[ondblclick-removeclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("ondblclick-removeclass"));
    });

    /// <* ondblclick-addclass="class [on selector]"> On doubleclick, adds the class.
    $(document).on("dblclick", "[ondblclick-addclass]", function (event) {
        sircl.ext.addClass($(this), $(this).attr("ondblclick-addclass"));
    });

    /// <* ondblclick-toggleclass="class [on selector]"> On doubleclick, toggles the class.
    $(document).on("dblclick", "[ondblclick-toggleclass]", function (event) {
        sircl.ext.toggleClass($(this), $(this).attr("ondblclick-toggleclass"));
    });

    // <* ondblclick-scrollintoview="selector"> On doubleclick scrolls the (first) match of the selector into the view.
    $(document).on("dblclick", "[ondblclick-scrollintoview]", function (event) {
        var $target = sircl.ext.$select($(this), $(this).attr("ondblclick-scrollintoview"));
        if ($target.length > 0) $target[0].scrollIntoView();
    });

});

/// Hover event-actions:
////////////////////////

$(function () {
    /// <* onhover-hide="selector"> On hover, hides elements matching the given selector.
    $(document).on("mouseenter", "*[onhover-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-hide")), false);
    });
    $(document).on("mouseleave", "*[onhover-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-hide")), true);
    });

    /// <* onhover-show="selector"> On hover, displays elements matching the given selector.
    $(document).on("mouseenter", "*[onhover-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-show")), true);
    });
    $(document).on("mouseleave", "*[onhover-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-show")), false);
    });

    /// <* onhover-removeclass="class [on selector]"> On hover, removes the class, on leave, adds the class.
    $(document).on("mouseenter", "*[onhover-removeclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("onhover-removeclass"));
    });
    $(document).on("mouseleave", "*[onhover-removeclass]", function (event) {
        sircl.ext.addClass($(this), $(this).attr("onhover-removeclass"));
    });

    /// <* onhover-addclass="class [on selector]"> On hover, adds the class, on leave, removes the class.
    $(document).on("mouseenter", "*[onhover-addclass]", function (event) {
        sircl.ext.addClass($(this), $(this).attr("onhover-addclass"));
    });
    $(document).on("mouseleave", "*[onhover-addclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("onhover-addclass"));
    });

    /// <* onhover-toggleclass="class [on selector]"> On hover, toggles the class, on leave, toggles the class back.
    $(document).on("mouseenter", "*[onhover-toggleclass]", function (event) {
        sircl.ext.toggleClass($(this), $(this).attr("onhover-toggleclass"));
    });
    $(document).on("mouseleave", "*[onhover-toggleclass]", function (event) {
        sircl.ext.toggleClass($(this), $(this).attr("onhover-toggleclass"));
    });
});

/// Checked event-actions:
//////////////////////////

$(function () {
    // <* onchecked-click="selector"> When checked (only by event, not initially), triggers a click event on the elements matching the given selector.
    $(document).on("change", "*[onchecked-click]:checked", function (event) {
        var targetSelector = this.getAttribute("onchecked-click");
        sircl.ext.$select($(this), targetSelector).each(function () {
            this.click(); // See: http://goo.gl/lGftqn
        });
    });

    $(document).on("change", "[onchecked-uncheck]", function (event) {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("onchecked-uncheck")).filter(":checked").each(function () {
            $(this).prop("checked", false);
            $(this).change();
        });
    });

    $(document).on("change", "[onchecked-check]", function (event) {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("onchecked-check")).filter(":not(:checked)").each(function () {
            $(this).prop("checked", true);
            $(this).change();
        });
    });

    $(document).on("change", "[onunchecked-uncheck]", function (event) {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("onunchecked-uncheck")).filter(":checked").each(function () {
            $(this).prop("checked", false);
            $(this).change();
        });
    });

    $(document).on("change", "[onunchecked-check]", function (event) {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("onunchecked-check")).filter(":not(:checked)").each(function () {
            $(this).prop("checked", true);
            $(this).change();
        });
    });

    $(document).on("change", "[ifchecked-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-hide")), !this.checked);
    });

    $(document).on("change", "[ifchecked-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-show")), this.checked);
    });

    $(document).on("change", "[ifchecked-disable]", function (event) {
        sircl.ext.enabled(sircl.ext.$select($(this), this.getAttribute("ifchecked-disable")), !this.checked);
    });

    $(document).on("change", "[ifchecked-enable]", function (event) {
        sircl.ext.enabled(sircl.ext.$select($(this), this.getAttribute("ifchecked-enable")), this.checked);
    });

    $(document).on("change", "[ifchecked-readonly]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-readonly")).prop("readonly", this.checked);
    });

    $(document).on("change", "[ifchecked-readwrite]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-readwrite")).prop("readonly", !this.checked);
    });

    $(document).on("change", "[ifchecked-removeclass]", function (event) {
        if (this.checked) {
            sircl.ext.removeClass($(this), this.getAttribute("ifchecked-removeclass"));
        } else {
            sircl.ext.addClass($(this), this.getAttribute("ifchecked-removeclass"));
        }
    });

    $(document).on("change", "[ifchecked-addclass]", function (event) {
        if (this.checked) {
            sircl.ext.addClass($(this), this.getAttribute("ifchecked-addclass"));
        } else {
            sircl.ext.removeClass($(this), this.getAttribute("ifchecked-addclass"));
        }
    });

    $(document).on("change", "[ifchecked-clearvalue]", function (event) {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-clearvalue")).each(function () {
            $(this).val("");
            $(this).change();
        });
    });

    $(document).on("change", "[ifunchecked-clearvalue]", function (event) {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("ifunchecked-clearvalue")).each(function () {
            $(this).val("");
            $(this).change();
        });
    });

    $(document).on("change", "[ifchecked-uncheck]", function (event) {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-uncheck")).filter(":checked").each(function () {
            $(this).prop("checked", false);
            $(this).change();
        });
    });

    $(document).on("change", "[ifchecked-check]", function (event) {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-check")).filter(":not(:checked)").each(function () {
            $(this).prop("checked", true);
            $(this).change();
        });
    });

    $(document).on("change", "[ifunchecked-uncheck]", function (event) {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("ifunchecked-uncheck")).filter(":checked").each(function () {
            $(this).prop("checked", false);
            $(this).change();
        });
    });

    $(document).on("change", "[ifunchecked-check]", function (event) {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("ifunchecked-check")).filter(":not(:checked)").each(function () {
            $(this).prop("checked", true);
            $(this).change();
        });
    });

    $(document).on("change", ".ifvalue-events", function (event) {
        var $scope = $(this).closest("FORM");
        if ($(this).hasAttr("ifvalue-scope")) $scope = sircl.ext.$select($(this), $(this).attr("ifvalue-scope"));
        else if ($scope.length == 0) $scope = $("BODY");
        var uncheckedCheck = ($(this).is("INPUT[type=checkbox]") || $(this).is("INPUT[type=radio]")) && this.checked == false;
        var actions = {
            toshow: [],
            tohide: [],
            toenable: [],
            todisable: [],
            toreadwrite: [],
            toreadonly: [],
            toclearvalue: [],
            tocheck: [],
            touncheck: []
        };
        // Handle ".ifvalue<name>" classes:
        // Get name:
        var name = sircl.ext.cssEscape(this.name);
        // Get value-independent class:
        var ifvaluename = ".ifvalue" + name;
        // Handle actions:
        $scope.find(ifvaluename + "-hide").each(function () {
            if (sircl.ext.visible(this)) actions.tohide.push(this);
        });
        $scope.find(ifvaluename + "-show").each(function () {
            if (!sircl.ext.visible(this)) actions.toshow.push(this);
        });
        $scope.find(ifvaluename + "-disable").each(function () {
            if (sircl.ext.enabled(this)) actions.todisable.push(this);
        });
        $scope.find(ifvaluename + "-enable").each(function () {
            if (!sircl.ext.enabled(this)) actions.toenable.push(this);
        });
        $scope.find(ifvaluename + "-readonly").each(function () {
            if ($(this).prop("readonly") == false) action.toreadonly.push(this);
        });
        $scope.find(ifvaluename + "-readwrite").each(function () {
            if ($(this).prop("readonly") == true) action.toreadwrite.push(this);
        });
        $scope.find(ifvaluename + "-clearvalue").each(function () {
            if ($(this).val() != "") action.toclearvalue.push(this);
        });
        $scope.find(ifvaluename + "-uncheck").each(function () {
            if (this.checked) actions.touncheck.push(this);
        });
        $scope.find(ifvaluename + "-check").each(function () {
            if (!this.checked) actions.tocheck.push(this);
        });
        // If it's a radio or checkbox that is not checked, skip the value-specific action:
        if (!uncheckedCheck) {
            // Handle ".ifvalue<name>is<value>" classes:
            var values = sircl.ext.effectiveValue(this);
            if (values == null) values = [];
            if (!Array.isArray(values)) values = [values];
            // Loop over all values (multiselects can have multiple values):
            for (var v = 0; v < values.length; v++) {
                // Get value:
                var value = sircl.ext.cssEscape(values[v]);
                // Get value-specific class:
                var ifvaluenameisvalue = ifvaluename + "is" + value;
                // Handle actions:
                $scope.find(ifvaluenameisvalue + "-hide").each(function () {
                    if (actions.toshow.indexOf(this) >= 0) actions.toshow.splice(actions.toshow.indexOf(this), 1);
                    if (sircl.ext.visible(this) && actions.tohide.indexOf(this) === -1) actions.tohide.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-show").each(function () {
                    if (actions.tohide.indexOf(this) >= 0) actions.tohide.splice(actions.tohide.indexOf(this), 1);
                    if (!sircl.ext.visible(this) && actions.toshow.indexOf(this) === -1) actions.toshow.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-disable").each(function () {
                    if (actions.toenable.indexOf(this) >= 0) actions.toenable.splice(actions.toenable.indexOf(this), 1);
                    if (sircl.ext.enabled(this) && actions.todisable.indexOf(this) === -1) actions.todisable.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-enable").each(function () {
                    if (actions.todisable.indexOf(this) >= 0) actions.todisable.splice(actions.todisable.indexOf(this), 1);
                    if (!sircl.ext.enabled(this) && actions.toenable.indexOf(this) === -1) actions.toenable.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-readonly").each(function () {
                    if (actions.toreadwrite.indexOf(this) >= 0) actions.toreadwrite.splice(actions.toreadwrite.indexOf(this), 1);
                    if ($(this).prop("readonly") == false && actions.toreadonly.indexOf(this) === -1) action.toreadonly.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-readwrite").each(function () {
                    if (actions.toreadonly.indexOf(this) >= 0) actions.toreadonly.splice(actions.toreadonly.indexOf(this), 1);
                    if ($(this).prop("readonly") == true && actions.toreadwrite.indexOf(this) === -1) action.toreadwrite.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-clearvalue").each(function () {
                    // There is currently no "-keepvalue" to remove items from the clearvalue list
                    if ($(this).val() != "" && actions.toclearvalue.indexOf(this) === -1) action.toclearvalue.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-uncheck").each(function () {
                    if (actions.tocheck.indexOf(this) >= 0) actions.tocheck.splice(actions.tocheck.indexOf(this), 1);
                    if (this.checked && actions.touncheck.indexOf(this) === -1) actions.touncheck.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-check").each(function () {
                    if (actions.touncheck.indexOf(this) >= 0) actions.touncheck.splice(actions.touncheck.indexOf(this), 1);
                    if (!this.checked && actions.tocheck.indexOf(this) === -1) actions.tocheck.push(this);
                });
            }
        }
        // Perform only net show/hides:
        actions.toshow.forEach(function (elem) {
            sircl.ext.visible(elem, true);
        });
        actions.tohide.forEach(function (elem) {
            sircl.ext.visible(elem, false);
        });
        // Perform only net enable/disables:
        actions.toenable.forEach(function (elem) {
            sircl.ext.enabled($(elem), true);
        });
        actions.todisable.forEach(function (elem) {
            sircl.ext.enabled($(elem), false);
        });
        // Perform only net readwrite/readonlies:
        actions.toreadwrite.forEach(function (elem) {
            $(elem).prop("readonly", false);
        });
        actions.toreadonly.forEach(function (elem) {
            $(elem).prop("readonly", true);
        });
        // Perform only net clearvalues and trigger change event:
        actions.toclearvalue.forEach(function (elem) {
            $(elem).val("");
            $(elem).change();
        });
        // Perform only net check/unchecks and trigger change event:
        actions.tocheck.forEach(function (elem) {
            elem.checked = true;
            $(elem).change();
        });
        actions.touncheck.forEach(function (elem) {
            elem.checked = false;
            $(elem).change();
        });
    });
});

$$(function sircl_ext_ifchecked_processHandler() {

    $(this).find("[ifchecked-hide]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-hide")), !this.checked);
    });

    $(this).find("[ifchecked-show]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-show")), this.checked);
    });

    $(this).find("[ifchecked-disable]").each(function () {
        sircl.ext.enabled(sircl.ext.$select($(this), this.getAttribute("ifchecked-disable")), !this.checked);
    });

    $(this).find("[ifchecked-enable]").each(function () {
        sircl.ext.enabled(sircl.ext.$select($(this), this.getAttribute("ifchecked-enable")), this.checked);
    });

    $(this).find("[ifchecked-readonly]").each(function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-readonly")).prop("readonly", this.checked);
    });

    $(this).find("[ifchecked-readwrite]").each(function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-readwrite")).prop("readonly", !this.checked);
    });

    $(this).find("*[ifchecked-removeclass]").each(function (event) {
        if (this.checked) {
            sircl.ext.removeClass($(this), this.getAttribute("ifchecked-removeclass"));
        } else {
            sircl.ext.addClass($(this), this.getAttribute("ifchecked-removeclass"));
        }
    });

    $(this).find("*[ifchecked-addclass]").each(function (event) {
        if (this.checked) {
            sircl.ext.addClass($(this), this.getAttribute("ifchecked-addclass"));
        } else {
            sircl.ext.removeClass($(this), this.getAttribute("ifchecked-addclass"));
        }
    });

    $(this).find("[ifchecked-clearvalue]").each(function (event) {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-clearvalue")).each(function () {
            $(this).val("");
            $(this).change();
        });
    });

    $(this).find("[ifunchecked-clearvalue]").each(function (event) {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("ifunchecked-clearvalue")).each(function () {
            $(this).val("");
            $(this).change();
        });
    });

    $(this).find("[ifchecked-uncheck]").each(function () {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-uncheck")).filter(":checked").each(function () {
            $(this).prop("checked", false);
            $(this).change();
        });
    });

    $(this).find("[ifchecked-check]").each(function () {
        if (this.checked) sircl.ext.$select($(this), this.getAttribute("ifchecked-check")).filter(":not(:checked)").each(function () {
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

    $(this).find("[ifunchecked-check]").each(function () {
        if (!this.checked) sircl.ext.$select($(this), this.getAttribute("ifunchecked-check")).filter(":not(:checked)").each(function () {
            $(this).prop("checked", true);
            $(this).change();
        });
    });

    var handledFielNames = [];
    $(this).find(".ifvalue-events").each(function () {
        var $scope = $(this).closest("FORM");
        if ($(this).hasAttr("ifvalue-scope")) $scope = sircl.ext.$select($(this), $(this).attr("ifvalue-scope"));
        else if ($scope.length == 0) $scope = $("BODY");
        var uncheckedCheck = ($(this).is("INPUT[type=checkbox]") || $(this).is("INPUT[type=radio]")) && this.checked == false;
        var actions = {
            toshow: [],
            tohide: [],
            toenable: [],
            todisable: [],
            toreadwrite: [],
            toreadonly: [],
            toclearvalue: [],
            tocheck: [],
            touncheck: []
        };
        // Handle ".ifvalue<name>" classes:
        // Get name:
        var name = sircl.ext.cssEscape(this.name);
        // If this is an unchecked and field already handled, abort:
        if (uncheckedCheck && handledFielNames.indexOf(this.name) > -1) return;
        handledFielNames.push(this.name);
        // Get value-independent class:
        var ifvaluename = ".ifvalue" + name;
        // Handle actions:
        $scope.find(ifvaluename + "-hide").each(function () {
            if (sircl.ext.visible(this)) actions.tohide.push(this);
        });
        $scope.find(ifvaluename + "-show").each(function () {
            if (!sircl.ext.visible(this)) actions.toshow.push(this);
        });
        $scope.find(ifvaluename + "-disable").each(function () {
            if (sircl.ext.enabled(this)) actions.todisable.push(this);
        });
        $scope.find(ifvaluename + "-enable").each(function () {
            if (!sircl.ext.enabled(this)) actions.toenable.push(this);
        });
        $scope.find(ifvaluename + "-readonly").each(function () {
            if ($(this).prop("readonly") == false) action.toreadonly.push(this);
        });
        $scope.find(ifvaluename + "-readwrite").each(function () {
            if ($(this).prop("readonly") == true) action.toreadwrite.push(this);
        });
        $scope.find(ifvaluename + "-clearvalue").each(function () {
            if ($(this).val() != "") action.toclearvalue.push(this);
        });
        $scope.find(ifvaluename + "-uncheck").each(function () {
            if (this.checked) actions.touncheck.push(this);
        });
        $scope.find(ifvaluename + "-check").each(function () {
            if (!this.checked) actions.tocheck.push(this);
        });
        // If it's a radio or checkbox that is not checked, skip the value-specific action:
        if (!uncheckedCheck) {
            // Handle ".ifvalue<name>is<value>" classes:
            var values = sircl.ext.effectiveValue(this);
            if (values == null) values = [];
            if (!Array.isArray(values)) values = [values];
            // Loop over all values (multiselects can have multiple values):
            for (var v = 0; v < values.length; v++) {
                // Get value:
                var value = sircl.ext.cssEscape(values[v]);
                // Get value-specific class:
                var ifvaluenameisvalue = ifvaluename + "is" + value;
                // Handle actions:
                $scope.find(ifvaluenameisvalue + "-hide").each(function () {
                    if (actions.toshow.indexOf(this) >= 0) actions.toshow.splice(actions.toshow.indexOf(this), 1);
                    if (sircl.ext.visible(this) && actions.tohide.indexOf(this) === -1) actions.tohide.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-show").each(function () {
                    if (actions.tohide.indexOf(this) >= 0) actions.tohide.splice(actions.tohide.indexOf(this), 1);
                    if (!sircl.ext.visible(this) && actions.toshow.indexOf(this) === -1) actions.toshow.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-disable").each(function () {
                    if (actions.toenable.indexOf(this) >= 0) actions.toenable.splice(actions.toenable.indexOf(this), 1);
                    if (sircl.ext.enabled(this) && actions.todisable.indexOf(this) === -1) actions.todisable.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-enable").each(function () {
                    if (actions.todisable.indexOf(this) >= 0) actions.todisable.splice(actions.todisable.indexOf(this), 1);
                    if (!sircl.ext.enabled(this) && actions.toenable.indexOf(this) === -1) actions.toenable.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-readonly").each(function () {
                    if (actions.toreadwrite.indexOf(this) >= 0) actions.toreadwrite.splice(actions.toreadwrite.indexOf(this), 1);
                    if ($(this).prop("readonly") == false && actions.toreadonly.indexOf(this) === -1) action.toreadonly.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-readwrite").each(function () {
                    if (actions.toreadonly.indexOf(this) >= 0) actions.toreadonly.splice(actions.toreadonly.indexOf(this), 1);
                    if ($(this).prop("readonly") == true && actions.toreadwrite.indexOf(this) === -1) action.toreadwrite.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-clearvalue").each(function () {
                    // There is currently no "-keepvalue" to remove items from the clearvalue list
                    if ($(this).val() != "" && actions.toclearvalue.indexOf(this) === -1) action.toclearvalue.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-uncheck").each(function () {
                    if (actions.tocheck.indexOf(this) >= 0) actions.tocheck.splice(actions.tocheck.indexOf(this), 1);
                    if (this.checked && actions.touncheck.indexOf(this) === -1) actions.touncheck.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-check").each(function () {
                    if (actions.touncheck.indexOf(this) >= 0) actions.touncheck.splice(actions.touncheck.indexOf(this), 1);
                    if (!this.checked && actions.tocheck.indexOf(this) === -1) actions.tocheck.push(this);
                });
            }
        }
        // Perform only net show/hides:
        actions.toshow.forEach(function (elem) {
            sircl.ext.visible(elem, true);
        });
        actions.tohide.forEach(function (elem) {
            sircl.ext.visible(elem, false);
        });
        // Perform only net enable/disables:
        actions.toenable.forEach(function (elem) {
            sircl.ext.enabled($(elem), true);
        });
        actions.todisable.forEach(function (elem) {
            sircl.ext.enabled($(elem), false);
        });
        // Perform only net readwrite/readonlies:
        actions.toreadwrite.forEach(function (elem) {
            $(elem).prop("readonly", false);
        });
        actions.toreadonly.forEach(function (elem) {
            $(elem).prop("readonly", true);
        });
        // Perform only net clearvalues and trigger change event:
        actions.toclearvalue.forEach(function (elem) {
            $(elem).val("");
            $(elem).change();
        });
        // Perform only net check/unchecks and trigger change event:
        actions.tocheck.forEach(function (elem) {
            elem.checked = true;
            $(elem).change();
        });
        actions.touncheck.forEach(function (elem) {
            elem.checked = false;
            $(elem).change();
        });
    });
});

/// Action-events:
//////////////////

$$(function sircl_ext_actionEvents_processHandler() {

    /// <* hide-ifexists="selection"> If the selection has matches, hide this element, else show it.
    $(this).find("[hide-ifexists]").each(function () {
        var $this = $(this);
        var exists = sircl.ext.$select($this, $this.attr("hide-ifexists")).length > 0;
        sircl.ext.visible(this, !exists);
    });

    /// <* show-ifexists="selection"> If the selection has matches, show this element, else hide it.
    $(this).find("[show-ifexists]").each(function () {
        var $this = $(this);
        var exists = sircl.ext.$select($this, $this.attr("show-ifexists")).length > 0;
        sircl.ext.visible(this, exists);
    });

    /// <* check-ifallchecked="selection"> If all of the selection is checked, check, else uncheck this.
    $(this).find("[check-ifallchecked]").each(function () {
        var $this = $(this);
        var $all = sircl.ext.$select($this, $this.attr("check-ifallchecked"));
        sircl.ext.$select($this, $this.attr("check-ifallchecked")).on("change", function () {
            var tocheck = $all.filter(":checked").length == $all.length;
            if ($this[0].checked != tocheck) {
                $this[0].checked = tocheck;
                $this.change();
            }
        });
        var tocheck = $all.filter(":checked").length == $all.length;
        if ($this[0].checked != tocheck) {
            $this[0].checked = tocheck;
            $this.change();
        }
    });

    /// <* check-ifanychecked="selection"> If any of the selection is checked, check, else uncheck this.
    $(this).find("[check-ifanychecked]").each(function () {
        var $this = $(this);
        var $any = sircl.ext.$select($this, $this.attr("check-ifanychecked"));
        sircl.ext.$select($this, $this.attr("check-ifanychecked")).on("change", function () {
            var tocheck = $any.filter(":checked").length > 0;
            if ($this[0].checked != tocheck) {
                $this[0].checked = tocheck;
                $this.change();
            }
        });
        var tocheck = $any.filter(":checked").length > 0;
        if ($this[0].checked != tocheck) {
            $this[0].checked = tocheck;
            $this.change();
        }
    });

    /// <* enable-ifallchecked="selection"> If all of the selection is checked, enable, else disable this.
    $(this).find("[enable-ifallchecked]").each(function () {
        var $this = $(this);
        var $all = sircl.ext.$select($this, $this.attr("enable-ifallchecked"));
        sircl.ext.$select($this, $this.attr("enable-ifallchecked")).on("change", function () {
            sircl.ext.enabled($this, $all.filter(":checked").length >= $all.length);
        });
        sircl.ext.enabled($this, $all.filter(":checked").length >= $all.length);
    });

    /// <* enable-ifanychecked="selection"> If any of the selection is checked, enable, else disable this.
    $(this).find("[enable-ifanychecked]").each(function () {
        var $this = $(this);
        var $any = sircl.ext.$select($this, $this.attr("enable-ifanychecked"));
        sircl.ext.$select($this, $this.attr("enable-ifanychecked")).on("change", function () {
            sircl.ext.enabled($this, $any.filter(":checked").length > 0);
        });
        sircl.ext.enabled($this, $any.filter(":checked").length > 0);
    });

    /// <* show-ifallchecked="selection"> If all of the selection is checked, show, else hide this.
    $(this).find("[show-ifallchecked]").each(function () {
        var $this = $(this);
        var $all = sircl.ext.$select($this, $this.attr("show-ifallchecked"));
        sircl.ext.$select($this, $this.attr("show-ifallchecked")).on("change", function () {
            sircl.ext.visible($this, $all.filter(":checked").length == $all.length)
        });
        sircl.ext.visible($this, $all.filter(":checked").length == $all.length)
    });

    /// <* show-ifanychecked="selection"> If any of the selection is checked, show, else hide this.
    $(this).find("[show-ifanychecked]").each(function () {
        var $this = $(this);
        var $any = sircl.ext.$select($this, $this.attr("show-ifanychecked"));
        sircl.ext.$select($this, $this.attr("show-ifanychecked")).on("change", function () {
            sircl.ext.visible($this, $any.filter(":checked").length > 0)
        });
        sircl.ext.visible($this, $any.filter(":checked").length > 0)
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

$$(function sircl_ext_ifvalid_processHandler() {
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
        sircl.ext.enabled(sircl.ext.$select($(this), this.getAttribute("ifvalid-enable")), sircl.ext.isValid($(this)));
    });
    $(this).find("[ifinvalid-enable]").each(function () {
        sircl.ext.enabled(sircl.ext.$select($(this), this.getAttribute("ifinvalid-enable")), !sircl.ext.isValid($(this)));
    });
});

$(function () {
    $(document).on("change input invalid", "[ifvalid-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifvalid-show")), sircl.ext.isValid($(this)));
    });
    $(document).on("change input invalid", "[ifinvalid-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifinvalid-show")), !sircl.ext.isValid($(this)));
    });
    $(document).on("change input invalid", "[ifvalid-addclass]", function (event) {
        if (sircl.ext.isValid($(this)))
            sircl.ext.addClass($(this), this.getAttribute("ifvalid-addclass"));
        else
            sircl.ext.removeClass($(this), this.getAttribute("ifvalid-addclass"));
    });
    $(document).on("change input invalid", "[ifinvalid-addclass]", function (event) {
        if (sircl.ext.isValid($(this)))
            sircl.ext.removeClass($(this), this.getAttribute("ifinvalid-addclass"));
        else
            sircl.ext.addClass($(this), this.getAttribute("ifinvalid-addclass"));
    });
    $(document).on("change input invalid", "[ifvalid-enable]", function (event) {
        sircl.ext.enabled(sircl.ext.$select($(this), this.getAttribute("ifvalid-enable")), sircl.ext.isValid($(this)));
    });
    $(document).on("change input invalid", "[ifinvalid-enable]", function (event) {
        sircl.ext.enabled(sircl.ext.$select($(this), this.getAttribute("ifinvalid-enable")), !sircl.ext.isValid($(this)));
    });
});

/// Focus event-actions:
////////////////////////

/// <INPUT class="onfocus-select"> Select all text when element gets focus:
$(document).on("focus", "INPUT.onfocus-select:not([type=checkbox]):not([type=radio]):not([type=button])", function (event) {
    $(this)[0].select();
});

/// <INPUT class="onfocusout-trim"> Trims the text on focus out:
/// (Though named an onfocusout event-action, technically implemented using a change event on document body, so it is done before all other change events.)
$(document.body).on("change", "INPUT.onfocusout-trim:not([type=checkbox]):not([type=radio]):not([type=button])", function (event) {
    $(this)[0].value = ($(this)[0].value + "").trim()
});

/// Scroll/Viewport event-actions:
/////////////////////////

// From: https://stackoverflow.com/a/7557433/323122
sircl.isElementInView = function (el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
};

$(function () {

    $(window).on("DOMContentLoaded load resize scroll", function () {

        /// <* class="onscrolltop-fade"> Makes the element visible when scrolling down (using a fading animation), hidden when scrolled at top.
        if ($(this).scrollTop() > 100) {
            if ($.isFunction($.fn.fadeIn)) { // fadeIn/Out is not available in slim version if jQuery
                $(".onscrolltop-fade").fadeIn(800);
            }
            sircl.ext.visible($(".onscrolltop-fade"), true);
        } else {
            if ($.isFunction($.fn.fadeOut)) { // fadeIn/Out is not available in slim version if jQuery
                $(".onscrolltop-fade").fadeOut(400);
            }
            sircl.ext.visible($(".onscrolltop-fade"), false);
        }

        /// <* ifinview-load="url"> Loads the given URL and places the result in the element when the element is visible in the view.
        $("[ifinview-load]").each(function () {
            if (sircl.isElementInView(this)) {
                var url = $(this).attr("ifinview-load");
                $(this).removeAttr("ifinview-load");
                $(this).load(url);
            }
        });

        /// <* ifinview-click="selector"> Clicks the given element when this element is visible in the view.
        $("[ifinview-click]").each(function () {
            if (sircl.isElementInView(this)) {
                var selector$ = $(this).attr("ifinview-click");
                $(this).removeAttr("ifinview-click");
                sircl.ext.$select($(this), selector$).each(function () {
                    this.click();
                });
            }
        });
    });

    /// <* class="onclick-scrolltop"> If clicked, scrolls the page to top (in slow, animated way).
    $(document).on("click", ".onclick-scrolltop", function (event) {
        if ($.isFunction($.fn.animate)) { // animate is not available in slim version if jQuery
            $("body,html").animate({
                scrollTop: 0
            }, 500);
        } else {
            window.scrollTo(0, 0);
        }
        return false;
    });
});

$$(function sircl_ext_ifinview_processHandler() {
    /// <* ifinview-load="url"> Loads the given URL and places the result in the element when the element is visible in the view.
    $("[ifinview-load]").each(function () {
        if (sircl.isElementInView(this)) {
            var url = $(this).attr("ifinview-load");
            $(this).removeAttr("ifinview-load");
            $(this).load(url);
        }
    });

    /// <* ifinview-click="selector"> Clicks the given element when this element is visible in the view.
    $("[ifinview-click]").each(function () {
        if (sircl.isElementInView(this)) {
            var selector$ = $(this).attr("ifinview-click");
            $(this).removeAttr("ifinview-click");
            sircl.ext.$select($(this), selector$).each(function () {
                this.click();
            });
        }
    });
});

//#endregion

//#region Confirmation dialogs

$(function () {
    /// Buttons and link can have a confirmation dialog:
    /// <a href="http://www.example.com" onclick-confirm="Are you sure ?">...</a>
    $(document.body).on("click", "*[onclick-confirm]", function (event) {
        var confirmMessage = $(this).attr("onclick-confirm");
        if (confirmMessage) {
            if (!sircl.ext.confirm(this, confirmMessage, event)) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    });

    /// Checkboxes can have a change confirm dialog:
    /// <input type="checkbox" onchange-confirm="Are you sure ?" />
    $(document.body).on("change", "INPUT[onchange-confirm][type='checkbox']", function (event) {
        var confirmMessage = $(this).attr("onchange-confirm");
        if (confirmMessage) {
            if (!sircl.ext.confirm(this, confirmMessage, event)) {
                $this.prop("checked", !$this.prop("checked"));
                event.stopPropagation();
                event.preventDefault();
            }
        }
    });

    /// Inputs and selects can have a change confirm dialog:
    /// <input type="text" onchange-confirm="Are you sure ?" />
    $(document.body).on("change", "INPUT[onchange-confirm]:not([type='checkbox']):not([type='radio']),SELECT[onchange-confirm]", function (event) {
        var confirmMessage = $(this).attr("onchange-confirm");
        if (confirmMessage) {
            if (!sircl.ext.confirm(this, confirmMessage, event)) {
                $(this).val(this._beforeConfirmValue);
                event.stopPropagation();
                event.preventDefault();
            } else {
                this._beforeConfirmValue = $(this).val();
            }
        }
    });
});

$$(function sircl_ext_onchangeConfirm_processHandler() {
    // Store initial value of input or select having onchange-confirm, to be able to restore if not confirmed:
    $(this).find("INPUT[onchange-confirm]:not([type='checkbox']):not([type='radio']),SELECT[onchange-confirm]").each(function () {
        this._beforeConfirmValue = $(this).val();
    });
});

//#endregion

//#region Drag & Drop

$(function () {

    /// Limit file count on file input
    $(document.body).on("change", "INPUT[type='file'][multiple][maxcount], INPUT[type='file']:not([multiple])", function (event) {
        var $this = $(this);
        var maxcount = $this.hasAttr("multiple") ? parseInt($this.attr("maxcount")) : 1;
        if (this.files.length > maxcount) {
            var maxcountalert = $this.attr("maxcount-alert");
            if (maxcountalert) sircl.ext.alert(this, maxcountalert, event);
            this.value = "";
            event.stopPropagation();
            event.preventDefault();
        }
    });

    /// Limit file type on file input
    $(document.body).on("change", "INPUT[type='file'][accept]", function (event) {
        var $this = $(this);
        var tokens = $this.attr("accept").split(',');
        for (var i = 0; i < tokens.length; i++) {
            if (tokens[i][0] === '.') {
                tokens[i] = tokens[i].toUpperCase();
            } else {
                tokens[i] = tokens[i]
                    .replaceAll("+", "\\+")
                    .replaceAll(".", "\\.")
                    .replaceAll("/", "\\/")
                    .replaceAll("*", ".+");
            }
        }
        for (var i = 0; i < this.files.length; i++) {
            var validFile = false;
            for (var t = 0; t < tokens.length; t++) {
                if (tokens[t][0] === '.') {
                    if (this.files[i].name.toUpperCase().lastIndexOf(tokens[t]) === (this.files[i].name.length - tokens[t].length)) {
                        validFile = true;
                        break;
                    }
                } else if (this.files[i].type.match(tokens[t])) {
                    validFile = true;
                    break;
                }
            }
            if (!validFile) {
                var acceptalert = $this.attr("accept-alert");
                if (acceptalert) sircl.ext.alert(this, acceptalert, event);
                this.value = "";
                event.stopPropagation();
                event.preventDefault();
                break;
            }
        }
    });

    /// Limit file size on file input
    $(document.body).on("change", "INPUT[type='file'][maxsize]", function (event) {
        var $this = $(this);
        var maxsize = ($this.attr("maxsize")).toUpperCase();
        if (maxsize.indexOf("KB") > 0) maxsize = parseFloat(maxsize.replace("KB", "").trim()) * 1024;
        else if (maxsize.indexOf("MB") > 0) maxsize = parseFloat(maxsize.replace("MB", "").trim()) * 1024 * 1024;
        else maxsize = parseFloat(maxsize);
        for (var i = 0; i < this.files.length; i++) {
            if (this.files[i].size > maxsize) {
                var maxsizealert = $this.attr("maxsize-alert");
                if (maxsizealert) sircl.ext.alert(this, maxsizealert, event);
                this.value = "";
                event.stopPropagation();
                event.preventDefault();
                break;
            }
        }
    });

    /// Limit total file size on file input
    $(document.body).on("change", "INPUT[type='file'][maxtotalsize]", function (event) {
        var $this = $(this);
        var maxtotalsize = ($this.attr("maxtotalsize")).toUpperCase();
        if (maxtotalsize.indexOf("KB") > 0) maxtotalsize = parseFloat(maxtotalsize.replace("KB", "").trim()) * 1024;
        else if (maxtotalsize.indexOf("MB") > 0) maxtotalsize = parseFloat(maxtotalsize.replace("MB", "").trim()) * 1024 * 1024;
        else maxtotalsize = parseFloat(maxtotalsize);
        var totalsize = 0;
        for (var i = 0; i < this.files.length; i++) {
            totalsize += this.files[i].size;
            if (totalsize > maxtotalsize) {
                var maxtotalsizealert = $this.attr("maxtotalsize-alert");
                if (maxtotalsizealert) sircl.ext.alert(this, maxtotalsizealert, event);
                this.value = "";
                event.stopPropagation();
                event.preventDefault();
                break;
            }
        }
    });

    /// Copies the name of the file
    $(document).on("change", "INPUT[type='file'][onchange-setname]", function (event) {
        var $this = $(this);
        if (this.files.length > 0) {
            var filename = this.files[0].name;
            var $target = sircl.ext.$select($this, $this.attr("onchange-setname"));
            $target.each(function () {
                if (this.tagName == "INPUT")
                    this.value = filename;
                else
                    this.innerText = filename;
            });
        }
    });

    /// Copies the base name of the file (name without extension)
    $(document).on("change", "INPUT[type='file'][onchange-setbasename]", function (event) {
        var $this = $(this);
        if (this.files.length > 0) {
            var filename = this.files[0].name;
            if (filename.indexOf('.') >= 0) filename = filename.substr(0, filename.lastIndexOf('.'));
            var $target = sircl.ext.$select($this, $this.attr("onchange-setbasename"));
            $target.each(function () {
                this.value = filename;
            });
        }
    });

    sircl.addAttributeAlias(".ondropfile-set", "ondropfile-set", ">INPUT[type=file]");

    /// Allow dragging file:
    /// <* ondropfile-set="form-input">...</*>
    $(document.body).on("dragover", "[ondropfile-set]", function (event) {
        if (event.originalEvent.dataTransfer.types.length > 0 && event.originalEvent.dataTransfer.types[0] == "Files") {
            // Allow by preventing default browser behavior:
            event.preventDefault();
            // If has [ondragover-addclass], add class:
            var $scope = $(this).closest("[ondragover-addclass]");
            if ($scope.length > 0) {
                sircl.ext.addClass($scope, $scope.attr("ondragover-addclass"));
            }
        }
    });

    /// Allow dropping file:
    /// <* ondropfile-set="form-input">...</*>
    $(document).on("drop", "[ondropfile-set]", function (event) {
        // Prevent default browser behavior:
        event.preventDefault();
        // Sert file(s):
        var $this = $(this);
        var $file = sircl.ext.$select($this, $(this).attr("ondropfile-set"));
        if ($file.length > 0) {
            $file[0].files = event.originalEvent.dataTransfer.files;
            $($file[0]).change();
        }
    });

    /// Disallow dragging file:
    /// <* class="ondropfile-ignore">...</*>
    $(document).on("dragover", ".ondropfile-ignore", function (event) {
        if (event.originalEvent.dataTransfer.types.length > 0 && event.originalEvent.dataTransfer.types[0] == "Files") {
            // Override default browser behavior:
            event.preventDefault();
        }
    });

    /// Disallow dropping file:
    /// <* class="ondropfile-ignore">...</*>
    $(document).on("drop", ".ondropfile-ignore", function (event) {
        // Prevent default browser behavior:
        event.preventDefault();
    });
});


$(function () {

    $(document).on("dragstart", "[draggable]", function (event) {
        if ($(this).hasAttr("drop-type")) {
            var dragTypes = $(this).attr("drop-type").split(" ");
            for (var i = 0; i < dragTypes.length; i++) {
                if (dragTypes[i].trim() != "") event.originalEvent.dataTransfer.setData(dragTypes[i].trim(), true);
            }
        }
        event.originalEvent.dataTransfer.setData("__id", sircl.ext.getId(this, true));
        event.originalEvent.dataTransfer.setData("any", $(this).attr("drop-value"));
    });

    $(document.body).on("dragover", "[ondrop-accept]", function (event) {
        var acceptTypes = $(this).attr("ondrop-accept").split(" ");
        for (var i = 0; i < acceptTypes.length; i++) {
            for (var j = 0; j < event.originalEvent.dataTransfer.types.length; j++) {
                if (acceptTypes[i].trim().toLowerCase() == event.originalEvent.dataTransfer.types[j]) {
                    // If a match is found, allow drop:
                    event.preventDefault();
                    // If has [ondragover-addclass], add class:
                    var $scope = $(this).closest("[ondragover-addclass]");
                    if ($scope.length > 0) {
                        sircl.ext.addClass($scope, $scope.attr("ondragover-addclass"));
                    }
                }
            }
        }
    });

    $(document).on("dragleave", "[ondragover-addclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("ondragover-addclass"));
    });

    $(document).on("drop", "[ondragover-addclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("ondragover-addclass"));
    });

    $(document).on("drop", ".ondrop-move", function (event) {
        // Prevent default browser behavior:
        event.preventDefault();
        // Perform move:
        var sourceId = event.originalEvent.dataTransfer.getData("__id");
        event.originalEvent.target.closest(".ondrop-move").appendChild(document.getElementById(sourceId));
    });

    $(document).on("drop", ".ondrop-copy", function (event) {
        // Prevent default browser behavior:
        event.preventDefault();
        // Perform move:
        var sourceId = event.originalEvent.dataTransfer.getData("__id");
        $(event.originalEvent.target.closest(".ondrop-copy")).append(document.getElementById(sourceId).outerHTML.replace("id=\"" + sourceId + "\"", ""));
    });

    $(document).on("drop", ".ondrop-submit", function (event) {
        var $this = $(this);
        var $form = ($this.hasAttr("form"))
            ? $("#" + $this.attr("form"))
            : $this.closest("FORM");
        if ($form.length > 0) {
            // Copy drop-value to .drop-value input element:
            var dropvalue = event.originalEvent.dataTransfer.getData("any");
            $form.find("INPUT.drop-value").each(function () {
                $(this).val(dropvalue);
            });
            // Prevent default browser behavior:
            event.preventDefault();
            // Submit form (add a submit button, then click that button):
            var btnid = "sircl-autoid-" + new Date().getTime();
            var btn = "<input hidden id=\"" + btnid + "\" type=\"submit\" ";
            if ($this.hasAttr("formaction")) btn += "formaction=\"" + $this.attr("formaction").replaceAll("{drop-value}", dropvalue || "") + "\" ";
            if ($this.hasAttr("formenctype")) btn += "formenctype=\"" + $this.attr("formenctype") + "\" ";
            if ($this.hasAttr("formmethod")) btn += "formmethod=\"" + $this.attr("formmethod") + "\" ";
            if ($this.hasAttr("formnovalidate")) btn += "formnovalidate=\"" + $this.attr("formnovalidate") + "\" ";
            if ($this.hasAttr("formtarget")) btn += "formtarget=\"" + $this.attr("formtarget") + "\" ";
            btn += "/>";
            $form.append(btn);
            $("#" + btnid).click();
        }
    });

});

//#endregion

//#region Sharing

// Hide sharing elements when sharing is not available:
$$(function sircl_ext_onclickShare_processHandler() {
    if (navigator.share) { } else {
        $("[onclick-share]").each(function () {
            sircl.ext.visible(this, false);
        });
    }
});

$(function () {
    $(document).on("click", "[onclick-share]", function () {
        if (navigator.share) {
            var $target = sircl.ext.$select($(this), $(this).attr("onclick-share"));
            var title = $target.attr("data-share-title") || $target.attr("title") || (($target.hasAttr("data-share-title")) ? undefined : document.title);
            var url = $target.attr("data-share-url") || $target.attr("href") || (($target.hasAttr("data-share-url")) ? undefined : window.location.href);
            var text = $target.attr("data-share-text") || $target.text();
            navigator.share({
                title: title,
                text: text,
                url: url
            }).then(function () {
            }).catch(function () {
            });
        }
    });
});

//#endregion

/////////////////////////////////////////////////////////////////
// Sircl 2.x - ChangeActions extension
// www.getsircl.com
// Copyright (c) 2019-2022 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-changeactions' component should be registered after the 'sircl' component. Please review order of script files.");

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
sircl._actionCall = function (triggerElement, $subjects, $scope, url, name, value, checked, event, onJson, onHtml, onFailure, onDone) {
    // Ignore if change event is issued from a processing section:
    if ($(event.target).closest(".sircl-content-processing").length > 0) return;
    // Get method:
    var method = (($(triggerElement).closest("[method]").attr("method") || "get").toUpperCase() == "POST") ? "POST" : "GET";
    // In url, substitute {rnd} by a random number:
    url = url.replace("{rnd}", Math.random());
    // In url, substitute "[...]" by form values:
    var fieldnames = [];
    if ($scope.hasClass("substitute-fields")) {
        var $formscope = $(triggerElement).closest("FORM");
        if ($formscope.length == 0) $formscope = $(document);
        var fieldparser = new RegExp(/(\[[a-z0-9\.\-\_]+?\])|(\%5B[a-z0-9\.\-\_]+?\%5D)/gi);
        do {
            var fieldname = fieldparser.exec(url);
            if (fieldname !== null) fieldnames.push(fieldname[0]);
            else break;
        } while (true);
        var fieldvalue;
        for (var f = 0; f < fieldnames.length; f++) {
            var fieldname = (fieldnames[f].charAt(0) === "[")
                ? fieldnames[f].substr(1, fieldnames[f].length - 2)  // Fieldname surrounded by '[' and ']'
                : fieldnames[f].substr(3, fieldnames[f].length - 6); // Fieldname surrounded by '%5B' and '%5D'
            var fields = $formscope.find("[name='" + fieldname + "']");
            if (fields.length == 1) {
                fieldvalue = sircl.ext.effectiveValue(fields[0]);
            } else if (fields.length > 1) {
                fieldvalue = [];
                for (var v = 0; v < fields.length; v++) {
                    var vval = sircl.ext.effectiveValue(fields[v]);
                    if (vval != "") fieldvalue.push(vval);
                }
                fieldvalue = fieldvalue.join();
            } else {
                fieldvalue = null;
            }
            if (fieldvalue === null)
                url = url.replace(fieldnames[f], "");
            else
                url = url.replace(fieldnames[f], encodeURIComponent(fieldvalue));
        }
    }
    // Retrieve name and values:
    if (value === null || value === undefined) value = [];
    if (!Array.isArray(value)) value = [value];
    var fields = [];
    var values = [];
    if (name != null && name != "" && name.toLowerCase() != "name") {
        fields.push("name");
        values.push(encodeURIComponent(name));
    }
    for (var i = 0; i < value.length; i++) {
        if (checked === null && name != null && name != "" && name.toLowerCase() != "value") {
            fields.push("value");
            values.push(encodeURIComponent(value[i]));
            fields.push(encodeURIComponent(name));
            values.push(encodeURIComponent(value[i]));
        } else if (name.toLowerCase() != "value") {
            fields.push("value");
            values.push(encodeURIComponent(value[i]));
        } else {
            fields.push(name);
            values.push(encodeURIComponent(value[i]));
        }
    }
    if (checked != null && fieldnames.indexOf("checked") == -1) {
        fields.push("checked");
        values.push(checked);
    }
    // Build as data string:
    var data = "";
    for (var i = 0; i < fields.length; i++) {
        if (i > 0) data += "&";
        data += fields[i] + "=" + values[i];
    }
    // If GET, add data to url:
    if (method === "GET" && data.length > 0) {
        url = url + ((url.indexOf("?") < 0) ? "?" : "&") + data;
        data = null;
    }
    // Perform request:
    var cache = false;
    if ($(triggerElement).attr("browser-cache") != null) cache = ($(triggerElement).attr("browser-cache").toLowerCase() == "on");
    var req = { $trigger: $(triggerElement), $subjects: $subjects, $scope: $scope, event: event };
    req.xhr = new XMLHttpRequest();
    req.xhr.open(method, url);
    if (method !== "GET") req.xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    if (cache == false) {
        req.xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
        req.xhr.setRequestHeader("Pragma", "no-cache");
    }
    req.xhr.setRequestHeader("X-Sircl-Request-Type", "ChangeAction");
    req.xhr.setRequestHeader("X-Sircl-Timezone-Offset", new Date().getTimezoneOffset());

    var onLoad = function (e) {
        req.loadEvent = e;
        if (req.xhr.status <= 299) {
            req.succeeded = true;
        } else {
            req.succeeded = false;
        }
        var contentType = req.xhr.getResponseHeader("Content-Type") || "";
        if (contentType.indexOf("json") >= 0) {
            req.data = JSON.parse(req.xhr.responseText);
        } else if (contentType.indexOf("html") >= 0) {
            req.data = req.xhr.responseText; 
        } else {
            req.data = null;
        }
        sircl._runChangeActionHandlers("afterSend", triggerElement, req);
        sircl._runChangeActionHandlers("beforeRender", triggerElement, req);
        if (!req.succeeded) sircl._runChangeActionHandlers("onError", triggerElement, req);
        if (req.succeeded) {
            if (contentType.indexOf("json") >= 0) {
                if (onJson) onJson.apply(triggerElement, [req]);
            } else if (contentType.indexOf("html") >= 0) {
                if (onHtml) onHtml.apply(triggerElement, [req]);
            }
        } else {
            if (onFailure) onFailure.apply(triggerElement);
        }
        sircl._runChangeActionHandlers("afterRender", triggerElement, req);
        if (!req.succeeded) sircl.handleError("S311", "Change action request failed.", { request: req });
    };

    var onError = function (e) {
        req.loadEvent = e;
        req.succeeded = false;
        req.data = null;
        sircl._runChangeActionHandlers("afterSend", triggerElement, req);
        sircl._runChangeActionHandlers("beforeRender", triggerElement, req);
        if (!req.succeeded) sircl._runChangeActionHandlers("onError", triggerElement, req);
        if (req.succeeded) {
            if ((req.xhr.getResponseHeader("Content-Type") || "").indexOf("text/html") == 0) {
                if (onHtml) onHtml.apply(triggerElement, [req]);
            } else {
                if (onJson) onJson.apply(triggerElement, [req]);
            }
        } else {
            if (onFailure) onFailure.apply(triggerElement);
        }
        sircl._runChangeActionHandlers("afterRender", triggerElement, req);
        if (!req.succeeded) sircl.handleError("S311", "Change action request failed.", { request: req });
    };

    var onLoadEnd = function () {
        if (onDone) onDone.apply(triggerElement);
    };

    req.xhr.addEventListener("abort", onError);
    req.xhr.addEventListener("error", onError);
    req.xhr.addEventListener("load", onLoad);
    req.xhr.addEventListener("loadend", onLoadEnd);
    sircl._runChangeActionHandlers("beforeSend", triggerElement, req);
    req.xhr.send(data);
};

$(function () {
    // On change of an ungrouped radio:
    $(document).on("change", "INPUT[type=radio][onchange-action]", function (event) {
        var $this = $(this);
        sircl._actionCall(this, $this, $this, $this.attr("onchange-action"), this.name, $this.attr("value"), $this.prop("checked"), event, function (req) {
            this._previousActionValue = $this.prop("checked");
        }, function (req) {
                sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        }, function (req) {
            $this.prop("checked", !$this.prop("checked"));
        });
    });
    // On change of a grouped radio:
    $(document).on("change", "[onchange-action] INPUT[type=radio]:not([onchange-action])", function (event) {
        var $this = $(this);
        var $scope = $this.closest("[onchange-action]");
        var $subjects = $scope.find("INPUT[type=radio][name='" + this.name + "']:not([onchange-action])");
        sircl._actionCall(this, $subjects, $scope, $scope.attr("onchange-action"), this.name, jQuery.makeArray($subjects.filter(":checked")).map(function (elem) { return elem.value; }), null, event, function (req) {
            var newValue = req.data;
            if (Array.isArray(newValue) && newValue.length > 0) newValue = newValue[0];
            if (newValue === undefined) {
                $subjects[0]._previousActionValue = this.value;
            } else if (newValue == null || newValue == "") {
                $subjects.prop("checked", false);
                $subjects[0]._previousActionValue = null;
            } else {
                $subjects.filter("[value='" + newValue + "']").prop("checked", true);
                $subjects[0]._previousActionValue = newValue;
            }
        }, function (req) {
                sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        }, function (req) {
            var previousActionValue = $scope.find("INPUT[type=radio][name='" + this.name + "']:not([onchange-action]):first")[0]._previousActionValue;
            if (previousActionValue) {
                $scope.find("INPUT[type=radio][name='" + this.name + "'][value='" + previousActionValue + "']:not([onchange-action])").prop("checked", true);
            } else {
                $scope.find("INPUT[type=radio][name='" + this.name + "']:not([onchange-action])").prop("checked", false);
            }
        });
    });
    // On change of an ungrouped checkbox:
    $(document).on("change", "INPUT[type=checkbox][onchange-action]", function (event) {
        var $this = $(this);
        sircl._actionCall(this, $this, $this, $this.attr("onchange-action"), this.name, $this.attr("value"), $this.prop("checked"), event, function (req) {
            this._previousActionValue = $this.prop("checked");
        }, function (req) {
            sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        }, function (req) {
            $this.prop("checked", !$this.prop("checked"));
        });
    });
    // On change of a grouped checkbox:
    $(document).on("change", "[onchange-action] INPUT[type=checkbox]:not([onchange-action])", function (event) {
        var $this = $(this);
        var $scope = $this.closest("[onchange-action]");
        var $subjects = $scope.find("INPUT[type=checkbox][name='" + this.name + "']:not([onchange-action])");
        sircl._actionCall(this, $subjects, $scope, $scope.attr("onchange-action"), this.name, jQuery.makeArray($scope.find("INPUT[type=checkbox][name='" + this.name + "']:checked:not([onchange-action])")).map(function (elem) { return elem.value; }), null, event, function (req) {
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
    $(document).on("change", "INPUT[onchange-action]:not([type=checkbox]):not([type=radio]):not([type=button]), [onchange-action] INPUT:not([type=checkbox]):not([type=radio]):not([type=button]):not([onchange-action]), SELECT[onchange-action], [onchange-action] SELECT:not([onchange-action]), TEXTAREA[onchange-action], [onchange-action] TEXTAREA:not([onchange-action])", function (event) {
        var $this = $(this);
        var $scope = $this.closest("[onchange-action]");
        sircl._actionCall(this, $this, $scope, $scope.attr("onchange-action"), this.name, $this.val(), null, event, function (req) {
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
    $(document).on("focusin", "INPUT[onfocus-action]:not([type=checkbox]):not([type=radio]):not([type=button]), TEXTAREA[onfocus-action]", function (event) {
        var $this = $(this);
        var $scope = $this.closest("[onfocus-action]");
        sircl._actionCall(this, $this, $scope, $scope.attr("onfocus-action"), this.name, $this.val(), null, event, function (req) {
            var newValue = req.data;
            if (newValue) {
                $this.val(newValue);
                try { this.select(); } catch (ex) { };
            }
        }, function (req) {
            sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        });
    });
    $(document).on("focusout", "INPUT[onfocusout-action]:not([type=checkbox]):not([type=radio]):not([type=button]), TEXTAREA[onfocusout-action]", function (event) {
        var $this = $(this);
        var $scope = $this.closest("[onfocusout-action]");
        sircl._actionCall(this, $this, $scope, $scope.attr("onfocusout-action"), this.name, $this.val(), null, event, function (req) {
            var newValue = req.data;
            if (newValue) {
                $this.val(newValue);
            }
        }, function (req) {
            sircl.ext.$select(req.$scope, req.$scope.attr("target")).html(req.data);
        });
    });
});

$$(function sircl_changeActions_processHandler () {
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
            $scope.find("INPUT[type=radio][name='" + this.name + "']:not([onchange-action]):first")[0]._previousActionValue = $("INPUT[type=radio][name='" + this.name + "']:not([onchange-action]):checked").val();
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
    if (alertMessage) sircl.ext.alert(sircl.ext.firstOrNull(req.$trigger), alertMessage, null);
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
// Sircl 2.x - ContextMenu extension
// www.getsircl.com
// Copyright (c) 2019-2021 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-contextmenu' component should be registered after the 'sircl' component. Please review order of script files.");

//#region Handling contextmenus

// BeforeSend request handler to hide open contextmenus:
sircl.addRequestHandler("beforeSend", function (req) {
    // Hide contextmenus when starting load:
    $(".contextmenu").css("display", "none");
    // Move to next handler:
    this.next(req);
});

// AfterLoad handler to register context menu event handlers:
$$(function contextMenu_processHandler () {
    // Add handler on parent of a .contextmenu element to show/hide context menu:
    $(this).find(".contextmenu").each(function () {
        var cm = $(this);
        var target = $($(this).attr("contextmenu-for"));
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