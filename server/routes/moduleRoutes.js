const express = require('express');
const router = express.Router();
const {
  analyzeSpeech,
  gdReply,
  evaluatePublicSpeaking,
  evaluatePresentation,
  assistEmail,
  getInterviewQuestions,
  submitInterview,
  debateReply,
  getGrowthStats,
  getLeaderboard
} = require('../controllers/moduleController');
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, analyzeSpeech);
router.post('/gd/reply', protect, gdReply);
router.post('/public-speaking', protect, evaluatePublicSpeaking);
router.post('/presentation', protect, evaluatePresentation);
router.post('/email', protect, assistEmail);
router.post('/interview/questions', protect, getInterviewQuestions);
router.post('/interview/submit', protect, submitInterview);
router.post('/debate/reply', protect, debateReply);
router.get('/growth', protect, getGrowthStats);
router.get('/community', protect, getLeaderboard);

module.exports = router;
