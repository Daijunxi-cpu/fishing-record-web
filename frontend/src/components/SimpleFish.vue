<template>
  <div 
    class="simple-fish"
    :style="{ left: x + 'px', top: y + 'px', transform: `scaleX(${direction})` }"
  >
    <svg width="60" height="30" viewBox="0 0 60 30">
      <path d="M45,15 C40,5 25,0 15,15 C25,30 40,25 45,15 Z" fill="#3498db" />
      <path d="M15,15 L5,8 L8,15 L5,22 Z" fill="#3498db" />
      <circle cx="38" cy="13" r="2" fill="white" />
      <circle cx="39" cy="13" r="1" fill="black" />
    </svg>
  </div>
</template>

<script>
export default {
  data() {
    return {
      x: 0,
      y: 0,
      direction: 1
    }
  },
  mounted() {
    document.addEventListener('mousemove', this.followMouse);
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.followMouse);
  },
  methods: {
    followMouse(e) {
      this.x = e.clientX - 30;
      this.y = e.clientY - 15;
      
      if (e.movementX > 0) {
        this.direction = -1;
      } else if (e.movementX < 0) {
        this.direction = 1;
      }
    }
  }
}
</script>

<style scoped>
.simple-fish {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}
</style>