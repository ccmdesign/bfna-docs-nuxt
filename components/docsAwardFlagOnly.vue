<template>
  <div class="doc-awards">
    <img class="doc-awards__flag" src="/assets/award-ribbon.svg" alt="Award Ribbon" />
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>
.doc-awards {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "space space flag";
}

.doc-awards__flag {
  grid-area: flag;
  aspect-ratio: 1/1;
  width: 22px;
  height: 42px;
  margin-inline-start: 0;
  object-fit: contain;
  object-position: center;
  margin-inline-end: var(--space-xs);
}

</style>