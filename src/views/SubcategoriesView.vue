<template>
  <div class="text-3xl mb-4 font-bold">Categories</div>
  <div v-if="loading" class="text-center">Loading...</div>
  <div v-else>
    <div class="my-4 flex items-center">
      <router-link :to="{ name: 'home' }" class="mr-1"><span class="hover:underline">Home</span> /</router-link>
      <div
        v-for="(breadcrumb, index) in breadcrumbs"
        :key="breadcrumb.id"
        class="flex items-center"
        :class="{ 'font-semibold text-sky-500': isActiveBreadcrumb(breadcrumb.id) }"
      >
        <router-link :to="{ name: 'subcategory', params: { id: breadcrumb.id } }" class="hover:underline">
          {{ breadcrumb.name }}
        </router-link>
        <span v-if="index < breadcrumbs.length - 1" class="mx-1">/</span>
      </div>
    </div>
    <div class="grid grid-cols-5 gap-4">
      <div v-for="category in categories" :key="category.id">
        <router-link :to="{ name: 'subcategory', params: { id: category.id } }">
          {{ category.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const categories = ref([])
const breadcrumbs = ref([])
const loading = ref(false)

const getCategories = async () => {
  categories.value = []
  breadcrumbs.value = []
  loading.value = true
  try {
    const subcategoryId = route.params.id
    const response = await axios.get(`http://127.0.0.1:8000/api/categories/${subcategoryId}/subcategories`, {
      headers: {
        Accept: 'application/json',
      },
      timeout: 5000,
    })
    categories.value = response.data.categories || []
    breadcrumbs.value = response.data.breadcrumbs || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    categories.value = []
    breadcrumbs.value = []
  } finally {
    loading.value = false
  }
}

const isActiveBreadcrumb = (breadcrumbId) => {
  return route.params.id === String(breadcrumbId)
}

onMounted(async () => {
  await getCategories()
})

watch(() => route.params.id, getCategories)
</script>
