<template>
  <div class="text-3xl mb-4 font-bold">{{ categoryName }}</div>
  <div class="my-4 flex items-center">
    <router-link :to="{ name: 'home' }" class="mr-1"><span class="hover:underline">Home</span> /</router-link>
    <div v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.id" class="flex items-center">
      <router-link
        :to="{ name: 'subcategory', params: { id: breadcrumb.id } }"
        :class="{
          'text-sky-500 cursor-default': isActiveBreadcrumb(breadcrumb.id),
          'hover:underline': !isActiveBreadcrumb(breadcrumb.id),
        }"
      >
        {{ breadcrumb.name }}
      </router-link>
      <span v-if="index < breadcrumbs.length - 1" class="mx-1">/</span>
    </div>
  </div>
  <div v-if="loading" class="text-center">Loading...</div>
  <div v-else-if="categories.length" class="grid grid-cols-5 gap-4">
    <div v-for="category in categories" :key="category.id">
      <router-link :to="{ name: 'subcategory', params: { id: category.id } }">
        <div class="card text-center p-4 bg-slate-300 rounded-lg">
          {{ category.name }}
        </div>
      </router-link>
    </div>
  </div>
  <div v-if="products.length" class="my-4 flex gap-4">
    <div class="border border-sky-300 bg-sky-200 rounded-lg w-2/12">
      <div v-for="filter in categoryFilters" :key="filter.id" class="px-4 py-2">
        <span class="font-bold">{{ filter.name }}</span>
        <div v-for="value in filter.values" :key="value.id">
          <input
            type="checkbox"
            :value="value.id"
            :checked="isChecked(filter.id, value.id)"
            @change="handleFilterChange(filter.id, value.id)"
          />
          {{ value.value }}
        </div>
      </div>
      <div class="flex justify-center my-4">
        <button
          v-if="hasActiveFilters"
          @click="submitFilters"
          type="button"
          class="px-4 py-2 transition duration-300 bg-sky-500 hover:bg-sky-600 text-white rounded-lg"
        >
          Submit Filters
        </button>
      </div>
    </div>
    <div class="w-10/12">
      <div v-if="loadingFilters" class="text-center">Loading...</div>
      <div v-else class="grid grid-cols-5 gap-4">
        <div v-for="product in products" :key="product.id" class="card text-center p-4 bg-sky-200 rounded-lg max-w-[250px]">
          <!-- <router-link :to="{ name: 'product', params: { id: product.id } }"> -->
          {{ product.name }}
          <!-- </router-link> -->
        </div>
      </div>
      <div class="mt-4 text-center">
        <button
          v-if="hasMore && !loadingFilters"
          @click="submitFilters"
          type="submit"
          class="rounded-lg bg-sky-500 px-4 py-2 text-white transition duration-300 hover:bg-sky-600 disabled:bg-slate-300"
          :disabled="loading"
        >
          Load more
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, watch, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const categories = ref([])
const categoryName = ref('Categories')
const breadcrumbs = ref([])
const products = ref([])
const categoryFilters = ref([])
const loading = ref(false)
const loadingFilters = ref(false)
const selectedFilters = reactive({})
const offset = ref(0)
const limit = 2
const hasMore = ref(true)
const clearProducts = ref(false)

const getCategories = async () => {
  categories.value = []
  products.value = []
  categoryFilters.value = []
  loading.value = true
  try {
    const subcategoryId = route.params.id
    const response = await axios.get(`http://127.0.0.1:8000/api/categories/${subcategoryId}/subcategories`, {
      params: {
        offset: offset.value,
        limit: limit,
      },
      headers: {
        Accept: 'application/json',
      },
      timeout: 5000,
    })
    categories.value = response.data.categories || []
    breadcrumbs.value = response.data.breadcrumbs || []
    products.value = response.data.products || []
    categoryFilters.value = response.data.categoryFilters || []
    categoryName.value = response.data.categoryName || ''
    offset.value += limit
    if (response.data.products.length < limit) {
      hasMore.value = false
    } else {
      hasMore.value = true
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    categories.value = []
    products.value = []
    categoryFilters.value = []
  } finally {
    loading.value = false
  }
}

const isChecked = (filterId, valueId) => {
  return selectedFilters[filterId]?.includes(valueId) || false
}

const hasActiveFilters = computed(() => Object.keys(selectedFilters).some((key) => selectedFilters[key].length > 0))

const handleFilterChange = (filterId, valueId) => {
  clearProducts.value = true
  if (!selectedFilters[filterId]) {
    selectedFilters[filterId] = []
  }
  const filter = selectedFilters[filterId]
  if (filter.includes(valueId)) {
    const index = filter.indexOf(valueId)
    filter.splice(index, 1)
  } else {
    filter.push(valueId)
  }
}

const submitFilters = async () => {
  loadingFilters.value = true
  try {
    const subcategoryId = route.params.id
    if (clearProducts.value) {
      offset.value = 0
    }
    const params = {}
    for (const [filterId, selectedValues] of Object.entries(selectedFilters)) {
      params[`filters[${filterId}][]`] = selectedValues
    }
    params.offset = offset.value
    params.limit = limit
    const response = await axios.get(`http://127.0.0.1:8000/api/products/${subcategoryId}/subcategories/filter`, {
      params: params,
      headers: {
        Accept: 'application/json',
      },
      timeout: 5000,
    })
    if (clearProducts.value) {
      products.value = response.data.products
      clearProducts.value = false
    } else {
      products.value = [...products.value, ...response.data.products]
    }
    offset.value += limit
    if (response.data.products.length < limit) {
      hasMore.value = false
    } else {
      hasMore.value = true
    }
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    loadingFilters.value = false
  }
}

const isActiveBreadcrumb = (breadcrumbId) => {
  return route.params.id === String(breadcrumbId)
}

onMounted(async () => {
  await getCategories()
})

// watch(() => route.params.id, getCategories)
watch(
  () => route.params.id,
  () => {
    Object.keys(selectedFilters).forEach((key) => {
      delete selectedFilters[key]
    })
    offset.value = 0
    clearProducts.value = false
    getCategories()
  },
)
</script>
