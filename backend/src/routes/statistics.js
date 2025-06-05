const express = require('express');
const router = express.Router();
const Record = require('../models/Record');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// 获取统计数据
router.get('/', async (req, res) => {
  try {
    // 检查数据库连接
    if (mongoose.connection.readyState !== 1) {
      throw new Error('数据库未连接');
    }

    // 检查是否有数据
    const recordCount = await Record.countDocuments();
    if (recordCount === 0) {
      return res.json({
        success: true,
        message: '暂无数据',
        data: {
          summary: {
            totalTrips: 0,
            totalFish: 0,
            totalWeight: 0,
            biggestCatch: 0
          },
          fishTypeDistribution: [],
          monthlyTrends: [],
          weatherDistribution: [],
          timeDistribution: []
        }
      });
    }

    // 总钓鱼次数
    const totalTrips = await Record.countDocuments();
    
    // 总钓获数量和重量
    const countResult = await Record.aggregate([
      { $group: { 
        _id: null, 
        totalFish: { $sum: '$count' },
        totalWeight: { $sum: '$weight' }
      }}
    ]);
    
    const totalFish = countResult[0]?.totalFish || 0;
    const totalWeight = countResult[0]?.totalWeight || 0;
    
    // 最大单次收获
    const biggestCatchResult = await Record.find()
      .sort({ weight: -1 })
      .limit(1);
    const biggestCatch = biggestCatchResult[0]?.weight || 0;
    
    // 鱼种分布
    const fishTypeDistribution = await Record.aggregate([
      { $group: { 
        _id: '$fishType', 
        count: { $sum: '$count' },
        totalWeight: { $sum: '$weight' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // 月度趋势
    const monthlyTrends = await Record.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 },
          totalWeight: { $sum: '$weight' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // 天气分布
    const weatherDistribution = await Record.aggregate([
      { $group: { 
        _id: '$weather', 
        count: { $sum: 1 }
      }}
    ]);
    
    // 时间分布（按小时）
    const timeDistribution = await Record.aggregate([
      {
        $group: {
          _id: { $hour: '$date' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalTrips,
          totalFish,
          totalWeight: parseFloat(totalWeight.toFixed(2)),
          biggestCatch: parseFloat(biggestCatch.toFixed(2))
        },
        fishTypeDistribution,
        monthlyTrends,
        weatherDistribution,
        timeDistribution
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 获取鱼种统计
router.get('/fish-types', async (req, res) => {
  try {
    // 强制不缓存响应
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // 获取所有鱼种及其数量、平均重量和总重量
    const fishTypeStats = await Record.aggregate([
      { 
        $group: { 
          _id: '$fishType', 
          count: { $sum: '$count' }, 
          totalWeight: { $sum: '$weight' },
          avgWeight: { $avg: '$weight' },
          recordCount: { $sum: 1 }
        } 
      },
      { $sort: { count: -1 } }
    ]);
    
    // 计算总数量用于百分比
    const totalCount = fishTypeStats.reduce((sum, item) => sum + item.count, 0);
    
    // 格式化数据，添加百分比和颜色
    const formattedStats = fishTypeStats.map((item, index) => {
      // 生成随机颜色，但确保颜色足够明亮
      const hue = (index * 137.5) % 360; // 使用黄金角分布获得均匀分布的颜色
      const color = `hsl(${hue}, 70%, 60%)`;
      
      return {
        fishType: item._id,
        count: item.count,
        percentage: parseFloat(((item.count / totalCount) * 100).toFixed(1)),
        avgWeight: item.avgWeight ? parseFloat(item.avgWeight.toFixed(2)) : 0,
        totalWeight: item.totalWeight ? parseFloat(item.totalWeight.toFixed(2)) : 0,
        recordCount: item.recordCount,
        color: color
      };
    });
    
    // 添加时间戳，确保每次返回的数据都被视为新数据
    const timestamp = new Date().getTime();
    
    res.json({
      success: true,
      timestamp,
      totalCount,
      fishTypes: formattedStats
    });
  } catch (error) {
    console.error('获取鱼种统计失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取最佳钓鱼地点
router.get('/best-locations', async (req, res) => {
  try {
    const bestLocations = await Record.aggregate([
      { $match: { location: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$location',
          totalFish: { $sum: '$count' },
          avgWeight: { $avg: '$weight' },
          trips: { $sum: 1 }
        }
      },
      { $sort: { totalFish: -1 } },
      { $limit: 5 }
    ]);
    
    res.json(bestLocations.map(location => ({
      location: location._id,
      totalFish: location.totalFish,
      avgWeight: location.avgWeight ? parseFloat(location.avgWeight.toFixed(2)) : 0,
      trips: location.trips
    })));
  } catch (error) {
    console.error('获取最佳钓鱼地点失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取最大钓获记录
router.get('/biggest-catches', async (req, res) => {
  try {
    const biggestCatches = await Record.find()
      .sort({ weight: -1 })
      .limit(5);
    
    res.json(biggestCatches);
  } catch (error) {
    console.error('获取最大钓获记录失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;