/////////////////////////////////////////////////////////////////
// Sircl 2.x - SortableJS extension
// www.getsircl.com
// Copyright (c) 2022 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-sortablejs' component should be registered after the 'sircl' component. Please review order of script files.");
if (typeof Sortable === "undefined") console.warn("The 'sircl-sortablejs' component requires the 'sortable.js' component. See https://github.com/SortableJS/Sortable");

/// Sortable options template:
var sircl_sortable_options_template = {
    animation: 150,
    delay: 300,
    delayOnTouchOnly: true,
    handle: ".reorder-handle"
};

$$(function site_onload_process_handler() {
    /// Sortable:
    $(this).find(".onreorder-submit").each(function () {
        var $this = $(this);
        var options = Object.assign({}, sircl_sortable_options_template); // Create shallow copy of options template
        options.group = $this.attr("reorder-group");
        options.onEnd = function (event) {
            if (event.newIndex === event.oldIndex && event.from === event.to) return;
            var $form = $this.closest("FORM");
            if ($form.length >= 1) {
                var form = $form[0];
                // Set fromindex/toindex input values:
                $form.find("INPUT.reorder-fromlist").each(function () {
                    $(this).val(event.from.getAttribute("reorder-name"));
                });
                $form.find("INPUT.reorder-fromindex").each(function () {
                    $(this).val(event.oldIndex);
                });
                $form.find("INPUT.reorder-tolist").each(function () {
                    $(this).val(event.to.getAttribute("reorder-name"));
                });
                $form.find("INPUT.reorder-toindex").each(function () {
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
        new Sortable(this, options);
    });
});