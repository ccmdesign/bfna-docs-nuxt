<template>
  <div class="homepage" :class="{ animated : animate }">
    <h1 class="sr-only">{{ currentVideo.title }}</h1>
    <div
      class="homepage__slider__background--large"
      :style="`background-image: url('${currentVideo.backgroundImage}')`"
    ></div>
    <VideoDescription open="true" />
    <div class="award-list" :class="{ animated : animate }">
      <div class="award"  v-for="award in currentVideo.awards" :key="award.id">
        <div class="award__tip"></div>
        <div class="award__info">
          <img src="../assets/award_icon.png" alt="Icon badge" class="award__icon">
          <span class="award__separator"></span>
          <div class="award__data">
            <p class="award__title">{{ award.title }}</p>
            <p class="award__text">{{ award.year }}<span v-if="award.institution"> - {{ award.institution }}</span></p>
          </div>
        </div>
      </div>
    </div>
    <navigation-bar v-if="getUIType() === 'large'" />
    <menu-ui v-if="getUIType() === 'large'"  />
    <div class="homepage__list-bar" :class="{ animated : animate }">
      <div class="video-list__screenings-section | content-info" v-if="currentVideo.screenings && currentVideo.screenings.length > 0">
        <h2 class="section-title">Upcoming Screenings</h2>
        <div class="screenings-list">
          <div class="screening-card" v-for="screen in currentVideo.screenings" :key="screen.id">
            <div class="screening-card__info">
              <div class="screening-card__title">
                <span class="screening-card__badge screening-card__badge--available" v-if="screen.availability">Available</span>
                <span class="screening-card__badge screening-card__badge--soldout" v-else>Sold out</span>
                <p class="screening-card__day">{{ new Date(screen.dateStart).getDate() }}</p>
                <div class="screening-card__datebox">
                  <p class="screening-card__month">
                    {{ monthNames[new Date(screen.dateStart).getMonth()] }}
                  </p>
                  <p class="screening-card__hours">
                    {{ gimmeHours(new Date(screen.dateStart)) }} - {{ gimmeHours(new Date(screen.dateEnd)) }} 
                  </p>
                </div>
              </div>
              <div class="screening-card__description">
                <a :href="screen.estabilishmentURL" target="_blank" class="screening-card__estabilishment" v-if="screen.estabilishmentURL">{{ screen.estabilishment }}</a>
                <p class="screening-card__estabilishment" v-else>{{ screen.estabilishment }}</p>
                <p class="screening-card__place">{{ screen.place }}</p>
              </div>
            </div>
            <div class="screening-card__link">
              <a :href="screen.ticketsURL" target="_blank" class="screening-card__button" v-if="screen.availability">Get tickets</a>
              <a class="screening-card__button screening-card__button--disabled" disabled v-else>Sold out</a>
            </div>
          </div>
        </div>
      </div>
      <div class="video-list__video-info | content-info" v-if="currentVideo.video_info && Object.keys(currentVideo.video_info).length > 0 ">
        <h2 class="section-title">Film Info</h2>
        <div class="video-info">
          <div class="video-info__media">
            <a href="#" @click.prevent="openVideo(currentVideo.video_info.teaser_url, currentVideo.video_info.teaser_source)" class="video-info__trailer | trailer-thumb" :style="'background-image: url('+currentVideo.video_info.thumb+')'" v-if="currentVideo.video_info.teaser_url">{{ currentVideo.video_info.title }}</a>
            <img class="video-info__screenshot" :src="currentVideo.video_info.screenshot" :alt="'Screenshot from '+currentVideo.title" v-if="currentVideo.video_info.screenshot">
            <img v-for="shot in currentVideo.video_info.screenshot_extras" :key="shot.id" class="video-info__screenshot" :src="shot.url" :alt="shot.title">
          </div>
          <div class="video-info__description">
            <h3 class="video_info__title">{{ currentVideo.video_info.column_1_title }}</h3>
            <p class="video-info__text">{{ currentVideo.video_info.column_1_text }}</p>
          </div>
          <div class="video-info__description" v-if="currentVideo.video_info.column_2_title || currentVideo.video_info.column_2_text">
            <h3 class="video_info__title" v-if="currentVideo.video_info.column_2_title">{{ currentVideo.video_info.column_2_title }}</h3>
            <p class="video-info__text" v-if="currentVideo.video_info.column_2_text">{{ currentVideo.video_info.column_2_text }}</p>
          </div>
        </div>
      </div>
      <div class="video-list__resources-section | content-info" v-if="currentVideo.resources && currentVideo.resources.length > 0">
        <h2 class="section-title">Resources</h2>
        <div class="resource-list">
          <div class="resource-list__resource | resource-card" v-for="resource in currentVideo.resources" :key="resource.id">
            <div class="resource-card__header">
              <template>
                <img src="../assets/cicle_link.png" alt="Link" class="resource-card__icon" v-if="resource.type == 'link'">
                <img src="../assets/cicle_pdf.png" alt="Link" class="resource-card__icon" v-else-if="resource.type == 'pdf'">
                <img src="../assets/cicle_doc.png" alt="Link" class="resource-card__icon" v-else-if="resource.type == 'doc'">
                <img src="../assets/cicle_img.png" alt="Link" class="resource-card__icon" v-else-if="resource.type == 'image'">
                <img src="../assets/cicle_video.png" alt="Link" class="resource-card__icon" v-else-if="resource.type == 'video'">
                <img src="../assets/cicle_zip.png" alt="Link" class="resource-card__icon" v-else-if="resource.type == 'zip'">
                <img src="../assets/cicle_file.png" alt="Link" class="resource-card__icon" v-else>
              </template>
              <div class="resource-card__main">
                <h3 class="resource-card__title">{{ resource.title }}</h3>
                <div class="resource-card__extra" v-if="resource.type == 'link'">Weblink</div>
                <div class="resource-card__extra" v-else>{{ resource.extension }} file, {{ resource.size }}</div>
              </div>
            </div>
            <div class="resource-card__body">
              <p class="resource-card__text">{{ resource.description }}</p>
              <a :href="resource.url" target="_blank" class="resource-card__button" v-if="resource.type == 'link'">Access</a>
              <a :href="resource.url" download class="resource-card__button" v-else>Download</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.section-title {
  color: #FFF;
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 42px;
  @media (max-width:768px) {
    padding: 0 24px;
    font-size: 2em;
  }
}

