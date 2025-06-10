const Mood = require('../models/Mood');
const User = require('../models/User'); // For populating user info if needed, though not strictly for these funcs

// @desc    Sync mood data for the authenticated user (create or update)
// @route   POST /api/moods/sync
// @access  Private
const syncMoodData = async (req, res) => {
  const { date, primaryMood, confidence, activities, summary, rawData, aiGenerated, shareablePost } = req.body;
  const userId = req.user._id; // From authMiddleware

  if (!date || !primaryMood) {
    return res.status(400).json({ message: 'Date and primaryMood are required' });
  }

  // Validate date format if necessary, new Date(date) should parse ISO strings
  const moodDate = new Date(new Date(date).setHours(0, 0, 0, 0)); // Normalize to start of day for consistent matching

  try {
    const moodDataPayload = {
      user: userId,
      date: moodDate,
      primaryMood,
      confidence,
      activities,
      summary,
      rawData,
      aiGenerated,
      shareablePost,
    };

    // Atomically find and update if exists, or insert if new (upsert)
    // Based on user and the specific date (normalized to start of day)
    const updatedOrCreatedMood = await Mood.findOneAndUpdate(
      { user: userId, date: moodDate },
      { $set: moodDataPayload }, // Use $set to update specified fields or all fields if that's the intent
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: 'Mood data synced successfully',
      data: updatedOrCreatedMood,
    });
  } catch (error) {
    console.error('Error syncing mood data:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error: ' + error.message });
    }
    res.status(500).json({ message: 'Server error while syncing mood data' });
  }
};

// @desc    Get mood history for the authenticated user
// @route   GET /api/moods/history
// @access  Private
const getMoodHistory = async (req, res) => {
  const userId = req.user._id; // From authMiddleware
  const { limit = 10, page = 1 } = req.query; // Basic pagination

  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * limitNum;

  try {
    const moods = await Mood.find({ user: userId })
      .sort({ date: -1 }) // Sort by date descending (newest first)
      .skip(skip)
      .limit(limitNum);
      // .populate('user', 'username email'); // Optionally populate user details

    const totalMoods = await Mood.countDocuments({ user: userId });

    res.status(200).json({
      message: 'Mood history retrieved successfully',
      data: moods,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalMoods / limitNum),
        totalEntries: totalMoods,
        entriesPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('Error retrieving mood history:', error);
    res.status(500).json({ message: 'Server error while retrieving mood history' });
  }
};

module.exports = {
  syncMoodData,
  getMoodHistory,
};
