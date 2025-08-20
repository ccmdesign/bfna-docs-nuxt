<script setup>
defineProps({
  tag: {
    type: String,
    required: true
  }
})
</script>

<template>
  <span class="chip">{{ tag }}</span>
</template>

<style scoped>
.chip {
  display: inline-block;
  padding: 0.2em 1em;
  margin: 0 0.25em;
  background-color: var(--black-color-95-tint);
  color: var(--white-color);
  border-radius: 4px;
  font-size: 0.7em;
  border: 1px solid var(--white-color);

  &:first-child {
    margin-left: 0;
  }
}


</style>