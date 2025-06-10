const express = require('express');
const router = express.Router();
const {
  sendFriendRequest,
  acceptFriendRequest,
  declineOrCancelFriendRequest,
  listFriends,
  listPendingRequests
} = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

// All routes in this file are protected and require authentication
router.use(protect); // Apply protect middleware to all routes in this router

// Send a friend request
// Expects recipientId in the request body: { "recipientId": "someUserId" }
router.post('/request', sendFriendRequest);

// Accept a friend request
// Expects requestId (the ID of the Friendship document) in URL params
router.post('/accept/:requestId', acceptFriendRequest);

// Decline a pending friend request (if recipient) or Cancel a sent pending request (if requester)
// Expects requestId (the ID of the Friendship document) in URL params
router.delete('/request/:requestId', declineOrCancelFriendRequest);

// List all accepted friends
router.get('/list', listFriends);

// List all pending friend requests (incoming and outgoing)
router.get('/pending', listPendingRequests);

// Future consideration: Unfriend a user (remove an 'accepted' friendship)
// router.delete('/:friendUserId', unfriendUser);
// This would require a different controller function that finds the 'accepted'
// Friendship document between req.user._id and :friendUserId and then deletes it.

module.exports = router;
