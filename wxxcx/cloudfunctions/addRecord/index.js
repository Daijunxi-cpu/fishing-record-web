// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { record } = event

  try {
    // 数据验证
    if (!record) {
      throw new Error('记录数据不能为空')
    }

    if (!record.weight || record.weight <= 0) {
      throw new Error('鱼获重量必须大于0')
    }

    if (!record.location || !record.location.name) {
      throw new Error('钓点信息不能为空')
    }

    // 处理位置信息
    const location = {
      name: record.location.name,
      address: record.location.address,
      latitude: record.location.latitude,
      longitude: record.location.longitude
    }

    // 处理时间信息
    const now = db.serverDate()
    const createTime = record.createTime ? new Date(record.createTime) : now

    // 添加记录
    const result = await db.collection('records').add({
      data: {
        ...record,
        location,
        _openid: wxContext.OPENID,
        createTime,
        updateTime: now,
        status: 'active' // 记录状态：active-有效，deleted-已删除
      }
    })

    // 更新用户统计信息
    await db.collection('userStats').where({
      _openid: wxContext.OPENID
    }).update({
      data: {
        totalRecords: _.inc(1),
        totalWeight: _.inc(record.weight),
        lastRecordTime: now
      }
    })

    return {
      success: true,
      data: result
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || err
    }
  }
} 