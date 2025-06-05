const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  title: {
    type: String,
    required: [true, '请输入标题']
  },
  content: {
    type: String,
    required: [true, '请输入内容']
  },
  mood: {
    type: String,
    enum: ['开心', '平静', '疲惫', '兴奋', '失望']
  },
  weather: {
    type: String,
    enum: ['晴天', '多云', '雨天', '雪天', '大风', '雾天']
  },
  location: {
    name: String,
    address: String,
    latitude: Number,
    longitude: Number
  },
  photos: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

diarySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Diary = mongoose.model('Diary', diarySchema);

module.exports = Diary;