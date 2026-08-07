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

if (typeof (EventSource) !== "undefined") {

    $$("before", function () {

        $(this).find("[sse-url]").each(function () {
            this.eventSource.close();
        });

    });

    $$("process", function () {

        $(this).find("[sse-url]").each(function () {

            // Read attributes:
            var sseUrl = this.getAttribute("sse-url");
            var sseDistinctModeNode = $(this).closest("[sse-distinct]");
            var sseDistinctMode = (sseDistinctModeNode.length > 0) ? sseDistinctModeNode[0].getAttribute("sse-distinct") : null;
            var sseWithCredentials = $(this).closest("[sse-withcredentials]").length > 0;

            // Construct EventSource:
            var eventSource = new EventSource(sseUrl, { withCredentials: sseWithCredentials });

            // Listen for "content" events:
            if (this.hasAttribute("sse-dispatch")) {
                if (sseDistinctMode != null) this.__sse_lastEventId = eventSource.lastEventId || "";
                var eventName = this.getAttribute("sse-dispatch") || "content";
                var contentTrigger = this;
                eventSource.addEventListener(eventName, function (event) {

                    // Check for duplicate messages:
                    if (sseDistinctMode == "last" && event.lastEventId == contentTrigger.__sse_lastEventId) return;
                    if (sseDistinctMode == "sequential" && event.lastEventId <= contentTrigger.__sse_lastEventId) return;
                    contentTrigger.__sse_lastEventId = event.lastEventId;

                    // Process the event as a request:
                    sircl.ext.processDataEventRequest($(contentTrigger), event);
                });
            }

            // Listen for custom events based on the [sse-event] attribute:
            $(this).filter("[sse-event]").add($(this).find("[sse-event]")).each(function () {
                if (sseDistinctMode != null) this.__sse_lastEventId = eventSource.lastEventId || "";
                var eventNames = this.getAttribute("sse-event").split(" ");
                var eventTrigger = this;
                for (var i = 0; i < eventNames.length; i++) {
                    eventSource.addEventListener(eventNames[i], function (event) {

                        // Check for duplicate messages:
                        if (sseDistinctMode == "last" && event.lastEventId == eventTrigger.__sse_lastEventId) return;
                        if (sseDistinctMode == "sequential" && event.lastEventId <= eventTrigger.__sse_lastEventId) return;
                        eventTrigger.__sse_lastEventId = event.lastEventId;

                        // Process the given content as a request:
                        sircl.ext.processContentRequest($(eventTrigger), event, event.data, $(eventTrigger), eventTrigger.getAttribute("target-method") || "content");
                    });
                }
            });

            // Store reference to eventSource:
            this.eventSource = eventSource;
        });

    });

} else {
    console.warn("ServerSentEvents are not supported on this browser.");
}

//#endregion
