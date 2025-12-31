<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { 
    Settings, 
    Grid as GridIcon, 
    User, 
    Gamepad2, 
    LogOut, 
    Menu, 
    X,
    PlayCircle,
    Delete,
    Volume2,
    Mic,
    Search,
    Bot
  } from 'lucide-vue-next';
  import { CORE_VOCABULARY, CATEGORIES } from '../constants';
  import { type Pictogram, type UserSettings, AppView, type AgentResponse } from '../types';
  import { speakText, refineSentence, textToKeywords } from '../services/geminiService';
    
  const view = ref<AppView>(AppView.LOGIN);
  const userSettings = ref<UserSettings | null>(null);
  const sidebarOpen = ref(false);
  const sentence = ref<Pictogram[]>([]);
  const searchTerm = ref("");
  const activeCategory = ref("all");
  const isSpeaking = ref(false);
  const isListening = ref(false);
  const agentOpen = ref(false);
  const currentTab = ref('dashboard');
  
  const filteredPictograms = computed(() => {
    return CORE_VOCABULARY.filter(p => {
      const matchesSearch = p.text.toLowerCase().includes(searchTerm.value.toLowerCase());
      
      let matchesCategory = true;
      if (activeCategory.value === 'people') matchesCategory = p.backgroundColor.includes('yellow');
      if (activeCategory.value === 'actions') matchesCategory = p.backgroundColor.includes('green');
      if (activeCategory.value === 'food') matchesCategory = p.keywords.includes('food') || p.keywords.includes('fruit') || p.keywords.includes('snack') || p.keywords.includes('drink');
      if (activeCategory.value === 'feelings') matchesCategory = p.keywords.includes('happy') || p.keywords.includes('sad') || p.keywords.includes('good') || p.keywords.includes('bad');
  
      return matchesSearch && matchesCategory;
    });
  });
  
  const addToSentence = (pic: Pictogram) => {
    sentence.value.push(pic);
  };
  
  const removeFromSentence = (index: number) => {
    sentence.value.splice(index, 1);
  };
  
  const clearSentence = () => {
    sentence.value = [];
  };
  
  const handlePlay = async () => {
    if (sentence.value.length === 0) return;
    isSpeaking.value = true;
    
    const naturalText = await refineSentence(sentence.value);
    console.log("Speaking:", naturalText);
  
    const voice = userSettings.value?.voiceGender === 'male' ? 'Fenrir' : 'Kore';
    await speakText(naturalText, voice);
    
    isSpeaking.value = false;
  };
  
  const handleMicrophone = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
  
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    isListening.value = true;
    
    recognition.start();
  
    recognition.onresult = async (event: any) => {
       const text = event.results[0][0].transcript;
       searchTerm.value = text;
       isListening.value = false;
       
       const keywords = await textToKeywords(text);
       
       const matchedPics: Pictogram[] = [];
       keywords.forEach(k => {
         const found = CORE_VOCABULARY.find(p => p.keywords.includes(k) || p.text.toLowerCase() === k);
         if (found) matchedPics.push(found);
       });
       
       if (matchedPics.length > 0) {
         sentence.value = matchedPics;
         searchTerm.value = "";
       }
    };
  
    recognition.onerror = () => {
      isListening.value = false;
    };
    recognition.onend = () => {
      isListening.value = false;
    };
  };
  
  const handleAgentAction = (response: AgentResponse) => {
    if (response.action === 'SHOW_PICTOGRAMS' && response.keywords) {
      const matchedPics: Pictogram[] = [];
      response.keywords.forEach(k => {
        const found = CORE_VOCABULARY.find(p => 
           p.text.toLowerCase() === k.toLowerCase() || 
           p.keywords.some(kw => kw.toLowerCase() === k.toLowerCase())
        );
        if (found) matchedPics.push(found);
      });
  
      if (matchedPics.length > 0) {
        sentence.value = matchedPics;
      }
    }
  };
  
  const themeBg = computed(() => userSettings.value?.highContrast ? 'bg-gray-900' : 'bg-gray-50');
  const themeText = computed(() => userSettings.value?.highContrast ? 'text-white' : 'text-slate-800');
  const gridGap = computed(() => userSettings.value?.gridSize === 'large' ? 'gap-6' : 'gap-2');
  const gridCols = computed(() => {
    if (userSettings.value?.gridSize === 'large') return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    if (userSettings.value?.gridSize === 'small') return 'grid-cols-4 md:grid-cols-6 lg:grid-cols-8';
    return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
  });
  </script>
  
  <template>
    <!-- <LoginScreen v-if="view === AppView.LOGIN" @login="view = AppView.WIZARD" />
  
    <WizardScreen 
      v-else-if="view === AppView.WIZARD" 
      @complete="(s) => { userSettings = s; view = AppView.DASHBOARD; }" 
    /> -->
  
    <div 
      class="flex h-screen w-screen overflow-hidden relative"
      :class="[themeBg, themeText]"
    >
      <!-- Sidebar -->
      <div 
        class="fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="p-4 flex items-center justify-between border-b border-slate-700">
          <span class="font-bold text-xl">PictoSpeak</span>
          <button @click="sidebarOpen = false" class="lg:hidden">
            <X :size="24" />
          </button>
        </div>
        
        <div class="p-4">
          <div class="flex items-center gap-3 mb-8 p-3 bg-slate-700 rounded-lg">
             <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
               {{ userSettings?.username.charAt(0) }}
             </div>
             <div>
               <p class="font-medium">{{ userSettings?.username }}</p>
               <p class="text-xs text-slate-400">Online</p>
             </div>
          </div>
  
          <nav class="space-y-2">
            <button 
              @click="currentTab = 'dashboard'"
              class="w-full flex items-center gap-3 p-3 rounded transition-colors"
              :class="currentTab === 'dashboard' ? 'bg-slate-700' : 'hover:bg-slate-700'"
            >
              <GridIcon :size="20" /> Dashboard
            </button>
            <button 
              @click="currentTab = 'games'"
              class="w-full flex items-center gap-3 p-3 rounded transition-colors"
              :class="currentTab === 'games' ? 'bg-slate-700' : 'hover:bg-slate-700'"
            >
              <Gamepad2 :size="20" /> Games (Soon)
            </button>
            <button class="w-full flex items-center gap-3 p-3 rounded hover:bg-slate-700">
              <User :size="20" /> Account
            </button>
            <button class="w-full flex items-center gap-3 p-3 rounded hover:bg-slate-700" @click="view = AppView.WIZARD">
              <Settings :size="20" /> Settings
            </button>
             <button class="w-full flex items-center gap-3 p-3 rounded hover:bg-slate-700 mt-10 text-red-400" @click="view = AppView.LOGIN">
              <LogOut :size="20" /> Sign Out
            </button>
          </nav>
        </div>
      </div>
  
      <!-- Main Content -->
      <div class="flex-1 flex flex-col h-full relative">
        
        <template v-if="currentTab === 'dashboard'">
          <!-- Header -->
        <header class="bg-white border-b shadow-sm p-2 md:p-4 shrink-0 flex flex-col gap-2 z-20">
          <div class="flex items-center gap-2">
             <button @click="sidebarOpen = true" class="lg:hidden p-2 text-slate-600">
               <Menu :size="24" />
             </button>
             
             <!-- Sentence Display -->
             <div class="flex-1 min-h-[5rem] md:min-h-[7rem] bg-slate-100 border-2 border-slate-300 rounded-xl p-2 flex items-center gap-2 overflow-x-auto no-scrollbar relative">
                <span v-if="sentence.length === 0" class="text-slate-400 italic ml-2">Select pictograms to build a sentence...</span>
                
                <div v-for="(pic, idx) in sentence" :key="`${pic.id}-${idx}`" class="flex-shrink-0 relative group">
                  <div class="w-16 h-16 md:w-20 md:h-20 border-2 rounded-lg p-1 bg-white flex flex-col items-center justify-between" :class="pic.backgroundColor">
                    <img :src="pic.url" :alt="pic.text" class="w-full h-full object-contain" />
                  </div>
                  <span class="text-[10px] md:text-xs font-bold text-center block w-full truncate">{{ pic.text.toUpperCase() }}</span>
                  <button 
                    @click="removeFromSentence(idx)"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X :size="12" />
                  </button>
                </div>
             </div>
  
             <!-- Actions -->
             <div class="flex flex-col gap-2">
                <button 
                  @click="clearSentence"
                  class="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                  title="Clear All"
                >
                  <Delete :size="24" />
                </button>
                <button 
                  @click="handlePlay"
                  :disabled="isSpeaking"
                  class="p-3 text-white rounded-xl shadow-lg transition-all"
                  :class="isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-green-600 hover:bg-green-700'"
                  title="Speak"
                >
                  <Volume2 v-if="isSpeaking" :size="24" />
                  <PlayCircle v-else :size="24" />
                </button>
             </div>
          </div>
  
          <!-- Search -->
          <div class="flex gap-2 mt-2">
             <div class="relative flex-1">
               <input 
                 type="text" 
                 placeholder="Type to search or add text..."
                 v-model="searchTerm"
                 class="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <Search class="absolute left-3 top-3.5 text-slate-400" :size="18" />
             </div>
             <button 
               @click="handleMicrophone"
               class="p-3 rounded-lg border transition-colors"
               :class="isListening ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'"
             >
               <Mic :size="20" />
             </button>
          </div>
        </header>
  
        <!-- Categories -->
        <div class="bg-white border-b overflow-x-auto no-scrollbar">
           <div class="flex p-2 gap-2 min-w-max">
             <button
               v-for="cat in CATEGORIES"
               :key="cat.id"
               @click="activeCategory = cat.id"
               class="px-4 py-2 rounded-full font-semibold text-sm transition-colors border"
               :class="activeCategory === cat.id 
                 ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                 : `${cat.color} text-slate-700 border-transparent hover:brightness-95`"
             >
               {{ cat.name }}
             </button>
           </div>
        </div>
  
        <!-- Grid -->
        <div class="flex-1 overflow-y-auto p-2 md:p-4 bg-slate-50/50">
           <div class="grid pb-20" :class="[gridCols, gridGap]">
              <button
                v-for="pic in filteredPictograms"
                :key="pic.id"
                @click="addToSentence(pic)"
                class="aspect-square rounded-xl border-b-4 p-1 md:p-2 transition-transform active:scale-95 shadow-sm hover:shadow-md bg-white flex flex-col items-center"
                :class="pic.backgroundColor"
              >
                <div class="flex-1 w-full h-full flex items-center justify-center p-1">
                  <img :src="pic.url" :alt="pic.text" class="max-w-full max-h-full object-contain" />
                </div>
                <span class="text-xs md:text-sm font-bold uppercase tracking-tight text-center w-full leading-none py-1 md:py-2 bg-white/80 rounded mt-1">
                  {{ pic.text }}
                </span>
              </button>
              
              <div v-if="filteredPictograms.length === 0" class="col-span-full text-center py-10 text-slate-400">
                <p>No pictograms found for "{{ searchTerm }}"</p>
                <p class="text-sm mt-2">Try checking spelling or using broader terms.</p>
              </div>
           </div>
        </div>
        
        <!-- Agent Button -->
        <button 
          class="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform z-40 border-4 border-white"
          @click="agentOpen = true"
        >
          <Bot :size="32" />
        </button>
  
        <!-- Agent Overlay -->
        <AgentBuddy 
           :isOpen="agentOpen" 
           @close="agentOpen = false"
           @action="handleAgentAction"
        />
        </template>
  
        <GamesScreen 
          v-else-if="currentTab === 'games'" 
          @toggle-sidebar="sidebarOpen = !sidebarOpen"
        />
  
      </div>
    </div>
  </template>
  
