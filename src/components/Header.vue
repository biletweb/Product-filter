<template>
  <header class="rounded-b-lg p-4 bg-slate-300">
    <div class="flex items-center justify-between">
      <span class="text-3xl font-bold text-sky-500">Product Filter</span>
      <div>
        <router-link :to="{ name: 'home' }" class="text-sky-500 hover:text-sky-600">Home</router-link>
      </div>
    </div>
  </header>
</template>
