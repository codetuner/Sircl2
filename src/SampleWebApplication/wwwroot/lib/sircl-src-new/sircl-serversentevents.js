/////////////////////////////////////////////////////////////////
// Sircl 2.x - Server-SenT Events
// www.getsircl.com
// Copyright (c) 2024 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

/* tslint:disabled */

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-serversentevents' component should be registered after the 'sircl' component. Please review order of script files.");

//#region Server-Sent Events handling

document.addEventListener("DOMContentLoaded", function sircl_serverSentEvents () {

    $("[sse-url]").each(function () {

        // Read attributes:
        var sseUrl = this.getAttribute("sse-url");
        var sseDistinct = this.hasAttribute("sse-distinct");
        var sseWithCredentials = this.hasAttribute("sse-withcredentials");

        // Construct EventSource:
        var eventSource = new EventSource(sseUrl, { withCredentials: sseWithCredentials });
        var lastEventId = eventSource.lastEventId || "";

        // Listen for "content" events:
        var trigger = this;
        eventSource.addEventListener("content", function (event) {
            //console.log('SSE Sircl Content: { id: "' + event.lastEventId + '", type: "' + event.type + '", data: "' + event.data + '" }', event)

            // Check for duplicate messages:
            if (sseDistinct && event.lastEventId == lastEventId) return;
            lastEventId = event.lastEventId;

            // Process the event as a request:
            sircl.ext.processEventRequest($(trigger), event);
        });

        // Store reference to eventSource:
        this.eventSource = eventSource;
    });

});

//#endregion
