/////////////////////////////////////////////////////////////////
// Sircl 2.0 - Bootstrap4 extension
// www.getsircl.com
// Copyright (c) 2019-2021 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The file 'sircl-bootstrap4' component should be registered after the 'sircl' component. Please review order of script files.");
if (typeof bootstrap === "undefined") console.warn("The file 'sircl-bootstrap4' component requires the 'bootstrap' component. See https://getbootstrap.com/");

//// Initialize Bootstrap popovers, tooltips, etc. using a $$() function as in:
//<script>
//$$(function () {
//   $(this).find("[data-bs-toggle='popover']").popover({ container: "body" });
//   $(this).find("[data-toggle='tooltip']").tooltip({ boundary: "window" });
//})
//</script>

// Use a Bootstrap spinner:
sircl.html_spinner = '<span class="sircl-spinner spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ';

//#region Hide or dispose elements before unloading their container

$$("before", function () {
    // Hide all popovers in scope:
    $(this).find("[data-bs-toggle='popover'], [data-toggle='popover']").popover("dispose");

    // Hide all tooltips in scope:
    $(this).find("[data-bs-toggle='tooltip'], [data-toggle='tooltip']").tooltip("dispose");
});

//#endregion

//#region Handling Bootstrap NavBars

sircl.addRequestHandler("beforeSend", function (req) {
    var processor = this;
    // Collapse any expanded navbar before loading:
    var $expandedNavbar = $(".navbar-collapse.show");
    $expandedNavbar.each(function () {
        $(this).removeClass("show");
    });
    // Move to next handler:
    processor.next(req);
});

//#endregion

//#region Handling Bootstrap Modals

sircl.addRequestHandler("beforeSend", function (req) {
    var processor = this;
    // Close any opened modal that is not the target if target has onload-showmodal class and is not open:
    var $openedTarget = req.$initialTarget.closest(".modal:not(.onload-showmodal):not(.show)");
    var $openModals = $(".modal.show");
    if (req.isForeground == true && $openModals.length > 0 && $openedTarget.length == 0) {
        if (!$.contains($openModals[0], req.$initialTarget[0]) && !$openModals.is(req.$initialTarget)) {
            // Delay move to next handler:
            $openModals[0]._onCloseOnce = function (e) {
                processor.next(req);
            };
            // Close modal:
            $openModals.modal("hide");
        } else {
            // Move to next handler:
            processor.next(req);
        }
    } else {
        // Move to next handler:
        processor.next(req);
    }
});

sircl.addRequestHandler("beforeSend", function (req) {
    var processor = this;
    // Open any non-open modal holding the initial target and having class "onload-showmodal":
    req._bsModalOpened = req.$initialTarget.closest(".modal.onload-showmodal:not(.show)");
    if (req._bsModalOpened.length > 0) {
        // Delay move to next handler:
        req._bsModalOpened[0]._onOpenOnce = function (e) {
            processor.next(req);
        };
        // Open modal:
        req._bsModalOpened.modal("show");
    } else {
        // Move to next handler:
        processor.next(req);
    }
});

sircl.addRequestHandler("afterSend", function (req) {
    var processor = this;
    // On error, undo opened modals:
    if (!req.succeeded && req._bsModalOpened.length > 0) {
        // Delay move to next handler:
        req._bsModalOpened[0]._onCloseOnce = function (e) {
            processor.next(req);
        };
        // Close modal:
        req._bsModalOpened.modal("hide");
    } else if (req.xhr.status == "204") {
        // Else, if status "204" (no content), close target modal:
        var $dlg = req.$initialTarget.closest(".modal.show");
        if ($dlg.length > 0) {
            // Delay move to next handler:
            $dlg[0]._onCloseOnce = function (e) {
                processor.next(req);
            };
            // Close modal:
            $dlg.modal("hide");
        } else {
            // Move to next handler:
            processor.next(req);
        }
    } else {
        // Move to next handler:
        processor.next(req);
    }
});

