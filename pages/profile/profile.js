const app = getApp()

Page({
  data: {
    userInfo: {},
    userId: '',
    version: '1.0.0'
  },

  onLoad() {
    this.checkUserInfo()
  },

  onShow() {
    this.checkUserInfo()
  },

  // 检查用户信息
  checkUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    const userId = wx.getStorageSync('userId')

    if (userInfo) {
      this.setData({
        userInfo,
        userId
      })
    }
  },

  // 用户登录
  async login() {
    try {
      // 获取用户信息
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善用户资料'
      })

      // 获取用户ID
      const { result } = await wx.cloud.callFunction({
        name: 'login'
      })

      // 保存用户信息
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('userId', result.openid)

      this.setData({
        userInfo,
        userId: result.openid
      })

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('登录失败：', error)
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    }
  },

  // 跳转到收藏页面
  goToFavorites() {
    if (!this.data.userInfo.nickName) {
      this.showLoginTip()
      return
    }
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    })
  },

  // 跳转到历史记录页面
  goToHistory() {
    if (!this.data.userInfo.nickName) {
      this.showLoginTip()
      return
    }
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '提示',
      content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.showToast({
            title: '清除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 检查更新
  checkUpdate() {
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      } else {
        wx.showToast({
          title: '已是最新版本',
          icon: 'success'
        })
      }
    })
  },

  // 跳转到关于页面
  goToAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  // 跳转到反馈页面
  goToFeedback() {
    if (!this.data.userInfo.nickName) {
      this.showLoginTip()
      return
    }
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    })
  },

  // 显示登录提示
  showLoginTip() {
    wx.showModal({
      title: '提示',
      content: '请先登录',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          this.login()
        }
      }
    })
  }
}) 