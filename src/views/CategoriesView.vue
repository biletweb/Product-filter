<template>
  <div class="text-3xl mb-4 font-bold">Categories</div>
  <div v-if="loading" class="text-center">Loading...</div>
  <div v-else class="grid grid-cols-5 gap-4">
    <div v-for="category in categories" :key="category.id">
      <router-link :to="{ name: 'subcategory', params: { id: category.id } }">
        <div class="card text-center p-4 bg-slate-300 rounded-lg">
          {{ category.name }}
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useHead } from '@vueuse/head'

const categories = ref([])
const loading = ref(false)

// Динамичные данные для SEO
const title = 'Категории товаров | biletweb'
const description =
  'Откройте для себя разнообразные категории товаров: от электроники до одежды и аксессуаров. Все, что вам нужно, в одном месте!'
const keywords = 'категории товаров, электроника, одежда, аксессуары, книги, интернет-магазин'

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: window.location.href },
    { property: 'og:image', content: '/favicon.ico' }, // Укажите изображение для Open Graph
  ],
})

const getCategories = async () => {
  categories.value = []
  loading.value = true
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/categories', {
      headers: {
        Accept: 'application/json',
      },
      timeout: 5000,
    })
    categories.value = response.data.categories || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await getCategories()
})
</script>
