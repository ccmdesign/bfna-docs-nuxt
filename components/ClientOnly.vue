<template>
  <div v-if="isMounted">
    <slot />
  </div>
  <div v-else>
    <slot name="fallback" />
  </div>
</template>

<script>
export default {
  name: 'ClientOnly',
  data() {
    return {
      isMounted: false
    }
  },
  mounted() {
    this.isMounted = true
  }
}
</script> 