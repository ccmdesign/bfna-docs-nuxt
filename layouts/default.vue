<template>
  <master-grid>
    <docs-topbar id="topbar" />
    <docs-hero-video id="hero-video" />
    <docs-hero-headings id="hero" />
    <docs-hero-extra id="hero-extra" />

    <slot />

    <docs-footer id="footer" />
  </master-grid>
</template>

<style>
#hero-video {
  grid-row: 1 / 4;
  z-index: 0;
}

#hero-extra {
  grid-column: 9/14;
  grid-row: 3 / 4;
  z-index: 1;
  align-self: center;
}

#hero {
  grid-row: 3 / 4;
  z-index: 1;
}

#featured-reel {
  grid-row: 4 / 5;
  z-index: 1;
  margin-block-start: -80px;
}

#latest-heading {
  grid-row: 5 / 6;
  z-index: 1;
}

#footer {
  grid-row: 9 / 10;
  z-index: 1;
}
</style> 