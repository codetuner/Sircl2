/////////////////////////////////////////////////////////////////
// Sircl 2.x - Media extension
// www.getsircl.com
// Copyright (c) 2023 Rudi Breedenraedt
// Sircl is released under the MIT license, see sircl-license.txt
/////////////////////////////////////////////////////////////////

/* tslint:disabled */

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-extended' component should be registered after the 'sircl' component. Please review order of script files.");

//#region Media support

// From: https://stackoverflow.com/a/7557433/323122
sircl.isElementInView = sircl.isElementInView || function (el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
};

document.addEventListener("DOMContentLoaded", function sircl_media_eventHandlers() {

    $(document).on("click", "[onclick-resetmedia]", function () {
        sircl.ext.$select($(this), $(this).attr("onclick-resetmedia")).each(function () {
            if (this.srcObject != null || this.currentSrc != '') this.pause();
            this.currentTime = 0;
        });
    });

    $(document).on("click", "[onclick-playmedia]", function () {
        sircl.ext.$select($(this), $(this).attr("onclick-playmedia")).each(function () {
            if (this.srcObject != null || this.currentSrc != '') this.play();
        });
    });

    $(document).on("click", "[onclick-pausemedia]", function () {
        sircl.ext.$select($(this), $(this).attr("onclick-pausemedia")).each(function () {
            if (this.srcObject != null || this.currentSrc != '') this.pause();
        });
    });

    $(document).on("click", "[onclick-toggleplaymedia]", function () {
        sircl.ext.$select($(this), $(this).attr("onclick-toggleplaymedia")).each(function () {
            if (this.ended) {
                if (this.srcObject != null || this.currentSrc != '') this.play();
            } else if (this.paused) {
                if (this.srcObject != null || this.currentSrc != '') this.play();
            } else {
                if (this.srcObject != null || this.currentSrc != '') this.pause();
            }
        });
    });

    $(document).on("click", "[onclick-takepicture]", function () {
        sircl.ext.$select($(this), $(this).attr("onclick-takepicture")).filter("VIDEO").each(function () {
            var video = this;
            var canvas = null;
            sircl.ext.$select($(this), this.getAttribute("picture-canvas")).filter("CANVAS").each(function () {
                var canvas = this;
                canvas.height = video.videoHeight / (video.videoWidth / canvas.width);
                var context = canvas.getContext("2d");
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
            });
            sircl.ext.$select($(this), this.getAttribute("picture-fileinput")).filter("INPUT[type=file]").each(function () {
                if (canvas == null) {
                    canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                }
                canvas.toBlob((blob) => {
                    if (blob) {
                        var filename = video.getAttribute("picture-filename") || "picture.png";
                        var filetype = video.getAttribute("picture-filetype") ||
                            (filename.toLowerCase().endsWith(".jpg") ? "image/jpeg" :
                                filename.toLowerCase().endsWith(".jpeg") ? "image/jpeg" : "image.png");
                        var file = new File([blob], filename, { type: filetype })
                        var container = new DataTransfer();
                        container.items.add(file);
                        this.files = container.files;
                        $(this).change();
                    }
                }, 'image/jpeg');
            });
            sircl.ext.$select($(this), this.getAttribute("picture-img")).filter("IMG").each(function () {
                if (canvas == null) {
                    canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                }
                var data = canvas.toDataURL("image/png");
                this.setAttribute("src", data);
            });
            sircl.ext.$select($(this), this.getAttribute("picture-imgref")).filter("IMG").each(function () {
                if (canvas == null) {
                    canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                }
                canvas.toBlob((blob) => {
                    this.setAttribute("src", URL.createObjectURL(blob));
                }, 'image/jpeg');
            });
        });
    });

    $(document).on("change", "[onchange-setvideosource]", function () {
        var deviceId = sircl.ext.effectiveValue(this);
        sircl.ext.$select($(this), $(this).attr("onchange-setvideosource")).filter("VIDEO").each(function () {
            if (!this.paused) {
                this.dispatchEvent(new Event("pause", {
                    bubbles: false,
                    cancelable: false
                }));
                this.dispatchEvent(new Event("ended", {
                    bubbles: false,
                    cancelable: false
                }));
            }
            var autoplay = !this.paused;
            if (this.srcObject != null) {
                this.srcObject.getTracks().forEach(function (track) {
                    track.stop();
                });
                this.srcObject = null;
            }
            if (deviceId != "") {
                navigator.mediaDevices
                    .getUserMedia({ video: { exact: deviceId } })
                    .then((stream) => {
                        this.srcObject = stream;
                        if (autoplay) this.play();
                    })
                    .catch((err) => {
                        console.error("Sircl [onchange-setvideosource]: An error occurred.", err);
                    });
            }
        });
    });

    $(window).on("DOMContentLoaded load resize scroll", function () {

        /// <AUDIO|VIDEO class="ifinview-playmedia"> (Starts) playing the media element when in view.
        $("AUDIO.ifinview-playmedia, VIDEO.ifinview-playmedia").each(function () {
            if (sircl.isElementInView(this)) {
                if (this.srcObject != null || this.currentSrc != '') if (this.paused) this.play();
            }
        });

        /// <AUDIO|VIDEO class="ifnotinview-pausemedia"> Pauses the media element when not in view.
        $("AUDIO.ifnotinview-pausemedia, VIDEO.ifnotinview-pausemedia").each(function () {
            if (!sircl.isElementInView(this)) {
                if (this.srcObject != null || this.currentSrc != '') if (!this.paused) this.pause();
            }
        });
    });
});

