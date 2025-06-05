<template>
  <div class="add-diary-page">
    <div class="page-header">
      <h1>写钓鱼日记</h1>
    </div>

    <form class="diary-form" @submit.prevent="submitDiary">
      <!-- 基本信息 -->
      <div class="form-section">
        <h2>基本信息</h2>
        
        <div class="form-group">
          <label for="title">标题</label>
          <input 
            type="text" 
            id="title" 
            v-model="formData.title" 
            required
            class="form-control"
            placeholder="给您的日记起个标题"
          >
        </div>
        
        <div class="form-group">
          <label for="date">日期</label>
          <input 
            type="date" 
            id="date" 
            v-model="formData.date" 
            required
            class="form-control"
          >
        </div>
        
        <div class="form-group">
          <label>心情</label>
          <div class="mood-selector">
            <div 
              v-for="option in moodOptions" 
              :key="option.value"
              :class="['mood-option', { active: formData.mood === option.value }]"
              @click="formData.mood = option.value"
            >
              <i :class="option.icon"></i>
              <span>{{ option.label }}</span>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>天气</label>
          <div class="weather-selector">
            <div 
              v-for="option in weatherOptions" 
              :key="option.value"
              :class="['weather-option', { active: formData.weather === option.value }]"
              @click="formData.weather = option.value"
            >
              <i :class="option.icon"></i>
              <span>{{ option.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 日记内容 -->
      <div class="form-section">
        <h2>日记内容</h2>
        
        <div class="form-group">
          <label for="content">内容</label>
          <textarea 
            id="content" 
            v-model="formData.content" 
            required
            class="form-control"
            placeholder="记录今天的钓鱼经历..."
            rows="10"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="location">钓点</label>
          <input 
            type="text" 
            id="location" 
            v-model="formData.location.name" 
            class="form-control"
            placeholder="钓鱼的地点"
          >
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="cancel">取消</button>
        <button type="submit" class="btn-submit" :disabled="isSubmitting">
          <span v-if="isSubmitting">
            <i class="fas fa-spinner fa-spin"></i> 保存中...
          </span>
          <span v-else>保存日记</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { addDiary } from '../api';

const router = useRouter();
const isSubmitting = ref(false);

// 表单数据
const formData = reactive({
  title: '',
  date: new Date().toISOString().split('T')[0], // 默认今天
  content: '',
  mood: '开心',
  weather: '晴天',
  location: {
    name: '',
    address: ''
  },
  userId: 'testuser' // 临时用户ID
});

// 心情选项
const moodOptions = [
  { value: '开心', label: '开心', icon: 'fas fa-smile' },
  { value: '平静', label: '平静', icon: 'fas fa-meh' },
  { value: '疲惫', label: '疲惫', icon: 'fas fa-tired' },
  { value: '兴奋', label: '兴奋', icon: 'fas fa-grin-stars' },
  { value: '失望', label: '失望', icon: 'fas fa-frown' }
];

// 天气选项
const weatherOptions = [
  { value: '晴天', label: '晴天', icon: 'fas fa-sun' },
  { value: '多云', label: '多云', icon: 'fas fa-cloud' },
  { value: '雨天', label: '雨天', icon: 'fas fa-cloud-rain' },
  { value: '雪天', label: '雪天', icon: 'fas fa-snowflake' },
  { value: '大风', label: '大风', icon: 'fas fa-wind' },
  { value: '雾天', label: '雾天', icon: 'fas fa-smog' }
];

// 提交日记
const submitDiary = async () => {
  isSubmitting.value = true;
  
  try {
    const response = await addDiary(formData);
    
    if (response.data.success) {
      alert('日记保存成功！');
      router.push('/diary');
    } else {
      throw new Error(response.data.message || '保存失败');
    }
  } catch (error) {
    console.error('Failed to save diary:', error);
    alert(error.response?.data?.message || '保存失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 取消
const cancel = () => {
  if (confirm('确定要取消吗？已填写的内容将不会保存。')) {
    router.push('/diary');
  }
};
</script>

<style scoped>
.add-diary-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.form-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.form-section h2 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

/* 心情选择器 */
.mood-selector, .weather-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.mood-option, .weather-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  width: 80px;
}

.mood-option:hover, .weather-option:hover {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.mood-option.active, .weather-option.active {
  border-color: #3498db;
  background-color: #ebf5fb;
}

.mood-option i, .weather-option i {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #6c757d;
}

.mood-option.active i, .weather-option.active i {
  color: #3498db;
}

.mood-option span, .weather-option span {
  font-size: 0.8rem;
}

/* 按钮样式 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn-cancel {
  padding: 12px 24px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #6c757d;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #e9ecef;
}

.btn-submit {
  padding: 12px 24px;
  background-color: #27ae60;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background-color: #219653;
}

.btn-submit:disabled {
  background-color: #a3e4c9;
  cursor: not-allowed;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .mood-selector, .weather-selector {
    justify-content: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-cancel, .btn-submit {
    width: 100%;
  }
}
</style>