<template>
  <master-grid>
    <docs-topbar id="topbar" />
    <docs-video-hero id="hero-video" />
    <docs-hero-headings id="hero" />

    <slot />

    <docs-footer id="footer" />
    <by-line id="by-line" />
  </master-grid>
</template>

<style>
#hero-video {
  grid-row: 1 / 4;
  z-index: 0;
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

#by-line {
  grid-row: 10 / 11;
  z-index: 1;
}
</style> 