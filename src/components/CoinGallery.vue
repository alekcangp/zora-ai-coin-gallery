<template>
  <div class="coin-gallery">
    <div class="gallery-header">
      <h2 class="gallery-title">💎 Coin Gallery</h2>
      <div class="gallery-controls">
        <select v-model="selectedListType" class="gallery-select">
          <option v-for="type in LIST_TYPES" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
        <span class="coin-count">{{ coins.length }} coins</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading coins...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="updateGallery" class="retry-button">Try Again</button>
    </div>

    <div v-else-if="coins.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No coins found</h3>
      <p>Try selecting a different list type</p>
    </div>

    <div v-else>
      <div class="gallery-grid">
        <div 
          v-for="coin in coins" 
          :key="coin.contractAddress"
          class="coin-card"
          @click="openCoin(coin.contractAddress)"
        >
          <div class="coin-image-container">
            <img 
              :src="coin.imageUrl" 
              :alt="coin.name"
              class="coin-image"
              @error="handleImageError"
            />
            <div class="coin-overlay">
              <div class="coin-details">
                <h3 class="coin-name">{{ coin.name }}</h3>
                <p class="coin-symbol">{{ coin.creator }}</p>
                <p class="coin-description">{{ truncateDescription(coin.description) }}</p>
                <div class="coin-stats" >
                  <span  class="volume">
                    Vol: ${{ formatNumber(coin.volume || 0) }}
                  </span>
                  <span 
                    v-if="coin.priceChange" 
                    class="price-change"
                    :class="{ 'positive': coin.priceChange > 0, 'negative': coin.priceChange < 0 }"
                  >
                    {{ coin.priceChange > 0 ? '+' : '' }}{{ coin.priceChange.toFixed(2) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="loadingMore" class="infinite-spinner-container">
        <div class="loading-spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import axios from 'axios';
import { LIST_TYPES, ZORA_COIN_BASE } from '../utils/constants';
import type { ListType, ZoraCoin } from '../types';

const selectedListType = ref<ListType>('NEW');
const coins = ref<ZoraCoin[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const error = ref<string | null>(null);
const nextCursor = ref<string | null>(null);

const fetchCoins = async (isInitial = false) => {
  if (loading.value || loadingMore.value) return;
  if (isInitial) loading.value = true;
  else loadingMore.value = true;
  error.value = null;
  try {
    const params: any = { 
      listType: selectedListType.value, 
      count: 20 
    };
    if (!isInitial && nextCursor.value) {
      params.after = nextCursor.value;
    }
    
    const response = await axios.get('https://api-sdk.zora.engineering/explore', { params });
    const data = response.data as { exploreList?: { edges?: any[], pageInfo?: { endCursor?: string } } };
    const newCoins = (data.exploreList?.edges || []).map((edge: any) => ({
      contractAddress: edge.node.address,
      name: edge.node.name || edge.node.symbol,
      description: edge.node.description || edge.node.name || 'No description available',
      imageUrl: edge.node.mediaContent?.previewImage?.medium,
      symbol: edge.node.symbol,
      createdAt: edge.node.createdAt,
      volume: parseFloat(edge.node.totalVolume) || 0,
      priceChange: 0,
      creator: edge.node.creatorProfile?.handle
    }));
    if (isInitial) coins.value = newCoins;
    else coins.value.push(...newCoins);
    nextCursor.value = data.exploreList?.pageInfo?.endCursor || null;
  } catch (err: any) {
    console.error('API Error:', err);
    if (err?.response?.status === 500) {
     // error.value = 'Server error (500) - API temporarily unavailable';
      loading.value = false;
      loadingMore.value = false;
      nextCursor.value = null;
    } else {
      error.value = err instanceof Error ? err.message : 'Failed to fetch coins';
    }
    
  } finally {
    
      loading.value = false;
      loadingMore.value = false;
   
    
  }
};

const openCoin = (contractAddress: string) => {
  window.open(`${ZORA_COIN_BASE}/${contractAddress}`, '_blank');
};

const truncateDescription = (description: string, maxLength: number = 120) => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + '...';
};

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(2);
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
};

const onScroll = () => {
  if (loadingMore.value || loading.value || !nextCursor.value || error.value?.includes('500')) return;
  const scrollY = window.scrollY || window.pageYOffset;
  const windowHeight = window.innerHeight;
  const docHeight = document.documentElement.offsetHeight;
  if (windowHeight + scrollY >= docHeight - 300) {
    fetchCoins(false);
  }
};

const updateGallery = async () => {
  coins.value = [];
  nextCursor.value = null;
  error.value = null;
  await fetchCoins(true);
};

onMounted(() => {
  fetchCoins(true);
  window.addEventListener('scroll', onScroll);
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

watch(selectedListType, () => {
  updateGallery();
});
</script>

<style scoped>
.coin-gallery {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 0, 128, 0.3);
  border-radius: 20px;
  padding: 32px;
  backdrop-filter: blur(20px);
  box-shadow: 0 12px 40px rgba(255, 0, 128, 0.1);
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.gallery-title {
  font-size: 2rem;
  font-weight: 800;
  color: #ff0080;
  margin: 0;
  background: linear-gradient(45deg, #ff0080, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gallery-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gallery-select {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 0, 128, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.gallery-select:focus {
  outline: none;
  border-color: #ff0080;
  box-shadow: 0 0 0 3px rgba(255, 0, 128, 0.2);
}

.coin-count {
  font-size: 0.9rem;
  color: #888;
  font-weight: 500;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #ccc;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 0, 128, 0.3);
  border-top: 3px solid #ff0080;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.retry-button {
  padding: 12px 24px;
  background: #ff0080;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
}

.retry-button:hover {
  background: #e6007a;
  transform: translateY(-2px);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.load-more-container {
  text-align: center;
  margin-top: 32px;
}

.load-more-button {
  padding: 14px 32px;
  background: linear-gradient(45deg, #ff0080, #00d4ff);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(255, 0, 128, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
}

.load-more-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 0, 128, 0.4);
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.coin-card {
  position: relative;
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 0, 128, 0.2);
}

.coin-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(255, 0, 128, 0.3);
  border-color: #ff0080;
}

.coin-image-container {
  position: relative;
  width: 100%;
  height: 200px;
}

.coin-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.coin-card:hover .coin-image {
  transform: scale(1.1);
}

.coin-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    transparent 100%
  );
  display: flex;
  align-items: flex-end;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.coin-card:hover .coin-overlay {
  opacity: 1;
}

.coin-details {
  width: 100%;
}

.coin-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
}

.coin-symbol {
  font-size: 0.9rem;
  color: #00d4ff;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.coin-description {
  font-size: 0.85rem;
  color: #ccc;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.coin-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.volume {
  color: #00ff88;
}

.price-change {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
}

.price-change.positive {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.price-change.negative {
  background: rgba(255, 0, 128, 0.2);
  color: #ff0080;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .coin-gallery {
    padding: 24px;
  }
  
  .gallery-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .gallery-title {
    font-size: 1.5rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .coin-overlay {
    opacity: 1;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8) 0%,
      transparent 100%
    );
  }
  
  .load-more-button {
    padding: 12px 24px;
    font-size: 0.9rem;
    min-width: 140px;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}

.infinite-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 32px 0 0 0;
  width: 100%;
}
</style>