.video-list__screenings-section {
  padding-bottom: 128px;
  @media (max-width: 768px) {
    padding-bottom: 64px;
  }
}

.screenings-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    @media (max-width: 1660px) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (max-width: 768px) {
      scroll-snap-type: x mandatory;
      overflow-x: auto;
      padding: 0 24px;
    }
}

.screening-card {
  background: #0B0D0E;
  box-shadow: 4px 4px 4px 0px rgba(0,0,0,0.2);
  padding: 0;
  color: #EAEBED;
  @media (max-width: 768px) {
    width: calc(100vw - 75px);
    scroll-snap-align: center;
    border: 1px solid rgba(255,255,255,0.25)
  }
}

  .screening-card__info {
    padding: 24px 24px 40px;
    border-bottom: 2px dashed #282F3A;
  }

  .screening-card__title {
    position: relative;
    padding-bottom: 24px;
    border-bottom: 1px solid #282F3A;
    display: flex;
    p {
      margin: 0;
    }
    .screening-card__day {
      margin-right: 24px;
    }
  }

  .screening-card__badge {
    position: absolute;
    top: 0;
    right: 0;
    color: #FFF;
    font-size: 0.75em;
    font-weight: 700;
    text-transform: uppercase;
    &.screening-card__badge--available {
      color: #3CFF95;
    }
    &.screening-card__badge--soldout {
      color: #FF8979;
    }
    @media (max-width: 768px) {
      font-size: 0.625em;
    }
  }

  .screening-card__datebox {
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
  }

  .screening-card__day {
    font-weight: 700;
    font-size: 3.5em;
    line-height: 1em;
    @media (max-width: 768px) {
      font-size: 2.875em;
    }
  }

  .screening-card__month {
    color: #D2D4DA;
    font-weight: 700;
    font-size: 1.125em;
    letter-spacing: 0.02em;
    @media (max-width: 768px) {
      font-size: 0.875em;
    }
  }

  .screening-card__hours {
    font-weight: 700;
    font-size: 1.125em;
    letter-spacing: 0.02em;
    @media (max-width: 768px) {
      font-size: 0.875em;
    }
  }

  .screening-card__description {
    padding-top: 24px;
    p {
      margin: 0;
    }
  }

  .screening-card__estabilishment {
    font-weight: bold;
    color: #EAEBED;
    @media (max-width: 768px) {
      font-size: 0.875em;
    }
    &:hover, &:focus, &:active {
      color: #EAEBED;
    }
  }

  .screening-card__place {
    font-weight: 400;
    color: #D2D4DA;
    @media (max-width: 768px) {
      font-size: 0.875em;
    }
  }

  .screening-card__link {
    padding: 24px;
    display: flex;
    justify-content: center;
  }

  .screening-card__button,
  .resource-card__button {
    display: block;
    width: 180px;
    height: 46px;
    line-height: 46px;
    text-transform: uppercase;
    font-weight: 700;
    border: 3.125px solid #C2C5CD;
    text-align: center;
    box-sizing: content-box;
    @media (max-width: 768px) {
      font-size: 0.875em;
      height: 37px;
      line-height: 37px;
      width: 140px;
    }
    &:not(.screening-card__button--disabled) {
      color: #FCFCFC;
      &:hover, &:focus, &:active {
        outline: none;
        text-decoration: none;
        color: #000;
        background: #FCFCFC;
        border-color: #FCFCFC;
      }
    }
    &.screening-card__button--disabled {
      color: #D2D4DA;
      border-color: #676A73;
    }
  }

