import { ref, computed } from 'vue';
import { createWalletClient, custom, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import type { ImageAnalysisResult, CoinCreationData, CreatedCoin, CreationStatus } from '../types';
import { setApiKey } from '@zoralabs/coins-sdk';

// Set up your API key before making any SDK requests
setApiKey(import.meta.env.VITE_ZORA_API_KEY);

// Image Analysis Composable
export function useImageAnalysis() {
  // Helper function to compress image for AI analysis (convert to JPEG)
  const compressImage = (imageData: string, maxWidth: number = 600, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Always convert to JPEG for AI analysis
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = imageData;
    });
  };

  const analyzeImageWithAI = async (imageData: string): Promise<ImageAnalysisResult> => {
    try {
     /*
      // Use mock data instead of AI analysis
      console.log('Using mock AI analysis data');
      return {
        name: 'AI Vision Coin',
        symbol: 'AVC',
        description: 'A unique cryptocurrency generated from your uploaded image using advanced AI vision technology.'
      };
     */ 
      // Original AI analysis code (commented out)
      
      // Compress image before sending to API (convert to JPEG for better AI processing)
      console.log('Compressing image for API (converting to JPEG)...');
      const apiCompressionStart = performance.now();
      const compressedImage = await compressImage(imageData, 600, 0.2); // Compress to max 600px with 80% compression, JPEG format
      const apiCompressionTime = performance.now() - apiCompressionStart;
      console.log(`API compression completed in ${apiCompressionTime.toFixed(2)}ms (JPEG format)`);
      
      // Convert base64 to Uint8Array for the API
      const base64Data = compressedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const imageArray = new Uint8Array(byteNumbers);
      
      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: '@cf/llava-hf/llava-1.5-7b-hf',
          data: {
            image: Array.from(imageArray), // Convert to array of integers as required by the API
            prompt: "Analyze this image and suggest a name, symbol (3-5 characters), and description (max 500 characters) based on what you see. Focus on the visual elements, colors, themes, and overall aesthetic. Format your response as: NAME: [name], SYMBOL: [symbol], DESCRIPTION: [description]",
            max_tokens: 512,
            temperature: 0.7
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.result) {
        const text = data.result.description || data.result.response || '';
        return parseAIResponse(text);
      }
      
      throw new Error('AI analysis failed');
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Return fallback analysis
      return {
        name: 'AI Vision Coin',
        symbol: 'AVC',
        description: 'A unique cryptocurrency generated from your uploaded image using advanced AI vision technology.'
      };
    }
  };

  const parseAIResponse = (text: string): ImageAnalysisResult => {
    const nameMatch = text.match(/NAME:\s*([^\n,]+)/i);
    const symbolMatch = text.match(/SYMBOL:\s*([^\n,]+)/i);
    const descMatch = text.match(/DESCRIPTION:\s*([^\n]+(?:\n[^\n]+)*)/i);

    return {
      name: nameMatch?.[1]?.trim() || 'AI Generated Coin',
      symbol: symbolMatch?.[1]?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10) || 'AIC',
      description: descMatch?.[1]?.trim() || 'An AI-generated cryptocurrency based on uploaded image analysis.'
    };
  };

  return {
    analyzeImageWithAI
  };
}

// Wallet Connection Composable (Singleton State)
const walletConnected = ref(false);
const walletAddress = ref('');
const networkName = ref('');
const walletClient = ref<any>(null);
const publicClient = ref<any>(null);

