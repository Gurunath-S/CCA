const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/google', authController.googleLogin);
router.get('/google', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('GET requests to the authentication endpoint are not supported. Please use the Google Sign-In button on the page.')}`);
});
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getMe);
router.post('/acknowledge-policy', authMiddleware, authController.acknowledgePolicy);

module.exports = router;
