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
      // Combine all descriptions
      const allDescriptions = coins
        .map(coin => coin.description)
        .join(' ')
        .substring(0, 5000); // Limit total text

      // Summarize the combined text
      const summary = await cloudflareAI.summarizeText(allDescriptions);
      
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