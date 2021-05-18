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

// onclick-load is an alias for href:
sircl.addContentReadyHandler("enrich", function () {
    $(this).find("[onclick-load]").each(function () {
        $(this).attr("href", $(this).attr("onclick-load"));
    });
});

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

    // <* onclick-check="selector"> On click checks matching checkbox or radio inputs.
    $(document.body).on("click", "[onclick-check]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-check")).filter("INPUT[type=checkbox], INPUT[type=radio]").each(function () {
            this.checked = true;
            $(this).change();
        });
    });

    // <* onclick-uncheck="selector"> On click unchecks matching checkbox or radio inputs.
    $(document.body).on("click", "[onclick-uncheck]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-uncheck")).filter("INPUT[type=checkbox], INPUT[type=radio]").each(function () {
            this.checked = false;
            $(this).change();
        });
    });

    // <* onclick-togglecheck="selector"> On click changes the checked/unchecked state of matching checkbox or radio inputs.
    $(document.body).on("click", "[onclick-togglecheck]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-togglecheck")).filter("INPUT[type=checkbox], INPUT[type=radio]").each(function () {
            this.checked = !this.checked;
            $(this).change();
        });
    });
});

// Dblclick event-actions:
//////////////////////////

$(function () {

    // <* ondblclick-load="url"> On doubleclick, calls the given URL.
    $(document.body).on("dblclick", "*[ondblclick-load]", function (event) {
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
    $(document.body).on("dblclick", "*[ondblclick-click]", function (event) {
        var targetSelector = $(this).attr("ondblclick-click");
        sircl.ext.$select($(this), targetSelector)[0].click(); // See: http://goo.gl/lGftqn
        //event.preventDefault();
    });


    // <* ondblclick-clear="selector"> On doubleclick clears the elements matching the given selector.
    $(document.body).on("dblclick", "[ondblclick-clear]", function (event) {
        sircl.ext.$select($(this), $(this).attr("ondblclick-clear")).html("");
    });

    // <* ondblclick-show="selector"> On doubleclick shows the elements matching the given selector.
    $(document.body).on("dblclick", "[ondblclick-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("ondblclick-show")), true);
    });

    // <* ondblclick-hide="selector"> On doubleclick hides the elements matching the given selector.
    $(document.body).on("dblclick", "[ondblclick-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("ondblclick-hide")), false);
    });

    // <* ondblclick-toggleshow="selector"> On doubleclick shows/hides the elements matching the given selector.
    $(document.body).on("dblclick", "[ondblclick-toggleshow]", function (event) {
        sircl.ext.$select($(this), $(this).attr("ondblclick-toggleshow")).each(function () {
            sircl.ext.visible($(this), !sircl.ext.visible($(this)));
        });
    });

    /// <* ondblclick-removeclass="class [on selector]"> On doubleclick, removes the class.
    $(document.body).on("dblclick", "[ondblclick-removeclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("ondblclick-removeclass"));
    });

    /// <* ondblclick-addclass="class [on selector]"> On doubleclick, adds the class.
    $(document.body).on("dblclick", "[ondblclick-addclass]", function (event) {
        sircl.ext.addClass($(this), $(this).attr("ondblclick-addclass"));
    });

    /// <* ondblclick-toggleclass="class [on selector]"> On doubleclick, toggles the class.
    $(document.body).on("dblclick", "[ondblclick-toggleclass]", function (event) {
        sircl.ext.toggleClass($(this), $(this).attr("ondblclick-toggleclass"));
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
    /// Buttons and link can have a confirmation dialog:
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

    /// Checkboxes can have a change confirm dialog:
    /// <input type="checkbox" onchange-confirm="Are you sure ?" />
    $(document.body).children().on("change", "INPUT[onchange-confirm][type='checkbox']", function (event) {
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
    $(document.body).children().on("change", "INPUT[onchange-confirm]:not([type='checkbox']):not([type='radio']),SELECT[onchange-confirm]", function (event) {
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

//#region Form changed state handling

// On initial load, if onchange-set input is true, add .form-changed class to form:
$$(function () {
    $(this).find("FORM[onchange-set]").each(function () {
        var $input = $(this).find("INPUT[name='" + $(this).attr("onchange-set") + "']");
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
            var $input = $(this).find("INPUT[name='" + $(this).attr("onchange-set") + "']");
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

//#region Drag & Drop

$(function () {

    $(document.body).on("dragstart", "[draggable]", function (event) {
        if ($(this).hasAttr("drop-type")) {
            var dragTypes = $(this).attr("drop-type").split(" ");
            for (var i = 0; i < dragTypes.length; i++) {
                if (dragTypes[i].trim() != "") event.originalEvent.dataTransfer.setData(dragTypes[i].trim(), true);
            }
        }
        event.originalEvent.dataTransfer.setData("__id", sircl.ext.getId(this, true));
        event.originalEvent.dataTransfer.setData("any", $(this).attr("drop-value"));
    });

    $(document.body).children().on("dragover", "[ondrop-accept]", function (event) {
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

    $(document.body).on("dragleave", "[ondragover-addclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("ondragover-addclass"));
    });

    $(document.body).on("drop", "[ondragover-addclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("ondragover-addclass"));
    });

    $(document.body).on("drop", ".ondrop-move", function (event) {
        // Prevent default browser behavior:
        event.preventDefault();
        // Perform move:
        var sourceId = event.originalEvent.dataTransfer.getData("__id");
        event.originalEvent.target.appendChild(document.getElementById(sourceId));
    });

    $(document.body).on("drop", ".ondrop-copy", function (event) {
        // Prevent default browser behavior:
        event.preventDefault();
        // Perform move:
        var sourceId = event.originalEvent.dataTransfer.getData("__id");
        $(event.originalEvent.target).append(document.getElementById(sourceId).outerHTML.replace("id=\"" + sourceId + "\"", ""));
    });

    $(document.body).on("drop", ".ondrop-submit", function (event) {
        var $form = $(this).closest("FORM");
        if ($form.length > 0) {
            // Copy drop-value to .drop-value input element:
            $form.find("INPUT.drop-value").each(function () {
                $(this).val(event.originalEvent.dataTransfer.getData("any"));
            });
            // Prevent default browser behavior:
            event.preventDefault();
            // Submit form:
            var form = $form[0];
            form._formTrigger = this;
            form._formTriggerTimer = setTimeout(function () { form._formTrigger = null; }, 700);
            form.submit();
        }
    });


});

//#endregion

