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
        const records = await Record.find().sort({ date: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 获取单个钓鱼记录
router.get('/:id', async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: '记录不存在' });
        }
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 创建新的钓鱼记录
router.post('/', async (req, res) => {
    const record = new Record({
        date: req.body.date,
        location: req.body.location,
        weather: req.body.weather,
        temperature: req.body.temperature,
        photos: req.body.photos,
        catches: req.body.catches,
        notes: req.body.notes
    });

    try {
        const newRecord = await record.save();
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
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

        await record.remove();
        res.json({ message: '记录已删除' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;