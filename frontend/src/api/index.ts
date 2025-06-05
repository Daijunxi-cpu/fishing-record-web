import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:6789/api',
  timeout: 30000, // 将超时时间增加到 30 秒
});

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 处理401错误
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export const getRecords = () => api.get('/records');
export const addRecord = (data: any) => api.post('/records', data);
export const getStatistics = () => api.get('/statistics');
export const getRecord = (id: string) => api.get(`/records/${id}`);
export const deleteRecord = (id: string) => api.delete(`/records/${id}`);

// 日记相关API
export const getDiaries = () => api.get('/diaries');
export const getDiary = (id: string) => api.get(`/diaries/${id}`);
export const addDiary = (data: any) => api.post('/diaries', data);
export const updateDiary = (id: string, data: any) => api.put(`/diaries/${id}`, data);
export const deleteDiary = (id: string) => api.delete(`/diaries/${id}`);

export default api; 