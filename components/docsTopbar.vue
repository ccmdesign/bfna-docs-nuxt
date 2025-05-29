<template>
  <div class="docs-topbar">
    <div class="docs-topbar__left">
      <h1>Logo</h1>
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
  background-color: #fff;
  grid-template-columns: 1fr 1fr 1fr;
}

.docs-topbar__left {
  grid-column: 1;
}

.docs-topbar__center {
  grid-column: 2;
}

.docs-topbar__right {
  grid-column: 3;
}
</style>
