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
          <div v-else id="fishTypeChart" class="chart"></div>
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
          <div v-else id="monthlyChart" class="chart"></div>
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
          <div v-else id="timeChart" class="chart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import api from '../services/api';
import * as echarts from 'echarts';
import '@fortawesome/fontawesome-free/css/all.css';

const loading = ref(true);
const records = ref([]);

// 总体统计
const totalTrips = ref(0);
const totalFish = ref(0);
const totalWeight = ref(0);
const biggestCatch = ref(0);

// 图表实例
let fishTypeChart = null;
let monthlyChart = null;
let timeChart = null;

// 加载统计数据
const loadStatistics = async () => {
  loading.value = true;
  console.log('开始加载统计数据...');
  try {
    const response = await api.get('/statistics');
    if (response.data.success) {
      console.log('统计数据加载成功:', response.data.data);
      const { summary, fishTypeDistribution, monthlyTrends, timeDistribution } = response.data.data;
      
      // 更新总体统计
      totalTrips.value = summary.totalTrips;
      totalFish.value = summary.totalFish;
      totalWeight.value = summary.totalWeight;
      biggestCatch.value = summary.biggestCatch;
      
      // 初始化图表
      nextTick(() => {
        initFishTypeChart(fishTypeDistribution);
        initMonthlyChart(monthlyTrends);
        initTimeChart(timeDistribution);
      });
    } else {
      console.error('获取统计数据失败:', response.data.message);
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 初始化鱼种分布图表
const initFishTypeChart = (data) => {
  const chartDom = document.getElementById('fishTypeChart');
  if (!chartDom) return;
  
  fishTypeChart = echarts.init(chartDom);
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data.map(item => ({
          name: item._id,
          value: item.count
        }))
      }
    ]
  };
  fishTypeChart.setOption(option);
};

// 初始化月度趋势图表
const initMonthlyChart = (data) => {
  const chartDom = document.getElementById('monthlyChart');
  if (!chartDom) return;
  
  monthlyChart = echarts.init(chartDom);
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => `${item._id.year}-${item._id.month}`)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: data.map(item => item.count),
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.2)'
        }
      }
    ]
  };
  monthlyChart.setOption(option);
};

// 初始化时间分布图表
const initTimeChart = (data) => {
  const chartDom = document.getElementById('timeChart');
  if (!chartDom) return;
  
  timeChart = echarts.init(chartDom);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const option = {
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: hours.map(h => `${h}:00`),
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: ['钓鱼次数'],
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...data.map(item => item.count)),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      name: '钓鱼次数',
      type: 'heatmap',
      data: data.map(item => [item._id, 0, item.count]),
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  timeChart.setOption(option);
};

// 在组件挂载时加载数据
onMounted(() => {
  loadStatistics();
  // 监听窗口大小变化，调整图表大小
  window.addEventListener('resize', handleResize);
});

// 在组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  fishTypeChart?.dispose();
  monthlyChart?.dispose();
  timeChart?.dispose();
});

// 处理窗口大小变化
const handleResize = () => {
  fishTypeChart?.resize();
  monthlyChart?.resize();
  timeChart?.resize();
};
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
  min-height: 400px;
  position: relative;
}

.chart {
  width: 100%;
  height: 400px;
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

/* 响应式调整 */
@media (max-width: 768px) {
  .stats-summary {
    grid-template-columns: 1fr;
  }
  
  .chart {
    height: 300px;
  }
}
</style>