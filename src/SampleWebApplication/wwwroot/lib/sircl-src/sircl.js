/* Sircl 2.x core */
/* (c) Rudi Breedenraedt */

var __rb = {};

/// Polyfils
// Have IE support "endsWith()" function on strings:
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

/// JQuery extensions:
jQuery.fn.extend({
    closestAttr: function (attrName) {
        var cattr = this.closest("*[" + attrName + "]");
        if (cattr.length > 0) {
            return cattr.attr(attrName);
        } else {
            return undefined;
        }
    },
    getId: function () {
        var id = this.attr('id');
        if (id === undefined) {
            id = new Date().getTime();
            this.attr('id', inlineTargetId);
        }
        return id;
    },
    target: function () {
        // Return closest target (string "_self", "_blank" or whatever) or null if none:
        var cta = this.closest("*[target]");
        if (cta) {
            var t = cta.attr("target");
            return (t == "") ? "_self" : t;
        } else {
            return null;
        }
    },
    inlineTarget: function () {
        // Return closest inline-target jQuery element:
        var cita = this.closest("*[inline-target]");
        if (cita.length > 0) {
            var it = cita.attr("inline-target");
            return (it == "") ? [] : $(it);
        } else {
            return this.closest(".inline-target");
        }
    },
    originTarget: function () {
        // Return closest inline-target jQuery element:
        return this.closest(".inline-target");
        // The origin-target is the element that was the target when loading the this item.
    }
});

/// Override load:
__rb.load = $.fn.load;
$.fn.load = function (url, data, callback) {
    //if (typeof url !== "string") {
    //    return __rb.load.apply(this, [url, data, function (responseText, textStatus, jqXHR) {
    //        if (status != "error") { $(this).loaded(); }
    //        if (callback) callback(responseText, textStatus, jqXHR);
    //    }]);
    //} else {
    //    return __rb.load.apply(this, arguments);
    //}
    var t = this;
    $.ajax({
        url: url,
        cache: false,
        dataType: "html",
        data: data,
        success: function (responseText, textStatus, jqXHR) {
            $(t).html(responseText);
            $(t).loaded();
            if (callback) callback(responseText, textStatus, jqXHR);
        }
    });
};

