/////////////////////////////////////////////////////////////////
// Sircl 2.x - TouchSwipe-Jquery-Plugin extension
// www.getsircl.com
// Copyright (c) 2024 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

/* tslint:disabled */

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-touchswipe-jquery' component should be registered after the 'sircl' component. Please review order of script files.");
if (typeof $.fn.swipe === "undefined") console.warn("The 'sircl-touchswipe-jquery' component requires the 'jquery.touchSwipe.js' component. See https://github.com/mattbryson/TouchSwipe-Jquery-Plugin");

$$("before", function () {
    $(this).find("*[onswipeleft-click],*[onswiperight-click],*[onswipeup-click],*[onswipedown-click],*[ontap-click],*[ondoubletap-click],*[onlongtap-click]").each(function () {
        $(this).swipe("destroy")
    });
});

$$("process", function () {
    $(this).find("*[onswipeleft-click],*[onswiperight-click],*[onswipeup-click],*[onswipedown-click],*[ontap-click],*[ondoubletap-click],*[onlongtap-click],*[onlongtapend-click]").each(function () {
        $(this).swipe({
            swipeLeft: function (event) {
                __sircl_touchswipe_click(this, "onswipeleft-click");
            },
            swipeRight: function (event) {
                __sircl_touchswipe_click(this, "onswiperight-click");
            },
            swipeUp: function (event) {
                __sircl_touchswipe_click(this, "onswipeup-click");
            },
            swipeDown: function (event) {
                __sircl_touchswipe_click(this, "onswipedown-click");
            },
            tap: function (event) {
                __sircl_touchswipe_click(this, "ontap-click");
            },
            doubleTap: function (event) {
                __sircl_touchswipe_click(this, "ondoubletap-click");
            },
            hold: function (event) {
                __sircl_touchswipe_click(this, "onlongtap-click");
            },
            longTap: function (event) {
                __sircl_touchswipe_click(this, "onlongtapend-click");
            },
            threshold: parseInt($(this).closest("[swipe-threshold]").attr("swipe-threshold") || "75"),
            longTapThreshold: parseInt($(this).closest("[longtap-threshold]").attr("longtap-threshold") || "500"),
            doubleTapThreshold: parseInt($(this).closest("[doubletap-threshold]").attr("doubletap-threshold") || "200"),
        });
        $(this).swipe("enable");
    });
});

function __sircl_touchswipe_click($elem, attrName) {
    if ($elem.hasAttr(attrName)) {
        var targetSelector = $elem.attr(attrName);
        sircl.ext.$select($elem, targetSelector).each(function () {
            this.click();
        });
    }
}