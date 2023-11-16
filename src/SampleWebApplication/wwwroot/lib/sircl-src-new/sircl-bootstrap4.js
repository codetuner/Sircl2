/////////////////////////////////////////////////////////////////
// Sircl 2.x - Bootstrap4 extension
// www.getsircl.com
// Copyright (c) 2019-2023 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-bootstrap4' component should be registered after the 'sircl' component. Please review order of script files.");
if (typeof bootstrap === "undefined") console.warn("The 'sircl-bootstrap4' component requires the 'bootstrap' component. See https://getbootstrap.com/");

//// Initialize Bootstrap popovers, tooltips, etc. using a $$() function as in:
//<script>
//$$(function () {
//   $(this).find("[data-toggle='popover']").popover({ container: "body" });
//   $(this).find("[data-toggle='tooltip']").tooltip({ boundary: "window" });
//})
//</script>

// Use a Bootstrap spinner:
sircl.html_spinner = '<span class="sircl-spinner spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ';

//#region Hide or dispose elements before unloading their container

$$("before", function sircl_bs4_init_beforeHandler () {
    try {
        // Hide all popovers in scope:
        $(this).find("[data-bs-toggle='popover'], [data-toggle='popover']").popover("dispose");

        // Hide all tooltips in scope:
        $(this).find("[data-bs-toggle='tooltip'], [data-toggle='tooltip']").tooltip("dispose");
    } catch (ex) {
        console.warn("Error trying to dispose Bootstrap 4 popovers and tooltips in scope.", ex, "sircl_bs4_init_beforeHandler");
    }
});

//#endregion

//#region Handling Bootstrap NavBars

