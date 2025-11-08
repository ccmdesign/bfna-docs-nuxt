<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error?.statusCode ?? 500)
const is404 = computed(() => statusCode.value === 404)

const pageTitle = computed(() =>
  is404.value ? 'Page not found' : 'We hit a snag'
)

const pageDescription = computed(() =>
  is404.value
    ? 'The page you were looking for has moved or never existed.'
    : 'Something went wrong on our side. Let’s get you back on track.'
)

useSeoMeta({
  title: () => `${pageTitle.value} | BFNA Documentaries`,
  description: () => pageDescription.value
})

const handleGoHome = () => {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="error-page">
    <master-grid>
      <docs-topbar />

      <section class="error-page__content stack">
        <p class="error-page__eyebrow">Error {{ statusCode }}</p>
        <h1 class="error-page__title">{{ pageTitle }}</h1>
        <p class="error-page__description">
          {{ pageDescription }}
        </p>

        <div class="error-page__actions">
          <button type="button" class="error-page__button" @click="handleGoHome">
            Back to home
          </button>
        </div>
      </section>

      <docs-footer id="footer" />
    </master-grid>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  background: radial-gradient(
      circle at 20% 20%,
      color-mix(in srgb, var(--primary-color) 20%, transparent),
      transparent 55%
    ),
    radial-gradient(
      circle at 80% 0%,
      color-mix(in srgb, var(--secondary-color) 25%, transparent),
      transparent 60%
    ),
    var(--black-color);
  color: var(--white-color);
}

:deep(#topbar) {
  backdrop-filter: blur(2px);
}

.error-page__content {
  grid-column: 3 / 11;
  grid-row: 4 / 8;
  padding: var(--space-l);
  background: color-mix(in srgb, var(--black-color) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--white-color) 15%, transparent);
  border-radius: 16px;
  gap: var(--space-m);
}

.error-page__eyebrow {
  font-size: var(--size-0);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--primary-color);
  margin: 0;
}

.error-page__title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  margin: 0;
}

.error-page__description {
  font-size: var(--size-2);
  color: var(--base-color-20-tint);
  margin: 0;
}

.error-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-s);
  align-items: center;
}

.error-page__button {
  border: none;
  background: var(--primary-color);
  color: var(--black-color);
  font-weight: 600;
  padding: var(--space-2xs-xs) var(--space-m);
  border-radius: 999px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.error-page__button:hover {
  background: color-mix(in srgb, var(--primary-color) 85%, white 15%);
}

.error-page__link {
  color: var(--white-color);
  text-decoration: underline;
  font-weight: 500;
}

@media (max-width: 768px) {
  .error-page__content {
    grid-column: 1 / -1;
    grid-row: 4 / 9;
    padding: var(--space-m);
  }
}
</style>
