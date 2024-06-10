/* tslint:disabled */

// Initialize sircl lib:
if (typeof sircl === "undefined") console.warn("The 'sircl-vue' component should be registered after the 'sircl' component. Please review order of script files.");
if (typeof Vue === "undefined") console.warn("The 'sircl-vue' component should be registered after the 'vue' component. Please review order of script files.");

// Sircl Vue object for extension:
sircl.vue = sircl.vue || {};
sircl.vue.createHandlers = sircl.vue.createHandlers || [];
//sircl.vue.createHandlers.push(function (el, rootComponent) { console.log("Vue: Creating", el, appObj); });
sircl.vue.mountHandlers = sircl.vue.createHandlers || [];
//sircl.vue.mountHandlers.push(function (el, app) { console.log("Vue: Mounting", el, app); });
sircl.vue.unmountHandlers = sircl.vue.createHandlers || [];
//sircl.vue.unmountHandlers.push(function (el, app) { console.log("Vue: Unmounting", el, app); });

// Unmount Vue apps before removing HTML part:
$$("before", function () {
    $(this).find("[vue-dataurl]").each(async function () {
        if (this.__vue_app) {
            sircl.vue.unmountHandlers.forEach((fx) => fx(this, this.__vue_app));
            this.__vue_app.unmount();
            this.__vue_app = null;
        }
    });
});

// Mount Vue apps:
$$(function () {
    $(this).find("[vue-dataurl]").each(async function () {
        // Prepare VueJs app:
        let rootComponent = {};
        let responseprom = (this.hasAttribute("vue-dataurl")) ? fetch(this.getAttribute("vue-dataurl")) : null;
        let templateresponseprom = (this.hasAttribute("vue-templateurl")) ? fetch(this.getAttribute("vue-templateurl")) : null;
        if (responseprom) {
            const response = await responseprom;
            const json = await response.json();
            rootComponent.data = function () { return json; };
        }
        if (this.hasAttribute("vue-template")) {
            rootComponent.template = sircl.ext.$select($(this), this.getAttribute("vue-template")).html();
        } else if (templateresponseprom) {
            const templateresponse = await templateresponseprom;
            const template = await templateresponse.text();
            rootComponent.template = template;
        }
        // Event handlers to inject Sircl Ready Handlers:
        rootComponent.beforeMount = () => { sircl._beforeUnload(this); };
        rootComponent.mounted = function () { sircl._afterLoad(this.$el.parentElement); };
        sircl.vue.createHandlers.forEach((fx) => fx(this, rootComponent));
        // Create and mount VueJs app:
        const { createApp } = Vue;
        const app = createApp(rootComponent);
        this.__vue_app = app;
        sircl.vue.mountHandlers.forEach((fx) => fx(this, app));
        app.mount(this);
    });
});