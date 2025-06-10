const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  primaryMood: {
    type: String,
    required: [true, 'Primary mood is required'],
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
  },
  activities: {
    type: [String],
    default: [],
  },
  summary: {
    type: String,
    trim: true,
  },
  // Raw data from sensors/app usage, as per original spec
  rawData: {
    screenTime: Number, // in hours or minutes
    steps: Number,
    heartRate: Number, // average for the day
    weather: String,   // e.g., "Sunny", "Cloudy"
    location: String,  // e.g., "Home", "Work", or more specific if available
    // Communication patterns (mocked or aggregated)
    messageCount: Number,
    topApps: [String],
  },
  // AI generated content beyond the primary mood and summary
  aiGenerated: {
    insights: [String],       // Brief observations about patterns
    trendAnalysis: String,  // Weekly/monthly mood pattern recognition (placeholder for now)
  },
  shareablePost: { // Casual, relatable summary for social sharing
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for user and date to ensure a user can only have one mood entry per day (if upsert logic relies on this)
// Or, more commonly, for efficient querying of a user's moods by date.
moodSchema.index({ user: 1, date: 1 }, { unique: false }); // unique:false if upsert is handled by findOneAndUpdate logic, true if you want DB to enforce it. Let's go with false and let application logic handle upsert.

// Pre-save hook if any processing is needed, e.g., for date formatting, though not strictly necessary here.

const Mood = mongoose.model('Mood', moodSchema);

module.exports = Mood;
