import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './apiService'; // Assuming apiService is set up to include token
// authService might not be directly needed here if apiService handles token attachment

// Constants for local AsyncStorage keys (can be kept for caching or specific local-only data)
const MOOD_ANALYSIS_INDEX_KEY = '@moodAnalysis_index_local'; // Renamed to avoid confusion
const MOOD_ANALYSIS_PREFIX_KEY = '@moodAnalysis_local_';  // Renamed

// Function to get mock daily data - this can remain for testing or be removed if not needed
// For now, let's assume it's still used by DashboardScreen to generate data to send to AI/backend
const getMockDailyData = () => {
  // Ensure it includes fields expected by the backend Mood model:
  // date (ISO string), primaryMood, confidence, activities, summary,
  // rawData object, aiGenerated object, shareablePost
  const primaryMoodOptions = ['calm', 'anxious', 'focused', 'social', 'lonely', 'motivated', 'stressed'];
  const activityOptions = ['Work', 'Exercise', 'Socializing', 'Relaxing', 'Hobbies', 'Errands'];
  const summaryDayType = ['positive', 'neutral', 'challenging', 'productive', 'uneventful'];
  const weatherOptions = ['sunny', 'cloudy', 'rainy', 'windy', 'snowy'];
  const appOptions = ['ProductivityHub', 'SocialNet', 'LearnSphere', 'GameZone', 'NewsFeed', 'UtilityMax'];
  const insightOptions = ["Insight about pattern A", "Observation on routine B", "Correlation C noted"];
  const feelingOptions = ['good', 'okay', 'a bit off', 'great', 'meh'];


  return {
    date: new Date().toISOString(),
    primaryMood: primaryMoodOptions[Math.floor(Math.random() * primaryMoodOptions.length)],
    confidence: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
    activities: [activityOptions[Math.floor(Math.random() * activityOptions.length)]],
    summary: "A generally " + summaryDayType[Math.floor(Math.random() * summaryDayType.length)] + " day.",
    rawData: {
        screenTime: Math.floor(Math.random() * 480) + 30, // 30 to 510 minutes
        steps: Math.floor(Math.random() * 10000) + 1000,
        weather: weatherOptions[Math.floor(Math.random() * weatherOptions.length)],
        messageCount: Math.floor(Math.random() * 50),
        topApps: [appOptions[Math.floor(Math.random() * appOptions.length)]]
    },
    aiGenerated: { // This would typically come from aiService after analysis
        insights: [insightOptions[Math.floor(Math.random() * insightOptions.length)]],
        // trendAnalysis: "Placeholder for trend analysis" // This field is not in the Mood model for now
    },
    shareablePost: "Feeling " + feelingOptions[Math.floor(Math.random()*feelingOptions.length)] + " today."
  };
};

// Store mood analysis: Send to backend, optionally cache locally
const storeMoodAnalysis = async (moodDataFull) => {
  // The moodDataFull should already contain the 'date' and other fields from aiService/getMockDailyData
  // Backend expects fields like: date, primaryMood, confidence, etc.
  // The backend's /api/moods/sync will handle user association via JWT.

  if (!moodDataFull || !moodDataFull.date || !moodDataFull.primaryMood) {
    console.error('storeMoodAnalysis: Date and primaryMood are required.');
    return { success: false, message: 'Date and primaryMood are required.' };
  }

  try {
    // Send to backend
    // apiService should automatically add Authorization header
    const response = await apiService.post('/moods/sync', moodDataFull);

    if (response.success) {
      console.log('Mood data synced to backend successfully:', response.data);
      // Optionally, update local cache if you're maintaining one
      // For now, we assume backend is the source of truth after sync.
      return { success: true, data: response.data.data }; // response.data.data because backend wraps in 'data' field
    } else {
      console.error('Failed to sync mood data to backend:', response.message);
      return { success: false, message: response.message || 'Failed to sync mood data.' };
    }
  } catch (error) {
    // This catch might be redundant if apiService handles it, but good for specific logging
    console.error('Error in storeMoodAnalysis calling apiService:', error);
    return { success: false, message: error.message || 'Client-side error during mood sync.' };
  }
};

// Get mood history: Fetch from backend
const getMoodHistory = async (limit = 10, page = 1) => {
  try {
    // apiService should automatically add Authorization header
    const response = await apiService.get(`/moods/history?limit=${limit}&page=${page}`);

    if (response.success) {
      console.log('Mood history fetched from backend successfully.');
      // The backend response includes a 'data' field for the moods array
      // and a 'pagination' field.
      return { success: true, data: response.data.data, pagination: response.data.pagination };
    } else {
      console.error('Failed to fetch mood history from backend:', response.message);
      return { success: false, message: response.message || 'Failed to fetch mood history.' };
    }
  } catch (error) {
    console.error('Error in getMoodHistory calling apiService:', error);
    return { success: false, message: error.message || 'Client-side error fetching mood history.' };
  }
};

// Clear All Mood History (Local Only - for client-side cache if implemented)
// Backend would need its own endpoint for clearing server-side history if that's a feature.
// For now, this function's utility is reduced if we're not heavily caching locally.
// We can keep it for clearing any purely local remnants if any.
const clearAllMoodHistory = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const moodKeys = keys.filter(key => key.startsWith(MOOD_ANALYSIS_PREFIX_KEY) || key === MOOD_ANALYSIS_INDEX_KEY);
    if (moodKeys.length > 0) {
      await AsyncStorage.multiRemove(moodKeys);
      console.log('Local mood history cache cleared.');
    } else {
      console.log('No local mood history cache found to clear.');
    }
    return { success: true };
  } catch (error) {
    console.error('Error clearing local mood history cache:', error);
    return { success: false, message: 'Failed to clear local cache.' };
  }
};

export default {
  getMockDailyData, // Keep if DashboardScreen still uses it to generate data for AI/sync
  storeMoodAnalysis,
  getMoodHistory,
  clearAllMoodHistory, // For local cache management
};
