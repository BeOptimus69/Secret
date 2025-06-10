import apiService from './apiService';
import { REACTION_TYPES, isValidReactionType } from '../constants/socialConstants'; // Adjust path if necessary

// Share a mood post
// postData should be an object like:
// { mood: "happy", content: "Feeling great!", privacyLevel: "friends", originalMoodEntryId: "someMongoId" (optional) }
const shareMoodPost = async (postData) => {
  if (!postData || !postData.mood) {
    return { success: false, message: 'Mood is required to share a post.' };
  }
  try {
    // Backend route is POST /api/moods/share (handled by socialController)
    const response = await apiService.post('/moods/share', postData);
    return response; // apiService formats to { success, data/message }
  } catch (error) {
    console.error('Client-side error in shareMoodPost:', error);
    return { success: false, message: error.message || 'Client error sharing mood post.' };
  }
};

// Get social feed with pagination
const getSocialFeed = async (page = 1, limit = 10) => {
  try {
    // Backend route is GET /api/social/feed
    const response = await apiService.get(`/social/feed?page=${page}&limit=${limit}`);
    // Expected: { success: true, data: { data: [posts], pagination: {} } }
    // apiService returns response.data directly if success, so access response.data.data for posts array
    // and response.data.pagination for pagination object.
    return response;
  } catch (error) {
    console.error('Client-side error in getSocialFeed:', error);
    return { success: false, message: error.message || 'Client error fetching social feed.' };
  }
};

// React to a mood post
// reactionType should be one of the values from REACTION_TYPES
const reactToMoodPost = async (postId, reactionType) => {
  if (!postId) {
    return { success: false, message: 'Post ID is required to react.' };
  }
  if (!isValidReactionType(reactionType)) {
    return { success: false, message: `Invalid reaction type: ${reactionType}.` };
  }
  try {
    // Backend route is POST /api/social/posts/:postId/react
    const response = await apiService.post(`/social/posts/${postId}/react`, { reactionType });
    return response;
  } catch (error) {
    console.error('Client-side error in reactToMoodPost:', error);
    return { success: false, message: error.message || 'Client error reacting to post.' };
  }
};

// Get all reactions for a specific mood post
const getPostReactions = async (postId) => {
  if (!postId) {
    return { success: false, message: 'Post ID is required to fetch reactions.' };
  }
  try {
    // Backend route is GET /api/social/posts/:postId/reactions (NEW - needs backend implementation)
    // This endpoint is assumed to return { success: true, data: [reactionObjects] }
    const response = await apiService.get(`/social/posts/${postId}/reactions`);
    console.warn('getPostReactions: This service function assumes the backend endpoint GET /api/social/posts/:postId/reactions exists and returns an array of reactions.');
    return response;
  } catch (error) {
    console.error('Client-side error in getPostReactions:', error);
    return { success: false, message: error.message || 'Client error fetching post reactions.' };
  }
};

export default {
  shareMoodPost,
  getSocialFeed,
  reactToMoodPost,
  getPostReactions,
  REACTION_TYPES, // Export for easy access in UI components
};