.video-list__video-info {
  padding-bottom: 128px;
  @media (max-width:768px) {
    padding-bottom: 64px;
  }
}

.video-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 64px;
    @media (max-width:768px) {
      grid-template-columns: repeat(1, 1fr);
      padding: 0 24px;
    }
}

  .video-info__screenshot {
    width: 100%;
    &:not(:last-child) {
      margin-bottom: 32px;
    }
  }

  .video_info__title {
    font-weight: 700;
    font-size: 2em;
    line-height: 1em;
    margin-bottom: 16px;
    @media (max-width:768px) {
      font-size: 1.5em;
    }
  }

  .video-info__text {
    white-space: pre-wrap;
    font-size: 1em;
    font-weight: 400;
  }

.trailer-thumb {
  width: 100%;
  aspect-ratio: 16/9;
  background-size: cover;
  background-position: center;
  position: relative;
  display: block;
  padding: 26px 20px;
  color: #FFF;
  font-weight: 700;
  font-size: 1.5em;
  letter-spacing: 0.02em;
  margin-bottom: 32px;
  &:hover, &:active, &:focus {
    color: #FFF;
    text-decoration: none;
    &:after {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }
  &:after {
    content: '';
    width: 112px;
    height: 112px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: transform 0.2s ease-in-out;
    background-image: url('../assets/play-icon.png');
    background-position: center;
    background-size: contain;
  }
}



.video-list__resources-section {
  padding-bottom: 128px;
  @media (max-width:768px) {
    padding-bottom: 64px;
  }
}

.resource-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    @media (max-width:768px) {
      scroll-snap-type: x mandatory;
      grid-template-columns: repeat(100, 1fr);
      padding: 0 24px;
      overflow-x: auto;
    }
}

