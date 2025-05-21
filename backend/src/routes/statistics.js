const express = require('express');
const router = express.Router();
const Record = require('../models/Record');
const auth = require('../middleware/auth');

// 获取统计数据
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 总钓鱼次数
    const totalTrips = await Record.countDocuments({ userId });
    
    // 总钓获数量
    const countResult = await Record.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    const totalFish = countResult.length > 0 ? countResult[0].total : 0;
    
    // 总重量
    const weightResult = await Record.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ]);
    const totalWeight = weightResult.length > 0 ? weightResult[0].total : 0;
    
    // 最大单次收获
    const biggestCatchResult = await Record.find({ userId })
      .sort({ weight: -1 })
      .limit(1);
    const biggestCatch = biggestCatchResult.length > 0 ? biggestCatchResult[0].weight : 0;
    
    // 鱼种分布
    const fishTypeDistribution = await Record.aggregate([
      { $match: { userId } },
      { $group: { _id: '$fishType', count: { $sum: '$count' } } },
      { $sort: { count: -1 } }
    ]);
    
    // 月度趋势
    const monthlyTrends = await Record.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 },
          fishCount: { $sum: '$count' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // 天气分布
    const weatherDistribution = await Record.aggregate([
      { $match: { userId } },
      { $group: { _id: '$weather', count: { $sum: 1 } } }
    ]);
    
    // 时间分布（按小时）
    const timeDistribution = await Record.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $hour: '$date' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalTrips,
      totalFish,
      totalWeight,
      biggestCatch,
      fishTypeDistribution: fishTypeDistribution.map(item => ({
        name: item._id,
        value: item.count
      })),
      monthlyTrends: monthlyTrends.map(item => ({
        year: item._id.year,
        month: item._id.month,
        count: item.count,
        fishCount: item.fishCount
      })),
      weatherDistribution: weatherDistribution.map(item => ({
        weather: item._id,
        count: item.count
      })),
      timeDistribution: timeDistribution.map(item => ({
        hour: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取最佳钓鱼地点
router.get('/best-locations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const bestLocations = await Record.aggregate([
      { $match: { userId, 'location.address': { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$location.address',
          totalFish: { $sum: '$count' },
          avgWeight: { $avg: '$weight' },
          trips: { $sum: 1 },
          location: { $first: '$location' }
        }
      },
      { $sort: { totalFish: -1 } },
      { $limit: 5 }
    ]);
    
    res.json(bestLocations.map(location => ({
      address: location._id,
      totalFish: location.totalFish,
      avgWeight: location.avgWeight,
      trips: location.trips,
      latitude: location.location.latitude,
      longitude: location.location.longitude
    })));
  } catch (error) {
    console.error('获取最佳钓鱼地点失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取最大钓获记录
router.get('/biggest-catches', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const biggestCatches = await Record.find({ userId })
      .sort({ weight: -1 })
      .limit(5);
    
    res.json(biggestCatches);
  } catch (error) {
    console.error('获取最大钓获记录失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;