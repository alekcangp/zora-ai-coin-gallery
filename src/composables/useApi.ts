import { ref, computed } from 'vue';
import type { ZoraCoin, ListType, ArtStyle, GeneratedArt } from '../types';
import { zoraApi } from '../services/zoraApi';
import { cloudflareAI } from '../services/cloudflareAI';

export function useZoraAPI() {
  const coins = ref<ZoraCoin[]>([]);
  const newCoins = ref<ZoraCoin[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCoins = async (listType: ListType, count: number = 10) => {
    loading.value = true;
    error.value = null;
    
    try {
      const fetchedCoins = await zoraApi.fetchCoins(listType, count);
      coins.value = fetchedCoins;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch coins';
    } finally {
      loading.value = false;
    }
  };

  const fetchNewCoins = async () => {
    try {
      const fetchedCoins = await zoraApi.fetchNewCoins();
      newCoins.value = fetchedCoins;
    } catch (err) {
      console.error('Failed to fetch new coins:', err);
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
  const error = ref<string | null>(null);

  const generateSynergyArt = async (coins: ZoraCoin[], style: ArtStyle) => {
    generating.value = true;
    error.value = null;

    try {
       // Shuffle an array
       for (let i = coins.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1)); // Pick a random index between 0 and i (inclusive)
         [coins[i], coins[j]] = [coins[j], coins[i]];   // Swap elements
       }
     
   // Combine all descriptions
  const smallDesc = coins
       .map(coin => coin.description)
       .filter(desc => desc.length >= 20)
       .filter(desc => desc.length < 50)
       .join('. ')

  const midlDesc = coins
       .map(coin => coin.description)
       .filter(desc => desc.length >= 50)
       .filter(desc => desc.length < 350)
       .join('. ')

  const bigDesc = coins
       .map(coin => coin.description)
       .filter(desc => desc.length >= 350)
       .join('. ')
/*
   const allDescriptions = coins
     .map(coin => coin.description)
     .filter(desc => desc.length >= 50)
     .map(desc => desc.substring(0, 200))
     .join('. ')
     .substring(0, 3000); // Limit total text
*/
      // Summarize the combined text
      const smallSummary = await cloudflareAI.summarizeText(smallDesc);
      const midlSummary = await cloudflareAI.summarizeText(midlDesc);
      const bigSummary = await cloudflareAI.summarizeText(bigDesc);

      const summary = `${bigSummary} ${midlSummary} ${smallSummary}`
      
      // Generate image from summary
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
    error: computed(() => error.value),
    generateSynergyArt,
    downloadImage
  };
}