.resource-card {
  background: #0B0D0E;
  box-shadow: 4px 4px 4px 0px rgba(0,0,0,0.2);
  padding: 32px 24px 24px;
  color: #EAEBED;
  display: flex;
  flex-flow: column nowrap;
  @media (max-width: 768px) {
    width: calc(100vw - 75px);
    scroll-snap-align: center;
    border: 1px solid rgba(255,255,255,0.25)
  }
}

  .resource-card__header {
    border-bottom: 1px solid #282F3A;
    padding-bottom: 16px;
    display: flex;
    flex-flow: row nowrap;
  }

  .resource-card__icon {
    width: 48px;
    height: 48px;
    margin-right: 15px;
    @media (max-width: 768px) {
      width: 40px;
      height: 40px;
      margin-right: 13px;
    }
  }

  .resource-card__main {
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
  }

  .resource-card__title {
    font-size: 1.125em;
    font-weight: 700;
    line-height: 1em;
    letter-spacing: 0.02em;
    margin: 0;
    @media (max-width: 768px) {
      font-size: 1em;
    }
  }

  .resource-card__extra {
    font-size: 1.125em;
    font-weight: 400;
    line-height: 1em;
    margin: 0;
    @media (max-width: 768px) {
      font-size: 1em;
    }
  }

  .resource-card__body {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    padding-top: 16px;
    flex-grow: 1;
  }

  .resource-card__text {
    width: 100%;
    flex-grow: 1;
    @media (max-width: 768px) {
      font-size: 0.875em;
    }
  }

.award-list {
  position: absolute;
  top: 115px;
  right: 0;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-end;
  overflow: hidden;
  @media (max-width: 768px) {
    display: none;    
  } 
}

  .award {
    margin-bottom: 10px;
    min-width: 360px;
    display: flex;
    transition: transform 0.3s ease-in-out;
    transform: translateX(100%);
  }
  .award-list.animated{
    .award {
      transform: translateX(calc(100% - 340px));
      &:hover {
        transform: translateX(20px);
      }
    }
  }

    .award__tip {
      width: 0; 
      height: 0; 
      border-top: 30px solid transparent;
      border-bottom: 30px solid transparent; 
      border-right: 22px solid #000; 
    }

    .award__info {
      background: #000;
      height: 60px;
      flex-grow: 1;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      padding: 0 45px 0 10px;
    }

    .award__separator {
      width: 1px;
      height: 44px;
      margin: 0 16px;
      background: #464646;
    }

    .award__title {
      font-size: 1.125em;
      line-height: 1em;
      color: #FCC500;
      font-weight: 700;
      letter-spacing: 0.02em;
      margin: 0;
    }

    .award__text {
      font-size: 0.875em;
      font-weight: 400;
      line-height: 1.62em;
      color: #FFF;
      margin: 0;
    }


.homepage {
  position: relative;
  width: 100%;
  height: 100vh;
  @media (max-width: 768px) {
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    &.animated {
      opacity: 1;
    }
  }

  &__slider {
    width: 100%;
    height: 100vh;
  }

  &__list-bar {
    width: 100%;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
    padding: 0 170px;
    position: relative;
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,8,12,1) 30%, rgba(0,8,12,1) 100%);
    &.animated {
      opacity: 1;
    }

    &.opened {
      background-color: #01121ad9;
    }
    @media (max-width: 768px) {
      padding: 0;
      overflow: hidden;
      background: rgba(0,8,12,1);
    }

    &__section {
      display: block;
      width: 100%;

      &.button-section {
        position: relative;
        text-align: center;
        height: 60px;
      }

      &.videos-section {
        overflow-y: hidden;
        transition: max-height 0.33s ease-in-out;

        &.closed {
          max-height: 0 !important;

          .child {
            opacity: 0;
          }
        }

        .child {
          opacity: 1;
          transition: opacity 0.33s ease-in-out;
        }
      }
    }

    &__button {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: inline-block;
      padding: 12px;
      cursor: pointer;
      transition: all 0.33s ease-in-out;
      &:before {
        content: attr(data-text);
        font-size: 1.5rem;
        font-weight: bold;
        text-transform: uppercase;
      }
      &.opened {
        transform: translate(-50%, -50%) rotateZ(179deg) scale(1.2);
        &:before {
          @extend .material-icons;
          width: 24px;
        }
      }
    }

    &__by {
      position: absolute;
      top: 50%;
      right: 16px;
      transform: translateY(-50%);
      font-size: 0.75em;
      opacity: 0.33;
      color: rgba(255, 255, 255, 0.33);

      a:hover {
        text-decoration: none;
      }
    }
  }

  &__controls {
    z-index: 2;
    @extend .material-icons;
    position: absolute;
    background-color: #08415c;
    padding: 12px;
    font-size: 36px;
    box-shadow: 4px 4px 16px rgba(0, 0, 0, 0.25);
    top: 66%;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.33s ease-in-out, transform 0.33s ease-in-out;

    &.hidden {
      opacity: 0;
    }

    &--left {
      left: 0;
      margin-left: 28px;

      &.hidden {
        transform: translateX(-50px) translateY(5px);
      }
    }

    &--right {
      right: 0;

      &.hidden {
        transform: translateX(50px) translateY(5px);
      }
    }
  }
}
@media (max-width: 768px) {
  .full_content {
    padding: 0 24px;
    max-height: none;
  }
}
</style>

