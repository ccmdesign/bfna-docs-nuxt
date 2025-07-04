<template>
  <input :id="'search-input' + uniqueId" class="docs-search" v-model="searchInput" type="text" :placeholder="placeholder" @input="createSearchQuery" />
</template>

<script setup>
import { useSearchStore } from '~/stores/search';
import { v4 as uuidv4 } from 'uuid';
const store = useSearchStore();
const router = useRouter();
const route = useRoute();

const placeholder = route.path !== '/search' ? 'Search for documentaries, topics, film authors...' : 'Search';
const uniqueId = ref(uuidv4());
const searchInput = ref(store.searchValue);
const emit = defineEmits(['search']);

let timerId;
const debounce = (func, delay, term) => {
  clearTimeout(timerId)
  timerId = setTimeout(async () => {

    await func(term)

  }, delay)

}

const createSearchQuery = async (e) => {
  
  const preSearch = async () => {
    if(searchInput.value) {      
      store.setSearchValue(searchInput.value);
      
      if(route.path !== '/search') {
        router.push({ path: '/search' });
      }
    }  
  }

  debounce(preSearch, 600, searchInput.value)
};

</script>

<style scoped>
.docs-search {
  width: 100%;
  padding: var(--space-2xs) var(--space-s);
  border: none;
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--white-color);
  font-size: var(--size--1);
  font-weight: 300;
  letter-spacing: 0.04em;
  text-decoration: none;

  &::placeholder {
    color: var(--white-color);
  }
}
</style>