__rb.get = function (event, origin, url, onSuccessDelegate, onFailureDelegate) {
    // Eval href:
    if (url === "" || url === "null") {
        event.preventDefault();
        event.stopPropagation();
        return;
    } else if (url === "history:back") {
        window.history.back();
        event.preventDefault();
        event.stopPropagation();
        return;
    } else if (url === "location:reload") {
        location.reload();
        event.preventDefault();
        event.stopPropagation();
        return;
    } else if (url.indexOf("alert:") == 0) {
        alert(url.substr(6));
        event.preventDefault();
        event.stopPropagation();
        return;
    } else {
        var jqorigin = $(origin);
        var elementName = origin.tagName;
        var target = jqorigin.target();
        var inlineTarget = jqorigin.inlineTarget()[0] || "";
        var inlineCached = (jqorigin.attr("inline-cached") || "false").toLowerCase() == "true";
        var hist = (jqorigin.attr("history") || "push").toLowerCase();
        if (target !== undefined || inlineTarget === "") {
            if (elementName == 'A') {
                return; // navigate link through default behavior
            } else if (target /* and element is not 'A' */) {
                window.open(url, target);
                event.preventDefault();
                return;
            } else {
                window.location = url;
                event.preventDefault();
                return;
            }
        } else { // Has inline target:
            // If target is in dialog and dialog is not shown:
            var tdlg = __rb.getDialog(inlineTarget);
            if (tdlg.length > 0 && !tdlg.is(".show")) {
                // If current trigger is in a(nother) modal, force-close it first:
                __rb.closeDialog(origin, true);
                // If in dialog, open it:
                __rb.openDialog(inlineTarget);
            }

            // Set origin-target:
            $(inlineTarget).addClass("inline-target");
            if ($(origin).originTarget().getId() !== $(inlineTarget).getId()) {
                $(inlineTarget).attr("origin-target", "#" + $(origin).originTarget().getId());
            }

            // Perform caching if requested:
            if (inlineCached) {
                // Hide context menus first:
                $(".contextmenu").css("display", "none");
                // Cache current state:
                window.history.replaceState({ inlineRestore: true, inlineTarget: '#' + $(inlineTarget).getId(), inlineHtml: $(inlineTarget).html() }, document.title, window.location.href);
            }

            // Set loading:
            $(document.body).addClass("load-in-progress");
            __rb.hide($(".load-in-progress-hide"), true);
            __rb.hide($(".load-in-progress-show"), false);

            // Perform request:
            $.ajax({
                url: url,
                cache: false,
                data: null,
                method: "GET",
                statusCode: {
                    200: function (data, textStatus, jqXHR) {
                        if (onSuccessDelegate) onSuccessDelegate(event, origin);
                        if (hist == "push") {
                            __rb.referrer = window.location.href.split("#")[0];
                            window.history.pushState(null, document.title, url);
                        } else if (hist == "set") {
                            __rb.referrer = window.location.href.split("#")[0];
                            window.history.replaceState(null, document.title, url);
                        }
                        if (data.indexOf("#FULL_PAGE#") > -1) {
                            document.open();
                            document.write(data);
                            document.close();
                        } else {
                            $(inlineTarget).html(data);
                            $(inlineTarget).find("*[inline-target=local]").each(function () { $(this).attr('inline-target', "#" + $(inlineTarget).getId()); });
                            $(inlineTarget).loaded();
                        }
                    },
                    202: function (data, textStatus, jqXHR) {  // Accepted : just an acknowledgment, no action
                        if (onSuccessDelegate) onSuccessDelegate(event, triggerElement);
                        // Check for a 'Location' header to perform a redirect:
                        var redirectLocation = jqXHR.getResponseHeader('Location');
                        if (redirectLocation) window.location = redirectLocation;
                    },
                    204: function (data, textStatus, jqXHR) { // No Content : clears the content, close dialog if in one.
                        if (onSuccessDelegate) onSuccessDelegate(event, triggerElement);
                        $(inlineTarget).html("");
                        // If in dialog, close it:
                        __rb.closeDialog(inlineTarget);
                        // Check for a 'Location' header to perform a redirect:
                        var redirectLocation = jqXHR.getResponseHeader('Location');
                        if (redirectLocation) window.location = redirectLocation;
                    },
                    205: function (data, textStatus, jqXHR) {
                    },
                    complete: function (jqXHR, textStatus) {
                        $(document.body).removeClass("load-in-progress");
                        __rb.hide($(".load-in-progress-hide"), false);
                        __rb.hide($(".load-in-progress-show"), true);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (onFailureDelegate) {
                            onFailureDelegate(event, origin, jqXHR, textStatus, errorThrown);
                        } else {
                            alert(error);
                        }
                    }
                }
            });
        }
    }
};


