<template>
  <div class="autocreate-coin">
    <div class="autocreate-header">
      <h2 class="autocreate-title">🤖 AI-Powered Autocreate Coin</h2>
      <p class="autocreate-description">
        Upload or generate an image and let AI create a unique cryptocurrency for you
      </p>
    </div>

    <!-- Mode Switcher -->
    <div class="mode-switcher">
      <button :class="{active: mode === 'upload'}" @click.prevent="switchMode('upload')">Upload Image</button>
      <button :class="{active: mode === 'generate'}" @click.prevent="switchMode('generate')">Generate Image</button>
    </div>

    <!-- Step 1: Image Upload or Generate -->
    <div v-if="currentStep === 'select'" class="step-container">
      <div v-if="mode === 'upload'" class="upload-section">
        <div 
          class="upload-area"
          :class="{ 'drag-over': uploadState.isDragOver, 'has-image': uploadState.image }"
          @drop="handleDrop"
          @dragover.prevent="uploadState.isDragOver = true"
          @dragleave="uploadState.isDragOver = false"
          @click="triggerFileInput"
        >
          <input
            ref="uploadFileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="file-input"
          />
          <div v-if="!uploadState.image" class="upload-placeholder">
            <div class="upload-icon">📸</div>
            <h3>Upload Your Coin Image</h3>
            <p>Drag & drop an image or click to browse</p>
            <p class="upload-hint">PNG, JPG, GIF up to 10MB</p>
          </div>
          <div v-else class="uploaded-image">
            <img :src="uploadState.image" alt="Uploaded coin image" />
            <div class="image-overlay">
              <button @click.stop="removeImage('upload')" class="remove-button">
                ❌ Remove
              </button>
            </div>
          </div>
        </div>
        <div v-if="uploadState.image && !uploadState.analyzing" class="analyze-btn-wrap-upload">
          <button @click.prevent="analyzeImage" class="analyze-button">
          🔍 Analyze Image with AI
        </button>
        </div>
        <div v-if="uploadState.analyzing && mode === 'upload'" class="analyzing-state">
          <div class="spinner"></div>
          <p>AI is analyzing your image...</p>
        </div>
      </div>
      <div v-else class="generate-section">
        <div class="generate-flex-row">
          <!-- Preview Area -->
          <div class="generate-preview-area">
            <div v-if="generateState.image" class="generated-image-preview">
              <img :src="generateState.image" alt="Generated coin image" />
              <div class="image-overlay">
                <button @click.stop="downloadGeneratedImage" class="download-button">
                  💾 Download
                </button>
              </div>
            </div>
            <div v-else class="generated-placeholder">
              <div class="placeholder-icon">🎨</div>
              <div class="placeholder-text">No image generated yet</div>
            </div>
            <div v-if="generateState.image && !generateState.analyzing" class="analyze-btn-wrap-generate">
              <button @click.prevent="analyzeImage" class="analyze-button">
                🔍 Analyze Image with AI
              </button>
            </div>
            <div v-if="generateState.analyzing && mode === 'generate'" class="analyzing-state">
              <div class="spinner"></div>
              <p>AI is analyzing your image...</p>
            </div>
          </div>
          <!-- Controls -->
          <form class="generate-form" @submit.prevent="generateImage">
            <div class="prompt-group">
              <label for="generatePrompt" class="prompt-label">Describe your coin image</label>
              <textarea
                id="generatePrompt"
                v-model="generateState.prompt"
                class="form-textarea prompt-textarea"
                placeholder="e.g. cyberpunk cat, golden dragon, futuristic robot, etc."
                maxlength="120"
                rows="5"
              ></textarea>
              <div class="char-count">{{ generateState.prompt.length }}/120</div>
            </div>
            <div class="style-group">
              <label for="generateStyle" class="style-label">Style</label>
              <select id="generateStyle" v-model="generateState.style" class="form-input style-select">
                <option v-for="style in artStyles" :key="style" :value="style">{{ style }}</option>
              </select>
            </div>
            <div class="generate-btn-center">
              <button 
                class="generate-btn"
                :disabled="generateState.generating"
                type="submit"
              >
                <span v-if="generateState.generating" class="button-content">
                  <span class="spinner-small"></span>
                  Generating...
                </span>
                <span v-else class="button-content">
                  {{ generateState.image ? 'Regenerate Image' : 'Generate Image' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Step 2: AI Generated Form -->
    <div v-if="currentStep === 'form'" class="step-container">
      <div class="form-section">
        <div class="form-header">
          <h3>✨ AI Generated Coin Details</h3>
          <p>Review and edit the AI-generated information</p>
        </div>
        <div class="coin-preview">
          <img :src="selectedImage || ''" alt="Coin preview" class="preview-image" />
          <div class="preview-details">
            <div class="form-group">
              <label class="form-label">Coin Name</label>
              <input
                v-model="coinData.name"
                type="text"
                class="form-input"
                placeholder="Enter coin name"
                maxlength="50"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Symbol</label>
              <input
                v-model="coinData.symbol"
                type="text"
                class="form-input"
                placeholder="Enter symbol (e.g., BTC)"
                maxlength="10"
                @input="formatSymbol"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="coinData.description"
                class="form-textarea"
                placeholder="Enter coin description"
                rows="4"
                maxlength="500"
              ></textarea>
              <div class="char-count">{{ coinData.description.length }}/500</div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button @click.prevent="goBack" class="back-button">
            ← Back to Image
          </button>
          <button 
            @click.prevent="proceedToCreate"
            :disabled="!isFormValid"
            class="proceed-button"
          >
            Create Coin →
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Coin Creation -->
    <div v-if="currentStep === 'create'" class="step-container">
      <div class="create-section">
        <div class="create-header">
          <h3>🚀 Create Your Coin</h3>
          <p>Connect your wallet and deploy your coin to the blockchain</p>
        </div>
        <div class="wallet-section">
          <!-- Network Warning -->
          <div v-if="showNetworkWarning" class="network-warning">
            <div class="warning-content">
              <span class="warning-icon">⚠️</span>
              <div class="warning-text">
                <h4>Switch to Base Mainnet</h4>
                <p>Please switch to Base in MetaMask</p>
              </div>
            </div>
          </div>
          
          <div v-if="!walletConnected" class="wallet-connect">
            <button @click.prevent="connectWallet" class="connect-wallet-button">
              🦊 Connect MetaMask
            </button>
            <p class="wallet-hint">You need to connect your wallet to create a coin</p>
          </div>
          <div v-else class="wallet-connected">
            <div class="wallet-info">
              <span class="wallet-icon">✅</span>
              <div class="wallet-details">
                <p class="wallet-address">{{ formatAddress(walletAddress) }}</p>
                <p class="wallet-network">Connected to {{ networkName }}</p>
              </div>
            </div>
            <div class="creation-controls">
              <button 
                @click.prevent="createCoin"
                :disabled="creating"
                class="create-coin-button"
              >
                <span v-if="creating" class="button-content">
                  <div class="spinner-small"></div>
                  {{ currentCreationStep || 'Creating Coin...' }}
                </span>
                <span v-else class="button-content">
                  💎 Create Coin
                </span>
              </button>
            </div>
          </div>
        </div>
        <!-- Creation Status hidden-->
        <div v-if="creationStatus.length > 0" class="status-section" style="display:none">
          <h4>Creation Progress</h4>
          <div class="status-list">
            <div 
              v-for="(status, index) in creationStatus"
              :key="index"
              class="status-item"
              :class="status.type"
            >
              <span class="status-icon">
                {{ status.type === 'success' ? '✅' : status.type === 'error' ? '❌' : '⏳' }}
              </span>
              <span class="status-text">{{ status.message }}</span>
            </div>
          </div>
        </div>
        
        <!-- Success Result -->
        <div v-if="createdCoin" class="success-section">
          <div class="success-card">
            <h3>🎉 Coin Created Successfully!</h3>
            <div class="coin-details">
              <div class="detail-item">
                <label>Coin Address:</label>
                <div class="address-container">
                  <code class="coin-address">{{ createdCoin.address }}</code>
                  <a 
                    :href="`https://basescan.org/address/${createdCoin.address}`"
                    target="_blank"
                    class="explorer-link"
                    title="View on Base Explorer"
                  >
                    🔍
                  </a>
                </div>
              </div>
              <div class="detail-item">
                <label>Transaction Hash:</label>
                <div class="address-container">
                  <code class="tx-hash">{{ createdCoin.txHash }}</code>
                  <a 
                    :href="`https://basescan.org/tx/${createdCoin.txHash}`"
                    target="_blank"
                    class="explorer-link"
                    title="View Transaction on Base Explorer"
                  >
                    🔍
                  </a>
                </div>
              </div>
              <div class="action-buttons">
                <a 
                  :href="`https://zora.co/coin/${createdCoin.address}`"
                  target="_blank"
                  class="zora-link"
                >
                  🔗 View on Zora
                </a>
                <button @click.prevent="createAnother" class="create-another-button">
                  ➕ Create Another
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button @click.prevent="goBack" class="back-button">
            ← Back to Edit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useImageAnalysis, useWallet, useCoinCreation } from '../composables/useAutocreate';
import { cloudflareAI } from '../services/cloudflareAI';
import { ArtStyle, CreationStatus, CreatedCoin } from '../types';

// Modes: 'upload' or 'generate'
const mode = ref<'upload' | 'generate'>('upload');

// ===== UPLOAD MODE - COMPLETELY ISOLATED STATE =====
const uploadState = ref({
  // Image state
  image: null as string | null,
  isDragOver: false,
  
  // Analysis state
  analyzing: false,
  
  // Form data
  coinData: {
    name: '',
    symbol: '',
    description: ''
  },
  
  // Step tracking
  step: 'select' as 'select' | 'form' | 'create',
  
  // Creation state
  creating: false,
  creationStep: '' as string,
  creationStatus: [] as CreationStatus[],
  createdCoin: null as CreatedCoin | null
});

// ===== GENERATE MODE - COMPLETELY ISOLATED STATE =====
const generateState = ref({
  // Image state
  image: null as string | null,
  prompt: '',
  style: 'Cyberpunk' as ArtStyle,
  generating: false,
  
  // Analysis state
  analyzing: false,
  
  // Form data
  coinData: {
    name: '',
    symbol: '',
    description: ''
  },
  
  // Step tracking
  step: 'select' as 'select' | 'form' | 'create',
  
  // Creation state
  creating: false,
  creationStep: '' as string,
  creationStatus: [] as CreationStatus[],
  createdCoin: null as CreatedCoin | null
});

// Art styles for generate mode
const artStyles: ArtStyle[] = [
  'Cyberpunk', 'Fantasy', 'Futuristic', 'Abstract', 'Retro Wave', 'Sci-Fi'
];

// Composables
const { analyzeImageWithAI } = useImageAnalysis();
const { 
  walletConnected, 
  walletAddress, 
  networkName, 
  connectWallet: connectWalletFn,
  checkCurrentNetwork
} = useWallet();
const { 
  createCoinOnChain,
  creationStatus: composableCreationStatus,
  creating: composableCreating
} = useCoinCreation();

// File input refs
const uploadFileInput = ref<HTMLInputElement>();

// Network checking state
const networkInfo = ref<any>(null);
const showNetworkWarning = ref(false);

// Add tracking for which mode initiated analysis
const analysisMode = ref<'upload' | 'generate' | null>(null);

// Computed: which image is currently selected
const selectedImage = computed(() => {
  return mode.value === 'upload' ? uploadState.value.image : generateState.value.image;
});

// Computed: which coin data to use based on current mode
const coinData = computed(() => {
  return mode.value === 'upload' ? uploadState.value.coinData : generateState.value.coinData;
});

// Computed: which step to show based on current mode
const currentStep = computed(() => {
  return mode.value === 'upload' ? uploadState.value.step : generateState.value.step;
});

// Computed: which creation status to use based on current mode
const creating = computed(() => {
  return mode.value === 'upload' ? uploadState.value.creating : generateState.value.creating;
});

const creationStatus = computed(() => {
  // Show creation status only for the mode where the coin was created
  if (uploadState.value.createdCoin && mode.value === 'upload') {
    return uploadState.value.creationStatus;
  } else if (generateState.value.createdCoin && mode.value === 'generate') {
    return generateState.value.creationStatus;
  }
  // If no coin created yet, show status from current mode
  return mode.value === 'upload' ? uploadState.value.creationStatus : generateState.value.creationStatus;
});

const currentCreationStep = computed(() => {
  return mode.value === 'upload' ? uploadState.value.creationStep : generateState.value.creationStep;
});

// Watcher to sync composable status with local state and update creation step
watch(composableCreationStatus, (newStatus) => {
  if (newStatus.length > 0) {
    const lastStatus = newStatus[newStatus.length - 1];
    let stepText = '';
    
    if (lastStatus.message.includes('Uploading image to IPFS')) {
      stepText = 'Uploading to IPFS...';
    } else if (lastStatus.message.includes('Generating metadata')) {
      stepText = 'Generating metadata...';
    } else if (lastStatus.message.includes('Creating coin on blockchain')) {
      stepText = 'Creating on blockchain...';
    } else if (lastStatus.message.includes('Waiting for transaction confirmation')) {
      stepText = 'Confirming transaction...';
    } else if (lastStatus.message.includes('Coin created successfully')) {
      stepText = 'Coin created successfully!';
    } else if (lastStatus.type === 'error') {
      stepText = 'Creation failed';
    } else {
      stepText = lastStatus.message;
    }
    
    // Update the appropriate mode's state
    if (mode.value === 'upload') {
      uploadState.value.creationStatus = [...newStatus];
      uploadState.value.creationStep = stepText;
    } else {
      generateState.value.creationStatus = [...newStatus];
      generateState.value.creationStep = stepText;
    }
  }
}, { deep: true });

// Watcher to sync composable creating state with local state
watch(composableCreating, (isCreating) => {
  if (mode.value === 'upload') {
    uploadState.value.creating = isCreating;
  } else {
    generateState.value.creating = isCreating;
  }
});

const createdCoin = computed(() => {
  // Show coin details only for the mode where it was created
  if (uploadState.value.createdCoin && mode.value === 'upload') {
    return uploadState.value.createdCoin;
  } else if (generateState.value.createdCoin && mode.value === 'generate') {
    return generateState.value.createdCoin;
  }
  return null;
});

const isFormValid = computed(() => {
  return coinData.value.name.trim().length > 0 &&
         coinData.value.symbol.trim().length > 0 &&
         coinData.value.description.trim().length > 0;
});

function switchMode(newMode: 'upload' | 'generate') {
  const previousMode = mode.value;
  mode.value = newMode;
  
  // Clear any ongoing analysis when switching modes
  uploadState.value.analyzing = false;
  generateState.value.analyzing = false;
  analysisMode.value = null;
  
  // Preserve successful coin details when switching modes
  // Only clear creation status, but keep the createdCoin data
  if (previousMode === 'upload' && newMode === 'generate') {
    // Switching from upload to generate - preserve upload coin details
    // Keep createdCoin but clear creation status
    uploadState.value.creationStatus = [];
  } else if (previousMode === 'generate' && newMode === 'upload') {
    // Switching from generate to upload - preserve generate coin details
    // Keep createdCoin but clear creation status
    generateState.value.creationStatus = [];
  }
  
  // Prevent page jumping
  event?.preventDefault();
}

function triggerFileInput() {
  uploadFileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processFile(file);
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  uploadState.value.isDragOver = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    processFile(file);
  }
}

