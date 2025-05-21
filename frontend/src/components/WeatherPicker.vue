<template>
  <div class="weather-picker">
    <div class="weather-options">
      <div 
        v-for="option in weatherOptions" 
        :key="option.value"
        :class="['weather-option', { active: modelValue === option.value }]"
        @click="selectWeather(option.value)"
      >
        <i :class="option.icon"></i>
        <span>{{ option.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'sunny'
  }
});

const emit = defineEmits(['update:modelValue']);

// 天气选项
const weatherOptions = [
  { value: 'sunny', label: '晴天', icon: 'fas fa-sun' },
  { value: 'cloudy', label: '多云', icon: 'fas fa-cloud' },
  { value: 'rainy', label: '雨天', icon: 'fas fa-cloud-rain' },
  { value: 'snowy', label: '雪天', icon: 'fas fa-snowflake' },
  { value: 'windy', label: '大风', icon: 'fas fa-wind' },
  { value: 'foggy', label: '雾天', icon: 'fas fa-smog' }
];

// 选择天气
const selectWeather = (value) => {
  emit('update:modelValue', value);
};
</script>

<style scoped>
.weather-picker {
  width: 100%;
}

.weather-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.weather-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 2px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
}

.weather-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #bbb;
}

.weather-option.active {
  border-color: #3498db;
  background-color: #ebf5fb;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.weather-option i {
  font-size: 1.8rem;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.weather-option span {
  font-size: 0.9rem;
  color: #555;
}

/* 天气图标颜色 */
.weather-option .fa-sun {
  color: #f39c12;
}

.weather-option .fa-cloud {
  color: #7f8c8d;
}

.weather-option .fa-cloud-rain {
  color: #3498db;
}

.weather-option .fa-snowflake {
  color: #2980b9;
}

.weather-option .fa-wind {
  color: #95a5a6;
}

.weather-option .fa-smog {
  color: #bdc3c7;
}

/* 选中状态下的图标颜色加深 */
.weather-option.active .fa-sun {
  color: #f1c40f;
}

.weather-option.active .fa-cloud {
  color: #34495e;
}

.weather-option.active .fa-cloud-rain {
  color: #2980b9;
}

.weather-option.active .fa-snowflake {
  color: #2471a3;
}

.weather-option.active .fa-wind {
  color: #7f8c8d;
}

.weather-option.active .fa-smog {
  color: #95a5a6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .weather-options {
    justify-content: center;
  }
}
</style>