<template>
  <footer class="footer">
    <ul>
      <h4>Topics</h4>
      <li><a href="#">Democracy</a></li>
      <li><a href="#">Politics & Society</a></li>
      <li><a href="#">Digital World</a></li>
    </ul>
    
    <ul>
      <h4>The Foundation</h4>
      <li><a href="#">About the Foundation</a></li>
      <li><a href="#">Board of Directors | Team</a></li>
      <li><a href="#">Bertelsmann Stiftung</a></li>
      <li><a href="#">Contact</a></li>
      <li><a href="#">Privacy Policy</a></li>
    </ul>
        
    <ul>
      <h4>Updates</h4>
      <li><a href="#">Publications</a></li>
      <li><a href="#">Infographics</a></li>
      <li><a href="#">Videos</a></li>
    </ul>

    <div>
      <p>Bertelsmann Foundation documentaries focus on governance, economics, elections, social issues, the digital revolution, and most importantly, where these issues intersect.</p>
      <div class="cluster">
        <a href="#">LOGO</a>
        <a href="#">LOGO</a>
      </div>
    </div>
      
    <div class="by-line | cluster">
      <span>© 2025 BFNA</span><span>Privacy</span><span>Terms</span>
      <a href="#" split-left>by ccm.design</a>
    </div>
  </footer>
</template>

<script setup>

</script>

<style scoped>

/* Footer Layout - SubGrid */
.footer {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: content-start / content-end;
  grid-template-rows: auto auto;
}

ul {
  grid-column: content-start / content-end;
  @media (min-width: 321px) and (max-width: 768px) { grid-column: span 2; }
  @media (min-width: 769px) { grid-column: span 1; }
  list-style: none;
  padding: 0;
  margin: 0;
}

.by-line { grid-column: content-start / content-end; }

/* Footer Skin */
.footer {
  padding-block: var(--space-xl) var(--space-l);
}


</style>