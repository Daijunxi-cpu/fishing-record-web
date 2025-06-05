// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  try {
    // 获取基础统计数据
    const basicStats = await db.collection('records')
      .aggregate()
      .match({
        _openid: wxContext.OPENID
      })
      .group({
        _id: null,
        totalRecords: $.sum(1),
        totalWeight: $.sum('$weight'),
        avgWeight: $.avg('$weight'),
        maxWeight: $.max('$weight'),
        minWeight: $.min('$weight'),
        totalLocations: $.addToSet('$location.name')
      })
      .end()

    // 获取每月统计数据
    const monthlyStats = await db.collection('records')
      .aggregate()
      .match({
        _openid: wxContext.OPENID
      })
      .group({
        _id: {
          year: $.year('$createTime'),
          month: $.month('$createTime')
        },
        count: $.sum(1),
        totalWeight: $.sum('$weight')
      })
      .sort({
        '_id.year': -1,
        '_id.month': -1
      })
      .limit(12)
      .end()

    // 获取钓点统计数据
    const locationStats = await db.collection('records')
      .aggregate()
      .match({
        _openid: wxContext.OPENID
      })
      .group({
        _id: '$location.name',
        count: $.sum(1),
        totalWeight: $.sum('$weight'),
        avgWeight: $.avg('$weight')
      })
      .sort({
        count: -1
      })
      .limit(10)
      .end()

    // 获取鱼种统计数据
    const fishTypeStats = await db.collection('records')
      .aggregate()
      .match({
        _openid: wxContext.OPENID
      })
      .group({
        _id: '$fishType',
        count: $.sum(1),
        totalWeight: $.sum('$weight'),
        avgWeight: $.avg('$weight')
      })
      .sort({
        count: -1
      })
      .end()

    const basicData = basicStats.list[0] || {
      totalRecords: 0,
      totalWeight: 0,
      avgWeight: 0,
      maxWeight: 0,
      minWeight: 0,
      totalLocations: []
    }

    return {
      success: true,
      data: {
        basic: {
          ...basicData,
          totalLocations: basicData.totalLocations.length
        },
        monthly: monthlyStats.list,
        locations: locationStats.list,
        fishTypes: fishTypeStats.list
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
} 