sircl.addRequestHandler("beforeRender", function (req) {
    var processor = this;
    // Close any opened modal that is not the target:
    var $openModals = $(".modal.show");
    if (req.isForeground == true && $openModals.length > 0) {
        if (!$.contains($openModals[0], req.$finalTarget[0]) && !$openModals.is(req.$initialTarget)) {
            // Delay move to next handler:
            $openModals[0]._onCloseOnce = function (e) {
                processor.next(req);
            };
            // Close modal:
            $openModals.modal("hide");
        } else {
            // Move to next handler:
            processor.next(req);
        }
    } else {
        // Move to next handler:
        processor.next(req);
    }
});
sircl.addRequestHandler("afterRender", function (req) {
    var processor = this;
    // Open modal on final target:
    var $modal = req.$finalTarget.closest(".modal:not(.show)");
    if ($modal.length > 0) {
        // Delay move to next handler:
        $modal[0]._onOpenOnce = function (e) {
            processor.next(req);
        };
        // Open modal:
        $modal.modal("show");
    } else {
        // Move to next handler:
        processor.next(req);
    }
});

$(function () {
    // Perform onOpen action once:
    $(document).on("shown.bs.modal", ".modal", function (event) {
        if (this._onOpenOnce) {
            var fx = this._onOpenOnce;
            this._onOpenOnce = undefined;
            fx();
        }
    });

    // Perform onClose action once:
    $(document).on("hidden.bs.modal", ".modal", function (event) {
        if (this._onCloseOnce) {
            var fx = this._onCloseOnce;
            this._onCloseOnce = undefined;
            fx();
        }
    });

    // When opening modal, set focus:
    $(document).on("shown.bs.modal", ".modal", function (event) {
        $(this).find("*[autofocus]:first").each(function (index) {
            try { this.focus(); } catch (x) { }
            try { this.select(); } catch (x) { }
        });
    });

    // Reset content of a modal with onclose-restore when closing the modal:
    $(document).on("hidden.bs.modal", ".modal.onclose-restore", function (event) {
        var originalContent = $(this)[0]._originalContent;
        if (originalContent !== undefined) $(this).html(originalContent);
    });

    // Dynamically load content on showing modal:
    $(document).on("show.bs.modal", ".modal", function (event) {
        var $container = $(this).find("[onshowmodal-load]");
        if ($container.length > 0) {
            $container.load($container.attr("onshowmodal-load"));
        }
    });
});

$$(function () {
    // Backup original content of onclose-restore modals to be able to reset on close:
    $(this).find(".modal.onclose-restore").each(function (index, elem) {
        elem._originalContent = $(elem).html();
    });

    // Auto-show modals:
    var automodalmain = false;
    var $scope = $(this);
    $(this).find(".modal.auto-show").each(function () {
        if ($(this).attr("auto-show-delay") !== undefined) {
            // Parse delay ("seconds" or "[hh:]mm:ss"):
            var delaypart = $(this).attr("auto-show-delay").split(":");
            var delay = 0;
            for (var i = 0; i < delaypart.length; i++) delay = parseFloat(delaypart[i]) + (60 * delay);
            // Set timer:
            setTimeout(function ($scope) {
                var $modal = $scope.find(".modal.auto-show[auto-show-delay]");
                if ($modal.length > 0) {
                    // Only show if no other modals shown yet, or if class force-show is set:
                    if ($(".modal.show").length == 0 || $modal.hasClass("force-show")) {
                        $modal.modal("show");
                    }
                }
            }, 1000 * delay, $scope);
        } else if (automodalmain == false) {
            $(this).modal("show");
            automodalmain = true;
        } else {
            sircl.handleError("SBS01", "Multiple auto-show bootstrap modals found. Only the first is shown.");
        }
    });

});

//#endregion

//#region Handling Bootstrap Tab & Pill navs

$(function () {
    // Dynamically load content on showing tab:
    $(document).on("show.bs.tab", ".tab-pane[onshowtab-load]", function (event) {
        $(this).load($(this).attr("onshow-load"));
    });
});

