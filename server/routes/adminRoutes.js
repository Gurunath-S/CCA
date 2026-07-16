const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Apply both authentication and administrator check to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserDetail);
router.post('/attributes', adminController.createGlobalAttribute);

module.exports = router;
