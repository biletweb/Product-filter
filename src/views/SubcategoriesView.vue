<template>
  <div class="text-3xl mb-4 font-bold">Categories</div>
  <div class="grid grid-cols-5 gap-4">
    <div v-for="category in categories" :key="category.id">
      <router-link :to="{ name: 'subcategory', params: { id: category.id } }">
        {{ category.name }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'

onMounted(() => {
  getCategories()
})

const categories = ref([])

const getCategories = async () => {
  const response = await axios.get('http://127.0.0.1:8000/api/categories', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
  categories.value = response.data.categories
}
</script>
