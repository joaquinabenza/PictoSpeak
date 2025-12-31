<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { UserSettings } from './types';

const emit = defineEmits<{
  (e: 'complete', settings: UserSettings): void
}>();

const step = ref(1);
const settings = reactive<UserSettings>({
  language: 'en',
  voiceGender: 'female',
  gridSize: 'medium',
  highContrast: false,
  username: 'Alex',
  themeColor: 'blue'
});

const nextStep = () => {
  if (step.value < 3) step.value++;
  else emit('complete', settings);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen bg-slate-50 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
      <h2 class="text-2xl font-bold mb-6 text-center">Setup Profile ({{ step }}/3)</h2>
      
      <div v-if="step === 1" class="space-y-4">
        <label class="block text-sm font-medium text-slate-700">Child's Name</label>
        <input type="text" v-model="settings.username" class="w-full border p-3 rounded-lg text-lg" />
        <label class="block text-sm font-medium text-slate-700 mt-4">Voice Preference</label>
        <div class="grid grid-cols-2 gap-4">
          <button @click="settings.voiceGender = 'male'" class="p-4 rounded-lg border-2" :class="settings.voiceGender === 'male' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">Male</button>
          <button @click="settings.voiceGender = 'female'" class="p-4 rounded-lg border-2" :class="settings.voiceGender === 'female' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'">Female</button>
        </div>
      </div>

      <div v-if="step === 2" class="space-y-4">
         <label class="block text-sm font-medium text-slate-700">Grid Size</label>
         <div class="space-y-2">
            <button
              v-for="s in ['small', 'medium', 'large']"
              :key="s"
              @click="settings.gridSize = s as any"
              class="w-full p-3 text-left rounded-lg border-2 capitalize"
              :class="settings.gridSize === s ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
            >
              {{ s }} Buttons
            </button>
         </div>
      </div>

      <div v-if="step === 3" class="space-y-4">
          <label class="block text-sm font-medium text-slate-700">Visuals</label>
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <span>High Contrast Mode</span>
            <button 
              @click="settings.highContrast = !settings.highContrast"
              class="w-12 h-6 rounded-full relative transition-colors"
              :class="settings.highContrast ? 'bg-black' : 'bg-gray-300'"
            >
              <div 
                class="w-4 h-4 bg-white rounded-full absolute top-1 transition-all"
                :class="settings.highContrast ? 'left-7' : 'left-1'"
              ></div>
            </button>
          </div>
      </div>

      <button 
        @click="nextStep"
        class="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
      >
        {{ step === 3 ? "Start Communicating" : "Next" }}
      </button>
    </div>
  </div>
</template>