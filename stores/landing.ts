import { defineStore } from 'pinia';
import { ref, computed } from 'vue'


export const useLandingStore = defineStore('landing', {
  state: () => ({
    isLanding: true
  }),
  actions: {
    setLanding(value: boolean) {
      this.isLanding = value;
    },
  }
});