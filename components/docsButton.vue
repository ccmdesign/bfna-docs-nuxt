<template>
  <button class="docs-button" :icon="icon" :color="color" :size="size"></button>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
  },
  color: {
    type: String,
    required: true,
    default: 'white'
  },
  size: {
    type: String,
    required: true,
    default: 'm'
  }
})
</script>

<style scoped>
.docs-button {
  border: none;
  cursor: pointer;
  color: attr(color);
  background-color: transparent;
}

.docs-button:before {
  content: attr(icon);
  font-family: var(--font-family-icon);
  font-weight: 200;

}

.docs-button[size="s"],
.docs-button[size="s"]:before {
  font-size: var(--size-1);
}
</style>
