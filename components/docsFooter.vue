<template>
  <footer class="footer | subgrid">
    <div class="footer__content">
      <div class="stack">
        <div class="cluster">
          <a class="footer__logo" href="#">
            <img src="/assets/bertelsmann-logo.png" alt="Bertelsmann Foundation" class="bfna-logo"/>
          </a>
          <a class="footer__logo" href="#">
            <img src="/assets/bfna-documentaries-logo.png" alt="BFNA Documentaries" class="bfna-documentaries-logo" />
          </a>
        </div>
        <p>Bertelsmann Foundation documentaries focus on governance, economics, elections, social issues, the digital revolution, and most importantly, where these issues intersect.</p>
      </div>
      <ul>
        <h4 class="h6">Bertelsmann Foundation Documentaries</h4>
        <span class="divider"></span>
        <li><a href="/about" target="_blank">About</a></li>
        <li><a href="https://www.bfna.org/" target="_blank">Visit the Bertelsmann Foundation</a></li>
        <li><a href="https://www.bfna.org/team/#board_of_directors" target="_blank">Board of Directors | Team</a></li>
        <li><a href="https://www.bfna.org/bertelsmann-stiftung/" target="_blank">Bertelsmann Stiftung</a></li>
        <!-- <li><a href="/assets/Privacy-Policy.pdf" rel="noopener" target="_blank">Privacy Policy</a></li> -->
        <!-- <by-line /> -->
      </ul>
    </div>
    <by-line class="by-line" />
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
  @media (min-width: 769px) { 
    grid-column: 8 / 14; 
  }
}

ul:first-child {
  @media (min-width: 769px) { grid-column: span 4 }
}

div {
  @media (min-width: 769px) { grid-column: span 4; }
}

/* Footer Skin */
.footer {
  padding-block: var(--space-l) var(--space-l);
  
  p, li { font-size: var(--size--1); }
  h4 { padding-block-end: var(--space-2xs-xs); }
}

ul {
  list-style: none;
  padding-inline: 0;
  margin: 0;
}



.footer__logo {
  max-width: calc(50% - var(--space-m));

  @media (min-width: 321px) and (max-width: 768px) {
    max-width: 120px;
  }

  @media (min-width: 1025px) {
    max-width: 150px;
  }
}

img {
  max-width: 100%;
}

.bfna-logo { max-width: 110px; }
.bfna-documentaries-logo {
  @media (min-width: 769px) {
    transform: translateY(10px);
  }
}

.divider {
  border-top: 1px solid var(--black-color-80-tint);
  margin-bottom: var(--space-s);
  display: block;
}

.by-line {
  grid-column: content-start / content-end;
  grid-row: 10 / 11;
  z-index: 1;
}
</style>