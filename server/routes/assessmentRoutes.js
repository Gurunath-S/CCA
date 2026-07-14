const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, assessmentController.createAssessment);
router.get('/history', authMiddleware, assessmentController.getHistory);
router.get('/:characterId', authMiddleware, assessmentController.getAssessmentsByCharacter);
router.get('/aggregate/:characterId', authMiddleware, assessmentController.getAggregateStats);

module.exports = router;
