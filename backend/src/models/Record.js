const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: [true, '请选择钓鱼日期']
  },
  fishType: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
    min: 1
  },
  weight: {
    type: Number,
    default: 0
  },
  weather: {
    type: String,
    required: [true, '请选择天气情况']
  },
  temperature: {
    type: Number,
    required: [true, '请输入温度']
  },
  photos: [{
    type: String,  // 存储照片URL
    required: [true, '请上传照片']
  }],
  location: {
    type: String,
    required: [true, '请输入钓鱼地点']
  },
  catches: [{
    fishType: {
      type: String,
      required: [true, '请输入鱼种']
    },
    weight: {
      type: Number,
      required: [true, '请输入重量']
    },
    length: {
      type: Number,
      required: [true, '请输入长度']
    }
  }],
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 添加索引以提高查询性能
recordSchema.index({ userId: 1, date: -1 });
recordSchema.index({ fishType: 1 });

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;