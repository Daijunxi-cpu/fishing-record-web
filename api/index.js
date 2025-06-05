const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// 加载环境变量
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 懒加载数据库连接
let conn = null;
async function connectDB() {
  if (!conn) {
    conn = mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await conn;
    console.log('MongoDB connected');
  }
}

// 用户模型
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 示例用户注册路由
app.post('/api/users/register', async (req, res) => {
  await connectDB();
  const { username, email, password } = req.body;
  try {
    const user = new User({ username, email, password });
    await user.save();
    res.json({ success: true, user: { username, email } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 示例用户登录路由
app.post('/api/users/login', async (req, res) => {
  await connectDB();
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: '用户不存在' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, error: '密码错误' });
    res.json({ success: true, user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
module.exports.handler = serverless(app); 