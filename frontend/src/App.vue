<template>
  <div class="app-container">
    <FloatingFish />
    <SimpleFish />
    <header class="app-header">
      <div class="header-content">
        <div class="logo" @click="navigateToHome">
          <img :src="fishLogo" alt="钓鱼logo" class="logo-image">
          <h1>钓鱼记录</h1>
        </div>
        
        <nav class="main-nav">
          <router-link to="/" class="nav-item" active-class="active">
            <i class="fas fa-home"></i>
            <span>首页</span>
          </router-link>
          
          <router-link to="/add" class="nav-item" active-class="active">
            <i class="fas fa-plus"></i>
            <span>添加记录</span>
          </router-link>
          
          <router-link to="/statistics" class="nav-item" active-class="active">
            <i class="fas fa-chart-bar"></i>
            <span>统计</span>
          </router-link>
          
          <router-link to="/diary" class="nav-item" active-class="active">
            <i class="fas fa-book"></i>
            <span>日记</span>
          </router-link>
        </nav>
      </div>
    </header>
    
    <main class="app-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; {{ currentYear }} 钓鱼记录应用 | 记录每一次钓鱼的美好时光</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import FloatingFish from './components/FloatingFish.vue';
import SimpleFish from './components/SimpleFish.vue';
import fishLogo from '../../src/assets/images/6.png';

const router = useRouter();
const currentYear = computed(() => new Date().getFullYear());

const navigateToHome = () => {
  router.push('/');
};
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

/* 应用容器 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 页头样式 */
.app-header {
  background-color: #2c3e50;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo i {
  font-size: 1.8rem;
  margin-right: 10px;
  color: #3498db;
}

.logo-image {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

/* 导航菜单 */
.main-nav {
  display: flex;
  gap: 20px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ecf0f1;
  text-decoration: none;
  padding: 5px 15px;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-item i {
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.nav-item span {
  font-size: 0.8rem;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background-color: #3498db;
  color: white;
}

/* 主内容区 */
.app-content {
  flex: 1;
  padding: 20px;
}

/* 页脚样式 */
.app-footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  margin-top: 40px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  font-size: 0.9rem;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .main-nav {
    width: 100%;
    justify-content: space-around;
  }
}
</style>