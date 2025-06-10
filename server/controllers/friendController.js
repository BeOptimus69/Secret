const Friendship = require('../models/Friendship');
const User = require('../models/User'); // To check if recipient exists
const mongoose = require('mongoose'); // For ObjectId validation if needed

// @desc    Send a friend request
// @route   POST /api/friends/request
// @access  Private
const sendFriendRequest = async (req, res) => {
  const requesterId = req.user._id; // From authMiddleware
  const { recipientId } = req.body;

  // Validate recipientId
  if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
    return res.status(400).json({ message: 'Valid recipient ID is required.' });
  }

  if (requesterId.equals(recipientId)) {
    return res.status(400).json({ message: 'You cannot send a friend request to yourself.' });
  }

  try {
    // Check if recipient user exists
    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient user not found.' });
    }

    // Check if a friendship already exists or is pending between these two users
    // This checks both directions to prevent issues if one sent to other and vice-versa simultaneously (though UI should prevent)
    // Or if a request was already sent.
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({ message: 'You are already friends with this user.' });
      } else if (existingFriendship.status === 'pending') {
        if (existingFriendship.requester.equals(requesterId)) {
          return res.status(400).json({ message: 'Friend request already sent.' });
        } else {
          // If the other user sent a request to you, you should accept it, not send a new one.
          return res.status(400).json({ message: 'This user has already sent you a friend request. Please check your pending requests.' });
        }
      } else if (existingFriendship.status === 'declined') {
         // Allow re-sending request if it was declined by recipient? Business logic decision.
         // For now, let's treat it as "an interaction already exists".
         // Or, could remove the declined request and allow a new 'pending' one.
         // For simplicity, let's prevent re-request for now if any record exists.
         // A more robust solution might delete declined/cancelled to allow new ones.
        return res.status(400).json({ message: 'A previous friend request interaction exists. Please manage existing requests or try again later.'});
      }
    }

    // Create new friendship document
    const newFriendship = new Friendship({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending',
    });

    await newFriendship.save();

    // TODO: Consider emitting a notification to the recipient user via WebSockets in a future step

    res.status(201).json({
      message: 'Friend request sent successfully.',
      data: newFriendship,
    });

  } catch (error) {
    if (error.code === 11000) { // MongoError: E11000 duplicate key error (from unique index)
        return res.status(400).json({ message: 'Friend request already exists or has been sent.' });
    }
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Server error while sending friend request.' });
  }
};

// @desc    Accept a friend request
// @route   POST /api/friends/accept/:requestId
// @access  Private
const acceptFriendRequest = async (req, res) => {
  const recipientId = req.user._id; // Current user is the recipient
  const { requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({ message: 'Invalid request ID.' });
  }

  try {
    const friendship = await Friendship.findById(requestId);

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found.' });
    }

    // Verify that the current user is the recipient and the request is pending
    if (!friendship.recipient.equals(recipientId)) {
      return res.status(403).json({ message: 'You are not authorized to accept this request.' });
    }
    if (friendship.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${friendship.status}.` });
    }

    friendship.status = 'accepted';
    friendship.acceptedAt = Date.now();
    await friendship.save();

    // TODO: Consider emitting notifications via WebSockets

    res.status(200).json({
      message: 'Friend request accepted.',
      data: friendship,
    });

  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Server error while accepting friend request.' });
  }
};

// @desc    Decline a pending friend request or Cancel a sent pending request
// @route   DELETE /api/friends/request/:requestId
// @access  Private
const declineOrCancelFriendRequest = async (req, res) => {
  const currentUserId = req.user._id;
  const { requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    return res.status(400).json({ message: 'Invalid request ID.' });
  }

  let friendship; // Define friendship here to access it in the catch block's logging
  try {
    friendship = await Friendship.findById(requestId);

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found.' });
    }

    // Only 'pending' requests can be declined or cancelled this way
    if (friendship.status !== 'pending') {
      return res.status(400).json({ message: `Cannot decline/cancel a request that is already ${friendship.status}.`});
    }

    // User must be either the requester (to cancel) or the recipient (to decline)
    if (!friendship.requester.equals(currentUserId) && !friendship.recipient.equals(currentUserId)) {
      return res.status(403).json({ message: 'You are not authorized to modify this request.' });
    }

    // For declining, some prefer to set status to 'declined'. For cancelling, removal is common.
    // Let's use removal for both for simplicity as per plan ("Remove the Friendship document").
    // If a 'declined' status is desired for record-keeping, change this to update status.
    const deletedFriendship = await Friendship.findByIdAndDelete(requestId);

    if (!deletedFriendship) { // Should not happen if findById worked, but as a safeguard
         return res.status(404).json({ message: 'Friendship request not found for deletion.' });
    }

    // TODO: Consider emitting notifications via WebSockets

    const action = friendship.recipient.equals(currentUserId) ? 'declined' : 'cancelled';
    res.status(200).json({ message: `Friend request ${action} successfully.` });

  } catch (error) {
    const actionForErrorMessage = friendship && friendship.recipient.equals(currentUserId) ? 'declining' : 'cancelling';
    console.error(`Error ${actionForErrorMessage} friend request:`, error);
    res.status(500).json({ message: `Server error while ${actionForErrorMessage} friend request.` });
  }
};

// @desc    List all accepted friends for the current user
// @route   GET /api/friends/list
// @access  Private
const listFriends = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    const friendships = await Friendship.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      status: 'accepted',
    })
    .populate('requester', 'username email _id') // Select fields you want from User model
    .populate('recipient', 'username email _id');

    // Transform the data to return a list of friend objects, not the friendship documents
    const friends = friendships.map(friendship => {
      if (friendship.requester._id.equals(currentUserId)) {
        return friendship.recipient; // Return the recipient if current user is requester
      } else {
        return friendship.requester; // Return the requester if current user is recipient
      }
    });

    res.status(200).json({
      message: 'Friends list retrieved successfully.',
      data: friends,
      count: friends.length
    });

  } catch (error) {
    console.error('Error listing friends:', error);
    res.status(500).json({ message: 'Server error while listing friends.' });
  }
};

// @desc    List pending friend requests (incoming and outgoing)
// @route   GET /api/friends/pending
// @access  Private
const listPendingRequests = async (req, res) => {
    const currentUserId = req.user._id;
    try {
        const incomingRequests = await Friendship.find({
            recipient: currentUserId,
            status: 'pending'
        }).populate('requester', 'username email _id');

        const outgoingRequests = await Friendship.find({
            requester: currentUserId,
            status: 'pending'
        }).populate('recipient', 'username email _id');

        res.status(200).json({
            message: 'Pending requests retrieved.',
            data: {
                incoming: incomingRequests,
                outgoing: outgoingRequests
            }
        });
    } catch (error) {
        console.error('Error listing pending requests:', error);
        res.status(500).json({ message: 'Server error while listing pending requests.' });
    }
};


module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  declineOrCancelFriendRequest,
  listFriends,
  listPendingRequests, // Added as per bonus in plan
};
