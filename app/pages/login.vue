<script setup lang="ts">
const emit = defineEmits(['login']);
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen bg-slate-100 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
      <div class="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
         <span class="text-4xl text-white font-bold">Aa</span>
      </div>
      <h1 class="text-3xl font-bold text-slate-800 mb-2">PictoSpeak</h1>
      <p class="text-slate-500 mb-8">AAC Communicator for Everyone</p>
      
      <button @click="emit('login')" class="w-full bg-white border border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-sm">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-6 h-6" alt="Google" />
        Sign in with Google
      </button>
      <p class="text-xs text-slate-400 mt-6">Uses ARASAAC Pictograms</p>
    </div>
  </div>
</template>