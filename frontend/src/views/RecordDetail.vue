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
                {{ record.location.name }}
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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getRecord, deleteRecord as deleteRecordApi } from '../api'; // 引入 getRecord 和 deleteRecord 函数

// 定义记录的类型接口
interface FishingRecordDetail {
  _id: string; // 使用 _id 匹配后端数据
  date: string;
  fishType: string;
  count: number;
  weight?: number; // 重量可能是可选的
  location?: {
    name: string;
    address?: string;
  };
  weather?: string;
  temperature?: number;
  photos?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const record = ref<FishingRecordDetail | null>(null); // 使用定义的类型，并允许为 null
const currentPhotoIndex = ref(0);

// 格式化日期
const formatDate = (dateString: string) => {
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
const getWeatherIcon = (weather: string | undefined) => {
  const icons: Record<string, string> = {
    '晴天': 'fas fa-sun',
    '多云': 'fas fa-cloud',
    '雨天': 'fas fa-cloud-rain',
    '雪天': 'fas fa-snowflake',
    '大风': 'fas fa-wind',
    '雾天': 'fas fa-smog'
  };
  return weather ? icons[weather] || 'fas fa-sun' : 'fas fa-sun';
};

// 获取天气文字描述
const getWeatherLabel = (weather: string | undefined) => {
   return weather || '未知';
};

// 处理图片加载错误
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    target.src = '/assets/default-fishing.jpg';
  }
};

// 照片导航
const nextPhoto = () => {
  if (record.value && record.value.photos && currentPhotoIndex.value < record.value.photos.length - 1) {
    currentPhotoIndex.value++;
  }
};

const prevPhoto = () => {
  if (record.value && record.value.photos && currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 编辑记录
const editRecord = () => {
  if (record.value) {
     router.push(`/edit/${record.value._id}`); // 使用 _id 进行编辑
  }
};

// 确认删除
const confirmDelete = () => {
  if (confirm('确定要删除这条钓鱼记录吗？此操作不可恢复。') && record.value) {
    deleteRecord();
  }
};

// 删除记录
const deleteRecord = async () => {
  if (!record.value) return; // 如果没有记录，则不执行删除
  try {
    // 调用API删除数据
    await deleteRecordApi(record.value._id);
    
    console.log('Record deleted:', record.value._id);
    
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
  record.value = null; // 加载前清空当前记录
  
  const recordId = route.params.id as string; // 获取路由参数 id
  if (!recordId) {
    console.error('Record ID is missing in route parameters.');
    loading.value = false;
    // 可以导航到错误页面或首页
    router.push('/'); 
    return;
  }

  try {
    // 调用API获取数据
    const response = await getRecord(recordId);
    
    if (response.data.success) {
      record.value = response.data.data;
       // 如果 record.value.photos 为空或 undefined，currentPhotoIndex 保持 0
       if (!record.value?.photos || record.value.photos.length === 0) {
         currentPhotoIndex.value = 0;
       }
    } else {
      // 处理后端返回 success: false 的情况
      console.error('Failed to load record:', response.data.message);
      alert(response.data.message || '加载记录失败，请重试');
      // 可以选择导航回首页或其他页面
    }
    
  } catch (error: any) {
    console.error('Failed to load record:', error);
    record.value = null; // 加载失败时清空记录
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRecord();
});

// 当路由参数变化时重新加载数据（例如从一条记录详情跳转到另一条）
// watch(() => route.params.id, (newId, oldId) => {
//   if (newId !== oldId) {
//     loadRecord();
//   }
// });
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