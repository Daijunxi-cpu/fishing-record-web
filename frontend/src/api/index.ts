import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // 使用相对路径，让Vite代理处理
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

export default api; 