<script setup>
import { ref, computed } from 'vue'

const { slugify } = useSlugify();

const props = defineProps({
  resource: {
    type: Object,
    default: () => ({
      id: '234khjn6-45sdfvklj-2345',
      title: 'Card Title',
      type: 'image',
      size: '1.2 MB',
      url: '',
    })
  }
})

const isPdf = computed(() => {
  const t = props.resource?.type || ''
  return t === 'application/pdf' || t === 'pdf' || (t === 'file' && (props.resource?.extension || '').toLowerCase() === 'pdf')
})
const pdfBackgroundStyle = computed(() => {
  let url = props.resource?.url || ''
  if (isPdf.value) {
    url = props.resource?.guideCover || ''
    if (!url || url === '/assets/guidecovers/.webp') url = '/assets/cicle_link.png'
  }
  return {
    backgroundImage: `url('${url || '/assets/pdf.jpg'}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

const getLinkBackgroundImage = (item) => {
  return {
    backgroundImage: `url('${item.title.length > 0 ? item.cover : '/assets/pdf.jpg' }')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}

const hasLinks = computed(() => Array.isArray(props.resource?.links) && props.resource.links.length > 0)
const fileType = computed(() => {
  if (hasLinks.value) return 'LINK'
  const t = (props.resource?.type || 'file').toUpperCase()
  return t.replace('APPLICATION/', '')
})

</script>

<template>
  <nuxt-link v-if="!hasLinks"
    class="card"
    :to="resource.url || '#'"
    external
    target="_blank"
    tabindex="0"
    :aria-label="resource.title || 'View resource'"
  >
    <div class="card__video card__video--bg card__poster" :style="pdfBackgroundStyle"></div>
    <slot name="content">
      <div class="card__content | stack">
        <h4 class="card__title">
          {{ resource.title }}
        </h4>
        <div class="card__meta | cluster">
          <docs-meta>{{ fileType }}</docs-meta>
        </div>
      </div>
    </slot>
  </nuxt-link>
  <template v-else>
    <nuxt-link v-for="link in (resource.links || [])" :key="link.id"
      class="card"
      :to="link.link || '#'"
      external
      target="_blank"
      tabindex="0"
      :aria-label="link.title || 'View link'"
    >
      <div class="card__video card__video--bg card__poster" :style="getLinkBackgroundImage(link)"></div>
      <slot name="content">
        <div class="card__content | stack">
          <h4 class="card__title">
            {{ link.title }}
          </h4>
          <div class="card__meta | cluster">
            <docs-meta>{{ fileType }}</docs-meta>
          </div>
        </div>
      </slot>
    </nuxt-link>
  </template>
</template>

<style scoped>

.card {
  width: 100%;
  border-radius: var(--border-radius-m);
  cursor: pointer;
  text-decoration: none;
  color: var(--white-color);

}

.card__content {
  --_stack-space: var(--space-3xs);
}

.card__video {
  width: 100%;
  object-fit: cover;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--border-radius-m);

}

.card__title a {
  font-size: medium;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0;
  text-decoration: none;
  color: var(--white-color);
}

.card {
  transition: all 0.3s ease-in-out;
  gap: var(--space-3xs-2xs);
  
  @media (max-width: 320px) { 
    grid-column: content-start / content-end; 
  }
  @media (min-width: 321px) and (max-width: 768px) { grid-column: span 6; }

  @media (min-width: 769px) {
    grid-column: span 2;
    transform-origin: top left;
  }
}

.card:hover {
  position: relative;
  z-index: 10;
  transform: scale(1.1);
  background-color: var(--white-color-10-shade);
  border-radius: 0 0 var(--border-radius-m) var(--border-radius-m);
  
  .card__video {
    border: 1px solid var(--white-color);
    border-radius: var(--border-radius-m) var(--border-radius-m) 0 0;
    
    box-shadow: 
      0 0 20px 0 rgba(255, 255, 255, 0.1),
      0 0 10px 0 rgba(255, 255, 255, 0.5),
      0 0 4px 0 rgba(255, 255, 255, 0.5)
      ;
  }
  
  /* .card__content {
    padding: var(--space-xs);
    h2 { font-size: var(--size--3); }
  }

  .card__meta {
    font-size: var(--size--3);
  } */
  
}

.card__poster {
  width: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-m);
  aspect-ratio: 1/1.42;

  &:hover {
    border: solid 2px var(--white-color);
  }
}


</style>
