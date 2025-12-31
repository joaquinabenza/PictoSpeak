import { Pictogram, Category } from './types';

export const ARASAAC_BASE_URL = "https://static.arasaac.org/pictograms";

// Helper to construct URL
const p = (id: number, text: string, colorClass: string, keywords: string[] = []): Pictogram => ({
  id,
  url: `${ARASAAC_BASE_URL}/${id}/${id}_300.png`,
  text,
  backgroundColor: colorClass,
  keywords: [text.toLowerCase(), ...keywords]
});

// Semantic Colors (Tailwind classes mapped)
const C_PEOPLE = 'bg-yellow-200 border-yellow-400';
const C_ACTION = 'bg-green-200 border-green-400';
const C_DESC = 'bg-blue-200 border-blue-400';
const C_NOUN = 'bg-orange-200 border-orange-400';
const C_SOCIAL = 'bg-pink-200 border-pink-400';
const C_MISC = 'bg-gray-200 border-gray-400';

// Core Vocabulary (A small subset of common AAC words)
export const CORE_VOCABULARY: Pictogram[] = [
  // Social
  p(2227, "Yes", C_SOCIAL, ["ok", "agree"]),
  p(2228, "No", C_SOCIAL, ["disagree", "not"]),
  p(6916, "Hello", C_SOCIAL, ["hi", "greetings"]),
  p(6924, "Bye", C_SOCIAL, ["goodbye", "later"]),
  p(6551, "Please", C_SOCIAL, []),
  p(6552, "Thanks", C_SOCIAL, ["thank you"]),
  
  // People (Pronouns)
  p(2238, "I / Me", C_PEOPLE, ["i", "me", "my"]),
  p(2239, "You", C_PEOPLE, ["your"]),
  p(2839, "Mom", C_PEOPLE, ["mother"]),
  p(2840, "Dad", C_PEOPLE, ["father"]),
  
  // Verbs (Actions)
  p(2243, "Want", C_ACTION, ["desire", "need"]),
  p(2256, "Eat", C_ACTION, ["food", "hungry"]),
  p(2258, "Drink", C_ACTION, ["water", "thirsty"]),
  p(2270, "Go", C_ACTION, ["leave"]),
  p(2280, "Stop", C_ACTION, ["wait"]),
  p(2266, "Play", C_ACTION, ["game", "fun"]),
  p(2264, "Sleep", C_ACTION, ["tired", "bed"]),
  p(2250, "Like", C_ACTION, ["love", "good"]),
  p(2251, "Don't Like", C_ACTION, ["hate", "bad"]),
  p(2255, "See", C_ACTION, ["look", "watch"]),
  p(2254, "Hear", C_ACTION, ["listen"]),

  // Nouns (Objects/Places)
  p(2421, "Toilet", C_NOUN, ["bathroom", "wc"]),
  p(2341, "House", C_NOUN, ["home"]),
  p(2334, "School", C_NOUN, ["class"]),
  p(2311, "Water", C_NOUN, ["liquid"]),
  p(2506, "Apple", C_NOUN, ["fruit"]),
  p(2507, "Banana", C_NOUN, ["fruit"]),
  p(2522, "Cookie", C_NOUN, ["snack"]),
  p(3078, "Tablet", C_NOUN, ["ipad", "screen"]),
  
  // Descriptors
  p(2292, "Good", C_DESC, ["great"]),
  p(2293, "Bad", C_DESC, ["awful"]),
  p(2297, "Big", C_DESC, ["large"]),
  p(2298, "Little", C_DESC, ["small"]),
  p(2304, "Hot", C_DESC, ["warm"]),
  p(2305, "Cold", C_DESC, ["freezing"]),
  p(5698, "Happy", C_DESC, ["glad"]),
  p(5700, "Sad", C_DESC, ["upset", "crying"]),
];

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All', color: 'bg-white' },
  { id: 'people', name: 'People', color: 'bg-yellow-100' },
  { id: 'actions', name: 'Actions', color: 'bg-green-100' },
  { id: 'food', name: 'Food', color: 'bg-orange-100' },
  { id: 'feelings', name: 'Feelings', color: 'bg-blue-100' },
];