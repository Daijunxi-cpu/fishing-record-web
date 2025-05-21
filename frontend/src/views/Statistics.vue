<template>
  <div class="statistics-page">
    <h1 class="page-title">钓鱼统计</h1>
    
    <div class="stats-container">
      <!-- 总体统计卡片 -->
      <div class="stats-summary">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalTrips }}</div>
            <div class="stat-label">总钓鱼次数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-fish"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalFish }}</div>
            <div class="stat-label">总钓获数量</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-weight"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ totalWeight }}kg</div>
            <div class="stat-label">总重量</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-trophy"></i></div>
          <div class="stat-content">
            <div class="stat-value">{{ biggestCatch }}kg</div>
            <div class="stat-label">最大单次收获</div>
          </div>
        </div>
      </div>
      
      <!-- 鱼种分布统计 -->
      <div class="chart-section">
        <h2 class="section-title">鱼种分布</h2>
        <div class="chart-container">
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          
          <div v-else-if="!fishTypeData.length" class="empty-state">
            <p>暂无数据</p>
          </div>
          
          <div v-else class="fish-distribution">
            <!-- 饼图区域 - 实际项目中可以集成ECharts等图表库 -->
            <div class="pie-chart-placeholder">
              <div class="pie-segments">
                <div 
                  v-for="(item, index) in fishTypeData" 
                  :key="index"
                  class="pie-segment"
                  :style="{
                    '--segment-color': getColorByIndex(index),
                    '--segment-start': item.startAngle + 'deg',
                    '--segment-end': item.endAngle + 'deg'
                  }"
                ></div>
              </div>
              <div class="pie-center">
                <span>{{ totalFish }}</span>
                <small>总数量</small>
              </div>
            </div>
            
            <!-- 图例 -->
            <div class="chart-legend">
              <div 
                v-for="(item, index) in fishTypeData" 
                :key="index"
                class="legend-item"
              >
                <div class="legend-color" :style="{ backgroundColor: getColorByIndex(index) }"></div>
                <div class="legend-label">{{ item.name }}</div>
                <div class="legend-value">{{ item.value }} ({{ item.percentage }}%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 月度趋势 -->
      <div class="chart-section">
        <h2 class="section-title">月度趋势</h2>
        <div class="chart-container">
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          
          <div v-else-if="!monthlyData.length" class="empty-state">
            <p>暂无数据</p>
          </div>
          
          <div v-else class="monthly-trend">
            <!-- 柱状图 - 实际项目中可以集成ECharts等图表库 -->
            <div class="bar-chart">
              <div class="chart-y-axis">
                <div v-for="n in 5" :key="n" class="y-axis-label">
                  {{ Math.round(maxMonthlyCount * (6 - n) / 5) }}
                </div>
              </div>
              
              <div class="chart-bars">
                <div 
                  v-for="(item, index) in monthlyData" 
                  :key="index"
                  class="chart-bar-group"
                >
                  <div 
                    class="chart-bar" 
                    :style="{ height: `${(item.count / maxMonthlyCount) * 100}%` }"
                  >
                    <span class="bar-value">{{ item.count }}</span>
                  </div>
                  <div class="bar-label">{{ item.month }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最佳钓鱼时间 -->
      <div class="chart-section">
        <h2 class="section-title">最佳钓鱼时间</h2>
        <div class="chart-container">
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>
          
          <div v-else-if="!timeData.length" class="empty-state">
            <p>暂无数据</p>
          </div>
          
          <div v-else class="best-time">
            <!-- 热力图 - 实际项目中可以集成ECharts等图表库 -->
            <div class="time-heatmap">
              <div class="heatmap-hours">
                <div 
                  v-for="(hour, index) in timeData" 
                  :key="index"
                  class="hour-block"
                  :style="{ 
                    backgroundColor: getHeatColor(hour.value, maxHourlyCount)
                  }"
                >
                  <div class="hour-label">{{ hour.hour }}:00</div>
                  <div class="hour-value">{{ hour.value }}</div>
                </div>
              </div>
              
              <div class="heatmap-legend">
                <div class="heatmap-gradient"></div>
                <div class="heatmap-labels">
                  <span>少</span>
                  <span>多</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const loading = ref(true);
const records = ref([]);

// 总体统计
const totalTrips = ref(0);
const totalFish = ref(0);
const totalWeight = ref(0);
const biggestCatch = ref(0);

// 鱼种分布数据
const fishTypeData = ref([]);

// 月度趋势数据
const monthlyData = ref([]);
const maxMonthlyCount = computed(() => {
  if (!monthlyData.value.length) return 0;
  return Math.max(...monthlyData.value.map(item => item.count));
});

// 时间分布数据
const timeData = ref([]);
const maxHourlyCount = computed(() => {
  if (!timeData.value.length) return 0;
  return Math.max(...timeData.value.map(item => item.value));
});

// 根据索引获取颜色
const getColorByIndex = (index) => {
  const colors = [
    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
    '#9b59b6', '#1abc9c', '#d35400', '#34495e',
    '#27ae60', '#e67e22', '#8e44ad', '#16a085'
  ];
  return colors[index % colors.length];
};

// 获取热力图颜色
const getHeatColor = (value, max) => {
  if (max === 0) return '#f1f1f1';
  const intensity = value / max;
  
  // 从浅蓝到深蓝的渐变
  const r = Math.floor(255 - intensity * 200);
  const g = Math.floor(255 - intensity * 150);
  const b = 255;
  
  return `rgb(${r}, ${g}, ${b})`;
};

// 加载统计数据
const loadStatistics = async () => {
  loading.value = true;
  
  try {
    // 这里将来会调用API获取数据
    // const response = await api.getStatistics();
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 模拟数据
    totalTrips.value = 28;
    totalFish.value = 87;
    totalWeight.value = 156.5;
    biggestCatch.value = 12.3;
    
    // 鱼种分布数据
    const fishTypes = [
      { name: '鲤鱼', value: 32 },
      { name: '草鱼', value: 18 },
      { name: '鲫鱼', value: 24 },
      { name: '鲢鱼', value: 8 },
      { name: '其他', value: 5 }
    ];
    
    // 计算饼图角度
    let startAngle = 0;
    fishTypeData.value = fishTypes.map(item => {
      const percentage = Math.round((item.value / totalFish.value) * 100);
      const angle = (item.value / totalFish.value) * 360;
      const endAngle = startAngle + angle;
      
      const result = {
        ...item,
        percentage,
        startAngle,
        endAngle
      };
      
      startAngle = endAngle;
      return result;
    });
    
    // 月度趋势数据
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    monthlyData.value = months.map((month, index) => {
      // 模拟一些随机数据
      const count = Math.floor(Math.random() * 15) + (index % 3 === 0 ? 10 : 5);
      return { month, count };
    });
    
    // 时间分布数据
    timeData.value = Array.from({ length: 24 }, (_, i) => {
      // 模拟一些随机数据，早晨和傍晚时段钓鱼较多
      let value;
      if (i >= 5 && i <= 8) {
        value = Math.floor(Math.random() * 10) + 15; // 早晨
      } else if (i >= 16 && i <= 19) {
        value = Math.floor(Math.random() * 10) + 18; // 傍晚
      } else {
        value = Math.floor(Math.random() * 8);
      }
      
      return { hour: i, value };
    });
    
  } catch (error) {
    console.error('Failed to load statistics:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadStatistics();
});
</script>

<style scoped>
.statistics-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 30px;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 总体统计卡片 */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
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

/* 图表区域 */
.chart-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.chart-container {
  min-height: 300px;
  position: relative;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #7f8c8d;
}

/* 鱼种分布图 */
.fish-distribution {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.pie-chart-placeholder {
  width: 250px;
  height: 250px;
  position: relative;
  margin: 0 auto;
}

.pie-segments {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

.pie-segment {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: 50% 50%;
  background: conic-gradient(
    var(--segment-color) var(--segment-start),
    var(--segment-color) var(--segment-end),
    transparent var(--segment-end)
  );
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.pie-center span {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.pie-center small {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.chart-legend {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-label {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.legend-value {
  color: #7f8c8d;
}

/* 月度趋势图 */
.monthly-trend {
  height: 300px;
}

.bar-chart {
  display: flex;
  height: 100%;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 10px;
  width: 40px;
}

.y-axis-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  text-align: right;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  border-bottom: 1px solid #ddd;
  border-left: 1px solid #ddd;
  padding-top: 20px;
  height: calc(100% - 20px);
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar {
  width: 70%;
  background: linear-gradient(to top, #3498db, #2980b9);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 10px;
  transition: height 1s ease-out;
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: #7f8c8d;
}

.bar-label {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* 最佳钓鱼时间热力图 */
.time-heatmap {
  padding: 20px 0;
}

.heatmap-hours {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}

.hour-block {
  padding: 15px 10px;
  border-radius: 8px;
  text-align: center;
  color: white;
  transition: transform 0.2s;
}

.hour-block:hover {
  transform: scale(1.05);
}

.hour-label {
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.hour-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.heatmap-legend {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.heatmap-gradient {
  width: 200px;
  height: 10px;
  background: linear-gradient(to right, #e3f2fd, #2196f3);
  border-radius: 5px;
}

.heatmap-labels {
  width: 200px;
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

.heatmap-labels span {
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .fish-distribution {
    flex-direction: column;
  }
  
  .pie-chart-placeholder {
    margin-bottom: 20px;
  }
  
  .heatmap-hours {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  }
}
</style>