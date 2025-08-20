<template>
  <span class="meta-info">
    <slot></slot>
  </span>
</template>

<script setup>
const props = defineProps({
  white: {
    type: Boolean,
    default: false
  }
})

const customFontColor = computed(() => {
  return props.white ? 'var(--black-color)' : 'var(--white-color-60-shade)';
});
const customBGColor = computed(() => {
  return props.white ? 'var(--white-color)' : 'var(--white-color-10-shade)';
});
</script>

<style scoped>
.meta-info {
  font-size: var(--size--2);
  font-weight: 400;
  letter-spacing: 0.04em;
  color: v-bind(customFontColor);
  display: inline-block;
  line-height: 1;
  padding: var(--space-3xs) var(--space-2xs);
  background-color: v-bind(customBGColor);
  border-radius: 4px;
}
</style>