function processFile(file: File) {
  if (!file.type.startsWith('image/')) {
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadState.value.image = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

function removeImage(type: 'upload' | 'generate') {
  if (type === 'upload') {
    uploadState.value.image = null;
    if (uploadFileInput.value) uploadFileInput.value.value = '';
    // Only clear success state if no coin was created successfully
    if (!uploadState.value.createdCoin) {
      uploadState.value.createdCoin = null;
      uploadState.value.creationStatus = [];
    }
  } else {
    generateState.value.image = null;
    // Only clear success state if no coin was created successfully
    if (!generateState.value.createdCoin) {
      generateState.value.createdCoin = null;
      generateState.value.creationStatus = [];
    }
  }
  // Prevent page jumping
  event?.preventDefault();
}

async function generateImage() {
  generateState.value.generating = true;
  try {
    // Use a default prompt if the user input is empty
    const prompt = generateState.value.prompt.trim() || 'abstract digital art, colorful, modern design';
    const img = await cloudflareAI.generateImage(prompt, generateState.value.style);
    generateState.value.image = img;
  } catch (err) {
    console.error('Failed to generate image:', err);
  } finally {
    generateState.value.generating = false;
  }
}

async function analyzeImage() {
  if (!selectedImage.value) return;
  
  // Track which mode initiated the analysis
  analysisMode.value = mode.value;
  
  if (mode.value === 'upload') {
    uploadState.value.analyzing = true;
  } else {
    generateState.value.analyzing = true;
  }
  
  try {
    const analysis = await analyzeImageWithAI(selectedImage.value);
    
    // Update the state based on which mode initiated the analysis, not current mode
    if (analysisMode.value === 'upload') {
      uploadState.value.coinData = {
        name: analysis.name || 'AI Generated Coin',
        symbol: analysis.symbol || 'AIC',
        description: analysis.description || 'An AI-generated cryptocurrency based on image.'
      };
      uploadState.value.step = 'form';
    } else if (analysisMode.value === 'generate') {
      generateState.value.coinData = {
        name: analysis.name || 'AI Generated Coin',
        symbol: analysis.symbol || 'AIC',
        description: analysis.description || 'An AI-generated cryptocurrency based on image.'
      };
      generateState.value.step = 'form';
    }
  } catch (err) {
    console.error('Failed to analyze image:', err);
  } finally {
    // Clear analysis state based on which mode initiated it
    if (analysisMode.value === 'upload') {
      uploadState.value.analyzing = false;
    } else if (analysisMode.value === 'generate') {
      generateState.value.analyzing = false;
    }
    // Reset analysis mode tracking
    analysisMode.value = null;
  }
}

function formatSymbol() {
  if (mode.value === 'upload') {
    uploadState.value.coinData.symbol = uploadState.value.coinData.symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  } else {
    generateState.value.coinData.symbol = generateState.value.coinData.symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
}

function proceedToCreate() {
  if (mode.value === 'upload') {
    uploadState.value.step = 'create';
  } else {
    generateState.value.step = 'create';
  }
  // Prevent page jumping
  event?.preventDefault();
}

function goBack() {
  if (mode.value === 'upload') {
    if (uploadState.value.step === 'form') {
      uploadState.value.step = 'select';
      // Only clear success state if no coin was created successfully
      if (!uploadState.value.createdCoin) {
        uploadState.value.createdCoin = null;
        uploadState.value.creationStatus = [];
      }
    } else if (uploadState.value.step === 'create') {
      uploadState.value.step = 'form';
      // Only clear success state if no coin was created successfully
      if (!uploadState.value.createdCoin) {
        uploadState.value.createdCoin = null;
        uploadState.value.creationStatus = [];
      }
    }
  } else {
    if (generateState.value.step === 'form') {
      generateState.value.step = 'select';
      // Only clear success state if no coin was created successfully
      if (!generateState.value.createdCoin) {
        generateState.value.createdCoin = null;
        generateState.value.creationStatus = [];
      }
    } else if (generateState.value.step === 'create') {
      generateState.value.step = 'form';
      // Only clear success state if no coin was created successfully
      if (!generateState.value.createdCoin) {
        generateState.value.createdCoin = null;
        generateState.value.creationStatus = [];
      }
    }
  }
  // Prevent page jumping
  event?.preventDefault();
}

async function connectWallet() {
  try {
    // Check current network first
    const network = await checkCurrentNetwork();
    networkInfo.value = network;
    
    if (network && !network.isCorrectNetwork) {
      showNetworkWarning.value = true;
      // Still try to connect, the wallet composable will handle network switching
    }
    
    await connectWalletFn();
    
    // Check network again after connection
    const updatedNetwork = await checkCurrentNetwork();
    networkInfo.value = updatedNetwork;
    showNetworkWarning.value = false;
  } catch (err) {
    console.error('Failed to connect wallet:', err);
    // Check if it's a network-related error
    if (err instanceof Error && err.message.includes('network')) {
      showNetworkWarning.value = true;
    }
  }
}

async function createCoin() {
  if (!selectedImage.value || !walletConnected.value) return;
  
  // Clear previous success state based on current mode
  if (mode.value === 'upload') {
    uploadState.value.createdCoin = null;
  } else {
    generateState.value.createdCoin = null;
  }
  
  try {
    const result = await createCoinOnChain({
      name: coinData.value.name,
      symbol: coinData.value.symbol,
      description: coinData.value.description,
      imageData: selectedImage.value
    });
    
    // Update the appropriate creation state based on current mode
    if (mode.value === 'upload') {
      uploadState.value.createdCoin = result;
    } else {
      generateState.value.createdCoin = result;
    }
  } catch (err) {
    console.error('Failed to create coin:', err);
  }
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function createAnother() {
  if (mode.value === 'upload') {
    uploadState.value.step = 'select';
    uploadState.value.coinData = { name: '', symbol: '', description: '' };
    uploadState.value.createdCoin = null;
    uploadState.value.creationStatus = [];
  } else {
    generateState.value.step = 'select';
    generateState.value.coinData = { name: '', symbol: '', description: '' };
    generateState.value.createdCoin = null;
    generateState.value.creationStatus = [];
  }
  // Prevent page jumping
  event?.preventDefault();
}

function downloadGeneratedImage() {
  if (!generateState.value.image) return;
  const link = document.createElement('a');
  link.href = generateState.value.image;
  link.download = `generated-coin-image-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Prevent page jumping
  event?.preventDefault();
}
</script>

<style scoped>
.autocreate-coin {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 40px;
  backdrop-filter: blur(20px);
  box-shadow: 0 12px 40px rgba(0, 255, 136, 0.1);
  scroll-behavior: smooth;
  scroll-margin-top: 20px;
}

.autocreate-header {
  text-align: center;
  margin-bottom: 32px;
}

.autocreate-title {
  font-size: 2rem;
  font-weight: 800;
  color: #00ff88;
  margin: 0 0 12px 0;
  background: linear-gradient(45deg, #00ff88, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.autocreate-description {
  color: #ccc;
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.6;
}

.step-container {
  min-height: 400px;
  scroll-behavior: smooth;
}

/* Mode Switcher */
.mode-switcher {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}
.mode-switcher button {
  padding: 12px 32px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(0,255,136,0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.mode-switcher button.active, .mode-switcher button:hover {
  background: linear-gradient(45deg, #00ff88, #00d4ff);
  color: #000;
  border-color: #00ff88;
}

/* Upload Section */
.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  height: 100%;
  justify-content: flex-start;
}

.upload-area {
  width: 100%;
  max-width: 500px;
  height: 300px;
  border: 2px dashed rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
}

.upload-area.has-image {
  border-style: solid;
  border-color: #00ff88;
}

.file-input {
  display: none;
}

.upload-placeholder {
  text-align: center;
  color: #ccc;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.upload-placeholder h3 {
  margin: 0 0 8px 0;
  color: #fff;
}

.upload-placeholder p {
  margin: 4px 0;
}

.upload-hint {
  font-size: 0.9rem;
  color: #888;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  position: relative;
}

.uploaded-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.image-overlay {
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
  border-radius: 14px;
}

.uploaded-image:hover .image-overlay {
  opacity: 1;
}

.remove-button {
  padding: 8px 16px;
  background: rgba(255, 0, 0, 0.8);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.analyze-button {
  padding: 16px 32px;
  background: linear-gradient(45deg, #00ff88, #00d4ff);
  border: none;
  border-radius: 12px;
  color: #000;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.analyze-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 136, 0.4);
}

.analyzing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #ccc;
}

/* Generate Section */
.generate-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.generate-flex-row {
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: flex-start;
  justify-content: center;
}

@media (max-width: 900px) {
  .generate-flex-row {
    flex-direction: column;
    gap: 24px;
    align-items: stretch;
  }
  .generate-preview-area {
    margin: 0 auto 24px auto;
  }
}

.generate-preview-area {
  min-width: 320px;
  max-width: 340px;
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 0;
  gap: 16px;
}

.generated-image-preview {
  position: relative;
  width: 320px;
  height: 320px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #00ff88;
}

.generated-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.generated-placeholder {
  width: 320px;
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  border: 2px dashed #00d4ff;
  background: rgba(0, 212, 255, 0.04);
  color: #00d4ff;
  font-size: 1.1rem;
  gap: 12px;
}

.placeholder-icon {
  font-size: 2.5rem;
}

.placeholder-text {
  color: #00d4ff;
  font-weight: 600;
  font-size: 1.1rem;
}

.generate-form {
  flex: 1 1 320px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  background: rgba(255,255,255,0.07);
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 rgba(0, 212, 255, 0.08);
  padding: 32px 24px 24px 24px;
  margin-top: 0;
}

.prompt-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prompt-label {
  font-size: 1rem;
  color: #00d4ff;
  font-weight: 600;
  margin-bottom: 2px;
}

.prompt-textarea {
  padding: 18px 18px;
  border-radius: 14px;
  border: 1.5px solid rgba(0, 212, 255, 0.3);
  background: rgba(255,255,255,0.08);
  color: #fff;
  font-size: 1.12rem;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  min-height: 120px;
  max-height: 300px;
}

.prompt-textarea:focus {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0,212,255,0.15);
  background: rgba(0, 212, 255, 0.07);
}

.char-count {
  font-size: 0.85rem;
  color: #888;
  text-align: right;
  margin-top: 2px;
}

.style-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
}

.style-label {
  font-size: 1rem;
  color: #00ff88;
  font-weight: 600;
  margin-bottom: 2px;
}

.generate-btn-center {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 18px;
  margin-bottom: 4px;
}

.generate-btn {
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
  align-self: unset;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 0, 128, 0.4);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.analyze-btn-wrap-generate {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  width: 100%;
}

/* Form Section */
.form-section {
  max-width: 800px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-header h3 {
  color: #00ff88;
  font-size: 1.5rem;
  margin: 0 0 8px 0;
}

.coin-preview {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.preview-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 16px;
  border: 2px solid rgba(0, 255, 136, 0.3);
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input,
.form-textarea {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #00ff88;
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.back-button {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.proceed-button {
  padding: 12px 32px;
  background: linear-gradient(45deg, #00ff88, #00d4ff);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.proceed-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 255, 136, 0.4);
}

.proceed-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Create Section */
.create-section {
  max-width: 600px;
  margin: 0 auto;
}

.create-header {
  text-align: center;
  margin-bottom: 32px;
}

.create-header h3 {
  color: #00d4ff;
  font-size: 1.5rem;
  margin: 0 0 8px 0;
}

.wallet-section {
  margin-bottom: 32px;
}

.wallet-connect {
  text-align: center;
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 0, 128, 0.3);
}

.connect-wallet-button {
  padding: 16px 32px;
  background: linear-gradient(45deg, #ff6b35, #f7931e);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;
}

.connect-wallet-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.wallet-hint {
  color: #888;
  margin: 0;
}

.wallet-connected {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 24px;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.wallet-icon {
  font-size: 1.5rem;
}

.wallet-details p {
  margin: 0;
}

.wallet-address {
  font-family: monospace;
  color: #00ff88;
  font-weight: 600;
}

.wallet-network {
  color: #888;
  font-size: 0.9rem;
}

.create-coin-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(45deg, #ff0080, #00d4ff);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-coin-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 0, 128, 0.4);
}

.create-coin-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* Status Section */
.status-section {
  margin: 32px 0;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.status-section h4 {
  margin: 0 0 16px 0;
  color: #fff;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.status-item.success {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.status-item.error {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
}

.status-item.pending {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
}

/* Success Section */
.success-section {
  margin: 32px 0;
}

.success-card {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
}

.success-card h3 {
  color: #00ff88;
  margin: 0 0 24px 0;
}

.coin-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.detail-item label {
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
}

.address-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coin-address,
.tx-hash {
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.9rem;
  color: #00d4ff;
  flex: 1;
  word-break: break-all;
}

.explorer-link {
  padding: 8px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 4px;
  color: #00ff88;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.explorer-link:hover {
  background: rgba(0, 255, 136, 0.2);
  border-color: #00ff88;
  transform: scale(1.05);
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}

.zora-link {
  padding: 12px 24px;
  background: linear-gradient(45deg, #ff0080, #00d4ff);
  border-radius: 8px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.zora-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 0, 128, 0.4);
}

.create-another-button {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-another-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Animations */
.spinner,
.spinner-small {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner {
  width: 32px;
  height: 32px;
}

.spinner-small {
  width: 16px;
  height: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .autocreate-coin {
    padding: 24px;
  }
  
  .autocreate-title {
    font-size: 1.5rem;
  }
  
  .coin-preview {
    grid-template-columns: 1fr;
    gap: 24px;
    text-align: center;
  }
  
  .preview-image {
    margin: 0 auto;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .address-container {
    flex-direction: column;
    align-items: stretch;
  }
}

.analyze-btn-wrap-upload {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  width: 100%;
  height: 60px;
  align-items: center;
}

.download-button {
  padding: 8px 16px;
  background: rgba(0, 255, 136, 0.9);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 12px;
}

.download-button:hover {
  background: #00ff88;
  transform: scale(1.05);
}

.generated-image-preview:hover .image-overlay {
  opacity: 1;
}

/* Network Warning */
.network-warning {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.warning-icon {
  font-size: 1.5rem;
}

.warning-text {
  flex: 1;
}

.warning-text h4 {
  margin: 0 0 8px 0;
  color: #fff;
}

.warning-text p {
  margin: 0;
  color: #888;
}

.network-details {
  font-size: 0.9rem;
  color: #888;
}
</style>