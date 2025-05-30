<template>
  <ol class="docs-list | subgrid | stack">
    <slot>
      <li class="docs-list__item | subgrid" v-for="item in items" :key="item.id">
        <docs-card thumbnail class="docs-list__item-thumbnail"/>
        <div class="docs-list__item-text | stack">
          <h3 class="font-size:-1 font-weight:600">{{ item.title }}</h3>
          <p class="font-size:-1">{{ item.description }}</p>
        </div>
        <div class="docs-list__item-meta | cluster">
          <docs-meta>{{ item.timestamp }}</docs-meta>
          <docs-meta>{{ item.year }}</docs-meta>
        </div>
      </li>
    </slot>
  </ol>
</template>

<style scoped>

ol {
  list-style: decimal;
  list-style-position: inside;
  padding-inline-start: 0;
}

.docs-list {
  --_stack-space: var(--space-2xs);
}

.docs-list__item {
  display: grid;
  grid-template-columns: 140px 1fr 110px;
  grid-template-areas: "thumbnail text meta";
  align-items: center;
  gap: var(--space-s);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--white-color-07-shade);
  padding: var(--space-2xs);
  border-radius: var(--border-radius-m);
  border: 1px solid transparent;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.docs-list__item:hover {
  background-color: var(--white-color-10-shade);
  border-color: var(--white-color-30-shade);
  transform: scale(1.02);
}

.docs-list__item-thumbnail {
  grid-area: thumbnail;
  border-radius: var(--border-radius-s) !important;
  /* width: 100%; */
  /* aspect-ratio: 16/9; */
}

.docs-list__item-text {
  grid-area: text;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  --_stack-space: var(--space-3xs);
}

.docs-list__item-meta { 
  grid-area: meta; 
  --_cluster-space: var(--space-2xs);
  justify-content: flex-end;
}

</style>


<script setup>
  const items = [
    { 
      id: 1, 
      title: 'Out to Vote', 
      description: 'After winning a fight to restore voting rights for formerly incarcerated people on parole or probation, returning citizens Bobby Perkins, Nicole Hanson-Mundell and Monica Cooper go all-in to get out the vote in Baltimore, Maryland. 1' ,
      year: '2021',
      timestamp: '12:00'

    },
    { 
      id: 2, 
      title: 'Rising Voices',
      description: 'In this episode from the Bertelsmann Foundation’s democracy in cities series, *Rising Voices*, we explore tactics and strategies to engage students as young as five-years-old in local democracy. Set in Vienna, Austria, we follow the work of WienXtra and the City Council of Vienna as they work with children and young adults to reshape their city and solve the challenges that Viennese residents, regardless of demographic, all share. From complex endeavors such as improving the city’s transit system to something as simple as planting trees, *Rising Voices* provides insights and solutions that can be replicated on both sides of the Atlantic and beyond.',
      year: '2021',
      timestamp: '12:00'
    },  
    { 
      id: 3, 
      title: 'Local 1196: A Steelworkers Strike',
      description: 'Local 1196 takes the viewer on the ground as days on strike turn to weeks, weeks turn to months, and union leaders realize they’re playing with a short stack, and against long odds.',
      year: '2021',
      timestamp: '12:00'
    },
    { 
      id: 4, 
      title: 'The People’s Choice',
      description: 'From the badlands of Juarez to remote indigenous territories of Oaxaca, this documentary tracks the rise of Morena, and what it means for the future of Mexican democracy.',
      year: '2021',
      timestamp: '12:00'
    },
  ]
</script>
