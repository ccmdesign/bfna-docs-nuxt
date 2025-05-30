<template>
  <div class="hero-headings | subgrid stack">
    <slot name="content">
      <div class="hero__category | font-size:-1">Democracy</div>
      <h1 class="hero__title | font-size:5">I, Too</h1>
      <div class="hero__author | font-size:-1">By Anthony Silberfeld</div>
      <div class="hero__meta | cluster">
        <docs-meta>28min</docs-meta>
        <docs-meta>2023</docs-meta>
      </div>
      <p class="hero__description | font-size:-1">For Carol Anderson, the January 6th insurrection was a predictable coda to more than two centuries of American mythology. What happens, she asks, when we discover that the history we teach our children is comprised of fables, not facts?</p>

      <div class="hero__actions | cluster">
        <docs-button effect="pill" variant="primary" icon="play_arrow">Watch Now</docs-button>
        <docs-button effect="pill" variant="secondary" icon-after="arrow_forward">More Info</docs-button>
      </div>
    </slot>
  </div>
</template>

<script setup>

</script>

<style scoped>

/* Hero Layout - SubGrid */

.hero-headings {
  grid-column: content-start / content-end;
  grid-row: 3 / 4;
  justify-self: end;
  padding-block-end: var(--space-3xl);
  @media (min-width: 768px) { grid-column: content-start / col2; }

  --_stack-space: var(--space-2xs);

  .hero__actions {
    --_stack-space: var(--space-s);
    --_cluster-space: var(--space-s);
  }
}

</style>