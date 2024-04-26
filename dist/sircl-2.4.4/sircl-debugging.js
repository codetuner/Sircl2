/////////////////////////////////////////////////////////////////
// Sircl 2.x - Debugging & Diagnostics extension
// www.getsircl.com
// Copyright (c) 2019-2023 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

/* tslint:disabled */

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-debugging' component should be registered after the 'sircl' component. Please review order of script files.");

//#region Add tooltip on hyperlinks and forms displaying the URL

$$("enrich", function sircl_debugging_enrichHandler () {
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
    console.log("Sircl-Debugging: req.beforeSend", req);
    setTimeout(function (thisArg, req) { thisArg.next(req); }, 200, this, req);
});

sircl.addRequestHandler("afterSend", function (req) {
    console.log("Sircl-Debugging: req.afterSend", req);
    setTimeout(function (thisArg, req) { thisArg.next(req); }, 200, this, req);
});

sircl.addRequestHandler("beforeRender", function (req) {
    console.log("Sircl-Debugging: req.beforeRender", req);
    this.next(req);
});

sircl.addRequestHandler("afterRender", function (req) {
    console.log("Sircl-Debugging: req.afterRender", req);
    this.next(req);
});

sircl.addRequestHandler("onError", function (req) {
    console.log("Sircl-Debugging: req.onError", req);
    this.next(req);
});

//#endregion

//#region Log Content Ready Handlers

$$("before", function sircl_debugging_beforeHandler() {
    console.log("Sircl-Debugging: load.before", this);
});

$$("content", function sircl_debugging_contentHandler() {
    console.log("Sircl-Debugging: load.content", this);
});

$$("enrich", function sircl_debugging_enrichHandler() {
    console.log("Sircl-Debugging: load.enrich", this);
});

// Process handler adds a temporary border to loaded parts:
$$(function sircl_debugging_processHandler() {
    console.log("Sircl-Debugging: load.process", this);
    var initialBorder = "";
    try { initialBorder = $(this).css("border"); } catch (ex) { };
    $(this).css("border", "solid 1px blue");
    window.setTimeout(function ($this, initialBorder) { $this.css("border", initialBorder); }, 500, $(this), initialBorder);
});

//#endregion

//#region Log errors

sircl.addErrorHandler(function (code, message, data) {
    console.log("Sircl-Debugging: error " + code + " - " + message, data);
});

//#endregion
