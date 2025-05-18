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
      const db = wx.cloud.database()
      const records = await db.collection('fishing_records')
        .orderBy('date', 'desc')
        .limit(10)
        .get()

      // 计算统计数据
      const stats = await this.calculateStats()

      this.setData({
        records: records.data,
        ...stats
      })

      callback && callback()
    } catch (error) {
      console.error('加载记录失败：', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      callback && callback()
    }
  },

  // 计算统计数据
  async calculateStats() {
    try {
      const db = wx.cloud.database()
      const _ = db.command
      
      // 获取总记录数
      const totalRecords = await db.collection('fishing_records').count()
      
      // 获取总鱼获数
      const totalFish = await db.collection('fishing_records')
        .aggregate()
        .group({
          _id: null,
          total: _.sum('$fishCount')
        })
        .end()
      
      // 获取不同钓点数量
      const locations = await db.collection('fishing_records')
        .aggregate()
        .group({
          _id: '$location'
        })
        .end()

      return {
        totalRecords: totalRecords.total,
        totalFish: totalFish.list[0]?.total || 0,
        totalLocations: locations.list.length
      }
    } catch (error) {
      console.error('计算统计数据失败：', error)
      return {
        totalRecords: 0,
        totalFish: 0,
        totalLocations: 0
      }
    }
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
