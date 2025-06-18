<template>
  <div class="app">
    <AnimatedBackground />
    
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <span class="title-icon">🚀</span>
            Zora AI Gallery
          </h1>
          <p class="app-subtitle">
            Discover, Generate, and Explore the Future of Digital Art
          </p>
        </div>
      </header>

      <main class="app-main">
        <CoinTicker />
        <SynergyArt />
        <CoinGallery />
      </main>

      <footer class="app-footer">
        <div class="footer-content">
          <p class="footer-text">
            Powered by <strong>Zora API</strong> & <strong>Cloudflare Workers AI</strong>
          </p>
          <div class="footer-links">
            <a href="https://zora.co" target="_blank" class="footer-link">Zora</a>
            <a href="https://developers.cloudflare.com/workers-ai/" target="_blank" class="footer-link">Workers AI</a>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimatedBackground from './components/AnimatedBackground.vue';
import CoinTicker from './components/CoinTicker.vue';
import SynergyArt from './components/SynergyArt.vue';
import CoinGallery from './components/CoinGallery.vue';
</script>

<style scoped>
.app {
  min-height: 100vh;
  position: relative;
  color: #fff;
}

.app-container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.app-header {
  padding: 40px 0 60px;
  text-align: center;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.app-title {
  font-size: 4rem;
  font-weight: 900;
  margin: 0 0 16px 0;
  background: linear-gradient(45deg, #00ff88, #00d4ff, #ff0080);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  line-height: 1.2;
}

.title-icon {
  background: linear-gradient(45deg, #ff0080, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: pulse 2s ease-in-out infinite;
}

.app-subtitle {
  font-size: 1.3rem;
  color: #ccc;
  margin: 0;
  font-weight: 300;
  line-height: 1.6;
}

.app-main {
  padding-bottom: 60px;
}

.app-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px 0;
  margin-top: 40px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-text {
  margin: 0;
  color: #888;
  font-size: 0.9rem;
}

.footer-text strong {
  color: #00ff88;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-link {
  color: #00d4ff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.footer-link:hover {
  color: #00ff88;
  transform: translateY(-2px);
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #00d4ff, #00ff88);
  transition: width 0.3s ease;
}

.footer-link:hover::after {
  width: 100%;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 0 16px;
  }
  
  .app-header {
    padding: 20px 0 40px;
  }
  
  .app-title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 8px;
  }
  
  .app-subtitle {
    font-size: 1.1rem;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 2rem;
  }
  
  .app-subtitle {
    font-size: 1rem;
  }
}
</style>