<template>
  <header class="hero">
    <div class="hero__topbar">
      <slot name="topbar">
        <docs-topbar />
      </slot>
    </div>

    <div class="hero__headings-panel">
      <div class="hero__headings | stack">
        <slot name="content">
          <h1>Hero</h1>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
          <div class="cluster">
            <button class="button">Watch Now</button>
            <button class="button">More Info</button>
          </div>
        </slot>
      </div>
    </div>

    <div class="hero__extras">
      <slot name="extras">
        <div class="stack">
          <docs-card />
        </div>
      </slot>
    </div>

    <!-- Video Background-->
    <div class="hero__video"></div>
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
}

.hero__headings-panel {
  grid-area: headings;
  grid-column: content-start / col3;
  grid-row: 2 / -1;
  align-items: end;
}

.hero__headings { grid-column: content-start / col3; }

.hero__extras {
  grid-area: extras;
  grid-column: col3 / content-end;
  align-items: end;
}

.hero__video {
  grid-column: full-start / full-end;
  grid-row: 1 / 3;
  background-color: #ddd;
  z-index: 0;
}



</style>