<template>
  <div>
    <button @click="addRecord">测试新增钓鱼记录</button>
    <div v-if="result" style="margin-top:10px;">
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const result = ref('')

const addRecord = async () => {
  try {
    const res = await axios.post('/api/records', {
      count: 2,
      fishType: '鲤鱼',
      userId: 'test-user-001',
      date: new Date().toISOString().split('T')[0],
      weather: '晴天',
      temperature: 25,
      location: '西湖',
      photos: ['https://example.com/photo.jpg']
    })
    result.value = JSON.stringify(res.data, null, 2)
  } catch (err) {
    result.value = err.response
      ? JSON.stringify(err.response.data, null, 2)
      : err.message
  }
}
</script> 