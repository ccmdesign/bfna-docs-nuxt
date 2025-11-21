<template>
  <div class="by-line">
    <div class="by-line__content | cluster">
      <a href="/assets/Privacy-Policy.pdf">Privacy</a>
      <a href="#" @click.prevent="openCookieModal">Cookies</a>
      <span split-left>© 2025 BFNA</span>
      <a href="https://www.ccmdesign.ca/" target="_blank">by ccm.design</a>
    </div>
  </div>
</template>

<script setup>
const { openCookieModal } = useCookieControl();
</script>

<style scoped>

/* By Line Layout - SubGrid */

.by-line {
  /* display: grid;
  grid-template-columns: subgrid;
  grid-column: auto; */
  font-size: var(--size--2);
  padding-block: var(--space-l) var(--space-s);
  color: var(--white-color-50-shade);
  background-color: var(--black-color-95-tint);
}

.by-line__content {
  /* display: flex;
  flex-direction: column; */
  gap: var(--space-s);
  grid-column: content-start / content-end;
  --_cluster-space: var(--space-xs);
  padding-top: var(--space-m);
}

.policy-links, .logos {
  /* display: flex; */
  /* flex-direction: column; */
  /* align-items: flex-start; */
  /* gap: var(--space-xs); */
}
.logos {
  /* gap: unset; */
}
</style>
