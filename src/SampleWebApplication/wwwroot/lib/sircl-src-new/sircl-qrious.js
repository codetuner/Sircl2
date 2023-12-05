/////////////////////////////////////////////////////////////////
// Sircl 2.x - Qrious extension
// www.getsircl.com
// Copyright (c) 2023 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

/* tslint:disabled */

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-qrious' component should be registered after the 'sircl' component. Please review order of script files.");
if (typeof QRious === "undefined") console.warn("The 'sircl-qrious' component requires the 'qrious.js' component. See https://cdnjs.com/libraries/qrious");

$$(function () {
    $(this).find("CANVAS[qr-code]").each(function drawQrCodes() {
        var element = this;
        var size = Math.min(element.width, element.height);
        console.log(location.href);
        new QRious({
            element: element,
            size: size,
            padding: 0,
            value: element.getAttribute("qr-code") || location.href
        });
    });
});
