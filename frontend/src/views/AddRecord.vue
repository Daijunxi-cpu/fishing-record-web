<template>
  <div class="add-record">
    <h2>添加钓鱼记录</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="date">日期</label>
        <input type="date" id="date" v-model="form.date" required />
      </div>
      <div class="form-group">
        <label for="fishType">鱼种</label>
        <input type="text" id="fishType" v-model="form.fishType" required />
      </div>
      <div class="form-group">
        <label for="count">数量</label>
        <input type="number" id="count" v-model="form.count" required />
      </div>
      <div class="form-group">
        <label for="weight">重量 (kg)</label>
        <input type="number" id="weight" v-model="form.weight" required />
      </div>
      <div class="form-group">
        <label for="location">地点</label>
        <input type="text" id="location" v-model="form.location" required />
      </div>
      <div class="form-group">
        <label for="weather">天气</label>
        <select id="weather" v-model="form.weather" required>
          <option value="sunny">晴天</option>
          <option value="cloudy">多云</option>
          <option value="rainy">雨天</option>
          <option value="snowy">雪天</option>
          <option value="windy">大风</option>
          <option value="foggy">雾天</option>
        </select>
      </div>
      <button type="submit">提交</button>
    </form>
    <button @click="handleSubmit" class="test-button">测试添加记录</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { addRecord } from '../api';

const router = useRouter();
const form = ref({
  date: '',
  fishType: '',
  count: 0,
  weight: 0,
  location: '',
  weather: 'sunny'
});

const handleSubmit = async () => {
  try {
    await addRecord(form.value);
    router.push('/');
  } catch (error) {
    console.error('Failed to add record:', error);
  }
};
</script>

<style scoped>
.add-record {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
}

button:hover {
  background-color: #219653;
}

.test-button {
  margin-top: 20px;
  background-color: #3498db;
}

.test-button:hover {
  background-color: #2980b9;
}
</style> 