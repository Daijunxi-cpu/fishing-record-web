<template>
  <div class="water-wave-container">
    <canvas ref="waveCanvas" class="water-wave"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const waveCanvas = ref(null);
let animationFrameId = null;
let resizeListener = null;

onMounted(() => {
  const canvas = waveCanvas.value;
  const ctx = canvas.getContext('2d');
  
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = 200;
  };
  
  resizeListener = () => resizeCanvas();
  window.addEventListener('resize', resizeListener);
  resizeCanvas();
  
  // 波浪参数
  const waves = [
    { y: 0, length: 0.01, amplitude: 10, speed: 0.03, color: 'rgba(52, 152, 219, 0.3)' },
    { y: 0, length: 0.02, amplitude: 5, speed: 0.07, color: 'rgba(41, 128, 185, 0.2)' },
    { y: 0, length: 0.015, amplitude: 8, speed: 0.05, color: 'rgba(52, 152, 219, 0.1)' }
  ];
  
  const drawWave = (time) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    waves.forEach(wave => {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      
      // 波浪移动
      wave.y += wave.speed;
      
      // 绘制波浪路径
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = Math.sin(x * wave.length + wave.y) * wave.amplitude + canvas.height / 2;
        ctx.lineTo(x, y);
      }
      
      // 完成波浪路径
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      
      // 填充波浪
      ctx.fillStyle = wave.color;
      ctx.fill();
    });
    
    animationFrameId = requestAnimationFrame(drawWave);
  };
  
  animationFrameId = requestAnimationFrame(drawWave);
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  if (resizeListener) {
    window.removeEventListener('resize', resizeListener);
    resizeListener = null;
  }
});
</script>

<style scoped>
.water-wave-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 200px;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.water-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>