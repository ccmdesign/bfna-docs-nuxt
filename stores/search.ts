import { defineStore } from 'pinia';
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'


export const useSearchStore = defineStore('search', {
  state: () => ({
    searchValue: '',
    searchResults: [],
  }),
  actions: {
    setSearchValue(value: string) {
      this.searchValue = value;
    },
    
    async doSearch(items: any) {
      const keys = ['title', 'description', 'by'];
    
      const options = {
        includeScore: true,
        threshold: 0,
        useExtendedSearch: true,
        ignoreLocation: true,
        ignoreFieldNorm: true,
        fieldNormWeight: 0,
        keys
      };
    
      const fuse = new Fuse(items, options)
      const term = ref(this.searchValue)
    
      const results = computed(() => {
        if (!term.value) return items
        const searchResults = fuse.search(term.value)
        return searchResults.map(result => result.item)
      })
      this.searchResults = results.value;
    }
  },
});