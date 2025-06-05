// �򻯰�������֤�м�����������κ��ⲿģ��
module.exports = (req, res, next) => {
  // ��ʱ����������֤
  req.user = { id: '123456' }; // ģ���û�ID
  next();
};