/// Globals:
__rb.html_spinner = '<i class="fas fa-circle-notch fa-spin"></i> ';
__rb.hideByClass = function (item, hide) { if (hide) item.addClass("hidden"); else item.removeClass("hidden"); }; // Using hidden class
__rb.hideByJquery = function (item, hide) { if (hide) item.hide(0); else item.show(0); }; // Using jquery hide/show method (number parameter is animation duration)
__rb.hideByAttribute = function (item, hide) { if (hide) item.attr("hidden", true); else item.attr("hidden", false); }; // Using HTML 5 hidden attribute
__rb.hide = __rb.hideByClass;
__rb.getDialog = function (item) { return $(item).closest('.modal'); };
__rb.closeDialog = function (item, forced) {
    var dlg = __rb.getDialog(item);
    if (dlg.length) {
        if (forced) {
            dlg.removeClass("show");
            $("body").removeClass("modal-open");
            $(".modal-backdrop").remove();
        } else {
            dlg.modal('hide');
        }
    }
};
__rb.openDialog = function (item) { var dlg = __rb.getDialog(item); if (dlg.length) dlg.modal('show'); };
__rb.referrer = document.referrer;
__rb.submitInline = function (event, triggerElement, formOrData, method, href, target, inlineTarget, inlineCached, hist, onSuccessDelegate, onErrorDelegate) {
    if (inlineTarget) {
        if (inlineCached) {
            // Hide context menus first:
            $(".contextmenu").css("display", "none");
            // Cache current state:
            window.history.replaceState({ inlineRestore: true, inlineTarget: '#' + $(inlineTarget).getId(), inlineHtml: $(inlineTarget).html() }, document.title, window.location.href);
        }
        if (event != null && event.target.dataset.dismiss == "modal") {
            // Fix modal backdrop staying when closing modal inside inline target:
            // https://stackoverflow.com/a/11544860
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
        }
        var data = (formOrData == null) ? "" : (formOrData.serialize) ? formOrData.serialize() : jQuery.param(formOrData); // Or use "var data = new FormData(form[0]);", but then we cannot work with only data.
        if (method == "GET") href = (href.indexOf('?') >= 0) ? href + '&' + data : href + '?' + data;
        $(document.body).addClass("load-in-progress");
        __rb.hide($(".load-in-progress-hide"), true);
        __rb.hide($(".load-in-progress-show"), false);
        $.ajax({
            url: href,
            cache: false,
            data: (method == "GET") ? null : data,
            method: method,
            statusCode: {
                200: function (data, textStatus, jqXHR) { // OK : new content is to be rendered, if in dialog, open it
                    if (onSuccessDelegate) onSuccessDelegate(event, triggerElement);
                    if (hist == "push") {
                        __rb.referrer = window.location.href.split("#")[0];
                        window.history.pushState(null, document.title, href);
                    } else if (hist == "set") {
                        __rb.referrer = window.location.href.split("#")[0];
                        window.history.replaceState(null, document.title, href);
                    }
                    if (data.indexOf("#FULL_PAGE#") > -1) {
                        document.open();
                        document.write(data);
                        document.close();
                    } else {
                        $(inlineTarget).html(data);
                        $(inlineTarget).find("*[inline-target=local]").each(function () { $(this).attr('inline-target', "#" + $(inlineTarget).getId()); });
                        //$(inlineTarget).find("FORM:not([inline-target])").each(function () { $(this).attr('inline-target', "#" + inlineTargetId); });
                        $(inlineTarget).loaded();
                        // If in dialog, open it:
                        __rb.openDialog(inlineTarget);
                    }
                },
                202: function (data, textStatus, jqXHR) { // Accepted : just an acknowledgment, no action
                    if (onSuccessDelegate) onSuccessDelegate(event, triggerElement);
                    // Check for a 'Location' header to perform a redirect:
                    var redirectLocation = jqXHR.getResponseHeader('Location');
                    if (redirectLocation) {
                        //window.location = redirectLocation;
                        $(inlineTarget).load(redirectLocation, null, function () {
                            __rb.referrer = redirectLocation.split("#")[0];
                            window.history.pushState(null, document.title, redirectLocation);
                        });
                    }
                },
                204: function (data, textStatus, jqXHR) { // No Content : clears the content, close dialog if in one.
                    if (onSuccessDelegate) onSuccessDelegate(event, triggerElement);
                    $(inlineTarget).html("");
                    // If in dialog, close it:
                    __rb.closeDialog(inlineTarget);
                    // Check for a 'Location' header to perform a redirect:
                    var redirectLocation = jqXHR.getResponseHeader('Location');
                    if (redirectLocation) window.location = redirectLocation;
                },
                205: function (data, textStatus, jqXHR) { // Reset Content : issue a page refresh
                    if (onSuccessDelegate) onSuccessDelegate(event, triggerElement);
                    var location = jqXHR.getResponseHeader("Location") || (window.location.href.split("#")[0]);
                    window.history.replaceState(null, document.title, location);
                    window.location.href = location;
                },
                //default: function (data, textStatus, jqXHR) {
                //}
            },
            complete: function (jqXHR, textStatus) {
                $(document.body).removeClass("load-in-progress");
                __rb.hide($(".load-in-progress-hide"), false);
                __rb.hide($(".load-in-progress-show"), true);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $(document.body).removeClass("load-in-progress");
                __rb.hide($(".load-in-progress-hide"), false);
                __rb.hide($(".load-in-progress-show"), true);
                if (onErrorDelegate) {
                    onErrorDelegate(event, triggerElement);
                } else {
                    if (jqXHR.responseText == undefined) {
                        alert(jqXHR.statusText);
                    } else if (jqXHR.responseText.indexOf("#FULL_PAGE#") > -1) {
                        document.open();
                        document.write(jqXHR.responseText);
                        document.close();
                    } else {
                        $(inlineTarget).html("<div>" + jqXHR.responseText + "</div>");
                        // If in dialog, open it:
                        __rb.openDialog(inlineTarget);
                    }
                    // Throw error:
                    throw ("Error " + jqXHR.status + " - " + jqXHR.statusText);
                }
            },
        });
        event.preventDefault();
    } else if (form != null) {
        form.submit();
    } else if (target) {
        window.open(href, target);
        event.preventDefault();
        return;
    } else {
        window.location = href;
        event.preventDefault();
        return;
    };
};
__rb.markFormChanged = function (form) {
    if (form == null) return;
    var inputname = form.attr("onchange-set");
    var target = form.find("INPUT[name='" + inputname + "']");
    // Perform action:
    if (target.length > 0) {
        $(target).each(function (index, item) {
            if ($(item).attr('type') == 'checkbox') {
                $(item).prop("checked", true);
            } else {
                $(item).val("true");
            }
        });
    }
    form.addClass("form-changed");
};

