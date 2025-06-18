import axios from 'axios';
import type { ZoraCoin, ListType } from '../types';
import { ZORA_API_BASE } from '../utils/constants';

const api = axios.create({
  baseURL: ZORA_API_BASE,
  timeout: 10000,
});

export const zoraApi = {
  async fetchCoins(listType: ListType, count: number = 10): Promise<ZoraCoin[]> {
    try {
      const response = await api.get(`/explore?listType=${listType}&count=${count}`);
      
      // Mock response structure - replace with actual Zora API response mapping
      return response.data?.exploreList?.edges?.map((coin: any) => {
        const volumeValue = parseFloat(coin.node.totalVolume);
        
        return {
          contractAddress: coin.node.address,
          name: coin.node.name || coin.node.symbol,
          description: coin.node.description || coin.node.name || 'No description available',
          imageUrl: coin.node.mediaContent.previewImage.medium,
          symbol: coin.node.symbol,
          createdAt: coin.node.createdAt,
          volume: !isNaN(volumeValue) ? volumeValue : 0,
          priceChange: 0,
          creator: coin.node.creatorProfile.handle
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching coins:', error);
      // Return mock data for development
      return generateMockCoins(count, listType);
    }
  },

  async fetchNewCoins(): Promise<ZoraCoin[]> {
    return this.fetchCoins('NEW', 10);
  }
};

// Mock data generator for development
function generateMockCoins(count: number, listType: ListType): ZoraCoin[] {
  const mockCoins: ZoraCoin[] = [];
  
  for (let i = 0; i < Math.min(count, 20); i++) {
    mockCoins.push({
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      name: `${listType} Coin ${i + 1}`,
      description: `This is a ${listType.toLowerCase()} cryptocurrency with innovative features and strong community support. Built on cutting-edge blockchain technology.`,
      imageUrl: `https://images.pexels.com/photos/${1000000 + Math.floor(Math.random() * 1000000)}/pexels-photo-${1000000 + Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop`,
      symbol: `${listType.substr(0, 3)}${i}`,
      volume: Math.random() * 1000000,
      priceChange: (Math.random() - 0.5) * 20
    });
  }
  
  return mockCoins;
}