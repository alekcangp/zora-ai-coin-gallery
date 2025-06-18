<template>
  <div class="synergy-art">
    <div class="art-header">
      <h2 class="art-title">🎨 AI Synergy Art Generator</h2>
      <p class="art-description">
        Combine coin data, AI summarization, and image generation to create unique digital art
      </p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label class="control-label">List Type</label>
        <select v-model="selectedListType" class="control-select">
          <option v-for="type in LIST_TYPES" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label class="control-label">Art Style</label>
        <select v-model="selectedStyle" class="control-select">
          <option v-for="style in ART_STYLES" :key="style.value" :value="style.value">
            {{ style.label }}
          </option>
        </select>
      </div>

      <button 
        @click="generateArt" 
        :disabled="generating || loading"
        class="generate-button"
      >
        <span v-if="generating" class="button-content">
          <div class="spinner"></div>
          Generating...
        </span>
        <span v-else class="button-content">
          ✨ Generate Synergy Art
        </span>
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="generatedArt" class="art-display">
      <div class="art-container">
        <img 
          :src="generatedArt.imageData" 
          :alt="`${generatedArt.style} synergy art`"
          class="generated-image"
        />
        <div class="art-overlay">
          <button @click="downloadImage" class="download-button">
            💾 Download
          </button>
        </div>
      </div>
      
      <div class="art-info">
        <div class="art-details">
          <span class="art-style">Style: {{ generatedArt.style }}</span>
          <span class="art-timestamp">
            Generated: {{ new Date(generatedArt.timestamp).toLocaleString() }}
          </span>
        </div>
        <div class="art-prompt">
          <h4>AI Summary:</h4>
          <p>{{ generatedArt.prompt }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="!generating" class="art-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-icon">🎭</div>
        <h3>No art generated yet</h3>
        <p>Select a list type and art style, then click "Generate Synergy Art" to create unique AI-powered artwork from coin data.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useZoraAPI, useAIGeneration } from '../composables/useApi';
import { LIST_TYPES, ART_STYLES } from '../utils/constants';
import type { ListType, ArtStyle } from '../types';

const { coins, loading, error: apiError, fetchCoins } = useZoraAPI();
const { generatedArt, generating, error: aiError, generateSynergyArt, downloadImage } = useAIGeneration();

const selectedListType = ref<ListType>('NEW');
const selectedStyle = ref<ArtStyle>('Cyberpunk');

const error = ref<string | null>(null);

watch([apiError, aiError], ([api, ai]) => {
  error.value = api || ai;
});

const generateArt = async () => {
  error.value = null;
  
  try {
    // Fetch coins for the selected list type
    await fetchCoins(selectedListType.value, 100);
    
    if (coins.value.length === 0) {
      error.value = 'No coins found for the selected list type';
      return;
    }
    
    // Generate synergy art
    await generateSynergyArt(coins.value, selectedStyle.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to generate art';
  }
};
</script>

<style scoped>
.synergy-art {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 40px;
  backdrop-filter: blur(20px);
  box-shadow: 0 12px 40px rgba(0, 212, 255, 0.1);
}

.art-header {
  text-align: center;
  margin-bottom: 32px;
}

.art-title {
  font-size: 2rem;
  font-weight: 800;
  color: #00d4ff;
  margin: 0 0 12px 0;
  background: linear-gradient(45deg, #00d4ff, #00ff88);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.art-description {
  color: #ccc;
  font-size: 1.1rem;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.controls {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.control-select {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  color: #fff;
  font-size: 1rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.control-select:focus {
  outline: none;
  border-color: #00d4ff;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.2);
}

.generate-button {
  padding: 16px 24px;
  background: linear-gradient(45deg, #ff0080, #00d4ff);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  align-self: end;
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 0, 128, 0.4);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  color: #ff6b6b;
  margin-bottom: 24px;
  text-align: center;
}

.art-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

.art-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.generated-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.art-container:hover .generated-image {
  transform: scale(1.05);
}

.art-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.art-container:hover .art-overlay {
  opacity: 1;
}

.download-button {
  padding: 12px 24px;
  background: rgba(0, 255, 136, 0.9);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-button:hover {
  background: #00ff88;
  transform: scale(1.05);
}

.art-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.art-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.art-style {
  font-weight: 600;
  color: #00ff88;
}

.art-timestamp {
  font-size: 0.9rem;
  color: #888;
}

.art-prompt {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 0, 128, 0.2);
}

.art-prompt h4 {
  margin: 0 0 12px 0;
  color: #ff0080;
  font-size: 1.1rem;
}

.art-prompt p {
  margin: 0;
  color: #ccc;
  line-height: 1.6;
}

.art-placeholder {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 2px dashed rgba(0, 212, 255, 0.3);
  border-radius: 16px;
}

.placeholder-content {
  max-width: 400px;
  margin: 0 auto;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.placeholder-content h3 {
  margin: 0 0 12px 0;
  color: #fff;
  font-size: 1.5rem;
}

.placeholder-content p {
  margin: 0;
  color: #888;
  line-height: 1.6;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1024px) {
  .art-display {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .controls {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .synergy-art {
    padding: 24px;
  }
  
  .art-title {
    font-size: 1.5rem;
  }
}
</style>