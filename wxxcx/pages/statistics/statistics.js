Page({
  data: {
    totalRecords: 0,
    totalFish: 0,
    totalLocations: 0,
    fishStats: [],
    weatherStats: [],
    timeStats: [],
    locationMarkers: [],
    mapCenter: {
      latitude: 39.908823,
      longitude: 116.397470
    }
  },

  onLoad() {
    this.loadStatistics()
  },

  onShow() {
    this.loadStatistics()
  },

  onPullDownRefresh() {
    this.loadStatistics(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 加载统计数据
  async loadStatistics(callback) {
    try {
      const db = wx.cloud.database()
      const _ = db.command
      
      // 获取所有记录
      const records = await db.collection('fishing_records').get()
      
      // 计算总览数据
      const totalRecords = records.data.length
      const totalFish = records.data.reduce((sum, record) => sum + record.fishCount, 0)
      const totalLocations = new Set(records.data.map(record => record.location)).size

      // 计算鱼种统计
      const fishStats = this.calculateFishStats(records.data)

      // 计算天气统计
      const weatherStats = this.calculateWeatherStats(records.data)

      // 计算时间分布
      const timeStats = this.calculateTimeStats(records.data)

      // 计算钓点标记
      const locationMarkers = this.calculateLocationMarkers(records.data)

      // 计算地图中心点
      const mapCenter = this.calculateMapCenter(records.data)

      this.setData({
        totalRecords,
        totalFish,
        totalLocations,
        fishStats,
        weatherStats,
        timeStats,
        locationMarkers,
        mapCenter
      })

      callback && callback()
    } catch (error) {
      console.error('加载统计数据失败：', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      callback && callback()
    }
  },

  // 计算鱼种统计
  calculateFishStats(records) {
    const fishMap = new Map()
    let totalFish = 0

    records.forEach(record => {
      const count = record.fishCount
      totalFish += count
      fishMap.set(record.fishType, (fishMap.get(record.fishType) || 0) + count)
    })

    return Array.from(fishMap.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: (count / totalFish * 100).toFixed(1)
    }))
  },

  // 计算天气统计
  calculateWeatherStats(records) {
    const weatherMap = new Map()
    const total = records.length

    records.forEach(record => {
      weatherMap.set(record.weather, (weatherMap.get(record.weather) || 0) + 1)
    })

    return Array.from(weatherMap.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: (count / total * 100).toFixed(1)
    }))
  },

  // 计算时间分布
  calculateTimeStats(records) {
    const timeMap = new Array(24).fill(0)
    const total = records.length

    records.forEach(record => {
      const hour = new Date(record.date).getHours()
      timeMap[hour]++
    })

    const maxCount = Math.max(...timeMap)

    return timeMap.map((count, hour) => ({
      hour,
      count,
      percentage: (count / maxCount * 100).toFixed(1)
    }))
  },

  // 计算钓点标记
  calculateLocationMarkers(records) {
    const locationMap = new Map()

    records.forEach(record => {
      const key = `${record.latitude},${record.longitude}`
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          latitude: record.latitude,
          longitude: record.longitude,
          count: 0
        })
      }
      locationMap.get(key).count++
    })

    return Array.from(locationMap.values()).map((location, index) => ({
      id: index + 1,
      latitude: location.latitude,
      longitude: location.longitude,
      title: `钓获${location.count}次`,
      iconPath: '/assets/icons/marker.png',
      width: 32,
      height: 32
    }))
  },

  // 计算地图中心点
  calculateMapCenter(records) {
    if (records.length === 0) {
      return {
        latitude: 39.908823,
        longitude: 116.397470
      }
    }

    const totalLat = records.reduce((sum, record) => sum + record.latitude, 0)
    const totalLng = records.reduce((sum, record) => sum + record.longitude, 0)

    return {
      latitude: totalLat / records.length,
      longitude: totalLng / records.length
    }
  }
}) 