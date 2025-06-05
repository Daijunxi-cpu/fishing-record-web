<template>
  <div class="fish-container">
    <div 
      class="fish"
      :style="{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: `scale(${direction === 'left' ? 1 : -1}, 1) rotate(${rotation}deg)`
      }"
    >
      <svg width="80" height="40" viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
        <!-- 鱼身 -->
        <path 
          d="M20,20 Q35,5 50,20 Q35,35 20,20 Z" 
          fill="#4a90e2" 
          stroke="#333" 
          stroke-width="1"
          class="fish-body"
        />
        
        <!-- 鱼尾 -->
        <path 
          d="M20,20 L5,10 L10,20 L5,30 Z" 
          fill="#4a90e2" 
          stroke="#333" 
          stroke-width="1"
          class="fish-tail"
        />
        
        <!-- 鱼鳍 -->
        <path 
          d="M35,10 Q40,5 45,10" 
          fill="none" 
          stroke="#333" 
          stroke-width="1"
          class="fish-fin"
        />
        <path 
          d="M35,30 Q40,35 45,30" 
          fill="none" 
          stroke="#333" 
          stroke-width="1"
          class="fish-fin"
        />
        
        <!-- 鱼眼 -->
        <circle cx="45" cy="17" r="3" fill="white" stroke="#333" stroke-width="1" />
        <circle cx="46" cy="17" r="1.5" fill="#333" />
        
        <!-- 鱼鳃 -->
        <path 
          d="M35,15 Q37,20 35,25" 
          fill="none" 
          stroke="#333" 
          stroke-width="1"
          class="fish-gill"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// 鱼的位置和方向
const position = ref({ x: 100, y: 100 });
const targetPosition = ref({ x: 100, y: 100 });
const direction = ref('right');
const rotation = ref(0);
const speed = ref(2);

// 鱼的游动状态
const isSwimming = ref(false);
const swimTimeout = ref(null);
const animationFrame = ref(null);

// 随机生成目标位置
const generateTargetPosition = () => {
  // 考虑视口边界，留出一定边距
  const margin = 100;
  const maxX = window.innerWidth - margin;
  const maxY = window.innerHeight - margin;
  
  targetPosition.value = {
    x: Math.max(margin, Math.min(maxX, position.value.x + (Math.random() - 0.5) * 300)),
    y: Math.max(margin, Math.min(maxY, position.value.y + (Math.random() - 0.5) * 200))
  };
  
  // 根据目标位置设置方向
  direction.value = targetPosition.value.x > position.value.x ? 'right' : 'left';
  
  // 计算旋转角度（根据移动方向）
  const dx = targetPosition.value.x - position.value.x;
  const dy = targetPosition.value.y - position.value.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  rotation.value = direction.value === 'right' ? angle : -angle;
};

// 鱼的游动动画
const swim = () => {
  if (!isSwimming.value) return;
  
  // 计算当前位置到目标位置的向量
  const dx = targetPosition.value.x - position.value.x;
  const dy = targetPosition.value.y - position.value.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 如果已经接近目标，生成新的目标
  if (distance < 10) {
    generateTargetPosition();
    return;
  }
  
  // 移动鱼
  const moveX = (dx / distance) * speed.value;
  const moveY = (dy / distance) * speed.value;
  
  position.value.x += moveX;
  position.value.y += moveY;
  
  // 继续动画
  animationFrame.value = requestAnimationFrame(swim);
};

// 跟随鼠标
const followMouse = (e) => {
  targetPosition.value = {
    x: e.clientX,
    y: e.clientY
  };
  
  // 根据鼠标位置设置方向
  direction.value = targetPosition.value.x > position.value.x ? 'right' : 'left';
  
  // 计算旋转角度
  const dx = targetPosition.value.x - position.value.x;
  const dy = targetPosition.value.y - position.value.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  rotation.value = Math.min(20, Math.max(-20, angle / 5)); // 限制旋转角度
};

// 开始游动
const startSwimming = () => {
  isSwimming.value = true;
  generateTargetPosition();
  swim();
  
  // 定期改变目标位置
  swimTimeout.value = setInterval(() => {
    generateTargetPosition();
  }, 5000);
};

onMounted(() => {
  // 初始位置设置在视口中心
  position.value = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  };
  
  // 监听鼠标移动
  window.addEventListener('mousemove', followMouse);
  
  // 开始游动
  startSwimming();
});

onUnmounted(() => {
  // 清理定时器和动画帧
  clearInterval(swimTimeout.value);
  cancelAnimationFrame(animationFrame.value);
  
  // 移除事件监听
  window.removeEventListener('mousemove', followMouse);
});
</script>

<style scoped>
.fish-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.fish {
  position: absolute;
  transition: transform 0.3s ease;
}

.fish-body {
  animation: bodyWave 2s ease-in-out infinite;
}

.fish-tail {
  animation: tailWag 0.5s ease-in-out infinite;
  transform-origin: 20px 20px;
}

.fish-fin {
  animation: finWave 1s ease-in-out infinite;
}

.fish-gill {
  animation: gillMove 2s ease-in-out infinite;
}

@keyframes bodyWave {
  0%, 100% {
    d: path('M20,20 Q35,5 50,20 Q35,35 20,20 Z');
  }
  50% {
    d: path('M20,20 Q35,8 50,20 Q35,32 20,20 Z');
  }
}

@keyframes tailWag {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(15deg);
  }
}

@keyframes finWave {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2px);
  }
}

@keyframes gillMove {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.8);
  }
}
</style>
