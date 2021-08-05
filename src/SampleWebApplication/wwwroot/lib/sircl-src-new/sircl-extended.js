﻿/////////////////////////////////////////////////////////////////
// Sircl 2.0 - Core extension
// www.getsircl.com
// Copyright (c) 2019-2021 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-extended' component should be registered after the 'sircl' component. Please review order of script files.");

//#region Extended event-actions

/// Load event-actions:
///////////////////////

sircl.addAttributeAlias(".onload-show", "onload-show", ":this");
sircl.addAttributeAlias(".onload-hide", "onload-hide", ":this");

sircl.addRequestHandler("beforeSend", function (req) {

    req.$initialTarget.find("[onload-hide]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onload-show")), false);
    });

    req.$initialTarget.find("[onload-show]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onload-show")), true);
    });

    req.$initialTarget.find("[onload-removeclass]").each(function () {
        sircl.ext.removeClass($(this), $(this).attr("onload-removeclass"));
    });

    req.$initialTarget.find("[onload-addclass]").each(function () {
        sircl.ext.addClass($(this), $(this).attr("onload-addclass"));
    });

    req.$initialTarget.find("[onload-toggleclass]").each(function () {
        sircl.ext.toggleClass($(this), $(this).attr("onload-toggleclass"));
    });

    // Move to next handler:
    this.next(req);
});

/// Init event-actions:
///////////////////////

sircl.addAttributeAlias(".oninit-show", "oninit-show", ":this");
sircl.addAttributeAlias(".oninit-hide", "oninit-hide", ":this");

$$("enrich", function () {
    $(this).find(".oninit-setvaluefromquery").each(function () {
        $(this).attr("oninit-setvaluefromquery", this.name);
    });
});

$$(function () {

    /// <* oninit-hide="selector"> Will make that element invisible on init.
    $(this).find("[oninit-hide]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("oninit-hide")), false);
    });

    /// <* oninit-show="selector"> Will make that element visible on init.
    $(this).find("[oninit-show]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("oninit-show")), true);
    });

    /// <* oninit-removeclass="classname [on selector]"> When initializing, removes the class to self or the given selector.
    $(this).find("[oninit-removeclass]").each(function () {
        sircl.ext.removeClass($(this), $(this).attr("oninit-removeclass"));
    });

    /// <* oninit-addclass="classname [on selector]"> When initializing, adds the class to self or the given selector.
    $(this).find("[oninit-addclass]").each(function () {
        sircl.ext.addClass($(this), $(this).attr("oninit-addclass"));
    });

    /// <* oninit-toggleclass="classname [on selector]"> When initializing, toggles the class to self or the given selector.
    $(this).find("[oninit-toggleclass]").each(function () {
        sircl.ext.toggleClass($(this), $(this).attr("oninit-toggleclass"));
    });

    /// <input oninit-setvaluefromquery="age"> Sets the value of the input to the named querystring parameter.
    $(this).find("[oninit-setvaluefromquery]").each(function () {
        $(this).attr("value", sircl.ext.getUrlParameter($(this).attr("oninit-setvaluefromquery")));
        $(this).change();
    });

    /// <SELECT oninit-defaultselect="value"> When initializing, will automatically select the corresponding item if the select had an empty value.
    /// The value of the oninit-defaultselect attribute is either:
    /// - ":singleton" to select the only element with a non-empty value, if there is only one;
    /// - ":first" to select the first non-empty value;
    /// - any other value, to select the item with that value.
    $(this).find("SELECT[oninit-defaultselect]").each(function () {
        if ($(this).val() != "") return; // Select already has a value.
        var value = $(this).attr("oninit-defaultselect") + "";
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
});

// Click event-actions:
///////////////////////

// onclick-load is an alias for href:
sircl.addContentReadyHandler("enrich", function () {
    $(this).find("[onclick-load]").each(function () {
        $(this).attr("href", $(this).attr("onclick-load"));
    });
});

