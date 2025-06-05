<template>
  <div class="diary-page">
    <h1 class="page-title">钓鱼日记</h1>
    
    <div class="diary-actions">
      <button class="add-button" @click="navigateToAddDiary">
        <i class="fas fa-plus"></i> 写新日记
      </button>
    </div>
    
    <div class="diary-list">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="diaries.length === 0" class="empty-state">
        <i class="fas fa-book empty-icon"></i>
        <p>还没有日记，开始记录您的钓鱼故事吧！</p>
        <button class="add-button" @click="navigateToAddDiary">写第一篇日记</button>
      </div>
      
      <div 
        v-else
        v-for="diary in diaries" 
        :key="diary._id" 
        class="diary-card"
        @click="viewDiaryDetail(diary._id)"
      >
        <div class="diary-date">{{ formatDate(diary.date) }}</div>
        <h3 class="diary-title">{{ diary.title }}</h3>
        <div class="diary-preview">{{ truncateContent(diary.content) }}</div>
        <div class="diary-footer">
          <div class="diary-mood" v-if="diary.mood">
            <i class="fas fa-heart"></i> {{ diary.mood }}
          </div>
          <div class="diary-weather" v-if="diary.weather">
            <i :class="getWeatherIcon(diary.weather)"></i> {{ diary.weather }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getDiaries } from '../api';

const router = useRouter();
const diaries = ref([]);
const loading = ref(true);

// 加载日记数据
const loadDiaries = async () => {
  loading.value = true;
  try {
    const response = await getDiaries();
    if (response.data.success) {
      diaries.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取日记失败');
    }
  } catch (error) {
    console.error('Failed to load diaries:', error);
    alert('加载日记失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 截断内容
const truncateContent = (content) => {
  if (!content) return '';
  return content.length > 100 ? content.substring(0, 100) + '...' : content;
};

// 获取天气图标
const getWeatherIcon = (weather) => {
  const icons = {
    '晴天': 'fas fa-sun',
    '多云': 'fas fa-cloud',
    '雨天': 'fas fa-cloud-rain',
    '雪天': 'fas fa-snowflake',
    '大风': 'fas fa-wind',
    '雾天': 'fas fa-smog'
  };
  return icons[weather] || 'fas fa-sun';
};

// 导航到添加日记页面
const navigateToAddDiary = () => {
  router.push('/diary/add');
};

// 查看日记详情
const viewDiaryDetail = (id) => {
  router.push(`/diary/${id}`);
};

onMounted(() => {
  loadDiaries();
});
</script>

<style scoped>
.diary-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 20px;
}

.diary-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.add-button {
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #219653;
}

.diary-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.diary-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.diary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.diary-date {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.diary-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #2c3e50;
}

.diary-preview {
  color: #555;
  margin-bottom: 15px;
  line-height: 1.5;
}

.diary-footer {
  display: flex;
  gap: 15px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.diary-mood, .diary-weather {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.3;
}
</style>