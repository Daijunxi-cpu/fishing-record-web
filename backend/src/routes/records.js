const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Record = require('../models/Record');
const auth = require('../middleware/auth');

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'fishing-' + uniqueSuffix + ext);
  }
});

// 文件过滤器，只允许图片
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 限制5MB
});

// 获取所有钓鱼记录
router.get('/', async (req, res) => {
  try {
    // 强制不缓存响应
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const records = await Record.find().sort({ date: -1 });
    
    // 返回统一格式的数据
    res.json({
      success: true,
      data: records,
      count: records.length // 可以选择添加总数
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取最近钓鱼记录
router.get('/recent', async (req, res) => {
  try {
    // 强制不缓存响应
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // 获取最近10条钓鱼记录，并添加格式化的日期和时间
    const recentRecords = await Record.find()
      .sort({ date: -1 })
      .limit(10);
    
    // 格式化数据，添加额外信息
    const formattedRecords = recentRecords.map(record => {
      const date = new Date(record.date);
      return {
        _id: record._id,
        fishType: record.fishType,
        count: record.count,
        weight: record.weight,
        location: record.location,
        weather: record.weather,
        temperature: record.temperature,
        formattedDate: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
        formattedTime: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        photos: record.photos
      };
    });
    
    // 添加时间戳，确保每次返回的数据都被视为新数据
    const timestamp = new Date().getTime();
    
    res.json({
      success: true,
      timestamp,
      count: formattedRecords.length,
      data: formattedRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个钓鱼记录
router.get('/:id', async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新的钓鱼记录
router.post('/', async (req, res) => {
    try {
        // 验证请求数据
        const { fishType, count, weight, location, weather, temperature, date } = req.body;
        
        if (!fishType) {
            return res.status(400).json({ 
                success: false, 
                message: '请输入鱼种' 
            });
        }
        
        if (!count || count <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: '请输入有效的数量' 
            });
        }
        
        if (!weight || weight <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: '请输入有效的重量' 
            });
        }
        
        if (!location || !location.name) {
            return res.status(400).json({ 
                success: false, 
                message: '请输入地点' 
            });
        }
        
        if (!weather) {
            return res.status(400).json({ 
                success: false, 
                message: '请选择天气' 
            });
        }
        
        if (!temperature) {
            return res.status(400).json({ 
                success: false, 
                message: '请输入温度' 
            });
        }
        
        // 创建新记录
        const record = new Record({
            ...req.body,
            date: date ? new Date(date) : new Date()
        });
        
        // 保存记录
        const newRecord = await record.save();
        
        // 返回成功响应
        res.status(201).json({
            success: true,
            message: '记录添加成功',
            data: newRecord
        });
    } catch (error) {
        console.error("创建记录失败:", error);
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// 更新钓鱼记录
router.put('/:id', async (req, res) => {
  try {
        const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: '记录不存在' });
    }
    
        Object.assign(record, req.body);
        const updatedRecord = await record.save();
        res.json(updatedRecord);
  } catch (error) {
        res.status(400).json({ message: error.message });
  }
});

// 删除钓鱼记录
router.delete('/:id', async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: '记录不存在' });
    }
    
    // 使用 findByIdAndDelete 替代 remove 方法
    await Record.findByIdAndDelete(req.params.id);
    res.json({ message: '记录已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;