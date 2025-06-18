# 🚀 Zora AI Coin Gallery

A dynamic web application that combines **Zora API** data with **Cloudflare Workers AI** to create unique AI-powered digital art from coin information. Discover, generate, and explore the future of digital art with cutting-edge AI technology.

![Zora AI Gallery](https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop)

## ✨ Features

### 🎨 AI Synergy Art Generator
- **Text Summarization**: Uses Cloudflare's BART model to summarize coin descriptions
- **Image Generation**: Creates unique artwork using Stable Diffusion XL
- **Multiple Art Styles**: Cyberpunk, Fantasy, Futuristic, Abstract, Retro Wave, Sci-Fi
- **Real-time Generation**: Combines coin data with AI to create contextual artwork

### 💎 Live Coin Gallery
- **Real-time Data**: Fetches live coin data from Zora API
- **Multiple List Types**: NEW, TOP_GAINERS, TOP_VOLUME_24H, MOST_VALUABLE, etc.
- **Interactive Cards**: Hover effects and detailed coin information
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🔴 Live Coin Ticker
- **Auto-refresh**: Updates every 60 seconds with new coin data
- **Smooth Scrolling**: Continuous ticker with pause on hover
- **Quick Access**: Click to open coins on Zora platform


## 🛠️ Tech Stack

- **Frontend**: Vue.js 3 + TypeScript + Vite
- **AI Services**: Cloudflare Workers AI
- **Data Source**: Zora API
- **Deployment**: Vercel


## 🚀 Live Demo

**Production Site**: [https://zora-ai-coin-gallery.vercel.app/](https://zora-ai-coin-gallery.vercel.app/)



## 🚀 Deployment

### Vercel Deployment (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https://github.com/alekcangp/zora-ai-coin-gallery&env=VITE_CLOUDFLARE_ACCOUNT_ID,VITE_CLOUDFLARE_API_TOKEN)

In the Vercel set the Environment Variables:

- `VITE_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id`  
- `VITE_CLOUDFLARE_API_TOKEN=your_cloudflare_api_token`    


## 🎨 Usage Guide

### Generating AI Art
1. Navigate to the "AI Synergy Art Generator" section
2. Select a coin list type (e.g., "NEW", "TOP_GAINERS")
3. Choose an art style (e.g., "Cyberpunk", "Fantasy")
4. Click "Generate Synergy Art" (Using data from the last 50 coins of the selected type)
5. Wait for the AI to process and generate the artwork
6. Download the generated image using the download button

### Exploring Coins
1. Browse the "Coin Gallery" section
2. Use the dropdown to filter by different list types
3. Click on any coin card to open it on Zora

### Live Ticker
- Watch the live ticker for real-time coin updates
- Hover over items to pause the scrolling
- Click to open coins directly on Zora



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



---

**Made using Cursor.com and Bolt.new**
