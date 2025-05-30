<template>
  <div class="docs-topbar | subgrid cluster">
      <h1 class="docs-topbar__left"><nuxt-link to="/">
        <img src="/assets/bfna-documentaries-logo.png" alt="BFNA Documentaries" />
      </nuxt-link>
    </h1>
    
    <docs-search class="docs-topbar__center" split-left split-right />
    
    <a class="docs-topbar__right" href="#">Visit Bertelsmann Foundation <span class="icon">open_in_new</span></a>
  </div>
</template>

<script setup>
</script>

<style scoped>
.docs-topbar {
  grid-column: content-start / content-end;
  align-items: start;
  grid-row: 1 / 2;
  z-index: 1;
  padding-block-start: var(--space-s);
}

.docs-topbar__left img {
  max-width: 180px;
}

.docs-topbar__center {
  max-width: 380px;
}

.docs-topbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-3xs);
  text-align: right;
  color: var(--white-color);
  font-size: var(--size--1);
  font-weight: 400;
  letter-spacing: 0.04em;
  text-decoration: none;

  .icon {
    line-height: .7;
    font-size: var(--size-0);
  }
}
</style>
