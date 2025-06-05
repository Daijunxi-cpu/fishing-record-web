const mongoose = require('mongoose');

const testDB = async () => {
  try {
    // 连接数据库
    console.log('正在连接数据库...');
    await mongoose.connect('mongodb://localhost:27017/fishing_records_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('数据库连接成功!');
    
    // 创建简单的记录模型
    const recordSchema = new mongoose.Schema({
      fishType: String,
      count: Number,
      date: Date
    });
    
    const Record = mongoose.model('Record', recordSchema);
    
    // 创建测试记录
    console.log('创建测试记录...');
    const testRecord = new Record({
      fishType: '测试鱼',
      count: 1,
      date: new Date()
    });
    
    // 保存记录
    const savedRecord = await testRecord.save();
    console.log('测试记录已保存:', savedRecord);
    
    // 查询所有记录
    const records = await Record.find();
    console.log('数据库中的所有记录:', records);
    
    console.log('测试完成!');
    process.exit(0);
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
};

testDB();
