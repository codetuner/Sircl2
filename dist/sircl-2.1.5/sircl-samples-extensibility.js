// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The file 'sircl-samples-extensibility' component should be registered after the 'sircl' component. Please review order of script files.");

//#region Custom confirm dialog with Bootstrap

//#region HTML code to be added in the master page
// <div id="confirm-modal" class="modal fade" tabindex="-1" role="dialog">
//     <div class="modal-dialog" role="document">
//         <div class="modal-content">
//             <div class="modal-header">
//                 <h5 class="modal-title">Please confirm...</h5>
//             </div>
//             <div class="modal-body"></div>
//             <div class="modal-footer">
//                 <button type="button" class="btn btn-primary" name="okButton">OK</button>
//                 <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
//             </div>
//         </div>
//     </div>
// </div>
// #endregion

sircl.ext.confirm = function (subject, message, event) {
    // If called for first time, show the confirm modal:
    var $subject = $(subject);
    if ($subject[0]._skipConfirmOnce != true) {
        $("#confirm-modal .modal-body").html(message);
        $("#confirm-modal")[0]._confirmAction = function () {
            // Retrigger click event to call this confirm a second time, but this time just consider confirmed:
            $subject[0]._skipConfirmOnce = true;
            $subject.click();
        };
        $("#confirm-modal").modal("show");
        return false;
    } else {
        // Else if called for second time, simply return true:
        $subject[0]._skipConfirmOnce = undefined;
        return true;
    }
};

$(function () {

    // When OK button clicked, prepare to execute confirmAction and close modal:
    $(document).on("click", "#confirm-modal button[name=okButton]", function (event) {
        $("#confirm-modal")[0]._onCloseOnce = $("#confirm-modal")[0]._confirmAction;
        $("#confirm-modal").modal("hide");
    });

    // When modal closed, execute confirmAction if it was prepared:
    $(document).on("hidden.bs.modal", "#confirm-modal", function (event) {
        if (this._onCloseOnce) {
            var fx = this._onCloseOnce;
            this._onCloseOnce = undefined;
            fx();
        }
    });
});

//#endregion

//#region TinyMCE integration

$$("before", function () {
    tinymce.remove("TEXTAREA[data-type='html']");
});
$$("process", function () {
    tinymce.init({
        selector: "TEXTAREA[data-type='html']",
        plugins: "link code fullscreen image charmap lists table hr paste preview print",
        toolbar: 'fullscreen | styleselect bold italic alignleft aligncenter alignright | bullist numlist outdent indent | table link image',
        menubar: true,
        paste_as_text: false,
        convert_urls: false
    });
});

//#endregion
