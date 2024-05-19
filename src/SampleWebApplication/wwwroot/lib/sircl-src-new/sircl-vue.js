/* tslint:disabled */

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-vue' component should be registered after the 'sircl' component. Please review order of script files.");
if (typeof Vue === "undefined") console.warn("The 'sircl-vue' component should be registered after the 'vue' component. Please review order of script files.");

// Unmount Vue apps before removing HTML part:
$$("before", function () {
    $(this).find("[vue-dataurl]").each(async function () {
        if (this.__vue_app) {
            this.__vue_app.unmount();
            this.__vue_app = null;
        }
    });
});

// Mount Vue apps:
$$(function () {
    $(this).find("[vue-dataurl]").each(async function () {
        // Prepare VueJs app:
        let appObject = {};
        let responseprom = (this.hasAttribute("vue-dataurl")) ? fetch(this.getAttribute("vue-dataurl")) : null;
        let templateresponseprom = (this.hasAttribute("vue-templateurl")) ? fetch(this.getAttribute("vue-templateurl")) : null;
        if (responseprom) {
            const response = await responseprom;
            const json = await response.json();
            appObject.data = function () { return json; };
        }
        if (this.hasAttribute("vue-template")) {
            appObject.template = sircl.ext.$select($(this), this.getAttribute("vue-template")).html();
        } else if (templateresponseprom) {
            const templateresponse = await templateresponseprom;
            const template = await templateresponse.text();
            appObject.template = template;
        }
        // Event handlers to inject Sircl Ready Handlers:
        appObject.beforeMount = () => { sircl._beforeUnload(this); };
        appObject.mounted = function () { sircl._afterLoad(this.$el.parentElement); };
        // Create and mount VueJs app:
        const { createApp } = Vue;
        const app = createApp(appObject);
        this.__vue_app = app;
        app.mount(this);
    });
});