//#endregion

//#region Handling Bootstrap Toasts

$$(function () {
    // Automatically show toasts with .oninit-showtoast on init:
    $(this).find(".toast.oninit-showtoast").toast("show");
});

//#endregion

//#region Bootstrap load progress handling

sircl.addRequestHandler("beforeSend", function (req) {
    req._bsProgressToResetAfterSend = []
    req._bsProgressToHideAfterSend = []
    // Show and add event handler to upload progresses:
    var $uploadProgresses = sircl.ext.$select(req.$initialTarget, req.$initialTarget.attr("upload-progress")).filter(".progress");
    if ($uploadProgresses.length > 0) {
        $uploadProgresses.each(function () {
            // Set initial value:
            $(this).find(".progress-bar").css("width", "0%");
            req._bsProgressToResetAfterSend.push(this);
            // Make hidden progresses visible:
            if (!sircl.ext.visible(this)) {
                req._bsProgressToHideAfterSend.push(this);
                sircl.ext.visible(this, true);
            }
        });
        // Add event handler to show upload progress:
        req.xhr.upload.addEventListener("progress", function (e) {
            if (e.lengthComputable) {
                $uploadProgresses.each(function () {
                    $(this).find(".progress-bar").css("width", Math.ceil(100 * e.loaded / e.total) + "%");
                });
            }
        });
    }
    // Show and add event handler to download progresses:
    var $downloadProgresses = sircl.ext.$select(req.$initialTarget, req.$initialTarget.attr("download-progress")).filter(".progress");
    if ($downloadProgresses.length > 0) {
        $downloadProgresses.each(function () {
            // Set initial value:
            $(this).find(".progress-bar").css("width", "0%");
            req._bsProgressToResetAfterSend.push(this);
            // Make hidden progresses visible:
            if (!sircl.ext.visible(this)) {
                req._bsProgressToHideAfterSend.push(this);
                sircl.ext.visible(this, true);
            }
        });
        // Add event handler to show download progress:
        req.xhr.addEventListener("progress", function (e) {
            if (e.lengthComputable) {
                $downloadProgresses.each(function () {
                    $(this).find(".progress-bar").css("width", Math.ceil(100 * e.loaded / e.total) + "%");
                });
            }
        });
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function (req) {
    // Hide progresses that were hidden before send:
    req._bsProgressToHideAfterSend.forEach(function (elem) {
        sircl.ext.visible(elem, false);
    });
    // Reset progresses to 0:
    req._bsProgressToResetAfterSend.forEach(function (elem) {
        $(elem).find(".progress-bar").css("width", "0%");
    });
    // Move to next handler:
    this.next(req);
});

//#endregion

//#region Hash routed tabs and pills

// Write hash value in location.href for hash-routed elements:
$(function () {
    $(document).on("click", ".hash-routed A[href^=\\#]:not([download])", function (event) {
        var hash = this.getAttribute("href");
        var url = window.location.href.replace(/(#.*|$)/i, hash); // Add or update the hash:
        var state = window.history.state;
        if (state != null) { state.url = url }
        if ($(this).closest(".hash-routed").is("[history=push]")) {
            window.history.pushState(state, document.title, url);
        } else {
            window.history.replaceState(state, document.title, url);
        }
    });
});

// If location contains hash, activate matching tab:
sircl.addAfterHistoryHandler(function () {
    if (location.hash != null && location.hash.length > 0) {
        var $target = $(document).find(".hash-routed A[href=\\" + location.hash + "]:not([download])");
        if ($target.length > 0) {
            $("A[href=\\" + $target.attr("href") + "]").tab("show");
        }
    }
});

//#endregion

//#region ifroute-setactive

sircl.addAfterHistoryHandler(function () {
    $(document).find("[ifroute-setactive]").each(function () {
        var regex = new RegExp($(this).attr("ifroute-setactive"), "i");
        if (regex.exec(location.pathname) !== null) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
});

//#endregion