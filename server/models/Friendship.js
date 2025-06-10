const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending',
    required: true,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  acceptedAt: {
    type: Date, // Will be set when the request is accepted
  },
});

// Compound index to ensure that a pair of (requester, recipient) is unique.
// This prevents duplicate friend requests in the same direction.
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Optional: Index for querying by recipient and status (e.g., for finding pending requests for a user)
friendshipSchema.index({ recipient: 1, status: 1 });
// Optional: Index for querying by requester and status (e.g., for finding sent pending requests by a user)
friendshipSchema.index({ requester: 1, status: 1 });


// Ensure users cannot send a friend request to themselves
friendshipSchema.pre('validate', function(next) {
  if (this.requester && this.recipient && this.requester.equals(this.recipient)) {
    next(new Error('Users cannot send a friend request to themselves.'));
  } else {
    next();
  }
});

const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = Friendship;
