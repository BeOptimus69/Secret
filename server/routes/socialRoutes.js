const express = require('express');
const router = express.Router();
const {
  getSocialFeed,
  reactToMoodPost
  // shareMoodPost will be in moodRoutes.js as per plan
} = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware');

// Apply protect middleware to all routes in this router
router.use(protect);

// Get social feed for the authenticated user
// GET /api/social/feed
router.get('/feed', getSocialFeed);

// React to a mood post
// POST /api/social/posts/:postId/react
// Expects reactionType in body: { "reactionType": "wave" }
router.post('/posts/:postId/react', reactToMoodPost);

module.exports = router;
