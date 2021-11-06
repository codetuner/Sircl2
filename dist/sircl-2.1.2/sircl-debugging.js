/////////////////////////////////////////////////////////////////
// Sircl 2.x - Debugging & Diagnostics extension
// www.getsircl.com
// Copyright (c) 2019-2021 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-contextmenu' component should be registered after the 'sircl' component. Please review order of script files.");

//#region Add tooltip on hyperlinks and forms displaying the URL

$$("enrich", function () {
    $(this).find("BODY [href]:not([title])").each(function () {
        if (this.tagName != "LINK") $(this).attr("title", $(this).attr("href"));
    });
    $(this).find("BODY [onclick-load]:not([title])").each(function () {
        $(this).attr("title", $(this).attr("onclick-load"));
    });
    $(this).find("BODY [action]:not([title])").each(function () {
        $(this).attr("title", $(this).attr("action"));
    });
    $(this).find("BODY [formaction]:not([title])").each(function () {
        $(this).attr("title", $(this).attr("formaction"));
    });
})

//#endregion

//#region Log request handler

sircl.addRequestHandler("beforeSend", function (req) {
    console.log("Sircl-Debugging: beforeSend");
    setTimeout(function (thisArg, req) { thisArg.next(req); }, 200, this, req);
});

sircl.addRequestHandler("afterSend", function (req) {
    console.log("Sircl-Debugging: afterSend");
    setTimeout(function (thisArg, req) { thisArg.next(req); }, 200, this, req);
});

sircl.addRequestHandler("beforeRender", function (req) {
    console.log("Sircl-Debugging: beforeRender");
    this.next(req);
});

sircl.addRequestHandler("afterRender", function (req) {
    console.log("Sircl-Debugging: afterRender");
    this.next(req);
});

sircl.addRequestHandler("onError", function (req) {
    console.log("Sircl-Debugging: onError");
    this.next(req);
});

// AfterLoad handler to register context menu event handlers:
$$(function () {
    console.log("Sircl-Debugging: afterLoad");
    var initialBorder = "";
    try { initialBorder = $(this).css("border"); } catch (ex) { };
    $(this).css("border", "solid 1px blue");
    window.setTimeout(function ($this, initialBorder) { $this.css("border", initialBorder); }, 500, $(this), initialBorder);
});

//#endregion
