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

    // <* onclick-scrollintoview="selector"> On click scrolls the (first) match of the selector into the view.
    $(this).find(".onload-scrollintoview").each(function () {
        this.scrollIntoView();
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

document.addEventListener("DOMContentLoaded", function () {
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
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onchange-hide")), false, true);
    });

    // <* onchange-show="selector"> On change, shows the elements matching the given selector.
    $(document).on("change", "*[onchange-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onchange-show")), true, true);
    });

});

// Key event-actions:
/////////////////////

// Key event-actions take as value the pressed key in the format "[Alt+][Ctrl+][Shift+]Key".
// I.e: "a", "+", "Ctrl+ArrowLeft", "Enter", "Escape" or "F1"

document.addEventListener("DOMContentLoaded", function () {
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

document.addEventListener("DOMContentLoaded", function () {

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
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onclick-hide")), false, true);
    });

    // <* onclick-show="selector"> On click shows the elements matching the given selector.
    $(document).on("click", "[onclick-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onclick-show")), true, true);
    });

    // <* onclick-toggleshow="selector"> On click shows/hides the elements matching the given selector.
    $(document).on("click", "[onclick-toggleshow]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onclick-toggleshow")).each(function () {
            sircl.ext.visible($(this), !sircl.ext.visible($(this)), true);
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

    // <* onclick-appendto="selector"> On click appends the content of the current element to the target.
    $(document).on("click", "[onclick-appendto]", function () {
        var $target = $($(this).attr("onclick-appendto"));
        // Append HTML and force afterLoad:
        var initialLength = $target.children().length;
        $target.append($(this).html());
        $target.children().slice(initialLength).each(function () { sircl._afterLoad(this); });
    });

    // <* onclick-prependto="selector"> On click prepends the content of the current element to the target.
    $(document).on("click", "[onclick-prependto]", function () {
        var $target = $($(this).attr("onclick-prependto"));
        // Prepend HTML and force afterLoad:
        var initialLength = $target.children().length;
        $target.prepend($(this).html());
        var finalLength = $target.children().length;
        $target.children().slice(0, finalLength - initialLength).each(function () { sircl._afterLoad(this); });
    });

    // <* onclick-replaceto="selector"> On click replaces the target by the current element.
    // If original element had no id and only single element replaced, keep id.
    $(document).on("click", "[onclick-replaceto]", function () {
        var $target = $($(this).attr("onclick-replaceto"));
        // Replace HTML and force afterLoad:
        var targetId = ($target.length == 1) ? sircl.ext.getId($target[0], false) : null;
        var $targetParent = $target.parent();
        var $targetSiblings = $targetParent.children();
        var initialLength = $targetSiblings.length;
        // Retrieve position of element to be replaced:
        var id = sircl.ext.getId($target, true);
        var pos = -1;
        for (var i = 0; i < initialLength; i++) {
            if ($targetSiblings[i].id === id) {
                pos = i;
                break;
            }
        }
        // Perform replacement:
        $target.replaceWith($(this).html());
        var finalLength = $targetParent.children().length;
        // If replaced by a single element with no id, copy id from original:
        if (pos > -1 && initialLength === finalLength && targetId !== null) {
            var elem = $targetParent.children()[pos];
            if (elem.id == null || elem.id == "") elem.id = targetId;
        }
        // If replaced by one or more elements, apply afterLoad to the new elements:
        if (pos > -1 && finalLength >= initialLength) {
            $targetParent.children().slice(pos, pos + finalLength - initialLength + 1).each(function () { sircl._afterLoad(this); });
            // Otherwise, replace just removed the element, no afterLoad needed.
        }
    });

    // <* onclick-alert="selector"> On click shows an alert.
    $(document).on("click", "[onclick-alert]", function (event) {
        sircl.ext.alert(this, $(this).attr("onclick-alert"), event);
    });

    // <* onclick-copytext="text"> Copies the given text to the clipboard.
    $(document).on("click", "[onclick-copytext]", function (event) {
        // Get & copy to clipboard:
        var text = this.getAttribute("onclick-copytext");
        navigator.clipboard.writeText(text);
        // Display spinner:
        var $spinners = $(this).find("> .spinner");
        if ($spinners.length > 0) {
            var $trigger = $(this);
            var _spinner_to_restore = $trigger[0].innerHTML;
            setTimeout(function () {
                $trigger[0].innerHTML = _spinner_to_restore;
            }, 250);
            $spinners[0].outerHTML = sircl.html_spinner;
        }
    });

    // <* onclick-copyinnertext="selector"> Copies the innerText of the matching element to the clipboard.
    $(document).on("click", "[onclick-copyinnertext]", function (event) {
        // Get & copy to clipboard:
        var text = sircl.ext.$select($(this), $(this).attr("onclick-copyinnertext")).text();
        navigator.clipboard.writeText(text);
        // Display spinner:
        var $spinners = $(this).find("> .spinner");
        if ($spinners.length > 0) {
            var $trigger = $(this);
            var _spinner_to_restore = $trigger[0].innerHTML;
            setTimeout(function () {
                $trigger[0].innerHTML = _spinner_to_restore;
            }, 250);
            $spinners[0].outerHTML = sircl.html_spinner;
        }
    });

    // <* onclick-copyinnerhtml="selector"> Copies the innerHTML of the matching element to the clipboard.
    $(document).on("click", "[onclick-copyinnerhtml]", function (event) {
        // Get & copy to clipboard:
        var text = sircl.ext.$select($(this), $(this).attr("onclick-copyinnerhtml")).html();
        navigator.clipboard.writeText(text);
        // Display spinner:
        var $spinners = $(this).find("> .spinner");
        if ($spinners.length > 0) {
            var $trigger = $(this);
            var _spinner_to_restore = $trigger[0].innerHTML;
            setTimeout(function () {
                $trigger[0].innerHTML = _spinner_to_restore;
            }, 250);
            $spinners[0].outerHTML = sircl.html_spinner;
        }
    });

    // <* onclick-copyvalue="selector"> Copies the value of the (first) matching (INPUT) element to the clipboard.
    $(document).on("click", "[onclick-copyvalue]", function (event) {
        var $elem = sircl.ext.$select($(this), $(this).attr("onclick-copyvalue"));
        if ($elem.length > 0) {
            // Get & copy to clipboard:
            var text = sircl.ext.effectiveValue($elem[0]);
            navigator.clipboard.writeText(text);
            // Display spinner:
            var $spinners = $(this).find("> .spinner");
            if ($spinners.length > 0) {
                var $trigger = $(this);
                var _spinner_to_restore = $trigger[0].innerHTML;
                setTimeout(function () {
                    $trigger[0].innerHTML = _spinner_to_restore;
                }, 250);
                $spinners[0].outerHTML = sircl.html_spinner;
            }
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

document.addEventListener("DOMContentLoaded", function () {

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
        } else if (href === "history:reload" || href === "history:refresh") {
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
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("ondblclick-hide")), false, true);
    });

    // <* ondblclick-show="selector"> On doubleclick shows the elements matching the given selector.
    $(document).on("dblclick", "[ondblclick-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("ondblclick-show")), true, true);
    });

    // <* ondblclick-toggleshow="selector"> On doubleclick shows/hides the elements matching the given selector.
    $(document).on("dblclick", "[ondblclick-toggleshow]", function (event) {
        sircl.ext.$select($(this), $(this).attr("ondblclick-toggleshow")).each(function () {
            sircl.ext.visible($(this), !sircl.ext.visible($(this)), true);
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

document.addEventListener("DOMContentLoaded", function () {
    /// <* onhover-hide="selector"> On hover, hides elements matching the given selector.
    $(document).on("mouseenter", "*[onhover-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-hide")), false, true);
    });
    $(document).on("mouseleave", "*[onhover-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-hide")), true, true);
    });

    /// <* onhover-show="selector"> On hover, displays elements matching the given selector.
    $(document).on("mouseenter", "*[onhover-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-show")), true, true);
    });
    $(document).on("mouseleave", "*[onhover-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onhover-show")), false, true);
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

