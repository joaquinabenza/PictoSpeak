<script setup lang="ts">
import { ref, watch } from 'vue';
import { Bot, X, MapPin, Mic, Send } from 'lucide-vue-next';
import { runAgentCommand, speakText } from '../../services/geminiService';
import type { AgentResponse } from '../types';

const props = defineProps<{
  isOpen: boolean
}>();

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'action', res: AgentResponse): void
}>();

const isListening = ref(false);
const response = ref<AgentResponse | null>(null);
const transcript = ref("");
const inputText = ref("");
const status = ref("Hello! I'm here to help.");

const hour = new Date().getHours();
const isNight = hour >= 18 || hour < 6;

watch(() => props.isOpen, (newVal) => {
  if (newVal && isNight) {
    status.value = "It's getting late. I'm here if you need to go home.";
  } else if (newVal) {
    status.value = "Hi friend! Type or tap mic to talk.";
  }
});

const processInput = async (text: string) => {
  transcript.value = text;
  status.value = "Thinking...";

  let location = undefined;
  try {
    const pos: any = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
    });
    location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch (e) {
    console.warn("Location not available for agent");
  }

  const result = await runAgentCommand(text, { isNight, location });
  response.value = result;
  status.value = "";

  if (result.action) {
    emit('action', result);
  }

  if (result.text) {
    speakText(result.text);
  }
};

const handleMic = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    status.value = "Microphone not supported.";
    return;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';

  isListening.value = true;
  status.value = "Listening...";
  response.value = null;
  transcript.value = "";

  recognition.start();

  recognition.onresult = async (event: any) => {
    const text = event.results[0][0].transcript;
    isListening.value = false;
    await processInput(text);
  };

  recognition.onerror = () => {
    isListening.value = false;
    status.value = "I didn't hear that. Try again?";
  };
  recognition.onend = () => {
    isListening.value = false;
    if (!transcript.value) status.value = "Type or tap mic to speak.";
  };
};

const handleTextSubmit = async () => {
  if (!inputText.value.trim()) return;
  const text = inputText.value;
  inputText.value = "";
  await processInput(text);
};
</script>

<template>
  <div v-if="isOpen" class="absolute bottom-24 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white flex justify-between items-center">
      <div class="flex items-center gap-2">
        <Bot class="animate-bounce" />
        <span class="font-bold">My Buddy</span>
      </div>
      <button @click="emit('close')"><X :size="20" /></button>
    </div>
    
    <div class="p-4 flex flex-col gap-4 min-h-[200px] bg-slate-50">
       <div class="text-center text-slate-600 text-sm italic">
          <span v-if="isListening" class="flex items-center justify-center gap-2">
            <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Listening...
          </span>
          <span v-else>{{ status }}</span>
       </div>

       <div v-if="transcript" class="bg-slate-200 self-end p-2 rounded-lg rounded-tr-none text-sm max-w-[90%]">
         "{{ transcript }}"
       </div>

       <div v-if="response" class="flex flex-col gap-2">
         <div class="bg-blue-100 self-start p-3 rounded-xl rounded-tl-none text-slate-800 text-sm shadow-sm">
            {{ response.text }}
         </div>
         
         <a v-if="response.mapData" :href="response.mapData.uri" target="_blank" rel="noreferrer" class="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors group">
           <div class="bg-green-100 p-2 rounded-full text-green-600 group-hover:scale-110 transition-transform">
             <MapPin :size="20" />
           </div>
           <div class="flex-1">
             <p class="font-bold text-xs text-slate-500 uppercase">Recommendation</p>
             <p class="text-blue-700 font-medium truncate">{{ response.mapData.title }}</p>
           </div>
         </a>
       </div>
    </div>

    <div class="p-3 bg-white border-t">
      <form @submit.prevent="handleTextSubmit" class="flex gap-2">
        <input type="text" v-model="inputText" placeholder="Ask me..." class="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500" />
        <button v-if="inputText" type="submit" class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
          <Send :size="18" />
        </button>
        <button v-else type="button" @click="handleMic" class="p-2 rounded-full transition-all" :class="isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
          <Mic :size="18" />
        </button>
      </form>
    </div>
  </div>
</template>