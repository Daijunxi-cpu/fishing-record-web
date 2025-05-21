<template>
  <div class="record-detail-page">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="!record" class="not-found">
      <i class="fas fa-exclamation-circle"></i>
      <h2>记录不存在</h2>
      <p>无法找到该钓鱼记录，可能已被删除。</p>
      <button class="btn-primary" @click="goBack">返回</button>
    </div>
    
    <template v-else>
      <!-- 顶部操作栏 -->
      <div class="action-bar">
        <button class="btn-back" @click="goBack">
          <i class="fas fa-arrow-left"></i> 返回
        </button>
        <div class="action-buttons">
          <button class="btn-edit" @click="editRecord">
            <i class="fas fa-edit"></i> 编辑
          </button>
          <button class="btn-delete" @click="confirmDelete">
            <i class="fas fa-trash"></i> 删除
          </button>
        </div>
      </div>
      
      <!-- 照片展示区 -->
      <div class="photos-section">
        <div v-if="record.photos && record.photos.length > 0" class="photo-gallery">
          <div class="main-photo">
            <img :src="record.photos[currentPhotoIndex]" alt="钓鱼照片" @error="handleImageError">
          </div>
          
          <div v-if="record.photos.length > 1" class="photo-thumbnails">
            <button 
              class="thumbnail-nav prev" 
              @click="prevPhoto" 
              :disabled="currentPhotoIndex === 0"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <div class="thumbnails-container">
              <div 
                v-for="(photo, index) in record.photos" 
                :key="index"
                :class="['thumbnail', { active: index === currentPhotoIndex }]"
                @click="currentPhotoIndex = index"
              >
                <img :src="photo" alt="缩略图" @error="handleImageError">
              </div>
            </div>
            
            <button 
              class="thumbnail-nav next" 
              @click="nextPhoto" 
              :disabled="currentPhotoIndex === record.photos.length - 1"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
        
        <div v-else class="no-photos">
          <i class="fas fa-image"></i>
          <p>暂无照片</p>
        </div>
      </div>
      
      <!-- 记录详情信息 -->
      <div class="record-info-section">
        <div class="info-card">
          <div class="info-header">
            <h1>{{ record.fishType }}</h1>
            <div class="date-weather">
              <div class="date">
                <i class="fas fa-calendar"></i>
                {{ formatDate(record.date) }}
              </div>
              <div class="location" v-if="record.location">
                <i class="fas fa-map-marker-alt"></i>
                {{ record.location }}
              </div>
              <div class="weather">
                <i :class="getWeatherIcon(record.weather)"></i>
                {{ getWeatherLabel(record.weather) }}
              </div>
            </div>
          </div>
          
          <div class="catch-details">
            <div class="detail-item">
              <div class="detail-label">数量</div>
              <div class="detail-value">{{ record.count }} 条</div>
            </div>
            <div class="detail-item" v-if="record.weight">
              <div class="detail-label">重量</div>
              <div class="detail-value">{{ record.weight }} kg</div>
            </div>
          </div>
          
          <div class="notes" v-if="record.notes">
            <h3>备注</h3>
            <p>{{ record.notes }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const record = ref(null);
const currentPhotoIndex = ref(0);

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取天气图标
const getWeatherIcon = (weather) => {
  const icons = {
    sunny: 'fas fa-sun',
    cloudy: 'fas fa-cloud',
    rainy: 'fas fa-cloud-rain',
    snowy: 'fas fa-snowflake',
    windy: 'fas fa-wind',
    foggy: 'fas fa-smog'
  };
  return icons[weather] || 'fas fa-sun';
};

// 获取天气文字描述
const getWeatherLabel = (weather) => {
  const labels = {
    sunny: '晴天',
    cloudy: '多云',
    rainy: '雨天',
    snowy: '雪天',
    windy: '大风',
    foggy: '雾天'
  };
  return labels[weather] || weather;
};

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.src = '/assets/default-fishing.jpg';
};

