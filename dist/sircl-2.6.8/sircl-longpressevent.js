/////////////////////////////////////////////////////////////////
// Sircl 2.x - Long-press-event extension
// www.getsircl.com
// Copyright (c) 2025 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

/* tslint:disabled */

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-longpressevent' component should be registered after the 'sircl' component. Please review order of script files.");

// LongPress event-actions:
//////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {

    // <* onlongpress-load="url"> On long-press, calls the given URL.
    $(document).on("long-press", "*[onlongpress-load]", function (event) {
        var href = this.getAttribute("onlongpress-load");
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
            sircl.ext.alert(this, href.substring(6), event);
        } else if (href.indexOf("javascript:") === 0) {
            var nonce = this.getAttribute("nonce");
            if (nonce) {
                jQuery.globalEval(href.substring(11), { nonce: nonce });
            } else {
                jQuery.globalEval(href.substring(11));
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

    // <* onlongpress-click="selector"> On long-press, triggers a click event on the elements matching the given selector.
    $(document).on("long-press", "*[onlongpress-click]", function (event) {
        var targetSelector = $(this).attr("onlongpress-click");
        sircl.ext.$select($(this), targetSelector).each(function () {
            this.click(); // See: http://goo.gl/lGftqn
        });
        //event.preventDefault();
    });

    // <* onlongpress-remove="selector"> On long-press removes the elements matching the given selector.
    $(document).on("long-press", "[onlongpress-remove]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onlongpress-remove")).remove();
    });

    // <* onlongpress-clear="selector"> On long-press clears the elements matching the given selector.
    $(document).on("long-press", "[onlongpress-clear]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onlongpress-clear")).html(null);
    });

    // <* onlongpress-hide="selector"> On long-press hides the elements matching the given selector.
    $(document).on("long-press", "[onlongpress-hide]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onlongpress-hide")), false, true);
    });

    // <* onlongpress-show="selector"> On long-press shows the elements matching the given selector.
    $(document).on("long-press", "[onlongpress-show]", function (event) {
        sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onlongpress-show")), true, true);
    });

    // <* onlongpress-toggleshow="selector"> On long-press shows/hides the elements matching the given selector.
    $(document).on("long-press", "[onlongpress-toggleshow]", function (event) {
        sircl.ext.$select($(this), $(this).attr("onlongpress-toggleshow")).each(function () {
            sircl.ext.visible($(this), !sircl.ext.visible($(this)), true);
        });
    });

    /// <* onlongpress-removeclass="class [on selector]"> On long-press, removes the class.
    $(document).on("long-press", "[onlongpress-removeclass]", function (event) {
        sircl.ext.removeClass($(this), $(this).attr("onlongpress-removeclass"));
    });

    /// <* onlongpress-addclass="class [on selector]"> On long-press, adds the class.
    $(document).on("long-press", "[onlongpress-addclass]", function (event) {
        sircl.ext.addClass($(this), $(this).attr("onlongpress-addclass"));
    });

    /// <* onlongpress-toggleclass="class [on selector]"> On long-press, toggles the class.
    $(document).on("long-press", "[onlongpress-toggleclass]", function (event) {
        sircl.ext.toggleClass($(this), $(this).attr("onlongpress-toggleclass"));
    });

});