sircl.addRequestHandler("beforeSend", function sircl_bs4_navbar_beforeSend_requestHandler (req) {
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

sircl.addRequestHandler("beforeSend", function sircl_bs4_modal_beforeSend_requestHandler1 (req) {
    var processor = this;
    // Close any opened modal that is not the target if target has beforeload-showmodal class and is not open:
    var $closedTarget = req.$initialTarget.closest(".modal.beforeload-showmodal:not(.show)");
    var $openModals = $(".modal.show");
    if (req.isForeground == true && $openModals.length > 0 && $closedTarget.length > 0) {
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

sircl.addRequestHandler("beforeSend", function sircl_bs4_modal_beforeSend_requestHandler2 (req) {
    var processor = this;
    // Open any non-open modal holding the initial target and having class "beforeload-showmodal":
    req._bsModalOpened = req.$initialTarget.closest(".modal.beforeload-showmodal:not(.show)");
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

sircl.addRequestHandler("afterSend", function sircl_bs4_modal_afterSend_requestHandler (req) {
    var processor = this;
    // On error, undo opened modals:
    if (!req.succeeded && req._bsModalOpened.length > 0) {
        // Delay move to next handler:
        req._bsModalOpened[0]._onCloseOnce = function (e) {
            processor.next(req);
        };
        // Close modal:
        req._bsModalOpened.modal("hide");
    } else if (req.status == "204") {
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

sircl.addRequestHandler("beforeRender", function sircl_bs4_modal_beforeRender_requestHandler (req) {
    var processor = this;
    // Close any opened modal that is not the target:
    var $openModals = $(".modal.show");
    if (req.isForeground == true && $openModals.length > 0) {
        if (!$.contains($openModals[0], req.$finalTarget[0]) && !$openModals.is(req.$finalTarget)) {
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
sircl.addRequestHandler("afterRender", function sircl_bs4_modal_afterRender_requestHandler (req) {
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

document.addEventListener("DOMContentLoaded", function () {
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
    $(document).on("shown.bs.modal", ".modal", function (event) {
        var $container = $(this).find("[onshowmodal-load]");
        if ($container.length > 0) {
            $container.load($container.attr("onshowmodal-load"));
            if ($container.is(".noreload")) $container.removeAttr("onshowmodal-load");
        }
    });
});

$$(function sircl_bs4_modal_processHandler () {
    // Backup original content of onclose-restore modals to be able to reset on close:
    $(this).find(".modal.onclose-restore").each(function (index, elem) {
        elem._originalContent = $(elem).html();
    });

    // Automatically show modals after load:
    var $modals = $(this).find(".modal[onload-showmodalafter]");
    if ($modals.length > 0) {
        var modal = $modals[0];
        // Parse delay ("seconds" or "[hh:]mm:ss"):
        var delaypart = $(modal).attr("onload-showmodalafter").split(":");
        var delay = 0;
        for (var i = 0; i < delaypart.length; i++) delay = parseFloat(delaypart[i]) + (60 * delay);
        // Set timer:
        setTimeout(function (mdl) {
            // Only show if no other modals shown yet:
            if ($(".modal.show").length == 0) {
                $(mdl).modal("show");
            }
        }, 1000 * delay, modal);
    }

});

//#endregion

//#region Handling Bootstrap Tab & Pill navs

document.addEventListener("DOMContentLoaded", function () {
    // Dynamically load content on showing tab:
    $(document).on("show.bs.tab", "[data-toggle='tab'], [data-toggle='pill']", function (event) {
        // Find target tab:
        var trigger = event.target;
        var target$;
        if (trigger.hasAttribute("data-target")) {
            target$ = trigger.getAttribute("data-target");
        } else if (trigger.hasAttribute("href")) {
            target$ = trigger.getAttribute("href");
        } else {
            return;
        }

        // If target tab has ifactivetab-load attribute, apply it:
        if ($(target$).hasAttr("ifactivetab-load")) {
            $(target$).load($(target$).attr("ifactivetab-load"));
            $(target$).removeAttr("ifactivetab-load");
        }
    });
});

$$(function sircl_bs4_tabs_processHandler () {
    // Dynamically load content on initially shown tab:
    $(".nav-link.active[data-toggle='tab'], .nav-link.active[data-toggle='pill']").each(function () {
        // Find target tab:
        var trigger = this;
        var target$;
        if (trigger.hasAttribute("data-target")) {
            target$ = trigger.getAttribute("data-target");
        } else if (trigger.hasAttribute("href")) {
            target$ = trigger.getAttribute("href");
        } else {
            return;
        }

        // If target tab has ifactivetab-load attribute, apply it:
        if ($(target$).hasAttr("ifactivetab-load")) {
            $(target$).load($(target$).attr("ifactivetab-load"));
            $(target$).removeAttr("ifactivetab-load");
        }
    });
});

//#endregion

//#region Handling Bootstrap Toasts

$$(function sircl_bs4_toasts_processHandler () {
    // Automatically show toasts with .onload-showtoast on init:
    $(this).find(".toast.onload-showtoast").toast("show");
});

//#endregion

//#region Handling Bootstrap Collapse

document.addEventListener("DOMContentLoaded", function () {

    // On check checkbox, expand, else collapse:
    $(document.body).on("change", "INPUT[type=checkbox][ifchecked-expand]", function (event) {
        var $this = $(this);
        var $target = sircl.ext.$select($this, $this.attr("ifchecked-expand"));
        if ($target.hasClass("collapse")) {
            if ($this.prop('checked')) {
                $target.collapse('show');
            } else {
                $target.collapse('hide');
            }
        }
    });

    // On check radio, expand, else collapse for all radios with same name in same form:
    $(document.body).on("change", "INPUT[type=radio][ifchecked-expand]", function (event) {
        var $this = $(this);
        var $all;
        if ($this.attr("name").length > 0) {
            $all = $this.closest("FORM").length > 0
                ? $this.closest("FORM").find("INPUT[type=radio][ifchecked-expand][name='" + $this.attr("name") + "']")
                : $("INPUT[type=radio][ifchecked-expand][name='" + $this.attr("name") + "']");
        } else {
            $all = $this;
        }
        $all.each(function () {
            var $target = sircl.ext.$select($(this), $(this).attr("ifchecked-expand"));
            if ($target.hasClass("collapse")) {
                if ($(this).prop('checked')) {
                    $target.collapse('show');
                } else {
                    $target.collapse('hide');
                }
            }
        });
    });

    // On expand, set state:
    $(document.body).on("show.bs.collapse", ".collapse[onexpand-set]", function (event) {
        var $this = $(this);
        var name = $(this).attr("onexpand-set");
        var $input;
        if (name == null || name.length == 0) {
            return;
        } else if ($this.closest("FORM").length > 0) {
            $input = $this.closest("FORM").find("INPUT[name='" + name + "']");
        } else {
            $input = $("INPUT[name='" + name + "']");
        }
        if (["true", "on"].indexOf($input.val().toLowerCase()) < 0) {
            $input.val("true");
            $input.change();
        }
    });

    // On collapse, set state:
    $(document.body).on("hide.bs.collapse", ".collapse[onexpand-set]", function (event) {
        var $this = $(this);
        var name = $(this).attr("onexpand-set");
        var $input;
        if (name == null || name.length == 0) {
            return;
        } else if ($this.closest("FORM").length > 0) {
            $input = $this.closest("FORM").find("INPUT[name='" + name + "']");
        } else {
            $input = $("INPUT[name='" + name + "']");
        }
        if (["false", "off"].indexOf($input.val().toLowerCase()) < 0) {
            $input.val("false");
            $input.change();
        }
    });

    // On expand, load content:
    $(document.body).on("show.bs.collapse", ".collapse[ifexpanded-load]", function (event) {
        var url = $(this).attr("ifexpanded-load");
        $(this).removeAttr("ifexpanded-load")
        $(this).load(url);
    });
});

$$(function sircl_bs4_collapse_processHandler () {

    // If checked, expand, else collapse:
    $("INPUT[type=checkbox][ifchecked-expand], INPUT[type=radio][ifchecked-expand]").each(function () {
        var $this = $(this);
        var $target = sircl.ext.$select($this, $this.attr("ifchecked-expand"));
        if ($target.hasClass("collapse")) {
            if ($this.prop('checked')) {
                $target.collapse('show');
            } else {
                $target.collapse('hide');
            }
        }
    });

    // Load content on initially expanded items:
    $(".collapse.show[ifexpanded-load]").each(function () {
        var url = $(this).attr("ifexpanded-load");
        $(this).removeAttr("ifexpanded-load")
        $(this).load(url);
    });
});

//#endregion

//#region Bootstrap load progress handling

sircl.addRequestHandler("beforeSend", function sircl_bs4_loadprogess_beforeSend_requestHandler (req) {
    req._bsProgressToResetAfterSend = []
    req._bsProgressToHideAfterSend = []
    if (req.xhr != null) {
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
    }
    // Move to next handler:
    this.next(req);
});

sircl.addRequestHandler("afterSend", function sircl_bs4_loadprogess_afterSend_requestHandler (req) {
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

document.addEventListener("DOMContentLoaded", function () {

    // Write hash value in location.href for hash-routed elements:
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

    // Support links to tabs when the page URL is the same:
    $(window).on("hashchange", function (event) {
        $(".hash-routed").find("[href='" + location.hash + "']").each(function () {
            event.preventDefault();
            $(this).click();
        });
    });

    // Set initial tab active on full page load:
    if (location.hash != null && location.hash.length > 0) {
        var $target = $(document).find(".hash-routed A[href=\\" + location.hash + "]:not([download])");
        if ($target.length > 0) {
            $("A[href=\\" + $target.attr("href") + "]").tab("show");
        }
    }
});

// If location contains hash, activate matching tab:
sircl.addAfterHistoryHandler(function sircl_bs4_hashRoute_afterHistoryHandler () {
    if (location.hash != null && location.hash.length > 0) {
        var $target = $(document).find(".hash-routed A[href=\\" + location.hash + "]:not([download])");
        if ($target.length > 0) {
            document.addEventListener("DOMContentLoaded", function () {
                $("A[href=\\" + $target.attr("href") + "]").tab("show");
            });
        }
    }
});





//#endregion

//#region ifroute-setactive

sircl.addAfterHistoryHandler(function sircl_bs4_activeRoute_afterHistoryHandler () {
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