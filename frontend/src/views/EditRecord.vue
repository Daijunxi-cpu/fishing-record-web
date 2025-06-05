<template>
  <div class="edit-record">
    <div class="back-button" @click="goBack">
      <i class="fas fa-arrow-left"></i> 返回
    </div>

    <div v-if="record" class="edit-container">
      <h1>编辑钓鱼记录</h1>

      <form @submit.prevent="saveRecord">
        <div class="form-group">
          <label for="date">日期</label>
          <input type="date" id="date" v-model="record.date" required>
        </div>

        <div class="form-group">
          <label>地点</label>
          <MapPicker v-model:location="record.location" />
        </div>

        <div class="form-group">
          <label>天气</label>
          <WeatherPicker v-model="record.weather" />
        </div>

        <div class="form-group">
          <label>照片</label>
          <PhotoUploader v-model:photos="record.photos" />
        </div>

        <div class="form-group">
          <label for="fishType">鱼种</label>
          <input type="text" id="fishType" v-model="record.fishType" required>
        </div>

        <div class="form-group">
          <label for="weight">重量(kg)</label>
          <input type="number" id="weight" v-model="record.weight" step="0.1" required>
        </div>

        <div class="form-group">
          <label for="notes">备注</label>
          <textarea id="notes" v-model="record.notes"></textarea>
        </div>

        <div class="action-buttons">
          <button type="button" class="cancel-btn" @click="goBack">取消</button>
          <button type="submit" class="save-btn">保存</button>
        </div>
      </form>
    </div>

    <div v-else class="not-found">
      <h2>记录未找到</h2>
      <p>该钓鱼记录可能已被删除或不存在。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MapPicker from '@/components/MapPicker.vue'
import WeatherPicker from '@/components/WeatherPicker.vue'
import PhotoUploader from '@/components/PhotoUploader.vue'
import { storageService, type FishingRecord } from '@/services/storage'

const route = useRoute()
const router = useRouter()
const record = ref<FishingRecord | null>(null)

onMounted(() => {
  const recordId = Number(route.params.id)
  const existingRecord = storageService.getRecord(recordId)
  if (existingRecord) {
    record.value = { ...existingRecord }
  }
})

const goBack = () => {
  router.back()
}

const saveRecord = () => {
  if (record.value) {
    const updatedRecord = storageService.updateRecord(record.value.id, record.value)
    if (updatedRecord) {
      router.push(`/record/${updatedRecord.id}`)
    }
  }
}
</script>

<style scoped>
.edit-record {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  color: #666;
  margin-bottom: 20px;
}

.back-button i {
  margin-right: 5px;
}

.edit-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.edit-container h1 {
  margin: 0 0 20px 0;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn,
.save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.save-btn {
  background: #4CAF50;
  color: white;
}

.save-btn:hover {
  background: #45a049;
}

.not-found {
  text-align: center;
  padding: 40px;
  color: #666;
}

.not-found h2 {
  margin: 0 0 10px 0;
}
</style> 