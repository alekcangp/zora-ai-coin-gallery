import { ref, computed } from 'vue';
import type { ZoraCoin, ListType, ArtStyle, GeneratedArt } from '../types';
import { zoraApi } from '../services/zoraApi';
import { cloudflareAI } from '../services/cloudflareAI';

// Global request tracking to prevent duplicates
let currentFetchRequest: Promise<ZoraCoin[]> | null = null;
let currentNewCoinsRequest: Promise<ZoraCoin[]> | null = null;

export function useZoraAPI() {
  const coins = ref<ZoraCoin[]>([]);
  const newCoins = ref<ZoraCoin[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCoins = async (listType: ListType, count: number = 10) => {
    // If there's already a request in progress, return it
    if (currentFetchRequest) {
      return currentFetchRequest;
    }

    loading.value = true;
    error.value = null;
    
    currentFetchRequest = zoraApi.fetchCoins(listType, count);
    
    try {
      const fetchedCoins = await currentFetchRequest;
      coins.value = fetchedCoins;
      return fetchedCoins;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch coins';
      throw err;
    } finally {
      loading.value = false;
      currentFetchRequest = null;
    }
  };

  const fetchNewCoins = async () => {
    // If there's already a request in progress, return it
    if (currentNewCoinsRequest) {
      return currentNewCoinsRequest;
    }

    currentNewCoinsRequest = zoraApi.fetchNewCoins();
    
    try {
      const fetchedCoins = await currentNewCoinsRequest;
      newCoins.value = fetchedCoins;
      return fetchedCoins;
    } catch (err) {
      console.error('Failed to fetch new coins:', err);
      throw err;
    } finally {
      currentNewCoinsRequest = null;
    }
  };

  return {
    coins: computed(() => coins.value),
    newCoins: computed(() => newCoins.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchCoins,
    fetchNewCoins
  };
}

export function useAIGeneration() {
  const generatedArt = ref<GeneratedArt | null>(null);
  const generating = ref(false);
  const generatingStep = ref<string>('');
  const error = ref<string | null>(null);

  const generateSynergyArt = async (coins: ZoraCoin[], style: ArtStyle) => {
    generating.value = true;
    error.value = null;

    try {
      //generatingStep.value = 'Processing coin data...';
      
      // Shuffle coins for variety
      const shuffledCoins = [...coins];
      for (let i = shuffledCoins.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCoins[i], shuffledCoins[j]] = [shuffledCoins[j], shuffledCoins[i]];
      }
     
      // Separate descriptions by length for parallel processing
      const smallDesc = shuffledCoins
        .map(coin => coin.description)
        .filter(desc => desc.length >= 20 && desc.length < 50)
        //.slice(Math.floor(Math.random() * 10))
        .join('. ');

      const midlDesc = shuffledCoins
        .map(coin => coin.description)
        .filter(desc => desc.length >= 50 && desc.length < 550)
       // .slice(Math.floor(Math.random() * 10))
        .join('. ');

      const bigDesc = shuffledCoins
        .map(coin => coin.description)
        .filter(desc => desc.length >= 550)
        //.slice(Math.floor(Math.random() * 10))
        .join('. ');

      //const mockText = 'Zora is an onchain social network that transforms every piece of content—be it a meme, video, artwork, or podcast—into a tradable coin.';
      
      generatingStep.value = 'Run summarization...';
      
      // Run all three summarizations in parallel
      const [smallSummary, midlSummary, bigSummary] = await Promise.all([
        smallDesc ? cloudflareAI.summarizeText(smallDesc) : "",
        midlDesc ? cloudflareAI.summarizeText(midlDesc) : "",
        bigDesc ? cloudflareAI.summarizeText(bigDesc) : ""
      ]);
      
      // Join all summaries into one
      const summary = `${bigSummary} ${midlSummary} ${smallSummary}`;
      
      //const mockText = 'Zora is an onchain social network that transforms every piece of content—be it a meme, video, artwork, or podcast—into a tradable coin.';
      //const summary = await cloudflareAI.summarizeText(allDescriptions || mockText);
      generatingStep.value = 'Creating artwork...';
      // Generate image from combined summary
      const imageData = await cloudflareAI.generateImage(summary, style);
      
      generatedArt.value = {
        imageData,
        prompt: summary,
        style,
        timestamp: Date.now()
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate art';
    } finally {
      generating.value = false;
      generatingStep.value = '';
    }
  };

  const downloadImage = () => {
    if (!generatedArt.value) return;

    const link = document.createElement('a');
    link.href = generatedArt.value.imageData;
    link.download = `synergy-art-${generatedArt.value.style.toLowerCase().replace(' ', '-')}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    generatedArt: computed(() => generatedArt.value),
    generating: computed(() => generating.value),
    generatingStep: computed(() => generatingStep.value),
    error: computed(() => error.value),
    generateSynergyArt,
    downloadImage
  };
}