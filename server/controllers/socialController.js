const MoodPost = require('../models/MoodPost');
const Friendship = require('../models/Friendship'); // To get friends for the feed
const Mood = require('../models/Mood'); // To validate originalMoodEntryId if provided
const mongoose = require('mongoose');

// @desc    Share a mood post
// @route   POST /api/moods/share (or /api/social/posts if routes are structured that way)
// @access  Private
const shareMoodPost = async (req, res) => {
  const { mood, content, privacyLevel, originalMoodEntryId } = req.body;
  const userId = req.user._id;

  if (!mood) {
    return res.status(400).json({ message: 'Mood is required for a post.' });
  }

  try {
    const postData = {
      user: userId,
      mood,
      content,
      privacyLevel, // Will default in schema if not provided
    };

    if (originalMoodEntryId) {
      if (!mongoose.Types.ObjectId.isValid(originalMoodEntryId)) {
        return res.status(400).json({ message: 'Invalid originalMoodEntryId.' });
      }
      const moodEntry = await Mood.findById(originalMoodEntryId);
      if (!moodEntry) {
        return res.status(404).json({ message: 'Original mood entry not found.' });
      }
      if (!moodEntry.user.equals(userId)) {
        return res.status(403).json({ message: 'Cannot link mood entry from another user.' });
      }
      postData.originalMoodEntry = originalMoodEntryId;
    }

    const newMoodPost = new MoodPost(postData);
    await newMoodPost.save();

    // Populate user details for the response
    await newMoodPost.populate('user', 'username email _id');

    res.status(201).json({
      message: 'Mood post shared successfully.',
      data: newMoodPost,
    });
  } catch (error) {
    console.error('Error sharing mood post:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while sharing mood post.' });
  }
};

// @desc    Get social feed for the authenticated user
// @route   GET /api/social/feed
// @access  Private
const getSocialFeed = async (req, res) => {
  const currentUserId = req.user._id;
  const { limit = 10, page = 1 } = req.query;
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const skip = (pageNum - 1) * limitNum;

  try {
    // 1. Get IDs of friends
    const friendships = await Friendship.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
      status: 'accepted',
    });
    const friendIds = friendships.map(f =>
      f.requester.equals(currentUserId) ? f.recipient : f.requester
    );

    // Include user's own posts in their feed as well
    const feedUserIds = [currentUserId, ...friendIds];

    // 2. Fetch posts from friends (and self) that are 'friends' or 'public'
    // For now, only 'friends' privacy is primary, 'public' can be added.
    const posts = await MoodPost.find({
      user: { $in: feedUserIds },
      privacyLevel: 'friends', // Or { $in: ['friends', 'public'] } if public posts are implemented
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('user', 'username email _id') // Populate author details
    .populate('reactions.user', 'username _id'); // Populate user details for reactions

    const totalPosts = await MoodPost.countDocuments({
      user: { $in: feedUserIds },
      privacyLevel: 'friends',
    });

    res.status(200).json({
      message: 'Social feed retrieved successfully.',
      data: posts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalPosts / limitNum),
        totalEntries: totalPosts,
        entriesPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error('Error retrieving social feed:', error);
    res.status(500).json({ message: 'Server error while retrieving social feed.' });
  }
};

// @desc    React to a mood post
// @route   POST /api/social/posts/:postId/react
// @access  Private
const reactToMoodPost = async (req, res) => {
  const { postId } = req.params;
  const { reactionType } = req.body; // e.g., "wave", "emoji_👍"
  const userId = req.user._id;

  if (!reactionType) {
    return res.status(400).json({ message: 'Reaction type is required.' });
  }
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid post ID.' });
  }

  try {
    const post = await MoodPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Mood post not found.' });
    }

    // TODO: Add visibility check: Can current user see this post?
    // (e.g., is it their own, from a friend and privacy 'friends', or 'public')
    // This requires fetching friend list or checking post.user against req.user._id or post.privacyLevel

    const existingReactionIndex = post.reactions.findIndex(
      (reaction) => reaction.user.equals(userId) && reaction.reactionType === reactionType
    );

    if (existingReactionIndex > -1) {
      // User already reacted with this type, remove reaction (toggle off)
      post.reactions.splice(existingReactionIndex, 1);
    } else {
      // If user reacted with a different type, remove that first (optional: allow multiple different reactions?)
      // For now, let's assume one reaction type per user, or just add new one.
      // To enforce one reaction instance per user regardless of type:
      // const userReactionIdx = post.reactions.findIndex(r => r.user.equals(userId));
      // if (userReactionIdx > -1) post.reactions.splice(userReactionIdx, 1);

      post.reactions.push({ user: userId, reactionType });
    }

    await post.save();

    // Populate user details for the response, especially for the reactions
    // Chaining populate calls
    await post.populate([
        { path: 'user', select: 'username email _id' },
        { path: 'reactions.user', select: 'username _id' }
    ]);


    res.status(200).json({
      message: 'Reaction updated successfully.',
      data: post,
    });
  } catch (error) {
    console.error('Error reacting to mood post:', error);
    res.status(500).json({ message: 'Server error while reacting to mood post.' });
  }
};

module.exports = {
  shareMoodPost,
  getSocialFeed,
  reactToMoodPost,
};
