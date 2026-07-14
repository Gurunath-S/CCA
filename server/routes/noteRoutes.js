const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/auth');

router.get('/:characterId', authMiddleware, noteController.getNotes);
router.put('/', authMiddleware, noteController.upsertNote);
router.delete('/:noteId', authMiddleware, noteController.deleteNote);

module.exports = router;
