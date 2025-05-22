const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // 加载环境变量

const connectDB = async () => {
  try {
    // 使用 Railway 提供的 MONGO_URL 环境变量连接数据库
    const connectionString = process.env.MONGO_URL;

    if (!connectionString) {
      console.error('MONGO_URL environment variable is not defined.');
      process.exit(1);
    }

    await mongoose.connect(connectionString, {
      // 这些选项根据你的 MongoDB 版本和需求可能需要调整或移除
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5秒连接超时
      connectTimeoutMS: 10000, // 10秒连接超时
      // 其他选项如 maxPoolSize, minPoolSize, writeConcern (w) 等也可以在这里配置
    });

    console.log('MongoDB connected successfully');

    // 添加连接状态检查
    mongoose.connection.on('error', err => {
        console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
    });

  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    // 进程退出并带有错误码
    process.exit(1);
  }
};

module.exports = connectDB; 