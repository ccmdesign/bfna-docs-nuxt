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
  background-color: var(--primary-color-60-shade);
  color: var(--black-color);
  border-radius: 10px;
  font-size: 0.7em;

  &:first-child {
    margin-left: 0;
  }
}


</style>