export function useWallet() {
  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }
    try {
      // Check current network first
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = `0x${base.id.toString(16)}`; // Convert to hex format
      
      if (currentChainId !== targetChainId) {
        // Try to switch to Base mainnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError: any) {
          // If the network is not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainId,
                chainName: 'Base',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              }],
            });
          } else {
            throw new Error(`Please switch to Base mainnet in MetaMask. Current network: ${currentChainId}, Required: ${targetChainId}`);
          }
        }
      }
      
      // Use Base Mainnet
      const client = createWalletClient({
        chain: base,
        transport: custom(window.ethereum)
      });
      // Request accounts
      const accounts = await client.requestAddresses();
      if (!accounts.length) throw new Error('No accounts found');
      walletAddress.value = accounts[0];
      walletConnected.value = true;
      // Re-create the wallet client with the account set
      walletClient.value = createWalletClient({
        chain: base,
        transport: custom(window.ethereum),
        account: accounts[0],
      });
      // Set network name (Base Mainnet)
      networkName.value = 'Base Mainnet';
      // Set public client for Base Mainnet
      publicClient.value = createPublicClient({ chain: base, transport: http() });
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw new Error('Failed to connect wallet. Please try again.');
    }
  };

  // Check if wallet is already connected
  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        // Check current network
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        const targetChainId = `0x${base.id.toString(16)}`;
        
        if (currentChainId !== targetChainId) {
          console.warn(`Wallet connected to wrong network. Current: ${currentChainId}, Required: ${targetChainId}`);
          return; // Don't auto-connect if on wrong network
        }
        
        const client = createWalletClient({
          chain: base,
          transport: custom(window.ethereum)
        });
        const accounts = await client.requestAddresses();
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  // Check current network without connecting
  const checkCurrentNetwork = async () => {
    if (!window.ethereum) return null;
    
    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = `0x${base.id.toString(16)}`;
      
      return {
        currentChainId,
        targetChainId,
        isCorrectNetwork: currentChainId === targetChainId,
        networkName: currentChainId === targetChainId ? 'Base' : 'Unknown Network'
      };
    } catch (error) {
      console.error('Error checking network:', error);
      return null;
    }
  };

  // Add MetaMask event listeners for account and chain changes
  if (typeof window !== 'undefined' && window.ethereum && !window.ethereum._zoraEventListenersAdded) {
    window.ethereum.on('accountsChanged', async (accounts: string[]) => {
      if (accounts.length > 0) {
        walletAddress.value = accounts[0];
        walletConnected.value = true;
        networkName.value = (await checkCurrentNetwork())?.networkName || '';
      } else {
        walletAddress.value = '';
        walletConnected.value = false;
        networkName.value = '';
      }
    });
    window.ethereum.on('chainChanged', async (_chainId: string) => {
      // Re-check network and update state
      const network = await checkCurrentNetwork();
      networkName.value = network?.networkName || '';
      // Optionally, disconnect wallet if not on correct network
      if (!network?.isCorrectNetwork) {
        walletConnected.value = false;
        walletAddress.value = '';
      } else {
        // Optionally, re-fetch address
        const client = createWalletClient({ chain: base, transport: custom(window.ethereum) });
        const accounts = await client.requestAddresses();
        walletAddress.value = accounts[0] || '';
        walletConnected.value = !!accounts[0];
      }
    });
    window.ethereum._zoraEventListenersAdded = true;
  }

  return {
    walletConnected: computed(() => walletConnected.value),
    walletAddress: computed(() => walletAddress.value),
    networkName: computed(() => networkName.value),
    walletClient: computed(() => walletClient.value),
    publicClient: computed(() => publicClient.value),
    connectWallet,
    checkConnection,
    checkCurrentNetwork
  };
}