/// Document Ready handler:
$(document).ready(function () {

    /// Buttons and link can have a confirmation dialog;
    /// <a href="http://www.example.com" confirm-message="Are you sure ?">...</a>
    $(document.body).children().on("click", "*[confirm-message]", function (event) {
        var confirmMessage = $(this).attr("confirm-message");
        if (confirmMessage) {
            if (!confirm(confirmMessage)) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    });

    /// On click link:
    $(document.body).on("click", "*[href]", function (event) {
        var elementName = $(this)[0].tagName;
        var href = $(this).attr("href");
        if (href == "null" || href == "") {
            event.preventDefault();
            event.stopPropagation();
            return;
        } else if (href == "history:back") {
            window.history.back();
            event.preventDefault();
            event.stopPropagation();
            return;
        } else if (href == "location:reload") {
            location.reload();
            event.preventDefault();
            event.stopPropagation();
            return;
        } else if (href.indexOf("alert:") == 0) {
            alert(href.substr(6));
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        var target = $(this).target();
        var inlineTarget = $(this).inlineTarget()[0];
        var inlineCached = ($(this).attr("inline-cached") || "false").toLowerCase() == "true";
        var hist = ($(this).attr("history") || "push").toLowerCase();

        if (inlineTarget) {
            // If in dialog, open it:
            __rb.openDialog(inlineTarget);
            // Submit inline:
            __rb.submitInline(event, $(this), null, "GET", href, target, inlineTarget, inlineCached, hist);
            return;
        }
        if (hist == "set") window.history.replaceState(null, document.title, href);
        if (elementName == 'A') {
            return; // navigate link through default behavior
        } else if (target /* and element is not 'A' */) {
            window.open(href, target);
            event.preventDefault();
            return;
        } else {
            window.location = href;
            event.preventDefault();
            return;
        }
    });

    $(document.body).on("click", "FORM BUTTON:submit", function (event) {
        var form = $(this).closest('form');
        var method = (form.attr("method") || "GET").toUpperCase();
        var href = $(this).attr("formaction") || form.attr("action") || "";
        var target = $(this).target();
        var inlineTarget = $(this).inlineTarget()[0];
        var hist = ($(this).attr("history") || "default").toLowerCase();
        if (inlineTarget) {
            // Mark form changed:
            __rb.markFormChanged(form);
            // Submit inline:
            __rb.submitInline(event, $(this), form, method, href, target, inlineTarget, false, hist);
        }
    });

    /// On submit form:
    $(document.body).on("submit", "FORM", function (event) {
        var form = $(this).closest('form');
        var method = (form.attr("method") || "GET").toUpperCase();
        var href = form.attr("action") || "";
        var target = $(this).target();
        var inlineTarget = $(this).inlineTarget()[0];
        var inlineCached = ($(this).attr("inline-cached") || "false").toLowerCase() == "true";
        var hist = ($(this).attr("history") || "push").toLowerCase();
        if (inlineTarget) {
            // Submit inline:
            __rb.submitInline(event, $(this), form, method, href, target, inlineTarget, inlineCached, hist);
            return;
        } else {
            if (hist == "set") window.history.replaceState(null, document.title, href);
            return; // submit form through default behavior
        }
    });

    /// On browser back:
    window.onpopstate = function (event) {
        // When going back after an inline target, an explicit reload is required:
        if (event.state != null && event.state.inlineRestore == true) {
            $(event.state.inlineTarget).html(event.state.inlineHtml);
            $(event.state.inlineTarget).loaded();
        }
        else if (event.state == null) {
            window.history.go();
        }
    };

    /// Show spinner in executing button:
    $(document.body).on("click", "BUTTON", function (event) {
        // If button is submit button, first check validators:
        if ($(this).is(":submit")) {
            var form = $(this).closest("FORM")[0];
            if (form) if (!form.checkValidity()) return;
        }
        // Render spinner:
        $(this).find(".spinner").replaceWith(__rb.html_spinner);
    });

    /// Fix for posting inline-target forms by submit button with custom formaction:
    $(document.body).on("click", "FORM[inline-target] BUTTON[type=submit][formaction]", function (event) {
        var form = $(this).closest("FORM");
        form.attr("action", $(this).attr("formaction"));
        form.submit();
        event.preventDefault();
    });

    /// Support for forwarding click events. I.e. a click on the div will be translated into
    /// a click on the link:
    ///
    ///   <div forward-click="#a1">Click me!</div>
    ///   <a id="a1" href="http://www.example.com/">...</a>
    ///
    $(document.body).on('click', "*[forward-click]", function (event) {
        var targetSelector = $(this).attr("forward-click");
        if (targetSelector != "off") $(targetSelector)[0].click(); // See: http://goo.gl/lGftqn
        event.preventDefault();
    });

    /// Disable ENTER key to submit forms. I.e. useful when multiple submit buttons and first
    /// one is not necessarily the default one.
    /// I.e:
    ///   <form default-submit-button="#save-button" method="post">...</form>
    $(document.body).on("keydown", "FORM[default-submit-button]", function (event) {
        if (event.keyCode == 13) {
            var target = $(this).find($(this).attr("default-submit-button"))[0];
            if (target != null) target.click(); // See: http://goo.gl/lGftqn
            event.preventDefault();
        }
        else if (event.keyCode == 27) {
            var target = $(this).find($(this).attr("default-cancel-button"))[0];
            if (target != null) target.click(); // See: http://goo.gl/lGftqn
            event.preventDefault();
        }
    });

    ///// Select all text when element gets focus:
    //$(document.body).on("focus", "INPUT[type=text] INPUT[type=number] INPUT[type=email]", function (event) {
    //    $(this)[0].select();
    //});

    $(window).on("beforeunload", function (event) {
        // Ensure load-in-progress-hide items are shown:
        __rb.hide($(".load-in-progress-show"), false);
        __rb.hide($(".load-in-progress-hide"), true);
    });

    /// Perform the loaded() function now the whole body is loaded:
    $(document.body).loaded();

});

/// Loaded extension to be executed on lazy loaded DOM objects:
/// Each loader extension element is an array with at [0] the function to call and at [1] optional data to provide.
var rbLoaderExtensions = [];

/// Provide a $$ function to register delay loader extensions:
function $$(callback, optionalData) {
    rbLoaderExtensions.push([callback, optionalData]);
};

jQuery.fn.extend({

    /// Defines a "loaded()" function to be called after dynamically loading HTML parts:
    loaded: function () {

        // **** KEEP AS FIRST ****
        // For any element having a 'moveto': moves the content HTML to the given selector.
        $(this).find("*[moveto]").each(function () {
            $($(this).attr("moveto")).html($(this).html());
            $($(this).attr("moveto")).loaded();
            $(this).html('');
        });

        //#region "Document transformation on loaded"

        /// Show/hide parts after load:
        $(this).find(".showafterload").removeClass("hidden");
        $(this).find(".hideafterload").addClass("hidden");

        // Ensure load-in-progress-hide items are hidden:
        __rb.hide($(".load-in-progress-show"), true);
        __rb.hide($(".load-in-progress-hide"), false);

        /// For any element having a 'autoload-url': load the given URL:
        /// Optionally, a 'autoload-refresh' indicates the time (in seconds) after which to continuously refresh the content.
        /// The url can contain a "{rnd}" literal that will then be replaced by a random number to force reloading.
        /// I.e: <div autoload-url="/Home/Index/?x={rnd}" autoload-refresh="10"></div>
        $(this).find('*[autoload-url]').each(function () {
            var url = $(this).attr("autoload-url") + '';
            var loadRefresh = $(this).attr("autoload-refresh");
            var target = $(this);
            target.load(url.replace('{rnd}', Math.random()), function () { $(this).loaded(); });
            if (loadRefresh) {
                window.setInterval(function () { target.load(url.replace('{rnd}', Math.random()), function () { $(this).loaded(); }); }, loadRefresh * 1000);
            }
        });

        /// Fix autofocus for lazy-loaded html:
        $(this).find("*[autofocus]:first").each(function (index) {
            var item = $(this)[0];
            item.focus();
            try { item.select(); } catch (x) { }
        });

        /// Selects having 'autoinit' attribute will automatically select the corresponding item if the select had an empty value.
        /// The value of the autoinit attribute is either:
        /// - "singleton" to select the only element with a non-empty value, if there is only one;
        /// - "first" to select the first non-empty value;
        /// - any other value, to select the item with that value.
        $(this).find('SELECT[autoinit]').each(function () {
            if ($(this).val() != '') return; // Select already has a value.
            var value = $(this).attr("autoinit") + '';
            var options = $('option', this);
            if (value.toLowerCase() == 'singleton') {
                var singleton = -1;
                for (var i = 0; i < options.length; i++) {
                    if (options[i].value != '' && singleton == -1) singleton = i;
                    else if (options[i].value != '') return;
                }
                if (singleton != -1) $(this).val(options[singleton].value);
            } else if (value.toLowerCase() == 'first') {
                var first = -1;
                for (var i = 0; i < options.length; i++) {
                    if (options[i].value != '') {
                        $(this).val(options[i].value);
                        break;
                    }
                }
            } else {
                $(this).val(value);
            }
        });

        /// Replace href value with "history:back" if href value = referrer url:
        $(this).find("a.back").each(function () {
            if (__rb.referrer.endsWith($(this).attr('href'))) {
                $(this).attr('href', 'history:back');
            }
        });

        /// Execute loader extensions:
        var loaderScope = $(this);
        $.each(rbLoaderExtensions, function (index, value) {
            var data = null;
            if (value.length > 1) data = value[1];
            value[0](loaderScope, data);
        });

        //#endregion
    }
});


