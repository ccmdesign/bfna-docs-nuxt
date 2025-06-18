<script setup>
import { useVideoStore } from '~/stores/video';

const { filterItems, setFilterOptions } = useVideoStore();

const sortVal = ref("recent");
const handleSort = () => {
  sortVal.value = sortVal.value === "recent" ? "oldest" : "recent";
  handleFilterSelection()
}

const workstream = ref("all");
const handleWorkstreamFilter = (event) => {
  const selectedWorkstream = event ? event.target.value : workstream.value;
  workstream.value = selectedWorkstream;
  handleFilterSelection();
};

const durationRange = ref("all");
const handleDurationRangeFilter = (event) => {
  const selectedRange = event ? event.target.value : durationRange.value;
  durationRange.value = selectedRange;
  handleFilterSelection();
};

const handleFilterSelection = () => {
  setFilterOptions({
    workstream: workstream.value,
    sort: sortVal.value === "recent" ? "desc" : "asc",
    durationRange: durationRange.value
  });
}


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

const durationRangeOptions = [
  { label: "0-15 mins", value: "0-15" },
  { label: "15-30 mins", value: "15-30" },
  { label: "30+ mins", value: "30" }
];

</script>

<template>
  <section class="docs-tools | subgrid">
    <slot>
      <div class="cluster">
        <h2 class="h4" split-right>All Documentaries</h2>
        
        <docs-select size="s" @change="handleWorkstreamFilter">
          <option class="select-options" value="all">All Docs</option>
          <option class="select-options" v-for="key in filterItems.workstreams" :value="key" :key="key">{{ getWorkspaceNameFromKey(key) }}</option>
          <!-- <option value="documentary">Documentary</option>
          <option value="fiction">Fiction</option>
          <option value="animation">Animation</option> -->
        </docs-select>

        <docs-select size="s" @change="handleDurationRangeFilter">
          <option class="select-options" value="all">Duration Range</option>
          <option class="select-options" v-for="item in durationRangeOptions" :value="item.value" :key="item.value">{{ item.label }}</option>
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
