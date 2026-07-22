<template>
  <div class="docs-select" :size="size" :icon="icon" :color="color">
    <select :aria-label="label" :title="label">
      <slot></slot>
    </select>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
  },
  color: {
    type: String,
    required: false,
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
  display: flex;
  align-items: center;
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
  /* Ensure select takes only needed width */
  width: auto;
  min-width: 0;
  flex: none;
}

.docs-select:before {
  content: attr(icon);
  font-family: var(--font-family-icon);
  font-weight: 200;
  margin-left: 0.5em;
  /* Align icon vertically with select */
  display: flex;
  align-items: center;
  /* Same 1em reservation as docsButton (BF-122): this pseudo-icon is ligature text,
     so without a fixed box the pre-swap fallback lays out at the glyph name's width. */
  flex: 0 0 auto;
  inline-size: 1em;
  block-size: 1em;
  line-height: 1;
  overflow: hidden;
}

.docs-select[size="s"] select,
.docs-select[size="s"]:before {
  font-size: var(--size-0);
}

.docs-select[size="xs"] select,
.docs-select[size="xs"]:before {
  font-size: var(--size--1);
}
</style>
