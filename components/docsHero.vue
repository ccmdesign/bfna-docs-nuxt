<template>
  <header class="hero">

    <div class="hero__topbar">
      <div class="center">
        <slot name="topbar">
          <docs-topbar />
        </slot>
      </div>
    </div>

    <div class="hero__panels | center">
      <div class="hero__headings">
        <slot name="content">
          <div class="stack">
            <h1>Hero</h1>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
            <div class="cluster">
              <button class="button">Watch Now</button>
              <button class="button">More Info</button>
            </div>
          </div>
        </slot>
      </div>

      <div class="hero__extras">
        <slot name="extras">
          <div class="stack">
            <docs-card />
          </div>
        </slot>
      </div>

    </div>

    <!-- Video Background-->
    <div class="hero__video">
      
    </div>
  </header>
</template>

<script setup>
// TODO: Add CENTER to Hero Content
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr;
  aspect-ratio: 16 / 9;
  grid-template-areas:
    "topbar"
    "panels";
}

.hero__panels {
  width: 100%;
  grid-area: panels;
  display: grid;
  grid-template-columns: 4fr 2fr minmax(266px, 1fr);
  grid-template-rows: 1fr;
  align-items: end;
  grid-template-areas:
    "content spacer extras";
}

.hero__headings {
  grid-area: content;
  color: #000;
  z-index: 1;
}

.hero__topbar {
  grid-area: topbar;
  z-index: 1;
}

.hero__extras {
  grid-area: extras;
  z-index: 1;

}

.hero__video {
  grid-column: 1 / 4;
  grid-row: 1 / 3;
  background-color: green;
  width: 100%;
  height: 100%;
}



</style>