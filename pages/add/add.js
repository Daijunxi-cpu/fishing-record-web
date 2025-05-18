Page({
  data: {
    images: [],
    dateTime: '',
    dateTimeArray: [],
    dateTimeIndex: [],
    location: '',
    latitude: '',
    longitude: '',
    weatherOptions: ['晴天', '多云', '阴天', '小雨', '大雨', '雷雨'],
    weatherIndex: 0,
    fishTypeOptions: [
      '鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳊鱼', '青鱼', '鲶鱼', '黑鱼', '黄颡鱼', '罗非鱼',
      '鲈鱼', '鲳鱼', '鲷鱼', '鲻鱼', '鲥鱼', '带鱼', '鳗鱼', '鲨鱼', '石斑鱼', '鳜鱼',
      '鲨鱼', '鲭鱼', '金枪鱼', '马鲛鱼', '鲐鱼', '鲱鱼', '秋刀鱼', '比目鱼', '鳕鱼', '鳗鲡',
      '河豚', '乌鱼', '鲂鱼', '鲴鱼', '鲚鱼', '鲌鱼', '其他'
    ],
    fishTypeIndex: 0,
    fishCount: '',
    remarks: '',
    submitting: false,
    customFishType: ''
  },

  onLoad() {
    // 初始化日期时间选择器
    this.initDateTimePicker()
  },

  // 初始化日期时间选择器
  initDateTimePicker() {
    const date = new Date()
    const years = []
    const months = []
    const days = []
    const hours = []
    const minutes = []

    // 年份范围：当前年份前后5年
    for (let i = date.getFullYear() - 5; i <= date.getFullYear() + 5; i++) {
      years.push(i + '年')
    }

    // 月份
    for (let i = 1; i <= 12; i++) {
      months.push(i + '月')
    }

    // 日期
    for (let i = 1; i <= 31; i++) {
      days.push(i + '日')
    }

    // 小时
    for (let i = 0; i < 24; i++) {
      hours.push(i + '时')
    }

    // 分钟
    for (let i = 0; i < 60; i++) {
      minutes.push(i + '分')
    }

    this.setData({
      dateTimeArray: [years, months, days, hours, minutes],
      dateTimeIndex: [5, date.getMonth(), date.getDate() - 1, date.getHours(), date.getMinutes()]
    })
  },

  // 日期时间选择器变化
  bindDateTimeChange(e) {
    const val = e.detail.value
    const dateTimeArray = this.data.dateTimeArray
    const dateTime = `${dateTimeArray[0][val[0]]}${dateTimeArray[1][val[1]]}${dateTimeArray[2][val[2]]} ${dateTimeArray[3][val[3]]}${dateTimeArray[4][val[4]]}`
    
    this.setData({
      dateTimeIndex: val,
      dateTime: dateTime
    })
  },

  // 选择天气
  bindWeatherChange(e) {
    this.setData({
      weatherIndex: e.detail.value
    })
  },

  // 选择鱼种
  bindFishTypeChange(e) {
    this.setData({
      fishTypeIndex: e.detail.value
    })
  },

  // 选择照片
  async chooseImage() {
    try {
      const res = await wx.chooseImage({
        count: 9 - this.data.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      this.setData({
        images: [...this.data.images, ...res.tempFilePaths]
      })
    } catch (error) {
      console.error('选择照片失败：', error)
    }
  },

  // 预览照片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: this.data.images
    })
  },

  // 删除照片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images
    images.splice(index, 1)
    this.setData({ images })
  },

  // 选择地点
  async chooseLocation() {
    try {
      // 检查并请求地理位置权限
      const resAuth = await wx.getSetting();
      if (resAuth.authSetting['scope.userLocation'] === false) {
        await wx.openSetting();
      }
      wx.authorize({
        scope: 'scope.userLocation',
        success: () => {
          wx.chooseLocation({
            success: (res) => {
              this.setData({
                location: res.name || res.address,
                latitude: res.latitude,
                longitude: res.longitude
              });
            },
            fail: () => {
              wx.showToast({
                title: '未能获取位置',
                icon: 'none'
              });
            }
          });
        },
        fail: () => {
          wx.showToast({
            title: '请授权定位权限',
            icon: 'none'
          });
        }
      });
    } catch (error) {
      wx.showToast({
        title: '请检查定位权限',
        icon: 'none'
      });
    }
  },

  // 监听自定义鱼种输入
  onCustomFishTypeInput(e) {
    this.setData({
      customFishType: e.detail.value
    })
  },

  // 钓获数量输入
  onFishCountInput(e) {
    // 只允许正整数
    let value = e.detail.value.replace(/[^\d]/g, '');
    if (value.startsWith('0')) value = value.replace(/^0+/, '');
    this.setData({
      fishCount: value
    });
  },

  // 提交表单
  async submitForm(e) {
    if (this.data.submitting) return

    // 表单验证
    if (!this.data.dateTime) {
      wx.showToast({
        title: '请选择日期时间',
        icon: 'none'
      })
      return
    }

    if (!this.data.location) {
      wx.showToast({
        title: '请输入钓鱼地点',
        icon: 'none'
      })
      return
    }

    if (!this.data.fishCount || isNaN(this.data.fishCount) || parseInt(this.data.fishCount) <= 0) {
      wx.showToast({
        title: '请输入正确的钓获数量',
        icon: 'none'
      })
      return
    }

    // 处理鱼种
    let fishType = this.data.fishTypeOptions[this.data.fishTypeIndex]
    if (fishType === '其他') {
      fishType = this.data.customFishType.trim()
      if (!fishType) {
        wx.showToast({
          title: '请输入自定义鱼种',
          icon: 'none'
        })
        return
      }
    }

    this.setData({ submitting: true })

    try {
      // 上传图片
      const imageUrls = []
      for (const image of this.data.images) {
        const cloudPath = `fishing/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`
        const res = await wx.cloud.uploadFile({
          cloudPath,
          filePath: image
        })
        imageUrls.push(res.fileID)
      }

      // 保存记录
      const db = wx.cloud.database()
      await db.collection('fishing_records').add({
        data: {
          images: imageUrls,
          date: this.data.dateTime,
          location: this.data.location,
          latitude: this.data.latitude,
          longitude: this.data.longitude,
          weather: this.data.weatherOptions[this.data.weatherIndex],
          fishType: fishType,
          fishCount: parseInt(this.data.fishCount),
          remarks: this.data.remarks,
          createTime: db.serverDate()
        }
      })

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('保存记录失败：', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 图片加载失败处理
  onImageError(e) {
    const defaultImg = '/assets/icons/empty.png';
    e.currentTarget.src = defaultImg;
  },

  // 钓鱼地点输入
  onLocationInput(e) {
    this.setData({
      location: e.detail.value
    })
  },
}) 