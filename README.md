# 🚀 Zora AI Studio

A modern application for creating AI-powered cryptocurrencies on the Zora protocol using Base. Upload images, generate AI art, and create your own coins with advanced AI analysis.

## ✨ Features

### 🎨 AI-Powered Coin Creation
- **Image Upload & Analysis**: Upload images and get AI-generated coin suggestions
- **AI Image Generation**: Generate custom coin images with different art styles
- **Smart Analysis**: AI analyzes images to suggest names, symbols, and descriptions
- **Multiple Art Styles**: Cyberpunk, Fantasy, Futuristic, Abstract, Retro Wave, Sci-Fi

### 💎 Coin Creation & Management
- **Blockchain Integration**: Create coins on Base using Zora protocol
- **IPFS Storage**: Automatic metadata and image upload to IPFS via Pinata
- **Wallet Connection**: MetaMask integration with automatic network switching
- **Transaction Tracking**: View coin addresses and transaction hashes

### 📱 Live Coin Gallery
- **Infinite Scroll**: Browse coins with smooth infinite scroll loading
- **Real-time Data**: Fetches live coin data from Zora API
- **Multiple List Types**: NEW, TOP_GAINERS, TOP_VOLUME_24H, MOST_VALUABLE, LAST_TRADED, FEATURED, FEATURED VIDEOS
- **Interactive Cards**: Hover effects and detailed coin information

### 🔴 Live Coin Ticker
- **Auto-refresh**: Updates every 60 seconds with new coin data
- **Smooth Scrolling**: Continuous ticker with pause on hover
- **Quick Access**: Click to open coins on Zora platform

## 🛠️ Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Blockchain**: Viem + Zora SDK
- **AI Services**: Cloudflare AI (image analysis and generation)
- **Storage**: Pinata IPFS
- **Deployment**: Vercel

## 🚀 Live Demo

**Production Site**: [https://zora-ai-coin-gallery.vercel.app/](https://zora-ai-coin-gallery.vercel.app/)

## 📋 Prerequisites

Before deploying, you'll need:

1. **Cloudflare Account** with AI API access
2. **Zora API Key** for coin creation and validation
3. **Pinata Account** for IPFS storage
4. **Vercel Account** for deployment
5. **MetaMask** wallet for blockchain interactions


## 🚀 Deployment

### Quick Deploy with Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?repository-url=https://github.com/alekcangp/zora-ai-coin-gallery&env=CLOUDFLARE_ACCOUNT_ID,CLOUDFLARE_API_TOKEN,VITE_ZORA_API_KEY,PINATA_API_KEY,PINATA_API_SECRET&envDescription=Cloudflare%20AI%20API%20credentials%20for%20image%20analysis%20and%20generation&envLink=https://dash.cloudflare.com/profile/api-tokens)

**Deployment Steps:**
1. **Click the "Deploy with Vercel" button above**
2. **Enter your environment variables** when prompted:
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare Account ID
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API Token
   - `VITE_ZORA_API_KEY` - Your Zora API Key
   - `PINATA_API_KEY` - Your Pinata API Key
   - `PINATA_API_SECRET` - Your Pinata API Secret
3. **Click Deploy** and your app will be live!

## 🎨 Usage Guide

### Creating AI-Powered Coins

1. **Upload Mode**:
   - Click "Upload Coin Image" area and select an image file (PNG, JPG, GIF up to 10MB)
   - Click "Analyze with AI" to get coin suggestions
   - Review and edit the suggested name, symbol, and description
   - Click "Create Coin" to deploy on Base

2. **Generate Mode**:
   - Enter a prompt describing your desired coin (max 120 characters)
   - Select an art style (Cyberpunk, Fantasy, Futuristic, Abstract, Retro Wave, Sci-Fi)
   - Click "Generate Image" to create AI artwork
   - Click "Analyze with AI" to get coin suggestions
   - Review and edit the details, then create your coin

### Exploring Coins
1. Browse the "Coin Gallery" section
2. Use the dropdown to filter by different list types
3. Click on any coin card to open it on Zora

### Live Ticker
- Watch the live ticker for real-time coin updates
- Hover over items to pause the scrolling
- Click to open coins directly on Zora

## 🌐 Network Configuration

The application is configured for **Base**:

- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org
- **Native Currency**: ETH


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made using Cursor.com, Bolt.new, and Cloudflare AI**
