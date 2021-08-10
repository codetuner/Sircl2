/////////////////////////////////////////////////////////////////
// Sircl 2.0 - ContextMenu extension
// www.getsircl.com
// Copyright (c) 2019-2021 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-contextmenu' component should be registered after the 'sircl' component. Please review order of script files.");

//#region Handling contextmenus

// BeforeSend request handler to hide open contextmenus:
sircl.addRequestHandler("beforeSend", function (req) {
    // Hide contextmenus when starting load:
    $(".contextmenu").css("display", "none");
    // Move to next handler:
    this.next(req);
});

// AfterLoad handler to register context menu event handlers:
$$(function () {
    // Add handler on parent of a .contextmenu element to show/hide context menu:
    $(this).find(".contextmenu").each(function () {
        var cm = $(this);
        var target = $($(this).attr("contextmenu-for"));
        if (target.length == 0) target = $(this).parent();
        target.on("contextmenu", function (event) {
            // Hides any currently visible context menu:
            var wasVisible = false;
            $(".contextmenu").each(function () {
                if ($(this).css("display") != "none") {
                    $(this).css("display", "none");
                    wasVisible = true;
                }
            });

            // If no context menu was currently visible, show current:
            if (!wasVisible) {
                cm
                    .css("top", (event.pageY - window.pageYOffset) + "px")
                    .css("left", (event.pageX - window.pageXOffset) + "px")
                    .css("position", "fixed")
                    .css("display", "block");
            }

            // Event is handled:
            event.stopPropagation();
            event.preventDefault();
        });
        target.on("click", function (event) {
            // On regular click, hide context menu:
            $(".contextmenu").each(function () {
                if ($(this).css("display") != "none") {
                    $(this).css("display", "none");
                }
            });
        });
    });
});

//#endregion