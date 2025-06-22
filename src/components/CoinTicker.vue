<template>
  <div class="coin-ticker">
    <div class="ticker-header">
      <h2 class="ticker-title">🔴 LIVE: New Coins</h2>
      <div class="update-indicator" :class="{ 'updating': isUpdating }">
        <span class="dot"></span>
        <span class="text">Auto-refresh: {{ countdown }}s</span>
      </div>
    </div>
    
    <div class="ticker-container">
      <div class="ticker-content" :class="{ 'paused': isPaused }">
        <div 
          v-for="coin in displayCoins" 
          :key="coin.contractAddress"
          class="ticker-item"
          @click="openCoin(coin.contractAddress)"
          @mouseenter="isPaused = true"
          @mouseleave="isPaused = false"
        >
          <div class="coin-image">
            <img :src="coin.imageUrl" :alt="coin.name" />
          </div>
          <div class="coin-info">
            <span class="coin-name truncate">{{ coin.name }}</span>
            <span class="coin-symbol">{{ coin.creator }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useZoraAPI } from '../composables/useApi';
import { ZORA_COIN_BASE, REFRESH_INTERVAL } from '../utils/constants';

const { newCoins, fetchNewCoins } = useZoraAPI();

const isUpdating = ref(false);
const isPaused = ref(false);
const countdown = ref(60);

let refreshInterval: ReturnType<typeof setInterval>;
let countdownInterval: ReturnType<typeof setInterval>;

const displayCoins = computed(() => {
  // Duplicate coins for seamless scrolling
  return [...newCoins.value, ...newCoins.value];
});

const updateCoins = async () => {
  isUpdating.value = true;
  await fetchNewCoins();
  isUpdating.value = false;
  countdown.value = 60;
};

const openCoin = (contractAddress: string) => {
  window.open(`${ZORA_COIN_BASE}/${contractAddress}`, '_blank');
};

onMounted(() => {
  updateCoins();
  
  refreshInterval = setInterval(updateCoins, REFRESH_INTERVAL);
  
  countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    }
  }, 1000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
  if (countdownInterval) clearInterval(countdownInterval);
});
</script>

<style scoped>
.coin-ticker {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.1);
}

.ticker-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.ticker-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #00ff88;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.update-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #888;
}

.update-indicator.updating .dot {
  background: #ff0080;
  animation: pulse 1s infinite;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff88;
}

.ticker-container {
  overflow: hidden;
  position: relative;
  height: 80px;
}

.ticker-content {
  display: flex;
  gap: 24px;
  animation: scroll 30s linear infinite;
  align-items: center;
  height: 100%;
}

.ticker-content.paused {
  animation-play-state: paused;
}

.ticker-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
}

.ticker-item:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 255, 136, 0.2);
}

.coin-image {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(0, 255, 136, 0.3);
  flex-shrink: 0;
}

.coin-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.coin-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.coin-name {
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.coin-symbol {
  font-size: 0.8rem;
  color: #00d4ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@media (max-width: 768px) {
  .ticker-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .ticker-item {
    min-width: 160px;
  }
  
  .coin-name {
    font-size: 0.8rem;
  }
}
</style>