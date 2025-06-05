const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');

// 获取所有日记
router.get('/', async (req, res) => {
  try {
    const diaries = await Diary.find().sort({ date: -1 });
    res.json({
      success: true,
      data: diaries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个日记
router.get('/:id', async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    if (!diary) {
      return res.status(404).json({ success: false, message: '日记不存在' });
    }
    res.json({ success: true, data: diary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建新日记
router.post('/', async (req, res) => {
  try {
    const diary = new Diary(req.body);
    const newDiary = await diary.save();
    res.status(201).json({
      success: true,
      message: '日记添加成功',
      data: newDiary
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 更新日记
router.put('/:id', async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    if (!diary) {
      return res.status(404).json({ success: false, message: '日记不存在' });
    }
    
    Object.assign(diary, req.body);
    const updatedDiary = await diary.save();
    res.json({
      success: true,
      message: '日记更新成功',
      data: updatedDiary
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 删除日记
router.delete('/:id', async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.id);
    if (!diary) {
      return res.status(404).json({ success: false, message: '日记不存在' });
    }
    
    await Diary.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: '日记已删除' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;