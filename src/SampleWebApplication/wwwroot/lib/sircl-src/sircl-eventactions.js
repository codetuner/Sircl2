/* Sircl 2.x event-actions */
/* (c) Rudi Breedenraedt */

var __rb_eventactiontest = {
    true: function (e) { return true; },
    isValid: function (e) { return e.target.validity.valid; },
    hasFocus: function (e) { return $(e.target).is(":focus"); },
    hasValue: function (e) { return $(e.target).val() != ""; },
    isChecked: function (e) { return $(e.target).prop("checked"); },
};

var __rb_eventactionfx = {
    check: function (event) {
        var selector = $(event.target).attr(event.data.selectorAttr);
        var target = $(selector);
        target.prop('checked', (!event.data.reverse) ? event.target.checked : !event.target.checked);
        target.trigger('change');
    },
    enable: function (event) {
        var selector = $(event.target).attr(event.data.selectorAttr);
        var target = $(selector);
        if (event.data.test(event) ? !event.data.reverse : event.data.reverse) {
            target.prop("disabled", false);
        } else {
            target.prop("disabled", true);
            target.filter("input[type=checkbox]").prop("checked", false);
        }
    },
    propagate: function (event) {
        var value = $(event.currentTarget).attr(event.data.selectorAttr);
        if (value == "off") {
            event.stopPropagation();
        }
    },
    show: function (event) {
        var selector = $(event.target).attr(event.data.selectorAttr);
        var target = $(selector);
        __rb.hide(target, !(event.data.test(event) ? !event.data.reverse : event.data.reverse));
    },
    toglleClass: function (event) {
        var attrvalues = $(event.target).attr(event.data.selectorAttr).split(" on ");
        var clss = attrvalues[0];
        var target = (attrvalues.length > 1) ? $(attrvalues[1]) : $(event.target);
        target.toggleClass(clss);
    },
    clear: function (event) {
        var selector = $(event.target).attr(event.data.selectorAttr);
        var target = $(selector);
        // Clear the innerHTML of the target:
        target.html('');
    },
    action: function (event) {
        var method = $(this).attr("method") || $(this).attr("formmethod") || "GET";
        var href = $(this).attr(event.data.selectorAttr);
        var value = $(event.target).val();
        if (event.target.type == "checkbox" && event.target.checked == false) value = "";
        var data = {};
        data[event.target.name] = value;
        data["name"] = event.target.name;
        data["value"] = $(event.target).val();
        if (event.target.type == "checkbox") data["checked"] = event.target.checked ? "true" : "false";
        var inlineTarget = $(this).inlineTarget()[0];
        if (!inlineTarget) {
            var inlineTargetId = $(this).attr('id') || new Date().getTime();
            $(this).attr('id', inlineTargetId);
            inlineTarget = "#" + inlineTargetId;
        }
        var onsuccess;
        var onerror;
        if (event.target.type == "checkbox") {
            onerror = function () { event.target.checked = !event.target.checked; };
        } // TODO for other form element types, use the onsuccessdeletage to set a "previousValue" expando property. On error: return to that previousValue if it exists, or use the defaultValue property if not.
        __rb.submitInline(event, $(this), data, method, href, null, inlineTarget, false, null, onsuccess, onerror);
    },
    keyAction: function (event) {
        var keyname = event.data.actionName;
        var actionName = $(this).attr(event.data.selectorAttr);
        if ((keyname === "enter" && event.keyCode === 13)) {
            if (actionName === "ignore") {
                event.preventDefault();
                event.stopPropagation();
            } else if (actionName === "submit") {
                $(event.target).closest("FORM").submit();
            }
        }
    }
};

var __rb_eventaction = {
    registerEvents: function (receiver, elementNames, eventName, actionNames, testfx, actionfx, events, processOnLoad) {
        for (var i = 0; i < actionNames.length; i++) {
            var actionName = actionNames[i];
            var reverse = (i > 0);
            var selectorAttr = eventName + "-" + actionName;
            var selector = elementNames.join("[" + selectorAttr + "],") + "[" + selectorAttr + "]";
            // Register events:
            for (var e = 0; e < events.length; e++) {
                var event = events[e];
                $(receiver).on(event, selector, { eventName: eventName, actionName: actionName, selectorAttr: selectorAttr, test: testfx, reverse: reverse }, actionfx);
            }
            // Register a loader extension:
            if (processOnLoad) {
                // Function and data for loader extension:
                var fd = [function (loaded, data) {
                    $(loaded).find(data.selector).each(function () { actionfx({ target: $(this)[0], data: data.data }) });
                }, { selector: selector, data: { eventName: eventName, actionName: actionName, selectorAttr: selectorAttr, test: testfx, reverse: reverse } }];
                // Register for future ajax loads:
                rbLoaderExtensions.push(fd);
                // Call for now:
                fd[0](document, fd[1]);
            }
            // Max 2 actionNames (straight + reverse):
            if (i == 1) break;
        }
    },
};

