<script setup>
import { ref, computed } from 'vue'

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

const backgroundStyle = computed(() => {
  
  return {
    backgroundImage: `url('${props.resource.type === 'pdf' ?  '/assets/pdf.jpg': props.resource.url }')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

</script>

<template>
  <nuxt-link
    class="card"
    :to="resource.url"
    external
    target="_blank"
    tabindex="0"
  >
    <div class="card__video card__video--bg" :style="backgroundStyle"></div>
    <slot name="content">
      <div class="card__content | stack">
        <h2 class="card__title">
          {{ resource.title }}
        </h2>
        <div class="card__meta | cluster">
          <docs-meta>{{ resource.type.toUpperCase() }}</docs-meta>
          <docs-meta>{{ resource.size }}</docs-meta>
        </div>
      </div>
    </slot>
  </nuxt-link>
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
  font-size: var(--size-0);
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
    grid-column: span 3;
    transform-origin: top left;
  }
}

.card:hover {
  position: relative;
  z-index: 10;
  transform: scale(1.25);
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
  
  .card__content {
    padding: var(--space-xs);
    h2 { font-size: var(--size--3); }
  }

  .card__meta {
    font-size: var(--size--3);
  }
  
}


</style>
