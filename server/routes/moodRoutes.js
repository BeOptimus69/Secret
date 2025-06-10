const express = require('express');
const router = express.Router();
const { syncMoodData, getMoodHistory } = require('../controllers/moodController');
const { shareMoodPost } = require('../controllers/socialController'); // Import from socialController
const { protect } = require('../middleware/authMiddleware');

// Routes in this file are individually protected by the 'protect' middleware.

// @route   POST /api/moods/sync
// @desc    Sync (create or update) mood data for the authenticated user
// @access  Private
router.post('/sync', protect, syncMoodData);

// @route   GET /api/moods/history
// @desc    Get mood history for the authenticated user
// @access  Private
router.get('/history', protect, getMoodHistory);

// @route   POST /api/moods/share
// @desc    Share a mood post (can be linked to a mood entry or standalone)
// @access  Private
router.post('/share', protect, shareMoodPost); // Added shareMoodPost route

module.exports = router;
