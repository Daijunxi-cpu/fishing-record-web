      <template>
        <div>
          <!-- 这里是你的添加记录页面内容 -->
          <h1>添加记录</h1>
          <form @submit.prevent="submitRecord">
            <div>
              <label for="species">鱼种:</label>
              <input type="text" id="species" v-model="record.species" required>
            </div>
            <div>
              <label for="weight">重量 (kg):</label>
              <input type="number" id="weight" v-model.number="record.weight" required>
            </div>
            <div>
              <label for="date">日期:</label>
              <input type="date" id="date" v-model="record.date" required>
            </div>
            <button type="submit">保存记录</button>
          </form>
        </div>
      </template>

      <script setup lang="ts">
      import { ref } from 'vue';
      import axios from 'axios';

      const record = ref({
        species: '',
        weight: null,
        date: ''
      });

      const submitRecord = async () => {
        try {
          // TODO: Replace with your actual backend API endpoint
          await axios.post('/api/records', record.value);
          alert('记录添加成功!');
          // Optional: Clear form or navigate after successful submission
          record.value = { species: '', weight: null, date: '' };
        } catch (error) {
          console.error('添加记录失败:', error);
          alert('添加记录失败，请稍后再试。');
        }
      };
      </script>

      <style scoped>
      /* 这里写添加记录页面的样式 */
      </style>