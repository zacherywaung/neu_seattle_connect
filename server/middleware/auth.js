const jwt = require('jsonwebtoken');

// 用法：在任何需要登录才能访问的路由前加上 protect
// 例如：router.post('/', protect, createPost)
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未登录，请先登录' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded 里有 { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token 无效或已过期' });
  }
};

module.exports = { protect };