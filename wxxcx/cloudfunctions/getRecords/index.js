// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { page = 1, pageSize = 10 } = event

  try {
    // 获取总记录数
    const countResult = await db.collection('records')
      .where({
        _openid: wxContext.OPENID
      })
      .count()

    // 获取分页数据
    const records = await db.collection('records')
      .where({
        _openid: wxContext.OPENID
      })
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return {
      success: true,
      data: {
        records: records.data,
        total: countResult.total,
        page,
        pageSize
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
} 