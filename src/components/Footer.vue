<template>
  <footer class="rounded-t-lg bg-slate-300 text-sky-500 py-4">
    <div class="text-center text-lg">
      © 2024-{{ currentYear }} biletweb. <a href="#" target="_blank" class="hover:text-sky-600 hover:underline">License MIT</a>.
      Version: {{ appVersion }}
    </div>
  </footer>
</template>

<script setup>
import version from '../../package.json'
const currentYear = new Date().getFullYear()

const appVersion = version.version
</script>