$(function () {

    // <* onclick-click="selector"> On click, triggers a click event on the elements matching the given selector.
    $(document).on("click", "*[onclick-click]", function (event) {
        var targetSelector = $(this).attr("onclick-click");
        sircl.ext.$select($(this), targetSelector)[0].click(); // See: http://goo.gl/lGftqn
        //event.preventDefault();
    });

    // <* onclick-clear="selector"> On click clears the elements matching the given selector.
    $(document).on("click", "[onclick-clear]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-clear")).html("");
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
        sircl.ext.$select($(this), $(this).attr("onclick-disable")).prop("disabled", true);
    });

    // <* onclick-enable="selector"> On click enables the elements matching the given selector.
    $(document).on("click", "[onclick-enable]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-enable")).prop("disabled", false);
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
            sircl.ext.alert($(this), href.substr(6), null, true);
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
                sircl._loadUrl($(this), href, $(target));
            }
        }
        // If not returned earlier, stop event propagation:
        event.preventDefault();
        event.stopPropagation();
    });

    // <* ondblclick-click="selector"> On doubleclick, triggers a click event on the elements matching the given selector.
    $(document).on("dblclick", "*[ondblclick-click]", function (event) {
        var targetSelector = $(this).attr("ondblclick-click");
        sircl.ext.$select($(this), targetSelector)[0].click(); // See: http://goo.gl/lGftqn
        //event.preventDefault();
    });


    // <* ondblclick-clear="selector"> On doubleclick clears the elements matching the given selector.
    $(document).on("dblclick", "[ondblclick-clear]", function (event) {
        sircl.ext.$select($(this), $(this).attr("ondblclick-clear")).html("");
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
        var targetSelector = $(this).attr("onchecked-click");
        sircl.ext.$select($(this), targetSelector)[0].click(); // See: http://goo.gl/lGftqn
    });

    $(document).on("change", "[ifchecked-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-hide")), !this.checked);
    });

    $(document).on("change", "[ifchecked-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-show")), this.checked);
    });

    $(document).on("change", "[ifchecked-disable]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-disable")).prop("disabled", this.checked);
    });

    $(document).on("change", "[ifchecked-enable]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-enable")).prop("disabled", !this.checked);
    });

    $(document).on("change", "[ifchecked-readonly]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-readonly")).prop("readonly", this.checked);
    });

    $(document).on("change", "[ifchecked-readwrite]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-readwrite")).prop("readonly", !this.checked);
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
            if ($(this).prop("disabled") == false) actions.todisable.push(this);
        });
        $scope.find(ifvaluename + "-enable").each(function () {
            if ($(this).prop("disabled") == true) actions.toenable.push(this);
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
                    if ($(this).prop("disabled") == false && actions.todisable.indexOf(this) === -1) actions.todisable.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-enable").each(function () {
                    if (actions.todisable.indexOf(this) >= 0) actions.todisable.splice(actions.todisable.indexOf(this), 1);
                    if ($(this).prop("disabled") == true && actions.toenable.indexOf(this) === -1) actions.toenable.push(this);
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
            $(elem).prop("disabled", false);
        });
        actions.todisable.forEach(function (elem) {
            $(elem).prop("disabled", true);
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

$$(function () {

    $(this).find("[ifchecked-hide]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-hide")), !this.checked);
    });

    $(this).find("[ifchecked-show]").each(function () {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-show")), this.checked);
    });

    $(this).find("[ifchecked-disable]").each(function () {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-disable")).prop("disabled", this.checked);
    });

    $(this).find("[ifchecked-enable]").each(function () {
        sircl.ext.$select($(this), this.getAttribute("ifchecked-enable")).prop("disabled", !this.checked);
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
            if ($(this).prop("disabled") == false) actions.todisable.push(this);
        });
        $scope.find(ifvaluename + "-enable").each(function () {
            if ($(this).prop("disabled") == true) actions.toenable.push(this);
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
                    if ($(this).prop("disabled") == false && actions.todisable.indexOf(this) === -1) actions.todisable.push(this);
                });
                $scope.find(ifvaluenameisvalue + "-enable").each(function () {
                    if (actions.todisable.indexOf(this) >= 0) actions.todisable.splice(actions.todisable.indexOf(this), 1);
                    if ($(this).prop("disabled") == true && actions.toenable.indexOf(this) === -1) actions.toenable.push(this);
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
            $(elem).prop("disabled", false);
        });
        actions.todisable.forEach(function (elem) {
            $(elem).prop("disabled", true);
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

$$(function () {

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
            $this.prop("disabled", $all.filter(":checked").length < $all.length);
        });
        $this.prop("disabled", $all.filter(":checked").length < $all.length);
    });

    /// <* enable-ifanychecked="selection"> If any of the selection is checked, enable, else disable this.
    $(this).find("[enable-ifanychecked]").each(function () {
        var $this = $(this);
        var $any = sircl.ext.$select($this, $this.attr("enable-ifanychecked"));
        sircl.ext.$select($this, $this.attr("enable-ifanychecked")).on("change", function () {
            $this.prop("disabled", !$any.filter(":checked").length > 0);
        });
        $this.prop("disabled", !$any.filter(":checked").length > 0);
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
            sircl.ext.visible($this, $all.filter(":checked").length > 0)
        });
        sircl.ext.visible($this, $all.filter(":checked").length > 0)
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
    $(document).on("change", "[ifvalid-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifvalid-show")), sircl.ext.isValid($(this)));
    });
    $(document).on("change", "[ifinvalid-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifinvalid-show")), !sircl.ext.isValid($(this)));
    });
    $(document).on("change", "[ifvalid-addclass]", function (event) {
        if (sircl.ext.isValid($(this)))
            sircl.ext.addClass($(this), this.getAttribute("ifvalid-addclass"));
        else
            sircl.ext.removeClass($(this), this.getAttribute("ifvalid-addclass"));
    });
    $(document).on("change", "[ifinvalid-addclass]", function (event) {
        if (sircl.ext.isValid($(this)))
            sircl.ext.removeClass($(this), this.getAttribute("ifinvalid-addclass"));
        else
            sircl.ext.addClass($(this), this.getAttribute("ifinvalid-addclass"));
    });
    $(document).on("change", "[ifvalid-enable]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifvalid-enable")).prop("disabled", !sircl.ext.isValid($(this)));
    });
    $(document).on("change", "[ifinvalid-enable]", function (event) {
        sircl.ext.$select($(this), this.getAttribute("ifinvalid-enable")).prop("disabled", sircl.ext.isValid($(this)));
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
sircl.isElementInView = function(el) {
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

$$(function () {
    /// <* ifinview-load="url"> Loads the given URL and places the result in the element when the element is visible in the view.
    $("[ifinview-load]").each(function () {
        if (sircl.isElementInView(this)) {
            var url = $(this).attr("ifinview-load");
            $(this).removeAttr("ifinview-load");
            $(this).load(url);
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
            if (!sircl.ext.confirm($(this), confirmMessage, event)) {
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
            if (!sircl.ext.confirm($(this), confirmMessage, event)) {
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
            if (!sircl.ext.confirm($(this), confirmMessage, event)) {
                $(this).val(this._beforeConfirmValue);
                event.stopPropagation();
                event.preventDefault();
            } else {
                this._beforeConfirmValue = $(this).val();
            }
        }
    });
});

$$(function () {
    // Store initial value of input or select having onchange-confirm, to be able to restore if not confirmed:
    $(this).find("INPUT[onchange-confirm]:not([type='checkbox']):not([type='radio']),SELECT[onchange-confirm]").each(function () {
        this._beforeConfirmValue = $(this).val();
    });
});

//#endregion

//#region Drag & Drop

$(function () {

    /// Allow dragging file:
    /// <* ondropfile-accept="mimetypse">...</*>
    $(document.body).on("dragover", "[ondropfile-accept]", function (event) {
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
    /// <* class="ondropfile-submit" ondropfile-accept="mimetypes">...</*>
    $(document).on("drop", "[ondropfile-accept]", function (event) {
        // Prevent default browser behavior:
        event.preventDefault();
        // Verify files:
        var $this = $(this);
        var acceptedTypes = $this.attr("ondropfile-accept").split(" ");
        var maxFileSize = ($this.attr("dropfile-maxsize") || "1024 MB").toUpperCase();
        if (maxFileSize.indexOf("KB") > 0) maxFileSize = parseFloat(maxFileSize.replace("KB", "").trim()) * 1024;
        else if (maxFileSize.indexOf("MB") > 0) maxFileSize = parseFloat(maxFileSize.replace("MB", "").trim()) * 1024 * 1024;
        else maxFileSize = parseFloat(maxFileSize);
        var maxFileCount = parseInt($this.attr("dropfile-maxcount") || "99");
        var invalidFileMsg = $this.attr("ondropinvalidfile-alert");
        var tooManyFilesMsg = $this.attr("ondroptoomanyfiles-alert");
        var validFileIndexes = [];
        for (var f = 0; f < event.originalEvent.dataTransfer.files.length; f++) {
            var file = event.originalEvent.dataTransfer.files[f];
            if (file.size > maxFileSize) continue;
            for (var t = 0; t < acceptedTypes.length; t++) {
                var type = acceptedTypes[t].trim().toLowerCase();
                if (type == "") continue;
                if (type.indexOf("*") == 0) { // If type = "*/*":
                    validFileIndexes.push(f);
                } else if (type.indexOf("*") == type.length - 1) { // If type ends with "*":
                    if (file.type.toLowerCase().indexOf(type.substr(0, type.length - 1)) == 0) {
                        validFileIndexes.push(f);
                    }
                } else { // Else must be exact match:
                    if (file.type.toLowerCase() == type) {
                        validFileIndexes.push(f);
                    }
                }
            }
        }
        if (validFileIndexes.length > maxFileCount && tooManyFilesMsg != null) {
            sircl.ext.alert($this, tooManyFilesMsg, event, false);
        } else if (validFileIndexes.length != event.originalEvent.dataTransfer.files.length && invalidFileMsg != null) {
            sircl.ext.alert($this, invalidFileMsg, event, false);
        }
        if (validFileIndexes.length > 0) {
            if (validFileIndexes.length > maxFileCount) {
                // Shorten array to maxFileCount:
                validFileIndexes = validFileIndexes.slice(0, maxFileCount);
            }
            if ($this.hasClass("ondropfile-submit")) {
                // Determine form:
                var $form = ($this.hasAttr("form"))
                    ? $("#" + $this.attr("form"))
                    : $this.closest("FORM");
                if ($form.length > 0) {
                    // Prevent default browser behavior:
                    event.preventDefault();
                    // Add a submit button:
                    var btnid = "sircl-autoid-" + new Date().getTime();
                    var btn = "<input hidden id=\"" + btnid + "\" type=\"submit\" ";
                    if ($this.hasAttr("formaction")) btn += "formaction=\"" + $this.attr("formaction") + "\" ";
                    if ($this.hasAttr("formenctype")) btn += "formenctype=\"" + $this.attr("formenctype") + "\" ";
                    if ($this.hasAttr("formmethod")) btn += "formmethod=\"" + $this.attr("formmethod") + "\" ";
                    if ($this.hasAttr("formnovalidate")) btn += "formnovalidate=\"" + $this.attr("formnovalidate") + "\" ";
                    if ($this.hasAttr("formtarget")) btn += "formtarget=\"" + $this.attr("formtarget") + "\" ";
                    btn += "/>";
                    $form.append(btn);
                    var $btn = $("#" + btnid);
                    // Add files to submit button:
                    var files = [];
                    for (var i = 0; i < validFileIndexes.length; i++) {
                        files.push(event.originalEvent.dataTransfer.files[validFileIndexes[i]]);
                    }
                    $btn[0]._files = files;
                    $btn[0]._filesName = $this.attr("name") || "files";
                    // Submit form:
                    $btn.click();
                }
            }
        }
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
        event.originalEvent.target.appendChild(document.getElementById(sourceId));
    });

    $(document).on("drop", ".ondrop-copy", function (event) {
        // Prevent default browser behavior:
        event.preventDefault();
        // Perform move:
        var sourceId = event.originalEvent.dataTransfer.getData("__id");
        $(event.originalEvent.target).append(document.getElementById(sourceId).outerHTML.replace("id=\"" + sourceId + "\"", ""));
    });

    $(document).on("drop", ".ondrop-submit", function (event) {
        var $this = $(this);
        var $form = ($this.hasAttr("form"))
            ? $("#" + $this.attr("form"))
            : $this.closest("FORM");
        if ($form.length > 0) {
            // Copy drop-value to .drop-value input element:
            $form.find("INPUT.drop-value").each(function () {
                $(this).val(event.originalEvent.dataTransfer.getData("any"));
            });
            // Prevent default browser behavior:
            event.preventDefault();
            // Submit form (add a submit button, then click that button):
            var btnid = "sircl-autoid-" + new Date().getTime();
            var btn = "<input hidden id=\"" + btnid + "\" type=\"submit\" ";
            if ($this.hasAttr("formaction")) btn += "formaction=\"" + $this.attr("formaction") + "\" ";
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
$$(function () {
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
                url: url,
                text: text
            });
        }
    });
});

//#endregion


