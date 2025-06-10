const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  user: { // Changed from userId to user to match conventions and for populate
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reactionType: { // Changed from type to reactionType for clarity
    type: String, // e.g., 'wave', 'emoji_👍', 'emoji_❤️'
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); // No separate _id for subdocuments unless needed

const moodPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalMoodEntry: { // Link to the detailed daily Mood entry
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mood',
    required: false, // Optional: A user might create a post not directly from a full mood entry
  },
  mood: { // The primary mood being shared, e.g., "happy", "focused", "calm"
    type: String,
    required: [true, 'Mood is required for a post.'],
    trim: true,
  },
  content: { // User's own text or AI-generated shareable text
    type: String,
    trim: true,
    maxlength: [280, 'Content cannot be more than 280 characters'], // Example length limit
  },
  privacyLevel: {
    type: String,
    enum: ['private', 'friends', 'public'], // 'public' for future, 'friends' is key now
    default: 'friends',
    required: true,
  },
  reactions: [reactionSchema], // Array of reactions
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Add any other fields like tags, location (if different from original mood entry) later if needed
});

// Index for querying posts by user, sorted by creation date
moodPostSchema.index({ user: 1, createdAt: -1 });
// Index for feed generation: privacyLevel and createdAt for filtering and sorting
moodPostSchema.index({ privacyLevel: 1, createdAt: -1 });
// If querying reactions becomes important, consider indexing fields within reactions array

const MoodPost = mongoose.model('MoodPost', moodPostSchema);

module.exports = MoodPost;
