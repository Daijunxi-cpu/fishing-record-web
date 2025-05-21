<template>
  <div class="fishing-home">
    <!-- 顶部统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-fish"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalRecords || 0 }}</div>
          <div class="stat-label">钓鱼次数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-weight"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalFish || 0 }}</div>
          <div class="stat-label">钓获总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><i class="fas fa-trophy"></i></div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.biggestCatch || 0 }}kg</div>
          <div class="stat-label">最大收获</div>
        </div>
      </div>
    </div>

    <!-- 最近钓鱼记录展示 -->
    <div class="recent-records">
      <div class="section-header">
        <h2>最近钓鱼记录</h2>
        <button class="add-button" @click="navigateToAdd">
          <i class="fas fa-plus"></i> 添加记录
        </button>
      </div>
      
      <div class="records-grid">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="recentRecords.length === 0" class="empty-state">
          <i class="fas fa-fish empty-icon"></i>
          <p>还没有钓鱼记录，开始添加吧！</p>
          <button class="add-button" @click="navigateToAdd">添加第一条记录</button>
        </div>
        
        <div 
          v-else
          v-for="record in recentRecords" 
          :key="record.id" 
          class="record-card"
          @click="viewRecordDetail(record.id)"
        >
          <div class="record-image">
            <img 
              :src="record.photos && record.photos.length > 0 ? record.photos[0] : '/assets/default-fishing.jpg'" 
              :alt="record.fishType"
              @error="handleImageError"
            >
          </div>
          <div class="record-info">
            <div class="record-date">{{ formatDate(record.date) }}</div>
            <div class="record-fish">{{ record.fishType }}</div>
            <div class="record-location" v-if="record.location">
              <i class="fas fa-map-marker-alt"></i>
              {{ record.location }}
            </div>
            <div class="record-weather">
              <i :class="getWeatherIcon(record.weather)"></i>
              {{ getWeatherLabel(record.weather) }}
            </div>
            <div class="record-catch">
              <span class="catch-count">{{ record.count }}</span> 条
              <span class="catch-weight" v-if="record.weight">· {{ record.weight }}kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 鱼种统计 -->
    <div class="fish-stats">
      <div class="section-header">
        <h2>鱼种统计</h2>
      </div>
      
      <div class="chart-container">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="!fishStats.length" class="empty-state">
          <p>暂无统计数据</p>
        </div>
        
        <div v-else class="fish-chart">
          <!-- 这里将来可以集成图表库，如ECharts -->
          <div class="fish-stat-bars">
            <div 
              v-for="(stat, index) in fishStats" 
              :key="index"
              class="fish-stat-item"
            >
              <div class="fish-name">{{ stat.name }}</div>
              <div class="fish-bar-container">
                <div class="fish-bar" :style="{ width: `${stat.percentage}%` }"></div>
                <span class="fish-count">{{ stat.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);
const records = ref([]);
const stats = ref({
  totalRecords: 0,
  totalFish: 0,
  biggestCatch: 0
});

// 最近的钓鱼记录，限制为6条
const recentRecords = computed(() => {
  return records.value.slice(0, 6);
});

// 鱼种统计数据
const fishStats = computed(() => {
  if (!records.value.length) return [];
  
  // 统计各鱼种数量
  const fishCounts = {};
  records.value.forEach(record => {
    if (!fishCounts[record.fishType]) {
      fishCounts[record.fishType] = 0;
    }
    fishCounts[record.fishType] += record.count || 1;
  });
  
  // 转换为数组并计算百分比
  const total = Object.values(fishCounts).reduce((sum, count) => sum + count, 0);
  const statsArray = Object.entries(fishCounts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / total) * 100)
  }));
  
  // 按数量排序
  return statsArray.sort((a, b) => b.count - a.count);
});

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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

// 跳转到添加记录页面
const navigateToAdd = () => {
  router.push('/add');
};

// 查看记录详情
const viewRecordDetail = (id) => {
  router.push(`/record/${id}`);
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    // 这里将来会调用API获取数据
    // const response = await api.getRecords();
    // records.value = response.data;
    
    // 模拟数据，实际项目中会替换为API调用
    setTimeout(() => {
      records.value = [
        {
          id: 1,
          date: '2023-06-15',
          fishType: '鲤鱼',
          count: 3,
          weight: 2.5,
          location: '西湖断桥附近',
          weather: 'sunny',
          photos: ['/assets/demo/fish1.jpg']
        },
        {
          id: 2,
          date: '2023-07-20',
          fishType: '草鱼',
          count: 1,
          weight: 4.2,
          location: '钱塘江边',
          weather: 'cloudy',
          photos: ['/assets/demo/fish2.jpg']
        },
        {
          id: 3,
          date: '2023-08-05',
          fishType: '鲫鱼',
          count: 5,
          weight: 1.8,
          location: '千岛湖',
          weather: 'rainy',
          photos: []
        }
      ];
      
      stats.value = {
        totalRecords: 10,
        totalFish: 25,
        biggestCatch: 4.2
      };
      
      loading.value = false;
    }, 1000);
  } catch (error) {
    console.error('Failed to load data:', error);
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.fishing-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 20px;
  opacity: 0.8;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 章节标题样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
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

/* 记录卡片网格 */
.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.record-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.record-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.record-image {
  height: 180px;
  overflow: hidden;
}

.record-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.record-card:hover .record-image img {
  transform: scale(1.05);
}

.record-info {
  padding: 15px;
}

.record-date {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.record-fish {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

.record-weather, .record-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.record-location i {
  color: #e74c3c;
}

.record-catch {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.catch-count {
  font-weight: 600;
  color: #e74c3c;
}

.catch-weight {
  margin-left: 5px;
}

/* 鱼种统计样式 */
.fish-stats {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.fish-stat-bars {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.fish-stat-item {
  display: flex;
  align-items: center;
}

.fish-name {
  width: 80px;
  font-weight: 500;
  color: #2c3e50;
}

.fish-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  height: 30px;
  background-color: #f1f1f1;
  border-radius: 15px;
  overflow: hidden;
}

.fish-bar {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2980b9);
  border-radius: 15px;
  min-width: 30px;
  transition: width 1s ease-out;
}

.fish-count {
  margin-left: 10px;
  font-weight: 600;
  color: #2c3e50;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  grid-column: 1 / -1;
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
  grid-column: 1 / -1;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.3;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .records-grid {
    grid-template-columns: 1fr;
  }
  
  .fish-stat-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .fish-name {
    width: 100%;
    margin-bottom: 5px;
  }
}
</style>