<template>
  <header class="hero">
    

    <div class="hero__headings-panel">
      <div class="hero__headings | stack">
        <slot name="content">
          <div class="hero__category">Democracy</div>
          <h1 class="hero__title">I, Too</h1>
          <div class="hero__author">By Anthony Silberfeld</div>
          <div class="hero__meta">
            <span class="hero__meta-time">28min</span>
            <span class="hero__meta-year">2023</span>
          </div>
          <p class="hero__description">For Carol Anderson, the January 6th insurrection was a predictable coda to more than two centuries of American mythology. What happens, she asks, when we discover that the history we teach our children is comprised of fables, not facts?</p>
        </slot>
      </div>
    </div>

    <div class="hero__extras">
      <slot name="extras">
        <div class="stack">
          
        </div>
      </slot>
    </div>

    <!-- Video Background-->
    <video class="hero__video" src="/assets/sample-video.webm" autoplay muted loop playsinline></video>
  </header>
</template>

<script setup>
// TODO: Add CENTER to Hero Content
</script>

<style scoped>

/* Hero Layout - SubGrid */

.hero,
.hero__topbar,
.hero__headings-panel,
.hero__extras {
  display: grid;
  grid-template-columns: subgrid;
}

.hero {
  grid-column: full-start / full-end;
  grid-template-rows: auto 1fr;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  max-height: 80svh;
  grid-template-areas:
    "topbar topbar"
    "headings extras";
}

.hero__topbar,
.hero__headings-panel,
.hero__extras {
  z-index: 1;
}

.hero__topbar {
  grid-area: topbar;
  grid-column: content-start / content-end;
  @media (max-width: 321px) { display: none; }
}

.hero__headings-panel {
  /* grid-area: headings; */
  grid-column: content-start / col3;
  @media (max-width: 321px) { grid-column: content-start / content-end; }
  grid-row: 2 / -1;
  align-items: end;
}

.hero__headings { 
  grid-column: content-start / col3; 
  @media (max-width: 321px) { grid-column: content-start / content-end; }
}

.hero__extras {
  grid-area: extras;
  grid-column: col3 / content-end;
  align-items: end;
  @media (max-width: 321px) { display: none; }
}

.hero__video {
  grid-column: full-start / full-end;
  grid-row: 1 / 3;
  z-index: 0;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* Hero Skin */
.hero {
  padding-bottom: var(--space-3xl);
}

.hero__headings {
  --_stack-space: var(--space-xs);
}

.hero__extras {
}

</style>