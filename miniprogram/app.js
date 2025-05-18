// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-8g123abc', // 请替换为你的云环境ID
        traceUser: true,
      })
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    this.globalData = {
      userInfo: null,
      userId: null,
      isLogin: false
    }
  },

  // 检查用户是否登录
  checkLogin: function() {
    return new Promise((resolve, reject) => {
      if (this.globalData.isLogin) {
        resolve(true)
      } else {
        wx.cloud.callFunction({
          name: 'login',
          success: res => {
            this.globalData.userId = res.result.openid
            this.globalData.isLogin = true
            resolve(true)
          },
          fail: err => {
            console.error('登录失败：', err)
            reject(err)
          }
        })
      }
    })
  }
})
