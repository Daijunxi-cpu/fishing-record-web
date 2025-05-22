<template>
  <div class="floating-fish-container">
    <div 
      v-for="(fish, index) in fishes" 
      :key="index"
      class="fish"
      :style="{
        left: fish.x + 'px',
        top: fish.y + 'px',
        transform: `scale(${fish.size}) rotate(${fish.rotation}deg)`,
        animationDelay: `${index * 0.2}s`
      }"
    >
      <div class="fish-body" :style="{ backgroundColor: fish.color }">
        <div class="fish-tail" :style="{ borderColor: `transparent transparent transparent ${fish.color}` }"></div>
        <div class="fish-eye"></div>
        <div class="fish-bubble"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const fishes = ref([]);
const mousePosition = ref({ x: 0, y: 0 });
const animationFrame = ref(null);

// 创建多条小鱼
const createFishes = () => {
  const newFishes = [];
  for (let i = 0; i < 5; i++) {
    newFishes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 0.4 + Math.random() * 0.4,
      rotation: 0,
      speed: 1 + Math.random() * 2,
      offset: Math.random() * Math.PI * 2,
      color: '#3498db' // 统一使用蓝色
    });
  }
  fishes.value = newFishes;
};

// 更新小鱼位置
const updateFishes = () => {
  const time = Date.now() * 0.001;
  
  fishes.value.forEach(fish => {
    // 计算到鼠标的距离
    const dx = mousePosition.value.x - fish.x;
    const dy = mousePosition.value.y - fish.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 如果距离太近，小鱼会游开
    if (distance < 100) {
      fish.x -= dx * 0.02;
      fish.y -= dy * 0.02;
    } else {
      // 否则跟随鼠标，但保持一定距离
      fish.x += dx * 0.01;
      fish.y += dy * 0.01;
    }
    
    // 添加一些随机游动
    fish.x += Math.sin(time + fish.offset) * fish.speed;
    fish.y += Math.cos(time + fish.offset) * fish.speed;
    
    // 确保小鱼不会游出屏幕
    fish.x = Math.max(0, Math.min(window.innerWidth, fish.x));
    fish.y = Math.max(0, Math.min(window.innerHeight, fish.y));
    
    // 更新旋转角度
    fish.rotation = Math.atan2(dy, dx) * (180 / Math.PI);
  });
  
  animationFrame.value = requestAnimationFrame(updateFishes);
};

// 监听鼠标移动
const handleMouseMove = (e) => {
  mousePosition.value = {
    x: e.clientX,
    y: e.clientY
  };
};

onMounted(() => {
  createFishes();
  updateFishes();
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.floating-fish-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
}

.fish {
  position: absolute;
  width: 40px;
  height: 20px;
  transition: transform 0.3s ease;
}

.fish-body {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50% 20% 20% 50%;
  animation: swim 1s ease-in-out infinite;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fish-tail {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 10px 0 10px 15px;
  animation: tailWag 0.5s ease-in-out infinite;
}

.fish-eye {
  position: absolute;
  left: 25%;
  top: 30%;
  width: 6px;
  height: 6px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #2c3e50;
}

.fish-bubble {
  position: absolute;
  left: 15%;
  top: 20%;
  width: 4px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: bubble 2s ease-in-out infinite;
}

@keyframes swim {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-3px) rotate(2deg);
  }
}

@keyframes tailWag {
  0%, 100% {
    transform: translateY(-50%) rotate(0deg);
  }
  50% {
    transform: translateY(-50%) rotate(15deg);
  }
}

@keyframes bubble {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-5px) scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: translateY(-10px) scale(0.8);
    opacity: 0;
  }
}
</style> 