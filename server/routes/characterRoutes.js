const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, characterController.getCharacters);
router.post('/custom', authMiddleware, characterController.createCustomCharacter);

module.exports = router;
