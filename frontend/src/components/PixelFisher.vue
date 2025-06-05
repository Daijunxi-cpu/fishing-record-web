<template>
  <div 
    class="pixel-fisher"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="startDrag"
    @mouseup="stopDrag"
    @mousemove="onDrag"
    @mouseleave="stopDrag"
  >
    <div class="fisher-sprite" :class="{ 'is-talking': isTalking }">
      <div class="fisher-body"></div>
      <div class="fisher-rod"></div>
    </div>
    <div class="speech-bubble" v-if="isTalking">
      {{ currentMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const position = ref({ x: 600, y: 80 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const isTalking = ref(false);
const currentMessage = ref('');
let messageTimeout = null;

const messages = [
  '今天天气真不错，适合钓鱼！',
  '要不要一起去钓鱼？',
  '我刚刚钓到一条大鱼！',
  '钓鱼最重要的是耐心~',
  '你最近钓到什么鱼了？',
  '钓鱼让我心情平静',
  '记得带防晒哦！',
  '今天的水质看起来不错',
  '钓鱼要讲究技巧的',
  '享受钓鱼的乐趣吧！'
];

const startDrag = (e) => {
  isDragging.value = true;
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  };
};

const stopDrag = () => {
  isDragging.value = false;
  showRandomMessage();
};

const onDrag = (e) => {
  if (isDragging.value) {
    position.value = {
      x: e.clientX - dragOffset.value.x,
      y: e.clientY - dragOffset.value.y
    };
  }
};

const showRandomMessage = () => {
  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }
  
  isTalking.value = true;
  currentMessage.value = messages[Math.floor(Math.random() * messages.length)];
  
  messageTimeout = setTimeout(() => {
    isTalking.value = false;
  }, 3000);
};

onMounted(() => {
  showRandomMessage();
});

onUnmounted(() => {
  if (messageTimeout) {
    clearTimeout(messageTimeout);
  }
});
</script>

<style scoped>
.pixel-fisher {
  position: fixed;
  width: 80px;
  height: 80px;
  cursor: move;
  z-index: 1000;
  user-select: none;
}

.fisher-sprite {
  position: relative;
  width: 100%;
  height: 100%;
  animation: float 2s ease-in-out infinite;
}

.fisher-body {
  position: absolute;
  width: 40px;
  height: 56px;
  background-color: #4a90e2;
  border: 2px solid #2c3e50;
  border-radius: 12px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.fisher-body::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 14px;
  background-color: #e74c3c;
  border: 2px solid #2c3e50;
  border-radius: 6px 6px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fisher-body::after {
  content: '';
  position: absolute;
  top: 15px;
  left: 8px;
  width: 8px;
  height: 8px;
  background-color: white;
  border: 2px solid #2c3e50;
  border-radius: 50%;
  box-shadow: 12px 0 0 white, 12px 0 0 2px #2c3e50;
}

.fisher-body::before {
  content: '';
  position: absolute;
  top: 25px;
  left: 4px;
  width: 6px;
  height: 4px;
  background-color: #ff9999;
  border-radius: 50%;
  opacity: 0.6;
  box-shadow: 20px 0 0 #ff9999;
}

.fisher-rod {
  position: absolute;
  top: 15px;
  right: -25px;
  width: 30px;
  height: 3px;
  background-color: #2c3e50;
  transform: rotate(-30deg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fisher-rod::after {
  content: '';
  position: absolute;
  right: -3px;
  top: -3px;
  width: 6px;
  height: 6px;
  background-color: #e74c3c;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #2c3e50;
}

.fisher-rod::before {
  content: '';
  position: absolute;
  right: -3px;
  top: -3px;
  width: 2px;
  height: 20px;
  background-color: #2c3e50;
  transform: rotate(45deg);
  transform-origin: top right;
  opacity: 0.6;
}

.speech-bubble {
  position: absolute;
  bottom: 50%;
  left: 100%;
  transform: translateY(50%);
  background-color: white;
  padding: 10px 15px;
  border-radius: 12px;
  border: 2px solid #2c3e50;
  margin-left: 12px;
  font-size: 14px;
  min-width: 200px;
  max-width: 300px;
  text-align: left;
  animation: fadeIn 0.3s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.4;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  border: 8px solid transparent;
  border-right-color: #2c3e50;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(50%) translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateY(50%) translateX(0);
  }
}

.is-talking .fisher-body {
  animation: talk 0.5s ease-in-out infinite;
}

@keyframes talk {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.95);
  }
}
</style> 