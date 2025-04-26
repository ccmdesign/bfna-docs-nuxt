<template>
  <div>
    <slot />
  </div>
</template>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #ffffff;
  background-color: #000000;
}

.layout-default {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style> 