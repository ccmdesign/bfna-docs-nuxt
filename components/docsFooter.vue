<template>
  <footer class="footer | subgrid">
    <div class="footer__content | subgrid">
    <ul>
      <h4 class="h6">The Foundation</h4>
      <li><a href="#">About the Foundation</a></li>
      <li><a href="#">Board of Directors | Team</a></li>
      <li><a href="#">Bertelsmann Stiftung</a></li>
      <li><a href="#">Contact</a></li>
      <li><a href="#">Privacy Policy</a></li>
    </ul>
    
    <ul>
      <h4 class="h6">Topics</h4>
      <li><a href="#">Democracy</a></li>
      <li><a href="#">Politics & Society</a></li>
      <li><a href="#">Digital World</a></li>
    </ul>
    
    
        
    <ul>
      <h4 class="h6">Updates</h4>
      <li><a href="#">Publications</a></li>
      <li><a href="#">Infographics</a></li>
      <li><a href="#">Videos</a></li>
    </ul>

    <div class="stack">
      <p>Bertelsmann Foundation documentaries focus on governance, economics, elections, social issues, the digital revolution, and most importantly, where these issues intersect.</p>
      <div class="cluster">
        <a href="#">
          <img src="/assets/bertelsmann-logo.png" alt="Bertelsmann Foundation" />
        </a>
        <a href="#">
          <img src="/assets/bfna-documentaries-logo.png" alt="ccm.design" />
          </a>
        </div>
      </div>
    </div>

    <by-line />
  </footer>
</template>

<script setup>

</script>

<style scoped>

/* Footer Layout - SubGrid */
.footer {
  grid-column: full-start / full-end;
  display: grid;
  grid-template-columns: subgrid;
  background-color: var(--black-color-95-tint);
}

.footer__content {
  grid-column: content-start / content-end;
  display: grid;
  grid-template-columns: subgrid;
}

ul, div {
  

  @media (max-width: 769px) {
    padding-block-start: var(--space-s);
    grid-template-columns: subgrid;
    grid-column: inherit;
  }
}

ul {
  @media (min-width: 769px) { grid-column: span 2; }
}

ul:first-child {
  @media (min-width: 769px) { grid-column: span 3; }
}

div {
  @media (min-width: 769px) { grid-column: span 5; }
}

/* Footer Skin */
.footer {
  padding-block: var(--space-l) 0;
  
  p, li { font-size: var(--size--1); }
  h4 { padding-block-end: var(--space-2xs-xs); }
}

ul {
  list-style: none;
  padding-inline: 0;
  margin: 0;
}

img {
  max-width: 80px;
}


</style>