$$("before", function sircl_media_beforeHandler() {
    // Stop audio/video stream from device (and release microphone/camera) before unloading:
    $(this).find("AUDIO, VIDEO").each(function () {
        if (this.srcObject != null) {
            this.srcObject.getTracks().forEach(function (track) {
                track.stop();
            });
            this.srcObject = null;
        }
    });
});

$$(function sircl_media_processHandler() {

    // Since events are not bubbling, need to attach them on process:

    // Hide actions:

    $(this).find("[onplaymedia-hide]").each(function () {
        this.addEventListener("play", function () {
            sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onplaymedia-hide")), false, true);
        })
    });

    $(this).find("[onwaitingmedia-hide]").each(function () {
        this.addEventListener("waiting", function () {
            sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onwaitingmedia-hide")), false, true);
        })
    });

    $(this).find("[onplayingmedia-hide]").each(function () {
        this.addEventListener("playing", function () {
            sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onplayingmedia-hide")), false, true);
        })
    });

    $(this).find("[onpausemedia-hide]").each(function () {
        this.addEventListener("pause", function () {
            sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onpausemedia-hide")), false, true);
        })
    });

    $(this).find("[onendedmedia-hide]").each(function () {
        this.addEventListener("ended", function () {
            sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onendedmedia-hide")), false, true);
        })
    });

    // Show actions:

    $(this).find("[onplaymedia-show]").each(function () {
        this.addEventListener("play", function () {
            sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onplaymedia-show")), true, true);
        })
    });

    $(this).find("[onwaitingmedia-show]").each(function () {
        this.addEventListener("waiting", function () {
            sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onwaitingmedia-show")), true, true);
        })
    });

    $(this).find("[onplayingmedia-show]").each(function () {
        this.addEventListener("playing", function () {
            sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onplayingmedia-show")), true, true);
        })
    });

    $(this).find("[onpausemedia-show]").each(function () {
        this.addEventListener("pause", function () {
            sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onpausemedia-show")), true, true);
        })
    });

    $(this).find("[onendedmedia-show]").each(function () {
        this.addEventListener("ended", function () {
            sircl.ext.visible(sircl.ext.$select($(this), $(this).attr("onendedmedia-show")), true, true);
        })
    });

    // Disable actions:

    $(this).find("[onplaymedia-disable]").each(function () {
        this.addEventListener("play", function () {
            sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onplaymedia-disable")), false);
        })
    });

    $(this).find("[onwaitingmedia-disable]").each(function () {
        this.addEventListener("waiting", function () {
            sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onwaitingmedia-disable")), false);
        })
    });

    $(this).find("[onplayingmedia-disable]").each(function () {
        this.addEventListener("playing", function () {
            sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onplayingmedia-disable")), false);
        })
    });

    $(this).find("[onpausemedia-disable]").each(function () {
        this.addEventListener("pause", function () {
            sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onpausemedia-disable")), false);
        })
    });

    $(this).find("[onendedmedia-disable]").each(function () {
        this.addEventListener("ended", function () {
            sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onendedmedia-disable")), false);
        })
    });

    // Enable actions:

    $(this).find("[onplaymedia-enable]").each(function () {
        this.addEventListener("play", function () {
            sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onplaymedia-enable")), true);
        })
    });

    $(this).find("[onwaitingmedia-enable]").each(function () {
        this.addEventListener("waiting", function () {
            sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onwaitingmedia-enable")), true);
        })
    });

    $(this).find("[onplayingmedia-enable]").each(function () {
        this.addEventListener("playing", function () {
            sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onplayingmedia-enable")), true);
        })
    });

    $(this).find("[onpausemedia-enable]").each(function () {
        this.addEventListener("pause", function () {
            sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onpausemedia-enable")), true);
        })
    });

    $(this).find("[onendedmedia-enable]").each(function () {
        this.addEventListener("ended", function () {
            sircl.ext.enabled(sircl.ext.$select($(this), $(this).attr("onendedmedia-enable")), true);
        })
    });

    // RemoveClass actions:

    $(this).find("[onplaymedia-removeclass]").each(function () {
        this.addEventListener("play", function () {
            sircl.ext.removeClass($(this), $(this).attr("onplaymedia-removeclass"));
        })
    });

    //$(this).find("[onwaitingmedia-removeclass]").each(function () {
    //    this.addEventListener("waiting", function () {
    //        sircl.ext.removeClass($(this), $(this).attr("onwaitingmedia-removeclass"));
    //    })
    //});

    //$(this).find("[onplayingmedia-removeclass]").each(function () {
    //    this.addEventListener("playing", function () {
    //        sircl.ext.removeClass($(this), $(this).attr("onplayingmedia-removeclass"));
    //    })
    //});

    $(this).find("[onpausemedia-removeclass]").each(function () {
        this.addEventListener("pause", function () {
            sircl.ext.removeClass($(this), $(this).attr("onpausemedia-removeclass"));
        })
    });

    //$(this).find("[onendedmedia-removeclass]").each(function () {
    //    this.addEventListener("ended", function () {
    //        sircl.ext.removeClass($(this), $(this).attr("onendedmedia-removeclass"));
    //    })
    //});

    // AddClass actions:

    $(this).find("[onplaymedia-addclass]").each(function () {
        this.addEventListener("play", function () {
            sircl.ext.addClass($(this), $(this).attr("onplaymedia-addclass"));
        })
    });

    //$(this).find("[onwaitingmedia-addclass]").each(function () {
    //    this.addEventListener("waiting", function () {
    //        sircl.ext.addClass($(this), $(this).attr("onwaitingmedia-addclass"));
    //    })
    //});

    //$(this).find("[onplayingmedia-addclass]").each(function () {
    //    this.addEventListener("playing", function () {
    //        sircl.ext.addClass($(this), $(this).attr("onplayingmedia-addclass"));
    //    })
    //});

    $(this).find("[onpausemedia-addclass]").each(function () {
        this.addEventListener("pause", function () {
            sircl.ext.addClass($(this), $(this).attr("onpausemedia-addclass"));
        })
    });

    //$(this).find("[onendedmedia-addclass]").each(function () {
    //    this.addEventListener("ended", function () {
    //        sircl.ext.addClass($(this), $(this).attr("onendedmedia-addclass"));
    //    })
    //});

    // Click actions:

    $(this).find("[onplaymedia-click]").each(function () {
        this.addEventListener("play", function () {
            var targetSelector = $(this).attr("onplaymedia-click");
            sircl.ext.$select($(this), targetSelector).each(function () {
                this.click(); // See: http://goo.gl/lGftqn
            });
            //event.preventDefault();
        })
    });

    $(this).find("[onpausemedia-click]").each(function () {
        this.addEventListener("pause", function () {
            var targetSelector = $(this).attr("onpausemedia-click");
            sircl.ext.$select($(this), targetSelector).each(function () {
                this.click(); // See: http://goo.gl/lGftqn
            });
            //event.preventDefault();
        })
    });

    $(this).find("[onendedmedia-click]").each(function () {
        this.addEventListener("ended", function () {
            var targetSelector = $(this).attr("onendedmedia-click");
            sircl.ext.$select($(this), targetSelector).each(function () {
                this.click(); // See: http://goo.gl/lGftqn
            });
            //event.preventDefault();
        })
    });

    // Load actions:

    $(this).find("SELECT.onload-addvideodevices").each(function () {
        if (navigator.mediaDevices == null || navigator.mediaDevices.enumerateDevices == null) {
            console.warn("Sircl .onload-addvideodevices: enumerateDevices() not supported.");
        } else {
            var count = 0;
            navigator.mediaDevices
                .enumerateDevices()
                .then((devices) => {
                    devices.forEach((device) => {
                        if (device.kind === "videoinput" && device.deviceId != "") {
                            var option = document.createElement("option");
                            option.value = device.deviceId;
                            option.text = device.label || "Camera " + (++count)
                            this.add(option);
                        }
                    });
                })
                .catch((err) => {
                    console.warn("Sircl .onload-addvideodevices: error enumerating devices.", err);
                });
        }
    });

    $(this).find("VIDEO[onload-setvideosource]").each(function () {
        var constraints = { video: true, audio: false };
        var source = this.getAttribute("onload-setvideosource");
        var audio = !this.hasAttribute("muted");
        if (source === "any") {
            constraints = { video: true, audio: audio };
        } else if (source === "user") {
            constraints = { video: { facingMode: { ideal: "user" } }, audio: audio };
        } else if (source === "environment") {
            constraints = { video: { facingMode: { ideal: "environment" } }, audio: audio };
        }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                this.srcObject = stream;
                if (this.hasAttribute("autplay")) this.play();
            })
            .catch((err) => {
                console.warn("Sircl [onload-setvideosource]: error setting video source.", err);
            });
    });
});

