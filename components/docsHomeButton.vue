<script setup>
const videoStore = useVideoStore();
const { setIsPlaying } = videoStore;

const handleHome = () => {
  setIsPlaying(false);
};
</script>

<template>
  <button class="back-home-btn" @click="handleHome" aria-label="Back to Home">
    <span class="material-symbols-outlined">arrow_left_alt</span>
    <span class="sr-only">Back to Home</span>
  </button>
</template>

<style scoped>
.back-home-btn {
  position: absolute;
  top: 4.5rem;
  left: 1.5rem;
  z-index: 10;
  background: var(--white-color-10-shade);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white-color);
  cursor: pointer;
  transition: background 0.2s;
}
.back-home-btn:hover,
.back-home-btn:focus {
  background: var(--red-color-80-shade);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  border: 0;
}
</style>