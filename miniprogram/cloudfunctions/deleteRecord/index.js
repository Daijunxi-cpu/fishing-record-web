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
  const { recordId } = event

  try {
    if (!recordId) {
      throw new Error('记录ID不能为空')
    }

    // 获取记录信息
    const record = await db.collection('records')
      .doc(recordId)
      .get()

    if (!record.data) {
      throw new Error('记录不存在')
    }

    if (record.data._openid !== wxContext.OPENID) {
      throw new Error('无权删除此记录')
    }

    // 软删除记录
    await db.collection('records')
      .doc(recordId)
      .update({
        data: {
          status: 'deleted',
          updateTime: db.serverDate()
        }
      })

    // 更新用户统计信息
    await db.collection('userStats')
      .where({
        _openid: wxContext.OPENID
      })
      .update({
        data: {
          totalRecords: _.inc(-1),
          totalWeight: _.inc(-record.data.weight)
        }
      })

    return {
      success: true
    }
  } catch (err) {
    return {
      success: false,
      error: err.message || err
    }
  }
} 