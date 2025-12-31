import { GoogleGenAI, Modality, type FunctionDeclaration, Type } from "@google/genai";
import type {  Pictogram, AgentResponse } from "../app/types";

// Helper for Base64 decoding for Audio
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const speakText = async (text: string, voiceName: string = 'Kore') => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Falling back to browser TTS.");
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using Gemini TTS model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
    
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();

  } catch (error) {
    console.error("Gemini TTS failed, fallback to browser:", error);
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
};

export const refineSentence = async (pictograms: Pictogram[]): Promise<string> => {
  if (!process.env.API_KEY || pictograms.length === 0) {
     return pictograms.map(p => p.text).join(" ");
  }

  const rawString = pictograms.map(p => p.text).join(" ");

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Convert this sequence of AAC pictogram keywords into a grammatically correct, simple sentence for a child. Do not add markdown or explanations. just the sentence. Keywords: ${rawString}`,
    });
    
    return response.text?.trim() || rawString;
  } catch (e) {
    console.error("Refinement failed", e);
    return rawString;
  }
};

export const textToKeywords = async (text: string): Promise<string[]> => {
    if (!process.env.API_KEY || !text) return text.split(" ");
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Extract the main keywords from this sentence that would match standard AAC pictograms (nouns, verbs, adjectives). Return them as a comma-separated list. Sentence: "${text}"`,
        });
        const result = response.text?.trim();
        return result ? result.split(",").map(s => s.trim().toLowerCase()) : text.split(" ");
    } catch (e) {
        return text.split(" ");
    }
};

// --- AI Agent Logic ---

const showPictogramsTool: FunctionDeclaration = {
  name: "show_pictograms",
  description: "Display a sequence of pictograms to the user to form a sentence based on their request.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      keywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of keywords for the pictograms (e.g. ['i', 'want', 'apple'])"
      }
    },
    required: ["keywords"]
  }
};

export const runAgentCommand = async (
  input: string, 
  context: { isNight: boolean, location?: { lat: number, lng: number } }
): Promise<AgentResponse> => {
  if (!process.env.API_KEY) {
    return { text: "I can't connect to my brain right now. Please check your API key." };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct system instructions
    let systemInstruction = `You are a friendly, caring AI companion for an autistic child. 
    Your goal is to help them communicate and stay safe.
    - If the user asks to say something or wants to communicate, use the 'show_pictograms' tool with simple keywords.
    - Speak simply, warmly, and encouragingly.
    - If it is night time (${context.isNight ? 'IT IS NIGHT/LATE' : 'It is daytime'}), be extra careful about safety.
    - If the user seems lost or it's late, you can use Google Maps to find a route home or show their location.
    `;

    const model = "gemini-2.5-flash"; // Using 2.5-flash for Maps grounding support
    
    const requestConfig: any = {
      tools: [
        { functionDeclarations: [showPictogramsTool] },
        { googleMaps: {} }
      ],
      systemInstruction: systemInstruction,
    };
    
    // Add location context if available for Maps
    if (context.location) {
      requestConfig.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: context.location.lat,
            longitude: context.location.lng
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model,
      contents: input,
      config: requestConfig
    });

    let result: AgentResponse = {
      text: response.text || "I'm listening..."
    };

    // Check for Function Calls (Pictograms)
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'show_pictograms') {
        result.action = 'SHOW_PICTOGRAMS';
        // The args come as a plain object in the SDK
        result.keywords = (call.args as any).keywords; 
        result.text = "Here are the pictograms for that.";
      }
    }

    // Check for Maps Grounding
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      // Find the first map chunk
      const mapChunk = groundingChunks.find((c: any) => c.web?.uri?.includes('google.com/maps') || c.web?.uri?.includes('maps.google.com'));
      
      // Note: gemini-2.5-flash googleMaps tool usually returns chunks in a specific format, 
      // but sometimes it's just web search grounding if maps tool isn't strictly enforced.
      // We look for any valid URI.
      if (mapChunk && mapChunk.web) {
        result.mapData = {
          uri: mapChunk.web.uri,
          title: mapChunk.web.title || "View on Map"
        };
      }
    }

    return result;

  } catch (error) {
    console.error("Agent error:", error);
    return { text: "Sorry, I had trouble understanding that." };
  }
};