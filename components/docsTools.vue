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
      return "Most Recent";
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

const isMobile = ref(false);
function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});


const showMobileFilters = ref(true);
const handleDisplayMobileFilters = () => {
  showMobileFilters.value = !showMobileFilters.value;

  if (showMobileFilters.value) {
    workstream.value = "all";
    durationRange.value = "all";
    sortVal.value = "recent";
    handleFilterSelection();
  }
}

</script>

<template>
  <section class="docs-tools | subgrid">
    <slot>
      <div class="cluster">
        <h2 class="h3" split-right>All Documentaries</h2>

        <docs-button v-if="isMobile && showMobileFilters" effect="pill" variant="secondary" class="btn-filter" @click="handleDisplayMobileFilters">
          <span class="material-symbols-outlined">filter_alt</span>
          Filters
        </docs-button>

        <div v-if="isMobile !== showMobileFilters" :class="isMobile ? 'filter-menu' : 'cluster'">

          <docs-select
            size="xs"
            label="Filter documentaries by topic"
            @change="handleWorkstreamFilter"
          >
            <option class="select-options" value="all">All Topics</option>
            <option class="select-options" v-for="key in filterItems.workstreams" :value="key" :key="key">{{ getWorkspaceNameFromKey(key) }}</option>
            <!-- <option value="documentary">Documentary</option>
            <option value="fiction">Fiction</option>
            <option value="animation">Animation</option> -->
          </docs-select>
  
          <docs-select
            size="xs"
            icon="schedule"
            label="Filter documentaries by duration"
            @change="handleDurationRangeFilter"
          >
            <option class="select-options" value="all"> All Duration Range</option>
            <option class="select-options" v-for="item in durationRangeOptions" :value="item.value" :key="item.value">{{ item.label }}</option>
          </docs-select>
  
          <!-- <docs-button>All Duration Range</docs-button> -->
          <docs-button class="sort" size="xs" data-sort="year" @click="handleSort">
            <span class="material-symbols-outlined">format_line_spacing</span>
            Sorted by: {{ getSortNameFromKey(sortVal) }}
          </docs-button>
          
          <p v-if="isMobile && !showMobileFilters" class="" @click="handleDisplayMobileFilters">clear filters</p>
        </div>
        
      </div>
    </slot>
  </section>
</template>

<style scoped>

h2 {
  font-weight: bold;
}

.docs-tools {
  grid-column: content-start / content-end;
  padding-block-start: var(--space-s-xl);
}

.select-options {
  background-color: var(--white-color-10-shade);
  font-size: var(--font-size-s);
}

.btn-filter {
  background-color: var(--white-color-10-shade);
  width: 100%;
  justify-content: center;
  padding-block: 2px !important;
}

.filter-menu {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  gap: var(--space-2xs);
  background-color: var(--white-color-10-shade);

  height: 70px;
  border-radius: 15px 15px 0 0
}

</style>