document.addEventListener("DOMContentLoaded", function () {
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
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-hide")), !this.checked, true);
    });

    $(document).on("change", "[ifchecked-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifchecked-show")), this.checked, true);
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
            sircl.ext.visible(elem, true, true);
        });
        actions.tohide.forEach(function (elem) {
            sircl.ext.visible(elem, false, true);
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
            sircl.ext.visible($this, $all.filter(":checked").length == $all.length, true)
        });
        sircl.ext.visible($this, $all.filter(":checked").length == $all.length)
    });

    /// <* show-ifanychecked="selection"> If any of the selection is checked, show, else hide this.
    $(this).find("[show-ifanychecked]").each(function () {
        var $this = $(this);
        var $any = sircl.ext.$select($this, $this.attr("show-ifanychecked"));
        sircl.ext.$select($this, $this.attr("show-ifanychecked")).on("change", function () {
            sircl.ext.visible($this, $any.filter(":checked").length > 0, true)
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

document.addEventListener("DOMContentLoaded", function () {
    $(document).on("change input invalid", "[ifvalid-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifvalid-show")), sircl.ext.isValid($(this)), true);
    });
    $(document).on("change input invalid", "[ifinvalid-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), this.getAttribute("ifinvalid-show")), !sircl.ext.isValid($(this)), true);
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
/// (Can be placed on the input element itself, or one of its parents, i.e. the FORM element)
$(document).on("focus", ".onfocus-select", function (event) {
    if ($(event.target).is("INPUT:not([type=checkbox]):not([type=radio]):not([type=button]):not(.onfocus-noselect)")) {
        event.target.select();
    }
});

/// <INPUT class="onfocusout-trim"> Trims the text on focus out:
/// (Can be placed on the input element itself, or one of its parents, i.e. the FORM element)
/// (Though named an onfocusout event-action, technically implemented using a change event on document body, so it is done before all other change events.)
$(document.body).on("change", ".onfocusout-trim", function (event) {
    if ($(event.target).is("INPUT:not([type=checkbox]):not([type=radio]):not([type=button]):not(.onfocusout-notrim)")) {
        event.target.value = (event.target.value + "").trim()
    }
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

document.addEventListener("DOMContentLoaded", function () {

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

document.addEventListener("DOMContentLoaded", function () {

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

document.addEventListener("DOMContentLoaded", function () {

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


document.addEventListener("DOMContentLoaded", function () {

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

document.addEventListener("DOMContentLoaded", function () {
    $(document).on("click", "[onclick-share]", function () {
        if (navigator.share) {
            // Display spinner:
            var $spinners = $(this).find("> .spinner");
            if ($spinners.length > 0) {
                var $trigger = $(this);
                var _spinner_to_restore = $trigger[0].innerHTML;
                setTimeout(function () {
                    $trigger[0].innerHTML = _spinner_to_restore;
                }, 250);
                $spinners[0].outerHTML = sircl.html_spinner;
            }
            // Retrieve sharing info:
            var $target = sircl.ext.$select($(this), $(this).attr("onclick-share"));
            var title = $target.attr("data-share-title") || $target.attr("title") || (($target.hasAttr("data-share-title")) ? undefined : document.title);
            var url = $target.attr("data-share-url") || $target.attr("href") || (($target.hasAttr("data-share-url")) ? undefined : window.location.href);
            var text = $target.attr("data-share-text") || $target.text();
            // Share:
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
