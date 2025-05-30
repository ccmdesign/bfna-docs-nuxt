<template>
  <div class="docs-select">
    <select :icon="icon" :color="color" :size="size">
      <slot></slot>
    </select>
  </div>
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
.docs-select {
  position: relative;
}

.docs-select select {
  cursor: pointer;
  color: attr(color);
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
}

.docs-select:before {
  content: attr(icon);
  font-family: var(--font-family-icon);
  font-weight: 200;

}

.docs-select[size="s"],
.docs-select[size="s"]:before {
  font-size: var(--size-1);
}
</style>
