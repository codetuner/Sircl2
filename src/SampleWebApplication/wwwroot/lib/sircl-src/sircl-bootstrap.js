/* Sircl 2.x bootstrap extensions */
/* (c) Rudi Breedenraedt */

/// Globals:

/// Document Ready handler:
$(document).ready(function () {

    /// Set focus on 'autofocus' element in modal when modal is shown.
    $(document.body).on("shown.bs.modal", function (event) {
        $(event.target).find("*[autofocus]:first").each(function () {
            // Delay with 300ms fixes issue on some IE versions that cursor blinks above input field when modal has fade effect.
            var item = $(this)[0];
            setTimeout(function () {
                item.focus();
                try { item.select(); } catch (x) { }
            }, 300);
        });
    });

    // Reset content of a modal with onclose-reset-content when closing the modal:
    $(document.body).on("hidden.bs.modal", ".modal[onclose-reset=':content']", function (event) {
        $(this).html($(this)[0]._rb_onCloseResetContent);
    });
});

rbLoaderExtensions.push([function (loaded) {

    // Set options of modals:
    $(loaded).find(".modal").each(function () {
        var backdrop = !($(this).hasClass("backdrop-off"));
        if ($(this).hasClass("static")) backdrop = "static";
        if ($(this).hasClass("backdrop-static")) backdrop = "static";
        var keyboard = !($(this).hasClass("keyboard-off"));
        var focus = !($(this).hasClass("focus-off"));
        $(this).modal({ backdrop: backdrop, keyboard: keyboard, focus: focus, show: false });
    });

    // Auto-show modals:
    var automodalmain = false;
    $(loaded).find(".modal.auto-show").each(function () {
        if ($(this).attr("auto-show-delay") !== undefined) {
            var delaypart = $(this).attr("auto-show-delay").split(':');
            var delay = 0;
            for (var i = 0; i < delaypart.length; i++) delay = parseFloat(delaypart[i]) + (60 * delay);
            setTimeout(function (modal) { modal.modal('show'); }, 1000 * delay, $(this));
        } else if (automodalmain == false) {
            $(this).modal('show');
            automodalmain = true;
        } else {
            console.log("More than one 'auto-show' modal found without delay, only one can be shown.");
        }
    });

    // Backup original content of onclose-reset-content modals to be able to reset on close:
    $(loaded).find(".modal[onclose-reset=':content']").each(function (index, elem) {
        $(this)[0]._rb_onCloseResetContent = $(this).html();
    });
}]);
