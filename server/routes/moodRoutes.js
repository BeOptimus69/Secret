const express = require('express');
const router = express.Router();
const { syncMoodData, getMoodHistory } = require('../controllers/moodController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this is the correct path

// All routes in this file will be protected by the 'protect' middleware first.
// Alternatively, you can apply middleware individually to routes.
// For simplicity here, applying to all routes defined on this router instance if chained like:
// router.post('/sync', protect, syncMoodData);
// router.get('/history', protect, getMoodHistory);
// Or, if you want to apply to all routes in this file:
// router.use(protect); // This would apply 'protect' to all subsequent routes in this file.
// Let's apply individually for clarity for now.

// @route   POST /api/moods/sync
// @desc    Sync (create or update) mood data for the authenticated user
// @access  Private
router.post('/sync', protect, syncMoodData);

// @route   GET /api/moods/history
// @desc    Get mood history for the authenticated user
// @access  Private
router.get('/history', protect, getMoodHistory);

module.exports = router;
