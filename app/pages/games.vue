<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { CORE_VOCABULARY } from '../constants';
  import { type Pictogram } from '../types';
  import { Menu, RefreshCw, Trophy } from 'lucide-vue-next';
  
  const emit = defineEmits(['toggleSidebar']);
  
  interface Card {
    id: number;
    pictogram: Pictogram;
    isFlipped: boolean;
    isMatched: boolean;
  }
  
  const cards = ref<Card[]>([]);
  const flippedCards = ref<Card[]>([]);
  const matches = ref(0);
  const moves = ref(0);
  const gameComplete = ref(false);
  
  const initGame = () => {
    matches.value = 0;
    moves.value = 0;
    gameComplete.value = false;
    flippedCards.value = [];
  
    // Select 6 random pictograms
    const shuffledVocab = [...CORE_VOCABULARY].sort(() => 0.5 - Math.random());
    const selected = shuffledVocab.slice(0, 6);
    
    // Create pairs
    const deck: Card[] = [];
    selected.forEach((pic, index) => {
      deck.push({ id: index * 2, pictogram: pic, isFlipped: false, isMatched: false });
      deck.push({ id: index * 2 + 1, pictogram: pic, isFlipped: false, isMatched: false });
    });
  
    // Shuffle deck
    cards.value = deck.sort(() => 0.5 - Math.random());
  };
  
  const handleCardClick = (card: Card) => {
    if (card.isMatched || card.isFlipped || flippedCards.value.length >= 2) return;
  
    card.isFlipped = true;
    flippedCards.value.push(card);
  
    if (flippedCards.value.length === 2) {
      moves.value++;
      checkForMatch();
    }
  };
  
  const checkForMatch = () => {
    const [card1, card2] = flippedCards.value;
    if (card1.pictogram.id === card2.pictogram.id) {
      card1.isMatched = true;
      card2.isMatched = true;
      matches.value++;
      flippedCards.value = [];
      
      if (matches.value === cards.value.length / 2) {
        setTimeout(() => gameComplete.value = true, 500);
      }
    } else {
      setTimeout(() => {
        card1.isFlipped = false;
        card2.isFlipped = false;
        flippedCards.value = [];
      }, 1000);
    }
  };
  
  onMounted(initGame);
  </script>
  
  <template>
    <div class="flex flex-col h-full bg-slate-50">
      <!-- Header -->
      <div class="bg-white border-b p-4 flex items-center justify-between shadow-sm shrink-0">
        <div class="flex items-center gap-3">
          <button @click="emit('toggleSidebar')" class="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu :size="24" />
          </button>
          <h2 class="text-xl font-bold text-slate-800">Memory Game</h2>
        </div>
        <div class="flex items-center gap-4 text-sm font-medium text-slate-600">
          <span>Moves: {{ moves }}</span>
          <button @click="initGame" class="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
            <RefreshCw :size="16" /> Restart
          </button>
        </div>
      </div>
  
      <!-- Game Board -->
      <div class="flex-1 p-4 overflow-y-auto">
        <div v-if="gameComplete" class="h-full flex flex-col items-center justify-center text-center animate-fade-in">
           <Trophy :size="64" class="text-yellow-500 mb-4" />
           <h3 class="text-2xl font-bold text-slate-800 mb-2">Great Job!</h3>
           <p class="text-slate-600 mb-6">You completed the game in {{ moves }} moves.</p>
           <button @click="initGame" class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-transform active:scale-95">
             Play Again
           </button>
        </div>
  
        <div v-else class="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto h-full content-center">
          <button 
            v-for="card in cards" 
            :key="card.id"
            @click="handleCardClick(card)"
            class="aspect-square relative perspective-1000 group"
            :disabled="card.isMatched || card.isFlipped"
          >
            <div class="w-full h-full transition-all duration-500 transform-style-3d relative"
                 :class="card.isFlipped || card.isMatched ? 'rotate-y-180' : ''">
              
              <!-- Front (Hidden) -->
              <div class="absolute inset-0 backface-hidden bg-slate-200 rounded-xl border-b-4 border-slate-300 flex items-center justify-center shadow-sm group-hover:brightness-95">
                 <span class="text-4xl opacity-20">?</span>
              </div>
  
              <!-- Back (Revealed) -->
              <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 p-2 flex flex-col items-center justify-center shadow-md bg-white"
                   :class="[card.pictogram.backgroundColor, card.isMatched ? 'ring-4 ring-green-400 ring-opacity-50' : '']">
                 <img :src="card.pictogram.url" class="w-3/4 h-3/4 object-contain" />
                 <span class="text-xs font-bold uppercase mt-1">{{ card.pictogram.text }}</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
  .rotate-y-180 {
    will-change: transform;
    transform: rotateY(180deg);
  }
  </style>