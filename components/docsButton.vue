<template>
  <button class="docs-button" :icon="icon" :color="color" :size="size" :effect="effect" :variant="variant">
    <slot></slot>
  </button>
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
  },
  effect: {
    type: String,
    required: true,
    default: 'default'
  },
  variant: {
    type: String,
    required: true,
    default: 'secondary'
  }
})
</script>

<style scoped>
.docs-button {
  border: 0;
  cursor: pointer;
  color: attr(color);
  background-color: transparent;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  padding-inline: var(--space-s);
  border: 1px solid var(--_button-border-color);
  background-color: var(--_button-background-color);
  color: var(--_button-color);
  font-size: var(--size-0);
  font-weight: 600;
}


.docs-button[icon]:empty { padding-inline: 0; }

.docs-button[icon]:before,
.docs-button[icon-after]:after {
  line-height: 0;
  content: attr(icon);
  font-family: var(--font-family-icon);
  font-weight: 200;
  font-size: var(--size-0);
}

.docs-button[size="s"],
.docs-button[size="s"]:before {
  font-size: var(--size--1);
}

.docs-button[effect="pill"] {
  border-radius: 100px;
  padding-block: calc(var(--space-2xs) + 2px) var(--space-xs);
}

.docs-button[variant="primary"] {
  --_button-border-color: var(--white-color);
  --_button-background-color: var(--white-color);
  --_button-color: var(--black-color);
}

.docs-button[variant="secondary"] {
  --_button-border-color: transparent;
  --_button-background-color: transparent;
  --_button-color: var(--white-color);
  backdrop-filter: blur(100px);
}

.docs-button[icon] {
  padding-inline-start: var(--space-xs);
}

.docs-button[icon-after]:after {
  font-size: var(--size-0);
  content: attr(icon-after);
}
</style>
