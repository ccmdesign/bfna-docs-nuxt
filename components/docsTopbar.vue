<template>
  <div class="docs-topbar">
    <div class="docs-topbar__left">
      <h1><nuxt-link to="/">
        <img src="/assets/bfna-documentaries-logo.png" alt="BFNA Documentaries" />
      </nuxt-link></h1>
    </div>
    
    <div class="docs-topbar__center">
      <input type="text" placeholder="Search"/>
    </div>
    
    <div class="docs-topbar__right">
      <a href="#">Visit Bertelsmann Foundation</a>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.docs-topbar {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: content-start / content-end;
  align-items: center;
}

.docs-topbar__left {
  grid-column: content-start / col1;
}

.docs-topbar__center {
  grid-column: col1 / col3;

  > * {
    width: 100%;
  }
}

.docs-topbar__right {
  grid-column: col3 / content-end;
  text-align: right;
}
</style>
