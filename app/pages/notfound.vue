<template>
  <div class="flex flex-col items-center justify-center h-screen bg-slate-100 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
      <h1 class="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-slate-800 mb-4">Page Not Found</h2>
      <p class="text-slate-600 mb-8">
        Oops! The page you are looking for does not exist.
      </p>
      <router-link 
        to="/" 
        class="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 transition-colors"
      >
        Go to Home
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>