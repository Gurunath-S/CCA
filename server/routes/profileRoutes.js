const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, profileController.updateProfile);
router.put('/account', authMiddleware, profileController.updateAccount);
router.get('/export', authMiddleware, profileController.exportData);
router.delete('/', authMiddleware, profileController.deleteAccount);

module.exports = router;
