<template>
  <div class="header">
    <NuxtLink to="/">
      <img src="/assets/bfna-documentaries-logo.png" alt="BFNA Documentaries" />
    </NuxtLink>
  </div>
</template>

<script setup>
// Component is now compatible with Nuxt 3 composition API
</script>

<style lang="scss">
.header {
  position: relative;
  display: flex;
  align-items: center;
  width: fit-content;
  flex-wrap: wrap;
  justify-content: flex-start;
  max-width: 540px;
  width: 100%;  
  gap: 35px;
  
  .bertelsmann {
    height: 4vh;
  }

  .documentaries {
    height: 15vh;
    margin-top: calc(5vh + 60px);
    @media (min-width: 768px) {
      margin-top: 55px;
    }
  }

  &__title {
    color: #fc8b00;
    text-transform: uppercase;
    font-size: 34px;
    font-weight: 500;
  }
}
</style>
