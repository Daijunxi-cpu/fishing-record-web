# Fishing Record Web

钓鱼记录网页应用

## 项目结构

```
fishing-record-web/
├── frontend/           # 前端代码
│   ├── src/           # 源代码
│   ├── public/        # 静态资源
│   ├── package.json   # 前端依赖
│   └── vite.config.ts # 前端配置
│
├── backend/           # 后端代码
│   ├── src/          # 源代码
│   ├── package.json  # 后端依赖
│   └── .env         # 环境变量
│
└── README.md         # 项目说明
```

## 开发环境设置

### 前端

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

### 后端

1. 进入后端目录：
   ```bash
   cd backend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置环境变量：
   - 复制 `.env.example` 为 `.env`
   - 修改必要的环境变量

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

## 部署

### Railway 部署

1. 前端部署：
   - 构建命令：`npm install && npm run build`
   - 输出目录：`dist`
   - 环境变量：`VITE_API_URL`（后端服务 URL）

2. 后端部署：
   - 构建命令：`npm install`
   - 启动命令：`npm start`
   - 环境变量：`MONGODB_URI`（MongoDB 连接字符串）

## 技术栈

- 前端：Vue 3 + Vite + TypeScript
- 后端：Node.js + Express + MongoDB
- 部署：Railway 