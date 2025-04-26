import Vue from "vue";
import Vuex from "vuex";
import ContentfulVue from "contentful-vue";

Vue.use(Vuex);
Vue.use(ContentfulVue, {
  space: "i3vkqp3u3738",
  accessToken: "djZF2h9Zs1hLxuj2cjN7544QiqZjeotwa3CDWPm2iyc",
});

const store = new Vuex.Store({
  state: {
    currentVideo: 0,
    videoList: [],
    featured: [],
    navigation: true,
    homepageVideoEffect: false,
    menuVisibility: false,
  },
  mutations: {
    setCurrentVideo(state, url) {
      let index = -1
      state.videoList.find(function (item, i) {
        if (item.videoUrl === url) {
          index = i
        }
      })
      state.currentVideo = index > state.videoList.length || index < 0 ? 0 : index;
    },
    setNavigation(state, navigation) {
      state.navigation = navigation;
    },
    setHomepageVideoEffect(state, homepageVideoEffect) {
      state.homepageVideoEffect = homepageVideoEffect;
    },
    setMenuVisibility(state, menuVisibility) {
      state.menuVisibility = menuVisibility;
    },
    setVideoList(state, videoList) {
      state.videoList = videoList;
    },
    setFeatured(state, featured) {
      state.featured = featured;
    },
  },
  getters: {
    hasVideos(state) {
      return state.videoList && state.videoList.length > 0;
    },
    emptyEpisode() {
      return {
        title: "",
        subtitle: "",
        description: "",
        videoUrl: "",
        workstream: "",
        backgroundImage: "",
      };
    },
  },
});

export default store;