// Coin Creation Composable
export function useCoinCreation() {
  const creating = ref(false);
  const creationStatus = ref<CreationStatus[]>([]);
  const createdCoin = ref<CreatedCoin | null>(null);

  const addStatus = (message: string, type: 'pending' | 'success' | 'error' = 'pending') => {
    creationStatus.value.push({ message, type, timestamp: Date.now() });
  };

  const updateLastStatus = (type: 'success' | 'error') => {
    if (creationStatus.value.length > 0) {
      creationStatus.value[creationStatus.value.length - 1].type = type;
    }
  };

  // Helper function to compress image for IPFS (ensure <= 2MB)
  const compressImageForIPFS = (imageData: string): Promise<{ dataUrl: string, mimeType: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate aspect ratio
        const originalAspectRatio = img.width / img.height;
        
        // Start with smaller dimensions for faster processing, maintaining aspect ratio
        let maxDimension = 1200; // Max dimension (width or height)
        let width: number, height: number;
        
        if (img.width > img.height) {
          width = Math.min(img.width, maxDimension);
          height = width / originalAspectRatio;
        } else {
          height = Math.min(img.height, maxDimension);
          width = height * originalAspectRatio;
        }
        
        let quality = 0.7; // Start with lower quality for faster compression
        
        // Get original format
        const originalFormat = imageData.split(';')[0].split(':')[1];
        
        const compressAndCheck = () => {
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL(originalFormat, quality);
          
          // Check file size (approximate)
          const base64Length = dataUrl.length - `data:${originalFormat};base64,`.length;
          const fileSizeInBytes = Math.ceil(base64Length * 0.75); // Base64 to binary conversion
          const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
          
          if (fileSizeInMB <= 2) {
            resolve({ dataUrl, mimeType: originalFormat });
          } else {
            // More aggressive compression for faster processing
            if (quality > 0.2) {
              quality -= 0.2; // Reduce quality more aggressively
            } else {
              // Reduce dimensions more aggressively while maintaining aspect ratio
              maxDimension = Math.floor(maxDimension * 0.8);
              if (img.width > img.height) {
                width = Math.min(img.width, maxDimension);
                height = width / originalAspectRatio;
              } else {
                height = Math.min(img.height, maxDimension);
                width = height * originalAspectRatio;
              }
              quality = 0.7; // Reset quality
            }
            compressAndCheck();
          }
        };
        
        compressAndCheck();
      };
      img.src = imageData;
    });
  };

  const uploadToIPFS = async (imageData: string): Promise<string> => {
    const totalUploadStart = performance.now();
    try {
      addStatus('Uploading image to IPFS...');
      
      // Compress image for IPFS to ensure <= 2MB
      console.log('Compressing image for IPFS...');
      const ipfsCompressionStart = performance.now();
      const { dataUrl: compressedImageData, mimeType } = await compressImageForIPFS(imageData);
      const ipfsCompressionTime = performance.now() - ipfsCompressionStart;
      console.log(`IPFS compression completed in ${ipfsCompressionTime.toFixed(2)}ms`);
      
      // Convert base64 to blob
      const base64Data = compressedImageData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Upload to IPFS via our API endpoint
      const formData = new FormData();
      const fileExtension = mimeType.split('/')[1] || 'png';
      formData.append('file', blob, `coin-image.${fileExtension}`);

      const networkUploadStart = performance.now();
      const response = await fetch('/api/ipfs-upload', {
        method: 'POST',
        body: formData,
      });
      const networkUploadTime = performance.now() - networkUploadStart;
      console.log(`Network upload completed in ${networkUploadTime.toFixed(2)}ms`);

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.ipfsUrl) {
        throw new Error('IPFS upload failed');
      }

      const totalUploadTime = performance.now() - totalUploadStart;
      console.log(`Total IPFS upload process completed in ${totalUploadTime.toFixed(2)}ms`);
      console.log(`- Compression: ${ipfsCompressionTime.toFixed(2)}ms`);
      console.log(`- Network upload: ${networkUploadTime.toFixed(2)}ms`);

      updateLastStatus('success');
      return data.ipfsUrl;
    } catch (error) {
      const totalUploadTime = performance.now() - totalUploadStart;
      console.log(`IPFS upload failed after ${totalUploadTime.toFixed(2)}ms`);
      updateLastStatus('error');
      console.error('IPFS upload error:', error);
      // Fallback to a placeholder image URL
      return 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop';
    }
  };

  const generateMetadata = async (coinData: CoinCreationData, imageUrl: string) => {
    addStatus('Generating metadata...');
    
    try {
      // Detect MIME type from the image data
      let mimeType = "image/jpeg"; // default fallback
      
      // Extract MIME type from base64 data URL
      if (coinData.imageData && coinData.imageData.startsWith('data:')) {
        const mimeMatch = coinData.imageData.match(/^data:([^;]+);/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
      }
      
      // Map common MIME types to standard formats
      const mimeTypeMap: Record<string, string> = {
        'image/jpeg': 'image/jpeg',
        'image/jpg': 'image/jpeg',
        'image/png': 'image/png',
        'image/gif': 'image/gif',
        'image/webp': 'image/webp',
        'image/svg+xml': 'image/svg+xml'
      };
      
      mimeType = mimeTypeMap[mimeType] || mimeType;

      const metadata = {
        name: coinData.name,
        ticker: coinData.symbol,
        description: coinData.description,
        image: imageUrl,
        content: {
          mime: mimeType,
          uri: imageUrl
        }
      };

      // Validate metadata using Zora SDK
      const { validateMetadataJSON } = await import('@zoralabs/coins-sdk');
      validateMetadataJSON(metadata);

      // Upload metadata to IPFS
      const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], { 
        type: 'application/json' 
      });
      
      const formData = new FormData();
      formData.append('file', metadataBlob, 'metadata.json');

      const response = await fetch('/api/ipfs-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Metadata upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.ipfsUrl) {
        throw new Error('Metadata upload failed');
      }

      updateLastStatus('success');
      return data.ipfsUrl;
    } catch (error) {
      updateLastStatus('error');
      throw error;
    }
  };

  const createCoinOnChain = async (coinData: CoinCreationData) => {
    const totalCreationStart = performance.now();
    creating.value = true;
    creationStatus.value = [];
    createdCoin.value = null;

    try {
      // Get wallet connection
      const { walletClient, publicClient, walletAddress } = useWallet();
      if (!walletClient.value || !walletAddress.value) {
        throw new Error('Wallet not connected');
      }

      // Upload image to IPFS
      const ipfsStart = performance.now();
      addStatus('Uploading image to IPFS...');
      const { dataUrl: compressedImageData, mimeType } = await compressImageForIPFS(coinData.imageData);
      const imageUrl = await uploadToIPFS(compressedImageData);
      const ipfsTime = performance.now() - ipfsStart;
      console.log(`IPFS upload completed in ${ipfsTime.toFixed(2)}ms`);
      
      // Generate and upload metadata to IPFS
      const metadataStart = performance.now();
      addStatus('Generating metadata...');
      const metadataUrl = await generateMetadata(coinData, imageUrl);
      const metadataTime = performance.now() - metadataStart;
      console.log(`Metadata generation completed in ${metadataTime.toFixed(2)}ms`);
      
      // Validate metadata URI before creating coin
      const validationStart = performance.now();
      try {
        // Use faster local metadata validation instead of IPFS content validation
        const { validateMetadataJSON } = await import('@zoralabs/coins-sdk');
        const metadata = {
          name: coinData.name,
          ticker: coinData.symbol,
          description: coinData.description,
          image: imageUrl,
          content: {
            mime: mimeType,
            uri: imageUrl
          }
        };
        validateMetadataJSON(metadata);
        const validationTime = performance.now() - validationStart;
        console.log(`Metadata validation completed in ${validationTime.toFixed(2)}ms`);
      } catch (validationError) {
        const validationTime = performance.now() - validationStart;
        const errorMessage = validationError instanceof Error ? validationError.message : 'Unknown validation error';
        console.log(`Metadata validation failed after ${validationTime.toFixed(2)}ms:`, errorMessage);
        addStatus('Metadata validation failed', 'error');
        throw validationError;
      }
      
      // Step 3: Create coin using Zora SDK
      const blockchainStart = performance.now();
      addStatus('Creating coin on blockchain...');
      
        // Import Zora SDK dynamically
        const { createCoin } = await import('@zoralabs/coins-sdk');
        const coinParams = {
          name: coinData.name,
          symbol: coinData.symbol,
          uri: metadataUrl,
          payoutRecipient: walletAddress.value as `0x${string}`,
          chainId: base.id,
        };
        // Use viem wallet client to send transaction
        addStatus('Waiting for MetaMask confirmation...');
        const tx = await createCoin(coinParams, walletClient.value, publicClient.value);
        updateLastStatus('success');
        addStatus('Waiting for transaction confirmation...');
        // Wait for transaction receipt
        const receipt = await publicClient.value.waitForTransactionReceipt({ hash: tx.hash });
        const blockchainTime = performance.now() - blockchainStart;
        console.log(`Blockchain transaction completed in ${blockchainTime.toFixed(2)}ms`);
        
        if (receipt.status === 'success') {
          updateLastStatus('success');
          // Extract coin address from logs if available
          const coinAddress = receipt.contractAddress || receipt.logs[0]?.address || '';
          createdCoin.value = {
            address: coinAddress,
            txHash: tx.hash,
            name: coinData.name,
            symbol: coinData.symbol,
          imageUrl: imageUrl,
            metadataUrl: metadataUrl
          };
          addStatus('Coin created successfully!', 'success');
          
          const totalCreationTime = performance.now() - totalCreationStart;
          console.log(`🎉 Total coin creation completed in ${totalCreationTime.toFixed(2)}ms`);
          console.log(`📊 Breakdown:`);
          console.log(`  - IPFS upload: ${ipfsTime.toFixed(2)}ms`);
          console.log(`  - Metadata generation: ${metadataTime.toFixed(2)}ms`);
          console.log(`  - Blockchain transaction: ${blockchainTime.toFixed(2)}ms`);
        } else {
          throw new Error('Transaction failed');
      }
    } catch (error) {
      const totalCreationTime = performance.now() - totalCreationStart;
      console.log(`❌ Coin creation failed after ${totalCreationTime.toFixed(2)}ms`);
      console.error('Coin creation error:', error);
      
      // Show user-friendly error messages
      let errorMessage = 'Failed to create coin';
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('User denied')) {
          errorMessage = 'Transaction was cancelled by user';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error - please try again';
        } else if (error.message.includes('gas')) {
          errorMessage = 'Gas estimation failed - please try again';
        }
      }
      
      addStatus(errorMessage, 'error');
      throw error;
    } finally {
      creating.value = false;
    }

    // Return the created coin data
    return createdCoin.value;
  };

  return {
    creating: computed(() => creating.value),
    creationStatus: computed(() => creationStatus.value),
    createdCoin: computed(() => createdCoin.value),
    createCoinOnChain
  };
}

// Extend window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}