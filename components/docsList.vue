<template>
  <div class="docs-list">
    <slot>
      <div class="docs-list__item" v-for="item in items" :key="item.id">
        <docs-card class="docs-list__item-thumbnail"/>
        <div class="docs-list__item-text">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
        <div class="docs-list__item-meta">
          <p>{{ item.year }}</p>
          <p>{{ item.timestamp }}</p>
        </div>
      </div>
    </slot>
  </div>
</template>

<style scoped>
.docs-list {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: content-start / content-end;
}

.docs-list__item {
  grid-column: span 2;
  display: grid;
  
  grid-template-columns: subgrid;
  align-items: start;
  
  @media (max-width: 768px) {
    grid-template-rows: auto 1fr;
    grid-template-areas: 
      "thumbnail thumbnail"
      "text text"
      "meta meta";
  }
  
  @media (min-width: 768px) {
    grid-column: span 4;
    grid-template-columns: 120px 1fr 80px;
    grid-template-areas: "thumbnail text meta";
  }
}

.docs-list__item-thumbnail { 
  grid-area: thumbnail;
  width: 100%;
  aspect-ratio: 16/9;
}
.docs-list__item-text {
  grid-area: text;
  align-items: start;
}
.docs-list__item-meta { grid-area: meta; }

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