<script setup>
import { useRouter, useRoute } from "vue-router";
import utils from "~/composables/utils";

const router = useRouter();
const route = useRoute();
const id = computed(() => route.params.id);

// Rest of component logic to be refactored later
</script>

<script>
import Slide from "@/components/HomepageUILarge/Slide";
import VideoList from "@/components/HomepageUILarge/VideoList";
import NavigationBar from "@/components/HomepageUILarge/NavigationBar";
import MenuUI from "@/components/HomepageUILarge/Menu";
import VideoDescription from "@/components/HomepageUILarge/VideoDescription";
import Footer from "@/components/Footer"

export default {
  name: "documentaryInternal",
  components: {
    Footer,
    Slide,
    VideoList,
    NavigationBar,
    "menu-ui": MenuUI,
    VideoDescription,
  },
  data() {
    return {
      videoListMenu: false,
      videoListHeight: 0,
      animate: false,
      monthNames : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    };
  },
  computed: {
    videoList() {
      return this.$store.state.videoList;
    },
    currentIndex() {
      return this.$store.state.currentVideo;
    },
    hasVideos() {
      return this.$store.getters.hasVideos;
    },
    currentVideo() {
      return this.hasVideos
        ? this.videoList[this.currentIndex]
        : this.$store.getters.emptyEpisode;
    },
  },
  methods: {
    openVideo(url, source) {
      let videoId = ''
      if(source == 'youtube'){
        videoId = utils.getVideoIdFromYoutubeUrl(url)
      } else if(source == 'vimeo'){
        videoId = utils.getVideoIdFromVimeoUrl(url)
      }
      console.log(videoId)
      if (!videoId) {
        alert(
          `Couldn't play video:\nvideo ID not found in "${url}".`
        );
      }
      this.$store.commit("setHomepageVideoEffect", true);
      setTimeout(() => {
        this.$router.push({ name: "watchVideoId", params: { videoId, source } });
      }, 330);
    },
    onPageChange(newSlide) {
      this.setCurrentVideo(newSlide);
    },
    setCurrentVideo(index) {
      this.$store.commit("setCurrentVideo", index);
    },
    toggleVideoList() {
      this.videoListMenu = !this.videoListMenu;
    },
    closeVideoList() {
      this.videoListMenu = false;
    },
    getButtonText() {
      if(this.videoListMenu) {
        return 'keyboard_arrow_upward'
      } else {
        return 'All Films'
      }
    },
    gimmeHours(date) {
      return date.getHours() + ":" + ('0' + date.getMinutes()).slice(-2);
    },
    getURL(slug) {
      let url = false;
      this.videoList.forEach(el => {
        if(utils.slugify(el.title) == slug) {
          url = el.videoUrl;
        }
      });
      return url;
    },
    getUIType () {
      return document.documentElement.clientWidth >= 768 ? 'large' : 'small'
    },
  },
  mounted() {
    this.animate = true;
    window.setTimeout(() => {
      window.scroll({
        top: 200, 
        left: 0, 
        behavior: 'smooth'
      });
    }, 0);
  },
  watch: {
    videoList: function () {
      let url = this.getURL(this.$route.params.id);
      if(url) {
        this.$store.commit("setCurrentVideo", url);
      }
    },
  }
};
</script>