// 照片导航
const nextPhoto = () => {
  if (currentPhotoIndex.value < record.value.photos.length - 1) {
    currentPhotoIndex.value++;
  }
};

const prevPhoto = () => {
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 编辑记录
const editRecord = () => {
  router.push(`/edit/${route.params.id}`);
};

// 确认删除
const confirmDelete = () => {
  if (confirm('确定要删除这条钓鱼记录吗？此操作不可恢复。')) {
    deleteRecord();
  }
};

// 删除记录
const deleteRecord = async () => {
  try {
    // 这里将来会调用API删除数据
    // await api.deleteRecord(route.params.id);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Record deleted:', route.params.id);
    
    // 删除成功后返回首页
    router.push('/');
  } catch (error) {
    console.error('Failed to delete record:', error);
    alert('删除失败，请重试');
  }
};

// 加载记录数据
const loadRecord = async () => {
  loading.value = true;
  
  try {
    // 这里将来会调用API获取数据
    // const response = await api.getRecord(route.params.id);
    // record.value = response.data;
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟数据
    record.value = {
      id: route.params.id,
      date: '2023-07-15T08:30:00',
      fishType: '鲤鱼',
      count: 3,
      weight: 2.5,
      location: '西湖断桥附近',
      weather: 'sunny',
      photos: [
        '/assets/demo/fish1.jpg',
        '/assets/demo/fish2.jpg'
      ],
      notes: '今天天气很好，在湖边钓到了几条不错的鲤鱼，水温适宜，鱼儿很活跃。使用了红虫作为诱饵，效果不错。'
    };
  } catch (error) {
    console.error('Failed to load record:', error);
    record.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRecord();
});
</script>

<style scoped>
.record-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 记录不存在状态 */
.not-found {
  text-align: center;
  padding: 100px 0;
  color: #7f8c8d;
}

.not-found i {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #e74c3c;
}

.not-found h2 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #2c3e50;
}

/* 顶部操作栏 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-back {
  background: none;
  border: none;
  color: #3498db;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-back:hover {
  color: #2980b9;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn-edit, .btn-delete {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-edit {
  background-color: #3498db;
  color: white;
}

.btn-edit:hover {
  background-color: #2980b9;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background-color: #c0392b;
}

/* 照片展示区 */
.photos-section {
  margin-bottom: 30px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.photo-gallery {
  display: flex;
  flex-direction: column;
}

.main-photo {
  width: 100%;
  height: 500px;
  overflow: hidden;
}

.main-photo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #f8f9fa;
}

.photo-thumbnails {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
}

.thumbnails-container {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  flex-grow: 1;
  scrollbar-width: thin;
  scrollbar-color: #bbb #f1f1f1;
}

.thumbnails-container::-webkit-scrollbar {
  height: 6px;
}

.thumbnails-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.thumbnails-container::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 3px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: border-color 0.2s;
  flex-shrink: 0;
}

.thumbnail.active {
  border-color: #3498db;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-nav {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 10px;
  transition: background-color 0.2s;
}

.thumbnail-nav:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.2);
}

.thumbnail-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-photos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  background-color: #f8f9fa;
  color: #7f8c8d;
}

.no-photos i {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.3;
}

/* 记录信息区 */
.record-info-section {
  margin-bottom: 30px;
}

.info-card {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.info-header {
  margin-bottom: 20px;
}

.info-header h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.date-weather {
  display: flex;
  gap: 20px;
  color: #7f8c8d;
}

.date, .weather, .location {
  display: flex;
  align-items: center;
  gap: 8px;
}

.location i {
  color: #e74c3c;
}

.catch-details {
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
}

.detail-item {
  flex: 1;
}

.detail-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.notes {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.notes h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.notes p {
  color: #34495e;
  line-height: 1.6;
  white-space: pre-line;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #2980b9;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-photo {
    height: 300px;
  }
  
  .catch-details {
    flex-direction: column;
    gap: 15px;
  }
  
  .action-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .action-buttons {
    width: 100%;
  }
  
  .btn-edit, .btn-delete {
    flex: 1;
    justify-content: center;
  }
}
</style>