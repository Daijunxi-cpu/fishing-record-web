require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// 连接数据库
connectDB();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/records', require('./routes/records'));
app.use('/api/statistics', require('./routes/statistics'));
app.use('/api/diaries', require('./routes/diaries'));

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '服务器错误' });
});

// 将端口从3000改为6789
const PORT = process.env.PORT || 6789;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
