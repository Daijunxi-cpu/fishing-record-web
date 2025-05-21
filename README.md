# 钓鱼记录网站

一个用于记录钓鱼活动的网站，帮助钓鱼爱好者记录和分享他们的钓鱼经历。

## 功能特点

- 记录钓鱼时间、天气情况
- 上传和管理钓鱼照片
- 记录钓获的鱼种和数量
- 数据统计和分析

## 技术栈

- **前端**：Vue 3 + TypeScript + Vite
- **后端**：Node.js + Express + MongoDB
- **样式**：SCSS + Font Awesome 图标

## 项目结构

```
fishing-record-web/
├── frontend/           # 前端代码
│   ├── src/            # 源代码
│   │   ├── components/ # 组件
│   │   ├── views/      # 页面
│   │   ├── router/     # 路由
│   │   ├── services/   # 服务
│   │   └── styles/     # 样式
│   ├── public/         # 静态资源
│   └── index.html      # HTML入口
│
├── backend/            # 后端代码
│   ├── src/            # 源代码
│   │   ├── models/     # 数据模型
│   │   ├── routes/     # API路由
│   │   └── index.js    # 入口文件
│   └── package.json    # 后端依赖
│
└── README.md           # 项目说明
```

## 开发指南

### 前端开发

1. 进入前端目录：
   ```bash
   cd frontend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 构建生产版本：
   ```bash
   npm run build
   ```

### 后端开发

1. 进入后端目录：
   ```bash
   cd backend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

## API接口

### 钓鱼记录

- `GET /api/records` - 获取所有钓鱼记录
- `GET /api/records/:id` - 获取单个钓鱼记录
- `POST /api/records` - 创建新钓鱼记录
- `PUT /api/records/:id` - 更新钓鱼记录
- `DELETE /api/records/:id` - 删除钓鱼记录

### 统计数据

- `GET /api/statistics` - 获取统计数据

## 部署

### 前端部署

1. 构建前端：
   ```bash
   cd frontend
   npm run build
   ```

2. 将 `dist` 目录部署到静态文件服务器

### 后端部署

1. 设置环境变量：
   - `MONGODB_URI` - MongoDB连接字符串
   - `PORT` - 服务器端口（默认8080）

2. 启动服务器：
   ```bash
   cd backend
   npm start
   ```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT