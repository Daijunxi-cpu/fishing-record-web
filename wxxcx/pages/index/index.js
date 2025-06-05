// index.js
const app = getApp()

Page({
  data: {
    totalRecords: 0,
    totalFish: 0,
    totalLocations: 0,
    records: [],
    currentTime: '',
    currentDate: ''
  },

  onLoad() {
    this.loadRecords()
    this.updateTime()
    // 设置定时器，每秒更新一次时间
    this.timeInterval = setInterval(() => {
      this.updateTime()
    }, 1000)
  },

  onUnload() {
    // 页面卸载时清除定时器
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  },

  // 更新时间显示
  updateTime() {
    const now = new Date()
    const time = now.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    })
    const date = now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
    this.setData({
      currentTime: time,
      currentDate: date
    })
  },

  onShow() {
    // 每次显示页面时重新加载数据
    this.loadRecords()
  },

  onPullDownRefresh() {
    this.loadRecords(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载钓鱼记录
  async loadRecords(callback) {
    try {
      // 使用后端API获取最近钓鱼记录
      wx.request({
        url: 'http://localhost:6789/api/records/recent',
        method: 'GET',
        success: (res) => {
          if (res.data && res.data.success) {
            // 计算统计数据
            this.calculateStats();
            
            this.setData({
              records: res.data.data
            });
          } else {
            console.error('获取记录失败：', res.data);
            wx.showToast({
              title: '获取记录失败',
              icon: 'none'
            });
          }
          callback && callback();
        },
        fail: (err) => {
          console.error('请求失败：', err);
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          callback && callback();
        }
      });
    } catch (error) {
      console.error('加载记录失败：', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      callback && callback();
    }
  },

  // 计算统计数据
  calculateStats() {
    wx.request({
      url: 'http://localhost:6789/api/statistics',
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.success) {
          const stats = res.data.summary;
          this.setData({
            totalRecords: stats.totalTrips || 0,
            totalFish: stats.totalFish || 0,
            totalLocations: 0 // 后端API暂无此数据，可以后续添加
          });
        } else {
          console.error('获取统计数据失败：', res.data);
        }
      },
      fail: (err) => {
        console.error('请求统计数据失败：', err);
      }
    });
  },

  // 跳转到记录详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/record/record?id=${id}`
    })
  },

  // 跳转到添加记录页面
  goToAdd() {
    wx.navigateTo({
      url: '/pages/add/add'
    })
  },

  // 图片加载失败处理
  onImageError(e) {
    const defaultImg = '/assets/icons/empty.png';
    const dataset = e.currentTarget.dataset;
    // 针对不同图片类型可做不同处理，这里统一替换src
    this.setData({
      [`${e.currentTarget.dataset.type || 'image'}Error`]: true
    });
    e.currentTarget.src = defaultImg;
  }
})
