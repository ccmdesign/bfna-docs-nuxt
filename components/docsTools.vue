<script setup>
import { useVideoStore } from '~/stores/video';

const { filterItems, setFilterOptions } = useVideoStore();
// const { filters } = storeToRefs(videoStore);


const sortVal = ref("recent");
const handleSort = () => {
  sortVal.value = sortVal.value === "recent" ? "oldest" : "recent";
  handleWorkstreamFilter()
}

const workstream = ref("all");
const handleWorkstreamFilter = (event) => {
  const selectedWorkstream = event ? event.target.value : workstream.value;
  workstream.value = selectedWorkstream;
  setFilterOptions({
    workstream: selectedWorkstream,
    sort: sortVal.value === "recent" ? "desc" : "asc"
  });
};


const getSortNameFromKey = (sortkey) => {
  switch (sortkey) {
    case "recent":
      return "Recent";
    case "oldest":
      return "Oldest";
    default:
      return "Recent";
  }
};

const getWorkspaceNameFromKey = (workspaceKey) => {
  switch (workspaceKey) {
    case "democracy":
      return "Democracy";
    case "future-of-work":
      return "Future Leadership";
    case "future-leadership":
      return "Future Leadership";
    case "digital-economy":
      return "Digital World";
    case "politics-society":
      return "Politics & Society";
    default:
      return "";
  }
};

</script>

<template>
  <section class="docs-tools | subgrid">
    <slot>
      <div class="cluster">
        <h2 class="h4" split-right>All Documentaries</h2>
        
        <docs-select size="s" @change="handleWorkstreamFilter">
          <option class="select-options" value="all">All</option>
          <option class="select-options" v-for="key in filterItems.workstreams" :value="key" :key="key">{{ getWorkspaceNameFromKey(key) }}</option>
          <!-- <option value="documentary">Documentary</option>
          <option value="fiction">Fiction</option>
          <option value="animation">Animation</option> -->
        </docs-select>

        <!-- <docs-button>All Duration Range</docs-button> -->
        <docs-button class="sort" data-sort="year" @click="handleSort">Sorted by: {{ getSortNameFromKey(sortVal) }}</docs-button>
      </div>
    </slot>
  </section>
</template>

<style scoped>

.docs-tools {
  grid-column: content-start / content-end;
  padding-block-start: var(--space-s-xl);
}

.select-options {
  background-color: var(--white-color-10-shade);
  font-size: var(--font-size-s);
}

</style>
