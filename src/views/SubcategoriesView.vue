<template>
  <div class="text-3xl mb-4 font-bold">Categories ID: {{ route.params.id }}</div>
  <div v-if="loading" class="text-center">Loading...</div>
  <div v-else class="grid grid-cols-5 gap-4">
    <div v-for="category in categories" :key="category.id">
      <router-link :to="{ name: 'subcategory', params: { id: category.id } }">
        {{ category.name }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const categories = ref([])
const loading = ref(false)

const getCategories = async () => {
  categories.value = []
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
  } catch (error) {
    console.error('Error fetching categories:', error)
    categories.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await getCategories()
})

watch(() => route.params.id, getCategories)
</script>
