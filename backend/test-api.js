const axios = require('axios');

const API_URL = 'http://localhost:6789/api';

async function testAPI() {
    try {
        // 测试创建记录
        const newRecord = {
            date: new Date(),
            location: "西湖",
            weather: "晴天",
            temperature: 25,
            photos: ["http://example.com/photo1.jpg"],
            catches: [{
                fishType: "鲫鱼",
                weight: 0.5,
                length: 20
            }],
            notes: "测试记录"
        };

        console.log('创建新记录...');
        const createResponse = await axios.post(`${API_URL}/records`, newRecord);
        console.log('创建成功:', createResponse.data);

        // 测试获取所有记录
        console.log('\n获取所有记录...');
        const getAllResponse = await axios.get(`${API_URL}/records`);
        console.log('获取成功:', getAllResponse.data);

        // 测试获取单个记录
        const recordId = createResponse.data._id;
        console.log('\n获取单个记录...');
        const getOneResponse = await axios.get(`${API_URL}/records/${recordId}`);
        console.log('获取成功:', getOneResponse.data);

        // 测试更新记录
        console.log('\n更新记录...');
        const updateData = { notes: "更新后的测试记录" };
        const updateResponse = await axios.put(`${API_URL}/records/${recordId}`, updateData);
        console.log('更新成功:', updateResponse.data);

        // 测试删除记录
        console.log('\n删除记录...');
        const deleteResponse = await axios.delete(`${API_URL}/records/${recordId}`);
        console.log('删除成功:', deleteResponse.data);

    } catch (error) {
        console.error('测试失败:', error.response ? error.response.data : error.message);
    }
}

testAPI(); 