//#endregion

//#region BardcodeScanner support

sircl.barcode_readinterval = 200;

sircl.mediaStartBarcodeScanner = function sircl_mediaStartBarcodeScanner(video) {
    if (!('BarcodeDetector' in window)) return;
    if (video == null) return;
    if (video._barcodeScannerInterval != null) return;

    BarcodeDetector.getSupportedFormats().then((supportedFormats) => {
        var formats = [];
        var requestedFormats = (video.getAttribute("barcode-formats") || "qr_code").split(' ');
        for (var i = 0; i < requestedFormats.length; i++) {
            if (supportedFormats.includes(requestedFormats[i])) {
                formats.push(requestedFormats[i]);
            } else {
                console.warn("Sircl .barcode-scanner: barcode format \"" + requestedFormats[i] + "\" not supported.");
            }
        }
        video._barcodeScanner = new BarcodeDetector({ formats: formats });
        video._barcodeScannerInterval = window.setInterval(function (video) {
            video._barcodeScanner.detect(video)
                .then(function (codes) {
                    if (codes.length === 0) return;
                    video.pause();
                    if (video.classList.contains("onbarcodedetected-navigate")
                        && (codes[0].rawValue.toLowerCase().startsWith("http://")
                            || codes[0].rawValue.toLowerCase().startsWith("https://")
                            || codes[0].rawValue.toLowerCase().startsWith("mailto://")
                        )) {
                        window.location.href = codes[0].rawValue;
                    } else {
                        if (video.getAttribute("onbarcodedetected-setvalue")) {
                            if (video.getAttribute("onbarcodedetected-setformat")) {
                                sircl.ext.$select($(video), video.getAttribute("onbarcodedetected-setformat")).each(function () {
                                    this.value = codes[0].format;
                                });
                            }
                            sircl.ext.$select($(video), video.getAttribute("onbarcodedetected-setvalue")).each(function () {
                                this.value = codes[0].rawValue;
                                $(this).change();
                            });
                        }
                        if (video.getAttribute("onbarcodedetected-click")) {
                            sircl.ext.$select($(video), video.getAttribute("onbarcodedetected-click")).each(function () {
                                this.click(); // See: http://goo.gl/lGftqn
                            });
                        }
                        // Also dispatch a "barcodedetected" event for extensibility:
                        var event = new CustomEvent("barcodedetected", { bubbles: true, detail: { barCodes: codes } });
                        video.dispatchEvent(event);
                    }
                })
                .catch(function (err) {
                    console.error("Sircl .barcode-scanner: error handling barcode detection.", err);
                });
        }, sircl.barcode_readinterval, video)
    });
}

sircl.mediaStopBarcodeScanner = function sircl_mediaStopBarcodeScanner(video) {
    if (video == null) return;
    if (video._barcodeScannerInterval != null) {
        clearInterval(video._barcodeScannerInterval);
        video._barcodeScannerInterval = null;
    }
}

$$("before", function sircl_media_barcode_beforeHandler() {
    // Stop scanner and remove interval before unloading:
    $(this).find("VIDEO.barcode-scanner").each(function () {
        sircl.mediaStopBarcodeScanner(this);
    });
});

$$(function sircl_media_barcode_processHandler() {

    $(this).find(".ifcanusebarcodescanner-show").each(function () {
        sircl.ext.visible($(this), ('BarcodeDetector' in window), false);
    });

    $(this).find(".ifcanusebarcodescanner-hide").each(function () {
        sircl.ext.visible($(this), !('BarcodeDetector' in window), false);
    });

    $(this).find("VIDEO.barcode-scanner").each(function () {
        this.addEventListener("play", function () {
            sircl.mediaStartBarcodeScanner(this);
        })
        this.addEventListener("pause", function () {
            sircl.mediaStopBarcodeScanner(this);
        })
    });

});

//#endregion
