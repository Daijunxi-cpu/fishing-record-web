<template>
  <div class="add-record-page">
    <div class="page-header">
      <h1>添加钓鱼记录</h1>
    </div>

    <form class="record-form" @submit.prevent="submitRecord">
      <!-- 照片上传区 -->
      <div class="form-section">
        <h2>照片上传</h2>
        <div class="photo-uploader">
          <div class="photo-preview-area">
            <div 
              v-for="(photo, index) in photos" 
              :key="index" 
              class="photo-preview"
            >
              <img :src="photo.url" alt="钓鱼照片预览">
              <button type="button" class="remove-photo" @click="removePhoto(index)">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="photo-upload-placeholder" v-if="photos.length < 9" @click="triggerFileInput">
              <i class="fas fa-camera"></i>
              <span>添加照片</span>
            </div>
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            accept="image/*" 
            multiple 
            @change="handleFileUpload" 
            class="hidden-file-input"
          >
          <p class="photo-tip">最多可上传9张照片</p>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="form-section">
        <h2>基本信息</h2>
        
        <div class="form-group">
          <label for="date">钓鱼日期</label>
          <input 
            type="date" 
            id="date" 
            v-model="formData.date" 
            required
            class="form-control"
          >
        </div>
        
        <div class="form-group">
          <label for="time">钓鱼时间</label>
          <input 
            type="time" 
            id="time" 
            v-model="formData.time" 
            class="form-control"
          >
        </div>
        
        <div class="form-group">
          <label for="location">钓鱼地点</label>
          <input 
            type="text" 
            id="location" 
            v-model="formData.location" 
            class="form-control"
            placeholder="例如：西湖、钱塘江、某某水库等"
          >
        </div>
        
        <div class="form-group">
          <label>天气情况</label>
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

      <!-- 钓获信息 -->
      <div class="form-section">
        <h2>钓获信息</h2>
        
        <div class="form-group">
          <label for="fishType">鱼种</label>
          <input 
            type="text" 
            id="fishType" 
            v-model="formData.fishType" 
            required
            class="form-control"
            placeholder="例如：鲤鱼、草鱼等"
          >
        </div>
        
        <div class="form-group">
          <label for="count">数量</label>
          <input 
            type="number" 
            id="count" 
            v-model="formData.count" 
            min="1"
            required
            class="form-control"
          >
        </div>
        
        <div class="form-group">
          <label for="weight">总重量 (kg)</label>
          <input 
            type="number" 
            id="weight" 
            v-model="formData.weight" 
            step="0.1"
            min="0"
            class="form-control"
          >
        </div>
        
        <div class="form-group">
          <label for="notes">备注</label>
          <textarea 
            id="notes" 
            v-model="formData.notes" 
            class="form-control"
            placeholder="添加关于此次钓鱼的备注信息..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="cancel">取消</button>
        <button type="submit" class="btn-submit" :disabled="isSubmitting">
          <span v-if="isSubmitting">
            <i class="fas fa-spinner fa-spin"></i> 提交中...
          </span>
          <span v-else>保存记录</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const fileInput = ref(null);
const photos = ref([]);
const isSubmitting = ref(false);

// 表单数据
const formData = reactive({
  date: new Date().toISOString().split('T')[0], // 默认今天
  time: new Date().toTimeString().slice(0, 5), // 默认当前时间
  location: '', // 钓鱼地点
  weather: '晴天', // 默认晴天，使用中文
  fishType: '',
  count: 1,
  weight: '',
  notes: ''
});

// 天气选项
const weatherOptions = [
  { value: '晴天', label: '晴天', icon: 'fas fa-sun' },
  { value: '多云', label: '多云', icon: 'fas fa-cloud' },
  { value: '雨天', label: '雨天', icon: 'fas fa-cloud-rain' },
  { value: '雪天', label: '雪天', icon: 'fas fa-snowflake' },
  { value: '大风', label: '大风', icon: 'fas fa-wind' },
  { value: '雾天', label: '雾天', icon: 'fas fa-smog' }
];

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click();
};

// 处理文件上传
const handleFileUpload = (event) => {
  const files = event.target.files;
  if (!files.length) return;
  
  // 限制最多9张照片
  const remainingSlots = 9 - photos.value.length;
  const filesToProcess = Array.from(files).slice(0, remainingSlots);
  
  filesToProcess.forEach(file => {
    // 创建本地预览URL
    const url = URL.createObjectURL(file);
    photos.value.push({
      file,
      url
    });
  });
  
  // 重置文件输入以允许重复选择相同文件
  event.target.value = '';
};

// 移除照片
const removePhoto = (index) => {
  // 释放URL对象
  URL.revokeObjectURL(photos.value[index].url);
  photos.value.splice(index, 1);
};

// 提交记录
const submitRecord = async () => {
  isSubmitting.value = true;
  
  try {
    // 构建要提交的数据
    const recordData = {
      ...formData,
      date: `${formData.date}T${formData.time}:00`,
      temperature: 25, // 暂时使用默认温度
      location: {
        name: formData.location,
        address: formData.location
      },
      photos: photos.value.map(p => p.url).filter(url => url.startsWith('http')), // 只发送有效的URL
      userId: 'testuser' // 暂时使用测试用户ID
    };
    
    // 调用API提交数据
    const response = await axios.post('/api/records', recordData);
    
    if (response.data.success) {
      // 提交成功后跳转到首页
      router.push('/');
    } else {
      throw new Error(response.data.message || '提交失败');
    }
  } catch (error) {
    console.error('Failed to submit record:', error);
    alert(error.response?.data?.message || '提交失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 取消
const cancel = () => {
  if (confirm('确定要取消吗？已填写的内容将不会保存。')) {
    router.push('/');
  }
};
</script>

<style scoped>
.add-record-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

/* 照片上传区域样式 */
.photo-uploader {
  margin-bottom: 20px;
}

.photo-preview-area {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  margin-bottom: 10px;
}

.photo-preview {
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* 保持1:1比例 */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.photo-preview img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-photo:hover {
  background: rgba(255, 0, 0, 0.7);
}

.photo-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  padding-bottom: 100%; /* 保持1:1比例 */
  position: relative;
  transition: background-color 0.2s;
}

.photo-upload-placeholder:hover {
  background-color: #e9ecef;
}

.photo-upload-placeholder i {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  color: #6c757d;
}

.photo-upload-placeholder span {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
  color: #6c757d;
}

.hidden-file-input {
  display: none;
}

.photo-tip {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 10px;
}

/* 表单控件样式 */
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

/* 天气选择器样式 */
.weather-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.weather-option {
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

.weather-option:hover {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.weather-option.active {
  border-color: #3498db;
  background-color: #ebf5fb;
}

.weather-option i {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #6c757d;
}

.weather-option.active i {
  color: #3498db;
}

.weather-option span {
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
  .weather-selector {
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