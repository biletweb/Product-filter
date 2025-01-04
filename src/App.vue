<script setup>
import { RouterView } from 'vue-router'
import CategoriesView from './views/CategoriesView.vue'
</script>

<template>
  <header>
    <CategoriesView />
  </header>

  <RouterView />
</template>
