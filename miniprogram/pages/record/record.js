Page({
  data: {
    record: null,
    images: [],
    markers: []
  },

  onLoad(options) {
    if (options.id) {
      this.loadRecord(options.id)
    }
  },

  // 加载记录详情
  async loadRecord(id) {
    try {
      const db = wx.cloud.database()
      const record = await db.collection('fishing_records').doc(id).get()
      
      this.setData({
        record: record.data,
        images: record.data.images,
        markers: [{
          id: 1,
          latitude: record.data.latitude,
          longitude: record.data.longitude,
          title: record.data.location,
          iconPath: '/assets/icons/marker.png',
          width: 32,
          height: 32
        }]
      })
    } catch (error) {
      console.error('加载记录失败：', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url,
      urls: this.data.images
    })
  },

  // 删除记录
  async deleteRecord() {
    try {
      const res = await wx.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？',
        confirmColor: '#ff4d4f'
      })

      if (res.confirm) {
        wx.showLoading({
          title: '删除中...'
        })

        const db = wx.cloud.database()
        
        // 删除云存储中的图片
        for (const image of this.data.images) {
          await wx.cloud.deleteFile({
            fileList: [image]
          })
        }

        // 删除数据库记录
        await db.collection('fishing_records').doc(this.data.record._id).remove()

        wx.hideLoading()
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })

        // 返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('删除记录失败：', error)
      wx.hideLoading()
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  },

  // 图片加载失败处理
  onImageError(e) {
    const defaultImg = '/assets/icons/empty.png';
    e.currentTarget.src = defaultImg;
  }
}) 