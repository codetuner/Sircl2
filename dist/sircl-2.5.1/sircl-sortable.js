/////////////////////////////////////////////////////////////////
// Sircl 2.x - SortableJS extension
// www.getsircl.com
// Copyright (c) 2022-2023 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

/* tslint:disabled */

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-sortablejs' component should be registered after the 'sircl' component. Please review order of script files.");
if (typeof Sortable === "undefined") console.warn("The 'sircl-sortablejs' component requires the 'sortable.js' component. See https://github.com/SortableJS/Sortable");

/// Sortable options template:
var sircl_sortable_options_template = {
    animation: 150,
    delay: 300,
    delayOnTouchOnly: true,
    touchStartThreshold: 4,
};

$$(function site_onload_process_handler() {
    /// Sortable:
    $(this).find(".onsort, .onsort-move, .onsort-copy, .onsort-clone, .onsort-submit").each(function () {
        var $this = $(this);
        var options = Object.assign({}, sircl_sortable_options_template); // Create shallow copy of options template
        options.sort = !$this.hasClass("onsort");
        options.handle = $this.attr("sort-handle") || options.handle;
        options.filter = $this.attr("sort-filter") || options.filter;
        options.group = {
            name: $this.attr("sort-name"),
            pull: ($this.hasClass("onsort-copy") || $this.hasClass("onsort-clone")) ? "clone" : true,
            put: $this.hasAttr("onsort-accept") ? ($this.attr("onsort-accept") == "any" ? true : $this.attr("onsort-accept").split(" ")) : (false)
        };
        if ($this.hasClass("onsort-submit")) {
            options.onEnd = function (event) {
                if (event.newIndex === event.oldIndex && event.from === event.to) return;
                var $form = $this.closest("FORM");
                if ($form.length >= 1) {
                    var form = $form[0];
                    // Set fromindex/toindex input values:
                    $form.find("INPUT.onsort-setfromlist").each(function () {
                        $(this).removeAttr("disabled");
                        $(this).val(event.from.getAttribute("sort-name"));
                    });
                    $form.find("INPUT.onsort-setfromindex").each(function () {
                        $(this).removeAttr("disabled");
                        $(this).val(event.oldIndex);
                    });
                    $form.find("INPUT.onsort-settolist").each(function () {
                        $(this).removeAttr("disabled");
                        $(this).val(event.to.getAttribute("sort-name"));
                    });
                    $form.find("INPUT.onsort-settoindex").each(function () {
                        $(this).removeAttr("disabled");
                        $(this).val(event.newIndex);
                    });
                    // Submit form (add a submit button, then click that button):
                    var btnid = "sircl-autoid-" + new Date().getTime();
                    var btn = "<input hidden id=\"" + btnid + "\" type=\"submit\" ";
                    if ($this.hasAttr("formaction")) btn += "formaction=\"" + $this.attr("formaction") + "\" ";
                    if ($this.hasAttr("formenctype")) btn += "formenctype=\"" + $this.attr("formenctype") + "\" ";
                    if ($this.hasAttr("formmethod")) btn += "formmethod=\"" + $this.attr("formmethod") + "\" ";
                    if ($this.hasAttr("formnovalidate")) btn += "formnovalidate=\"" + $this.attr("formnovalidate") + "\" ";
                    if ($this.hasAttr("formtarget")) btn += "formtarget=\"" + $this.attr("formtarget") + "\" ";
                    btn += "/>";
                    $form.append(btn);
                    $("#" + btnid).click();
                }
            };
        }
        new Sortable(this, options);
    });
});