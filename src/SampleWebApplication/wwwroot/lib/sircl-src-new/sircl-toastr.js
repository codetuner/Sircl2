﻿/////////////////////////////////////////////////////////////////
// Sircl 2.x - Toastr extension
// www.getsircl.com
// Copyright (c) 2019-2021 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-toastr' component should be registered after the 'sircl' component. Please review order of script files.");
if (typeof toastr === "undefined") console.warn("The 'sircl-toastr' component requires the 'toastr.js' component. See https://github.com/CodeSeven/toastr");
if (typeof jQuery !== "undefined" &&  $.isFunction($.fn.fadeIn) == false) console.warn("The 'sircl-toastr' component requires the full edition of jQuery. The slim edition is not sufficient.");

// Disables Toasts if "slim" edition of jQuery is loaded:
if ($.isFunction($.fn.fadeIn)) {

    // X-Sircl-Toastr response header support:
    sircl.addRequestHandler("afterSend", function sircl_toastr_afterSend_requestHandler (req) {
        if (req.xhr != null) {
            var toastrHeader = req.xhr.getResponseHeader("X-Sircl-Toastr");
            if (toastrHeader != null && toastrHeader.indexOf("|") > 1) {
                var toastrHeaderParts = toastrHeader.split("|");
                var toastrType = toastrHeaderParts[0];
                toastrHeaderParts.splice(0, 1);
                toastr[toastrType].apply(null, toastrHeaderParts);
            }
        }
        // Move to next handler:
        this.next(req);
    });

    // .onload-showtoastr shows toasts based on following definition:
    // <div class="onload-showtoastr" hidden data-toastr-type="info" data-toastr-title="Welcome!">
    //   You are on the <b>Products</b> page.
    // </div>
    $$(function sircl_toastr_processHandler () {
        $(this).find(".onload-showtoastr").each(function () {
            var toastrType = $(this).data("toastr-type") || "info";
            var toastrArgs = [$(this).html()];
            if ($(this).data("toastr-title") != null) toastrArgs.push($(this).data("toastr-title"));
            toastr[toastrType].apply(null, toastrArgs);
        });
    });

}