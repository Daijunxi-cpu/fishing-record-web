# 微信小程序迁移计划

## 目录结构

需要从当前项目中剥离出微信小程序相关代码，创建新的 `wxxcx` 目录，包含以下内容：

```
wxxcx/
├── cloudfunctions/       # 云函数
│   ├── addRecord/
│   ├── deleteRecord/
│   ├── getRecords/
│   ├── getStatistics/
│   └── login/
├── pages/                # 小程序页面
│   ├── add/
│   ├── index/
│   ├── profile/
│   ├── record/
│   └── statistics/
├── assets/               # 资源文件
│   ├── bg/
│   └── icons/
├── app.js                # 小程序入口文件
├── app.json              # 小程序配置文件
├── app.wxss              # 小程序全局样式
├── project.config.json   # 项目配置
├── sitemap.json          # 站点地图
└── theme.json            # 主题配置

```

## 迁移步骤

1. 创建 `wxxcx` 目录
2. 复制 `miniprogram` 目录下的所有内容到 `wxxcx` 目录
   - app.js
   - app.json
   - app.wxss
   - project.config.json
   - sitemap.json
   - theme.json
   - pages/ 目录
   - cloudfunctions/ 目录
3. 复制 `assets` 目录到 `wxxcx/assets`
4. 更新 `app.json` 中的路径引用，确保它们指向正确的位置

## 受影响的关系

1. **资源引用**
   - 页面中引用的图片路径需要更新
   - 样式文件中的资源路径需要更新

2. **云函数配置**
   - 确保云函数的环境ID配置正确
   - 更新云函数中可能存在的路径引用

3. **组件引用**
   - 如果使用了自定义组件，确保路径引用正确

## 执行命令

在Windows环境中，可以使用以下命令执行迁移：

```
mkdir wxxcx
xcopy /E /I miniprogram\* wxxcx\
mkdir wxxcx\assets
xcopy /E /I assets\* wxxcx\assets\
```

## 迁移后的验证

1. 确保所有文件都已正确复制
2. 检查路径引用是否正确
3. 在微信开发者工具中导入新项目，验证功能是否正常