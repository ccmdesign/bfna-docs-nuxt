<template>
  <footer class="footer | subgrid">
    <ul>
      <h4 class="h6">Topics</h4>
      <li><a href="#">Democracy</a></li>
      <li><a href="#">Politics & Society</a></li>
      <li><a href="#">Digital World</a></li>
    </ul>
    
    <ul>
      <h4 class="h6">The Foundation</h4>
      <li><a href="#">About the Foundation</a></li>
      <li><a href="#">Board of Directors | Team</a></li>
      <li><a href="#">Bertelsmann Stiftung</a></li>
      <li><a href="#">Contact</a></li>
      <li><a href="#">Privacy Policy</a></li>
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
  </footer>
</template>

<script setup>

</script>

<style scoped>

/* Footer Layout - SubGrid */
.footer {
  grid-column: content-start / content-end;
  display: grid;
  grid-template-columns: subgrid;
}

ul, div {
  padding-block-start: var(--space-s-l);
  @media (max-width: 769px) {
    grid-template-columns: subgrid;
    grid-column: inherit;
  }
}

ul {
  @media (min-width: 769px) { grid-column: span 1; }
}

/* Footer Skin */
.footer {
  padding-block: var(--space-xl);
  
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