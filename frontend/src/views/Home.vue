<template>
  <div class="fishing-home">
    <WaterWave />
    <PixelFisher />
    <!-- TestConnection /> -->
    <!-- 今日钓鱼运势 -->
    <div class="fortune-container">
      <div class="fortune-card">
        <div class="fortune-icon"><i class="fas fa-fish"></i></div>
        <div class="fortune-content">
          <div class="fortune-value">{{ fortune }}</div>
          <div class="fortune-label">今日运势</div>
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
          :key="record._id" 
          class="record-card"
          @click="viewRecordDetail(record._id)"
        >
          <div class="record-info">
            <div class="record-date">{{ formatDate(record.date) }}</div>
            <div class="record-fish">{{ record.fishType }}</div>
            <div class="record-location" v-if="record.location">
              <i class="fas fa-map-marker-alt"></i>
              {{ record.location.name }}
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

    <!-- 励志语句 -->
    <div class="quote-container">
      <p class="motivational-quote">{{ motivationalQuote }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { getRecords, getStatistics } from '../api';
import PixelFisher from '../components/PixelFisher.vue';
import WaterWave from '../components/WaterWave.vue';

interface FishingRecord {
  _id: string;
  date: string;
  fishType: string;
  count: number;
  weight: number;
  location: {
    name: string;
    address?: string;
  };
  weather: string;
}

interface FishStat {
  name: string;
  count: number;
  percentage: number;
}

const router = useRouter();
const loading = ref(true);
const records = ref<FishingRecord[]>([]);
const fortune = ref('');

const motivationalQuotes = [
  '每次抛竿，都是对希望的投资。',
  '耐心是钓鱼人最好的鱼饵。',
  '享受过程，渔获只是惊喜。',
  '不是鱼不好钓，是你去得不够多。',
  '愿者上钩，亦或是你征服鱼！',
  '手持钓竿，心随鱼动。',
  '每一次空军，都是下次爆护的伏笔。',
  '不在渔，在渔。',
  '钓鱼不是爱好，是生活方式。',
  '让浮漂跳舞，让心灵平静。',
];

const motivationalQuote = ref('');

const generateFortune = () => {
  const fortunes = [
    '大吉：今天钓鱼运势极佳，适合出门钓鱼！',
    '吉：今天钓鱼运势不错，可以尝试钓鱼。',
    '中吉：今天钓鱼运势一般，建议选择合适的时间。',
    '小吉：今天钓鱼运势稍差，建议改日再钓。',
    '凶：今天钓鱼运势不佳，建议休息。'
  ];
  fortune.value = fortunes[Math.floor(Math.random() * fortunes.length)];
};

const generateQuote = () => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  motivationalQuote.value = motivationalQuotes[randomIndex];
};

// 最近的钓鱼记录，限制为6条
const recentRecords = computed(() => {
  return records.value.slice(0, 6);
});

// 鱼种统计数据
const fishStats = computed(() => {
  if (!records.value.length) return [];
  
  // 统计各鱼种数量
  const fishCounts: Record<string, number> = {};
  records.value.forEach((record) => {
    if (!fishCounts[record.fishType]) {
      fishCounts[record.fishType] = 0;
    }
    fishCounts[record.fishType] += record.count;
  });
  
  // 转换为数组并计算百分比
  const total = Object.values(fishCounts).reduce((sum, count) => sum + count, 0);
  const statsArray: FishStat[] = Object.entries(fishCounts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / total) * 100)
  }));
  
  // 按数量排序
  return statsArray.sort((a, b) => b.count - a.count);
});

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 获取天气图标
const getWeatherIcon = (weather: string) => {
  const icons: Record<string, string> = {
    '晴天': 'fas fa-sun',
    '多云': 'fas fa-cloud',
    '雨天': 'fas fa-cloud-rain',
    '雪天': 'fas fa-snowflake',
    '大风': 'fas fa-wind',
    '雾天': 'fas fa-smog'
  };
  return icons[weather] || 'fas fa-sun';
};

// 获取天气文字描述
const getWeatherLabel = (weather: string) => {
  return weather || '未知';
};

// 跳转到添加记录页面
const navigateToAdd = () => {
  router.push('/add');
};

// 查看记录详情
const viewRecordDetail = (id: string) => {
  router.push(`/record/${id}`);
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const [recordsResponse, statsResponse] = await Promise.all([
      getRecords(), // 临时注释：强制 Git 检测变化
      getStatistics()
    ]);
    
    if (recordsResponse.data.success) {
      records.value = recordsResponse.data.data;
    } else {
      throw new Error(recordsResponse.data.message || '获取记录失败');
    }
    
    // 更新统计数据
    if (statsResponse.data.success) {
      // 这里可以处理统计数据
      console.log('Statistics:', statsResponse.data.data);
    }
    
    loading.value = false;
  } catch (error: any) {
    console.error('Failed to load data:', error);
    alert(error.response?.data?.message || '加载数据失败，请重试');
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
  generateFortune();
  generateQuote();
});

onActivated(() => {
  loadData();
  generateFortune();
  generateQuote();
});
</script>

<style scoped>
.fishing-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 220px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  z-index: 1;
}

/* 励志语句样式 */
.quote-container {
  text-align: center;
  margin: 20px auto;
  padding: 15px 20px;
  background-color: #e8f5e9; /* 淡绿色背景 */
  border-left: 5px solid #4caf50; /* 绿色左边框 */
  border-radius: 8px;
  max-width: 800px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.motivational-quote {
  font-size: 1.1rem;
  color: #333;
  font-style: italic;
  margin: 0;
}

/* 今日钓鱼运势样式 */
.fortune-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.fortune-card {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.fortune-card:hover {
  transform: translateY(-5px);
}

.fortune-icon {
  font-size: 2.5rem;
  margin-right: 20px;
  opacity: 0.8;
}

.fortune-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.fortune-label {
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
  position: relative;
}

.record-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, transparent 1%, rgba(255, 255, 255, 0.7) 1%) center/15000%;
  opacity: 0;
  transition: background 0.5s, opacity 1s;
}

.record-card:active::after {
  background-size: 100%;
  opacity: 1;
  transition: 0s;
}

.record-card:hover {
  transform: translateY(-5px) rotate(1deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  animation: card-wave 2s infinite ease-in-out;
}

@keyframes card-wave {
  0% { transform: translateY(-5px) rotate(0deg); }
  25% { transform: translateY(-7px) rotate(1deg); }
  50% { transform: translateY(-5px) rotate(0deg); }
  75% { transform: translateY(-7px) rotate(-1deg); }
  100% { transform: translateY(-5px) rotate(0deg); }
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