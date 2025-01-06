<template>
  <div class="text-3xl mb-4 font-bold">{{ categoryName }}</div>
  <div v-if="!loadingOnMounted" class="my-4 flex items-center">
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
  <div v-if="categoryFilters.length" class="my-4 flex gap-4">
    <div class="border border-sky-300 bg-sky-200 rounded-lg w-2/12">
      <div v-for="filter in categoryFilters" :key="filter.id" class="px-4 py-2">
        <span class="font-bold">{{ filter.name }}</span>
        <div v-for="value in filter.values" :key="value.id">
          <input
            type="checkbox"
            :id="value.id"
            :value="value.id"
            :checked="isChecked(filter.id, value.id)"
            :disabled="loadingMore"
            @change="(handleFilterChange(filter.id, value.id), submitFilters(value.id))"
          />
          <span class="mx-2">{{ value.value }}</span>
          <span v-if="loadingFilters[value.id]">loading...</span>
        </div>
      </div>
    </div>
    <div class="w-10/12">
      <div class="grid grid-cols-5 gap-4">
        <div v-for="product in products" :key="product.id" class="card text-center p-4 bg-sky-200 rounded-lg max-w-[250px]">
          {{ product.name }}
        </div>
      </div>
      <div v-if="hasMore" class="mt-4 text-center">
        <button
          @click="submitFilters"
          type="submit"
          class="rounded-lg bg-sky-500 px-4 py-2 text-white transition duration-300 hover:bg-sky-600 disabled:bg-slate-300"
          :disabled="loadingMore"
        >
          <span v-if="loadingMore">Loading...</span>
          <span v-else>Load more</span>
        </button>
      </div>
      <div v-if="products.length === 0" class="p-4 rounded-lg text-white uppercase font-semibold bg-rose-500 text-center">
        No products
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, watch, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'

const route = useRoute()
const categories = ref([])
const categoryName = ref('Categories')
const breadcrumbs = ref([])
const products = ref([])
const categoryFilters = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const loadingOnMounted = ref(false)
const loadingFilters = reactive({})
const selectedFilters = reactive({})
const offset = ref(0)
const limit = 10
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
      params: { offset: offset.value, limit: limit },
      headers: { Accept: 'application/json' },
      timeout: 5000,
    })
    categories.value = response.data.categories || []
    breadcrumbs.value = response.data.breadcrumbs || []
    products.value = response.data.products || []
    categoryFilters.value = response.data.categoryFilters || []
    categoryName.value = response.data.categoryName || ''
    offset.value += limit
    hasMore.value = response.data.products.length >= limit
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    loading.value = false
  }
}

const isChecked = (filterId, valueId) => {
  return selectedFilters[filterId]?.includes(valueId) || false
}

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

const submitFilters = async (filterId) => {
  loadingMore.value = true
  loadingFilters[filterId] = true
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
      headers: { Accept: 'application/json' },
      timeout: 5000,
    })
    if (clearProducts.value) {
      products.value = response.data.products
      clearProducts.value = false
    } else {
      products.value = [...products.value, ...response.data.products]
    }
    offset.value += limit
    hasMore.value = response.data.products.length >= limit
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    loadingFilters[filterId] = false
    loadingMore.value = false
  }
}

const isActiveBreadcrumb = (breadcrumbId) => {
  return route.params.id === String(breadcrumbId)
}

onMounted(async () => {
  loadingOnMounted.value = true
  await getCategories()
  loadingOnMounted.value = false
})

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

const description = 'Лучшие товары из мира электроники: смартфоны, ноутбуки, телевизоры, аксессуары и многое другое.'

useHead({
  title: () => `${categoryName.value} | biletweb`,
  meta: [
    { name: 'description', content: description },
    { name: 'keywords', content: () => categoryName.value },
    { property: 'og:title', content: () => `${categoryName.value} | biletweb` },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: window.location.href },
    { property: 'og:image', content: '/favicon.ico' },
  ],
})
</script>
