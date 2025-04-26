<template>
<section class="footer-section">
  <div class="footer">
    <div class="footer__half | footer__map">
      <div class="footer__col">
        <nav class="footer__nav footer--topics">
          <h2 class="footer__heading">Topics</h2>
          <a href="https://www.bfna.org/democracy/" class="footer__item"
            >Democracy</a
          ><br />
          <a href="https://www.bfna.org/future-leadership/" class="footer__item"
            >Future Leadership</a
          ><br />
          <a
            href="https://www.bfna.org/digital-world/"
            class="footer__item"
            >Digital World</a
          ><br />
          <a
            href="https://www.bfna.org/politics-society/"
            class="footer__item"
            >Politics & Society</a
          ><br />
        </nav>
      </div>
      <div class="footer__col">
        <nav class="footer__nav footer--about">
          <h2 class="footer__heading">The Foundation</h2>
          <a href="https://www.bfna.org/about" class="footer__item"
            >About the Foundation</a
          ><br />
          <a href="https://www.bfna.org/team" class="footer__item"
            >Board of Directors | Team</a
          ><br />
          <a
            href="https://www.bfna.org/bertelsmann-stiftung"
            class="footer__item"
            >Bertelsmann Stiftung</a
          ><br />
          <a
            href="mailto: info@bfna.org"
            target="_blank"
            class="footer__item"
            >Contact</a
          ><br />
          <a href="https://www.bfna.org/privacy-policy" class="footer__item"
            >Privacy Policy</a
          >
        </nav>
      </div>
      <div class="footer__col">
        <nav class="footer__nav footer--updates">
          <h2 class="footer__heading">Updates</h2>
          <a
            href="https://www.bfna.org/updates/index.html#publications"
            class="footer__item"
            >Publications</a
          ><br />
          <a
            href="https://www.bfna.org/updates/index.html#infographics"
            class="footer__item"
            >Infographics</a
          ><br />
          <a
            href="https://www.bfna.org/updates/index.html#videos"
            class="footer__item"
            >Videos</a
          ><br />
        </nav>
      </div>
    </div>
    <div class="footer__half | footer__about">
      <p class="footer__about-text">Bertelsmann Foundation documentaries focus on governance, economics, elections, social issues, the digital revolution, and most importantly, where these issues intersect.</p>
      <div class="footer__logos">
        <a href="https://www.bfna.org/" target="_blank" class="router-link-exact-active router-link-active"><img src="../assets/bertelsmann-logo.png" alt="Bertelsmann Foundation" class="footer__bfna" /></a>
        <NuxtLink to="/"><img src="../assets/bfna-documentaries-logo.png" alt="Bertelsmann Foundation Documentaries" class="footer__doc" /></NuxtLink>
      </div>
    </div>
  </div>
  <div class="ccm-footer">
    <a href="https://www.ccmdesign.ca/" class="ccm-footer__link">by ccm.design</a>
  </div>
</section>
</template>

<style lang="scss" scoped>
.footer-section {
  position: relative;
  @media (max-width:768px) {
    padding-bottom: 54px;
    border-top: 1px solid #282F3A;
  }
}

.footer {
  background: #0C0C0C;
  padding: 90px 10%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  @media (max-width:768px) {
    flex-direction: column;
    padding: 32px 40px 77px;
  }
  a {
    color: #FFF;
    text-decoration: none;
    &:hover, &:focus, &:active {
      text-decoration: none;
      color: #FFF;
    }
  }
}

  .footer__map {
    display: flex;
    flex-flow: row nowrap;
    @media (max-width:768px) {
      flex-direction: column;
    }
  }

    .footer__col {
      margin-right: 86px;
      @media (max-width:768px) {
        margin-right: 0;
        margin-bottom: 42px;
      }
    }

    .footer__heading {
      text-transform: uppercase;
      font-weight: 700;
      font-size: 0.75em;
      line-height: 1em;
      margin-bottom: 16px;
    }

    .footer__item {
      font-weight: 400;
      font-size: 1em;
      line-height: 1.62em;
    }

  .footer__about {
    padding-left: 86px;
    border-left: 1px solid #2F2F2F;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
    width: 45%;
    @media (max-width: 1460px) {
      width: 37%;
    }
    @media (max-width:768px) {
      width: 100%;
      border: none;
      padding-left: 0;
    }
  }

    .footer__about-text {
      font-size: 0.875em;
      line-height: 1.22em;
      font-weight: 400;
      @media (max-width:768px) {
        padding-bottom: 42px;
      }
    }

    .footer__bfna {
      width: min(177px, calc(49% - 15px));
      margin-right: 30px;
      @media (max-width:768px) {
        width: min(177px, 60%);
        padding-bottom: 34px;
      }
    }

    .footer__doc {
      width: min(233px, calc(49% - 15px));
      @media (max-width:768px) {
        width: min(233px, 60%);
      }
    }

.ccm-footer {
  background: #000;
  padding: 8px 48px;
  text-align: right;
}

  .ccm-footer__link {
    color: #949494;
    text-decoration: none;
    font-size: 0.625em;
    line-height: 1.4em;
    &:hover, &:focus, &:active {
      text-decoration: none;
      color: #949494;
    }
  }
</style>

<script>
export default {
  computed: {
  },
  methods: {
  },
};
</script>
