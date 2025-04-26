import Vue from "vue";
import VueYoutube from "vue-youtube";
import vueVimeoPlayer from "vue-vimeo-player";

import App from "./App.vue";
import router from "./router";
import store from "../stores/store";

import setupContentful from "./setupContentful";
import getList from "../stores/getList";
import "./registerServiceWorker";

Vue.config.productionTip = false;

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

// Constants
export const STORAGE_KEY = 'bfna-store';

// Video list
export const DEFAULT_VIDEO_LIST = [];

export const getSavedStore = () => {
  if(localStorage.getItem(STORAGE_KEY)) {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  }

  return {
    videoList: DEFAULT_VIDEO_LIST,
    currentVideo: 0,
    homepageVideoEffect: false,
    navigation: true,
    menuVisibility: false,
  };
};

export const saveStore = (store) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};
