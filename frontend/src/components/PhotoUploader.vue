<template>
  <div class="photo-uploader">
    <div class="photo-preview-area">
      <div 
        v-for="(photo, index) in modelValue" 
        :key="index" 
        class="photo-preview"
      >
        <img :src="photo.url" alt="照片预览">
        <div class="photo-actions">
          <button type="button" class="action-btn view-btn" @click="previewPhoto(photo)">
            <i class="fas fa-eye"></i>
          </button>
          <button type="button" class="action-btn delete-btn" @click="removePhoto(index)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div 
        v-if="modelValue.length < maxPhotos" 
        class="photo-upload-placeholder"
        @click="triggerFileInput"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        :class="{ 'drag-over': isDragging }"
      >
        <i class="fas fa-cloud-upload-alt"></i>
        <span>点击或拖拽照片</span>
        <small>{{ maxPhotos - modelValue.length }}张照片剩余</small>
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
    
    <!-- 照片预览弹窗 -->
    <div v-if="previewVisible" class="photo-preview-modal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <img :src="previewSrc" alt="照片预览">
        <button class="close-preview" @click="closePreview">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxPhotos: {
    type: Number,
    default: 9
  }
});

const emit = defineEmits(['update:modelValue']);

const fileInput = ref(null);
const isDragging = ref(false);
const previewVisible = ref(false);
const previewSrc = ref('');

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click();
};

// 处理文件上传
const handleFileUpload = (event) => {
  const files = event.target.files;
  if (!files.length) return;
  
  processFiles(Array.from(files));
  
  // 重置文件输入以允许重复选择相同文件
  event.target.value = '';
};

// 处理文件
const processFiles = (files) => {
  // 限制最多上传的照片数量
  const remainingSlots = props.maxPhotos - props.modelValue.length;
  const filesToProcess = files.slice(0, remainingSlots);
  
  // 处理每个文件
  const newPhotos = [...props.modelValue];
  
  filesToProcess.forEach(file => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      console.error('不支持的文件类型:', file.type);
      return;
    }
    
    // 创建本地预览URL
    const url = URL.createObjectURL(file);
    
    newPhotos.push({
      file,
      url,
      name: file.name,
      size: file.size,
      type: file.type
    });
  });
  
  emit('update:modelValue', newPhotos);
};

// 移除照片
const removePhoto = (index) => {
  const newPhotos = [...props.modelValue];
  
  // 释放URL对象
  URL.revokeObjectURL(newPhotos[index].url);
  
  newPhotos.splice(index, 1);
  emit('update:modelValue', newPhotos);
};

// 预览照片
const previewPhoto = (photo) => {
  previewSrc.value = photo.url;
  previewVisible.value = true;
};

// 关闭预览
const closePreview = () => {
  previewVisible.value = false;
};

// 拖拽相关处理
const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files.length) {
    processFiles(Array.from(files));
  }
};
</script>

<style scoped>
.photo-uploader {
  width: 100%;
}

.photo-preview-area {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
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

.photo-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 8px;
  display: flex;
  justify-content: space-around;
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-preview:hover .photo-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.delete-btn:hover {
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
  transition: all 0.2s;
}

.photo-upload-placeholder:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.photo-upload-placeholder.drag-over {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.photo-upload-placeholder i {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.8rem;
  color: #6c757d;
}

.photo-upload-placeholder span {
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.9rem;
  color: #6c757d;
}

.photo-upload-placeholder small {
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  color: #6c757d;
}

.hidden-file-input {
  display: none;
}

/* 照片预览弹窗 */
.photo-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.preview-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
}

.close-preview {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>