/// Document Ready handler:
$(document).ready(function () {

    // Action events using standard handlers:
    __rb_eventaction.registerEvents(document.body, ["*"], "onclick", ["clear"], __rb_eventactiontest.true, __rb_eventactionfx.clear, ["click"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "onclick", ["show", "hide"], __rb_eventactiontest.true, __rb_eventactionfx.show, ["click"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "onclick", ["toglleclass"], __rb_eventactiontest.true, __rb_eventactionfx.toglleClass, ["click"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "ondblclick", ["clear"], __rb_eventactiontest.true, __rb_eventactionfx.clear, ["dblclick"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "ondblclick", ["show", "hide"], __rb_eventactiontest.true, __rb_eventactionfx.show, ["dblclick"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "ondblclick", ["toglleclass"], __rb_eventactiontest.true, __rb_eventactionfx.toglleClass, ["dblclick"], false);
    __rb_eventaction.registerEvents(document.body, ["FORM"], "onsubmit", ["show", "hide"], __rb_eventactiontest.true, __rb_eventactionfx.show, ["submit"], false);
    __rb_eventaction.registerEvents(document.body, ["INPUT", "SELECT"], "ifhasvalue", ["show", "hide"], __rb_eventactiontest.hasValue, __rb_eventactionfx.show, ["change", "input"], true);
    __rb_eventaction.registerEvents(document.body, ["INPUT", "SELECT"], "ifhasvalue", ["enable", "disable"], __rb_eventactiontest.hasValue, __rb_eventactionfx.enable, ["change", "input"], true);
    __rb_eventaction.registerEvents(document.body, ["INPUT"], "ifchecked", ["check", "uncheck"], __rb_eventactiontest.isChecked, __rb_eventactionfx.check, ["change"], true);
    __rb_eventaction.registerEvents(document.body, ["INPUT"], "ifchecked", ["show", "hide"], __rb_eventactiontest.isChecked, __rb_eventactionfx.show, ["change"], true);
    __rb_eventaction.registerEvents(document.body, ["INPUT"], "ifchecked", ["enable", "disable"], __rb_eventactiontest.isChecked, __rb_eventactionfx.enable, ["change"], true);
    __rb_eventaction.registerEvents(document.body, ["INPUT"], "ifvalid", ["show", "hide"], __rb_eventactiontest.isValid, __rb_eventactionfx.show, ["change", "input"], true);
    __rb_eventaction.registerEvents(document.body, ["INPUT"], "ifvalid", ["enable", "disable"], __rb_eventactiontest.isValid, __rb_eventactionfx.enable, ["change"], true);
    __rb_eventaction.registerEvents(document.body, ["INPUT", "A"], "iffocus", ["show", "hide"], __rb_eventactiontest.hasFocus, __rb_eventactionfx.show, ["focusin", "focusout"], true);
    __rb_eventaction.registerEvents(document.body, ["*"], "onclick", ["propagate"], __rb_eventactiontest.true, __rb_eventactionfx.propagate, ["click"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "ondblclick", ["propagate"], __rb_eventactiontest.true, __rb_eventactionfx.propagate, ["dblclick"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "onchange", ["propagate"], __rb_eventactiontest.true, __rb_eventactionfx.propagate, ["change"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "oninput", ["propagate"], __rb_eventactiontest.true, __rb_eventactionfx.propagate, ["input"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "onchange", ["action"], __rb_eventactiontest.true, __rb_eventactionfx.action, ["change"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "onclick", ["action"], __rb_eventactiontest.true, __rb_eventactionfx.action, ["click"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "ondblclick", ["action"], __rb_eventactiontest.true, __rb_eventactionfx.action, ["click"], false);
    __rb_eventaction.registerEvents(document.body, ["*"], "onkey", ["enter"], __rb_eventactiontest.true, __rb_eventactionfx.keyAction, ["keypress"], false);

    /// <* onhover-show="selector"> On hover, displays elements matching the given selector.
    $(document.body).on("mouseenter", "*[onhover-show]", function (event) {
        var target = $($(this).attr("onhover-show"));
        __rb.hide(target, false);
    }); $(document.body).on("mouseleave", "*[onhover-show]", function (event) {
        var target = $($(this).attr("onhover-show"));
        __rb.hide(target, true);
    });

    /// <* onhover-hide="selector"> On hover, hides elements matching the given selector.
    $(document.body).on("mouseenter", "*[onhover-hide]", function (event) {
        var target = $($(this).attr("onhover-hide"));
        __rb.hide(target, true);
    }); $(document.body).on("mouseleave", "*[onhover-hide]", function (event) {
        var target = $($(this).attr("onhover-hide"));
        __rb.hide(target, false);
    });

    /// <* onhover-setclass="class"> On hover, sets the given class on the element.
    $(document.body).on("mouseenter", "*[onhover-setclass]", function (event) {
        var attrvalues = $(this).attr("onhover-setclass").split(" on ");
        var clss = attrvalues[0];
        var target = (attrvalues.length > 1) ? $(attrvalues[1]) : $(this);
        target.addClass(clss);
    }); $(document.body).on("mouseleave", "*[onhover-setclass]", function (event) {
        var attrvalues = $(this).attr("onhover-setclass").split(" on ");
        var clss = attrvalues[0];
        var target = (attrvalues.length > 1) ? $(attrvalues[1]) : $(this);
        target.removeClass(clss);
    });

    /// <form onsubmit-disable=":submit"> Prevents submitting the form twice.
    $(document.body).on("submit", "FORM[onsubmit-disable=':submit']", function (event) {
        $(this).find("INPUT[type=submit], INPUT[type=reset], INPUT[type=image], BUTTON").each(function (index) {
            $(this).prop('disabled', true);
        });
    });

    /// <form onchange-set="inputname"> On input, flags the form dirty.
    $(document.body).on("input change", "FORM[onchange-set]", function (event) {
        __rb.markFormChanged($(this));
    });

    /// <* onchange-submit=":form"> triggers form submission on change.
    $(document.body).on("change", "*[onchange-submit=':form']", function (event) {
        var form = $(this).closest('form');
        var inlineTarget = $(this).inlineTarget()[0];
        var formaction = $(this).attr("formaction");
        if ($(this)[0] !== form[0] && (inlineTarget || formaction)) {
            var method = (form.attr("method") || "GET").toUpperCase();
            var href = $(this).attr("formaction") || form.attr("action") || "";
            var target = $(this).target();
            __rb.submitInline(event, $(this), form, method, href, target, inlineTarget, false, null);
        } else {
            form.submit();
        }
    });

});

rbLoaderExtensions.push([function (loaded) {

    // Timer events:

    $(loaded).find("*[timer]").each(function () {
        var ms = 1000 * $(this).attr("timer");
        var element = $(this)[0];
        for (var i = 0; i < element.attributes.length; i++) {
            var value = element.attributes[i].value;
            if (element.attributes[i].name == "ontimer-addclass") {
                setTimeout(function (element, value) {
                    $(element).addClass(value);
                }, ms, element, value);
            }
            if (element.attributes[i].name == "ontimer-removeclass") {
                setTimeout(function (element, value) {
                    $(element).removeClass(value);
                }, ms, element, value);
            }
            if (element.attributes[i].name == "ontimer-toglleclass") {
                setTimeout(function (element, value) {
                    $(element).toglleClass(value);
                }, ms, element, value);
            }
        }
    });

    // Onload events:

    $(loaded).find("*[onload-addclass]").each(function () {
        var attrvalues = $(this).attr("onload-addclass").split(" on ");
        var clss = attrvalues[0];
        var target = (attrvalues.length > 1) ? $(attrvalues[1]) : $(this);
        target.addClass(clss);
    });
    $(loaded).find("*[onload-removeclass]").each(function () {
        var attrvalues = $(this).attr("onload-removeclass").split(" on ");
        var clss = attrvalues[0];
        var target = (attrvalues.length > 1) ? $(attrvalues[1]) : $(this);
        target.removeClass(clss);
    });
    $(loaded).find("*[onload-toggleclass]").each(function () {
        var attrvalues = $(this).attr("onload-toglleclass").split(" on ");
        var clss = attrvalues[0];
        var target = (attrvalues.length > 1) ? $(attrvalues[1]) : $(this);
        target.toglleClass(clss);
    });

    // Action-events:

    $(loaded).find("*[enable-ifchecked-any]").each(function () {
        var elem = this;
        var target = $(this).attr("enable-ifchecked-any");
        // Enable/disable depending on current checked state:
        $(elem).prop("disabled", !$(target).is(":checked"));
        // Add event handlers to update live:
        $(target).on("change", function () { $(elem).prop("disabled", !$(target).is(":checked")); });
    });

    $(loaded).find("*[show-ifchecked-any]").each(function () {
        var elem = this;
        var target = $(this).attr("show-ifchecked-any");
        // Show/hide depending on current checked state:
        if ($(target).is(":checked")) $(elem).removeClass("hidden"); else $(elem).addClass("hidden");
        // Add event handlers to update live:
        $(target).on("change", function () { if ($(target).is(":checked")) $(elem).removeClass("hidden"); else $(elem).addClass("hidden"); });
    });

}]);