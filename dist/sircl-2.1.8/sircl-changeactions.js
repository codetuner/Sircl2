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
