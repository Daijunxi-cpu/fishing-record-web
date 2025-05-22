const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  fishType: {
    type: String,
    required: [true, '请输入鱼种']
  },
  count: {
    type: Number,
    required: [true, '请输入数量'],
    min: [1, '数量必须大于0']
  },
  weight: {
    type: Number,
    required: [true, '请输入重量'],
    min: [0.1, '重量必须大于0.1kg']
  },
  weather: {
    type: String,
    required: [true, '请选择天气'],
    enum: ['晴天', '多云', '雨天', '雪天', '大风', '雾天']
  },
  temperature: {
    type: Number,
    required: [true, '请输入温度'],
    min: [-50, '温度不能低于-50度'],
    max: [50, '温度不能超过50度']
  },
  location: {
    name: {
      type: String,
      required: [true, '请输入钓点名称']
    },
    address: String,
    latitude: Number,
    longitude: Number
  },
  photos: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: '照片URL格式不正确'
    }
  }],
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
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 添加索引以提高查询性能
recordSchema.index({ userId: 1, date: -1 });
recordSchema.index({ fishType: 1 });
recordSchema.index({ location: 1 });
recordSchema.index({ weather: 1 });

// 添加更新时间中间件
recordSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;