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
    if ($scope.hasClass("substitute-fields")) {
        var $formscope = $(triggerElement).closest("FORM");
        if ($formscope.length == 0) $formscope = $(document);
        var fieldparser = new RegExp(/(\[[a-z0-9\.\-\_]+?\])|(\%5B[a-z0-9\.\-\_]+?\%5D)/gi);
        var fieldnames = [];
        do {
            var fieldname = fieldparser.exec(url);
            if (fieldname !== null) fieldnames.push(fieldname[0]);
            else break;
        } while (true);
        for (var f = 0; f < fieldnames.length; f++) {
            var fieldvalue = (fieldnames[f].charAt(0) === "[")
                ? $formscope.find("[name='" + fieldnames[f].substr(1, fieldnames[f].length - 2) + "']").val()
                : $formscope.find("[name='" + fieldnames[f].substr(3, fieldnames[f].length - 6) + "']").val();
            if (fieldvalue === undefined)
                url = url.replace(fieldnames[f], "");
            else if (fieldnames[f].charAt(0) === "[")
                url = url.replace(fieldnames[f], fieldvalue);
            else
                url = url.replace(fieldnames[f], encodeURIComponent(fieldvalue));
        }
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
        var $subjects = $scope.find("INPUT[type=radio][name='" + this.name + "']:not([onchange-action])");
        sircl._actionCall(this, $subjects, $scope, $scope.attr("onchange-action"), this.name, jQuery.makeArray($subjects.filter(":checked")).map(function (elem) { return elem.value; }), event, function (req) {
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
        var $subjects = $scope.find("INPUT[type=checkbox][name='" + this.name + "']:not([onchange-action])");
        sircl._actionCall(this, $subjects, $scope, $scope.attr("onchange-action"), this.name, jQuery.makeArray($scope.find("INPUT[type=checkbox][name='" + this.name + "']:checked:not([onchange-action])")).map(function (elem) { return elem.value; }), event, function (req) {
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
