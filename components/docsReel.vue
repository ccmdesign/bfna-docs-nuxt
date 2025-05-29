<template>
  <section class="reel-section">
    <div class="center">
      <slot name="title">
        
      </slot>
    </div>

    <div class="center">
      <div class="reel-grid">
        <slot name="reel">
          <docs-card v-for="i in 7" :key="i"></docs-card>
        </slot>
      </div>
    </div>    

  </section>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.reel-grid {
  display: grid;
  grid-auto-columns: minmax(266px, 100%);
  grid-auto-flow: column;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;  /* Enable snap points */
  scroll-snap-align: start;       /* Snap to the start of each card */
  scroll-behavior: smooth;        /* Smooth scrolling */
  -webkit-overflow-scrolling: touch;  /* Enable smooth scrolling on iOS */
  -ms-overflow-style: none;       /* Hide scrollbar in IE and Edge */
}
</style>