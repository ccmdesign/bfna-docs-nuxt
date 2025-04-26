import Vue from "vue";
import VueCarousel from "vue-carousel";
import VueYoutube from "vue-youtube";
import vueVimeoPlayer from "vue-vimeo-player";

import App from "./App.vue";
import router from "./router";
import store from "../stores/store";

import setupContentful from "./setupContentful";
import getList from "../stores/getList";
import "./registerServiceWorker";

Vue.config.productionTip = false;

Vue.use(VueCarousel);
Vue.use(VueYoutube);
Vue.use(vueVimeoPlayer);

const instance = new Vue({
  router,
  store,
  render: (h) => h(App),
  mounted: () => document.dispatchEvent(new Event("x-app-rendered")),
}).$mount("#app");

setupContentful(instance);
getList(instance);
