import { createRouter, createWebHistory } from 'vue-router'
import CategoriesView from '../views/CategoriesView.vue'
import SubcategoriesView from '../views/SubcategoriesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CategoriesView,
    },
    {
      path: '/subcategory/:id',
      name: 'subcategory',
      component: SubcategoriesView,
    },
  ],
})

export default router
