<template>
  <div class="animated-background">
    <div class="gradient-overlay"></div>
    <div class="particles">
      <div 
        v-for="i in 50" 
        :key="i" 
        class="particle"
        :style="getParticleStyle()"
      ></div>
    </div>
    <div class="grid-overlay"></div>
  </div>
</template>

<script setup lang="ts">
const getParticleStyle = () => {
  const delay = Math.random() * 20;
  const duration = 10 + Math.random() * 20;
  const size = 2 + Math.random() * 4;
  
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  };
};
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    #0a0a0a 0%,
    #1a0a2e 25%,
    #16213e 50%,
    #0f3460 75%,
    #0a0a0a 100%
  );
  animation: gradientShift 20s ease-in-out infinite;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridPulse 4s ease-in-out infinite;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, #00ff88 0%, transparent 70%);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes gradientShift {
  0%, 100% {
    filter: hue-rotate(0deg);
  }
  50% {
    filter: hue-rotate(60deg);
  }
}

@keyframes gridPulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}
</style>