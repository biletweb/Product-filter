<template>
  <div class="text-3xl mb-4 font-bold">Categories ID: {{ route.params.id }}</div>
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
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

onMounted(() => {
  getCategories()
})

const route = useRoute()
const categories = ref([])
const subcategories = ref('')

const getCategories = async () => {
  subcategories.value = route.params.id
  const response = await axios.get(`http://127.0.0.1:8000/api/categories/${subcategories.value}/subcategories`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
  categories.value = response.data.categories
}

watch(
  () => route.params.id,
  () => {
    getCategories()
  }
)
</script>
