

module.exports = (req, res, next) => {
  // req.user is set by verifyToken
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
