<template>
  <div class="test-connection">
    <h2>连接测试</h2>
    <div class="test-buttons">
      <button @click="testGetRecords">测试获取记录</button>
      <button @click="testCreateRecord">测试创建记录</button>
    </div>
    <div class="test-results" v-if="testResult">
      <h3>测试结果：</h3>
      <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:6789/api'
const testResult = ref(null)

const testGetRecords = async () => {
  try {
    const response = await axios.get(`${API_URL}/records`)
    testResult.value = response.data
  } catch (error) {
    testResult.value = {
      error: error.message,
      details: error.response?.data
    }
  }
}

const testCreateRecord = async () => {
  try {
    const newRecord = {
      date: new Date(),
      location: "西湖",
      weather: "晴天",
      temperature: 25,
      photos: ["http://example.com/photo1.jpg"],
      catches: [{
        fishType: "鲫鱼",
        weight: 0.5,
        length: 20
      }],
      notes: "前端测试记录"
    }
    
    const response = await axios.post(`${API_URL}/records`, newRecord)
    testResult.value = response.data
  } catch (error) {
    testResult.value = {
      error: error.message,
      details: error.response?.data
    }
  }
}
</script>

<style scoped>
.test-connection {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-buttons {
  margin: 20px 0;
}

button {
  margin-right: 10px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.test-results {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 