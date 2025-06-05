<template>
  <div class="diary-detail-page">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="!diary" class="not-found">
      <i class="fas fa-exclamation-circle"></i>
      <p>日记不存在或已被删除</p>
      <button class="back-button" @click="goBack">返回列表</button>
    </div>
    
    <div v-else class="diary-content">
      <div class="diary-header">
        <h1 class="diary-title">{{ diary.title }}</h1>
        <div class="diary-meta">
          <div class="diary-date">{{ formatDate(diary.date) }}</div>
          <div class="diary-mood" v-if="diary.mood">
            <i class="fas fa-heart"></i> {{ diary.mood }}
          </div>
          <div class="diary-weather" v-if="diary.weather">
            <i :class="getWeatherIcon(diary.weather)"></i> {{ diary.weather }}
          </div>
        </div>
      </div>
      
      <div class="diary-body">
        <div class="diary-text">{{ diary.content }}</div>
        
        <div class="diary-location" v-if="diary.location && diary.location.name">
          <h3>钓点</h3>
          <p>
            <i class="fas fa-map-marker-alt"></i>
            {{ diary.location.name }}
          </p>
        </div>
      </div>
      
      <div class="diary-actions">
        <button class="edit-button" @click="editDiary">
          <i class="fas fa-edit"></i> 编辑
        </button>
        <button class="delete-button" @click="confirmDelete">
          <i class="fas fa-trash"></i> 删除
        </button>
        <button class="back-button" @click="goBack">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getDiary, deleteDiary } from '../api';

const router = useRouter();
const route = useRoute();
const diary = ref(null);
const loading = ref(true);

// 加载日记数据
const loadDiary = async () => {
  loading.value = true;
  try {
    const response = await getDiary(route.params.id);
    if (response.data.success) {
      diary.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取日记失败');
    }
  } catch (error) {
    console.error('Failed to load diary:', error);
    diary.value = null;
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
    day: 'numeric',
    weekday: 'long'
  });
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

// 编辑日记
const editDiary = () => {
  router.push(`/diary/edit/${diary.value._id}`);
};

// 确认删除
const confirmDelete = async () => {
  if (confirm('确定要删除这篇日记吗？此操作不可撤销。')) {
    try {
      const response = await deleteDiary(diary.value._id);
      if (response.data.success) {
        alert('日记已删除');
        router.push('/diary');
      } else {
        throw new Error(response.data.message || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete diary:', error);
      alert(error.response?.data?.message || '删除失败，请重试');
    }
  }
};

// 返回列表
const goBack = () => {
  router.push('/diary');
};

onMounted(() => {
  loadDiary();
});
</script>

<style scoped>
.diary-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.diary-header {
  margin-bottom: 30px;
}

.diary-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.diary-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.diary-date, .diary-mood, .diary-weather {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diary-body {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.diary-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  white-space: pre-line;
  margin-bottom: 30px;
}

.diary-location {
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.diary-location h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.diary-location p {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #555;
}

.diary-location i {
  color: #e74c3c;
}

.diary-actions {
  display: flex;
  gap: 15px;
}

.edit-button, .delete-button, .back-button {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.edit-button {
  background-color: #3498db;
  color: white;
  border: none;
}

.edit-button:hover {
  background-color: #2980b9;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
  border: none;
}

.delete-button:hover {
  background-color: #c0392b;
}

.back-button {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #ddd;
}

.back-button:hover {
  background-color: #e9ecef;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
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

/* 未找到状态 */
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
  color: #7f8c8d;
}

.not-found i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #e74c3c;
}

.not-found p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .diary-actions {
    flex-direction: column;
  }
  
  .edit-button, .delete-button, .back-button {
    width: 100%;
    justify-content: center;
  }
}
</style>