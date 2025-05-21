// 简化版身份验证中间件，不依赖任何外部模块
module.exports = (req, res, next) => {
  // 临时跳过身份验证
  req.user = { id: '123456' }; // 模拟用户ID
  next();
};
