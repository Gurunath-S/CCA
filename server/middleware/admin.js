const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }

    req.user.role = user.role;
    req.user.email = user.email;
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ message: 'Server error verifying admin status' });
  }
};
