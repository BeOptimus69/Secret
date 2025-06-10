/**
 * dataService.js
 *
 * This service is responsible for fetching, aggregating, and storing user data.
 * For now, it provides mock data and simple storage logging.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOOD_ANALYSIS_INDEX_KEY = '@moodAnalysis_index';
const MOOD_ANALYSIS_PREFIX_KEY = '@moodAnalysis_';

/**
 * Fetches (currently mocks) aggregated daily data for the user.
 * In a real scenario, this would involve:
 * - Fetching raw data from AsyncStorage (screen time, sensor data logs).
 * - Fetching raw data from Geolocation logs.
 * - Potentially calling external APIs (e.g., weather).
 * - Aggregating this data into a structured daily summary.
 *
 * @returns {object} An object representing the user's daily data.
 */
const getMockDailyData = () => {
  const screenTimeHours = Math.floor(Math.random() * 8) + 1; // Random hours between 1-8
  const weatherOptions = ['sunny', 'cloudy', 'rainy', 'windy'];
  const appOptions = ['ProductivityHub', 'SocialNet', 'LearnSphere', 'GameZone', 'NewsFeed'];

  const mockData = {
    averageScreenTime: screenTimeHours * 60, // Convert to minutes
    totalSteps: Math.floor(Math.random() * 10000) + 1000, // Random steps between 1000-11000
    locationPatterns: [
      {type: 'home', duration: Math.floor(Math.random() * 5) + 4}, // 4-8 hours at home
      {type: ['work', 'cafe', 'park', 'gym'][Math.floor(Math.random() * 4)], duration: Math.floor(Math.random() * 4) + 1}, // 1-4 hours elsewhere
    ],
    appUsage: [
      {appName: appOptions[Math.floor(Math.random() * appOptions.length)], usage: Math.floor(Math.random() * 120) + 30}, // 30-150 mins
      {appName: appOptions[Math.floor(Math.random() * appOptions.length)], usage: Math.floor(Math.random() * 90) + 15},  // 15-105 mins
      {appName: appOptions[Math.floor(Math.random() * appOptions.length)], usage: Math.floor(Math.random() * 60) + 10},   // 10-70 mins
    ].filter((value, index, self) => self.findIndex(item => item.appName === value.appName) === index), // Ensure unique app names for this mock
    weather: weatherOptions[Math.floor(Math.random() * weatherOptions.length)],
    messageCount: Math.floor(Math.random() * 50) + 5, // 5-55 messages
  };

  // console.log('dataService.getMockDailyData generated:', mockData); // Keep this for debugging if needed
  return mockData;
};

/**
 * Stores the mood analysis result using AsyncStorage.
 * It saves the individual analysis and updates an index of all analyses.
 *
 * @param {object} moodData - The mood analysis object received from aiService.js.
 */
const storeMoodAnalysis = async (moodData) => {
  if (!moodData || typeof moodData !== 'object' || Object.keys(moodData).length === 0) {
    console.error('dataService.storeMoodAnalysis: Invalid or empty moodData received. Skipping storage.');
    return;
  }

  const id = new Date().toISOString();
  // It's good practice to not mutate the original object if it comes from state or props.
  // However, for this specific case where we want the ID in the stored object, we'll make a copy.
  const moodDataToStore = { ...moodData, id };

  // Log to confirm presence of moodData.date (as per subtask instructions)
  if (moodDataToStore.date) {
    console.log('dataService.storeMoodAnalysis: moodData.date is present:', moodDataToStore.date);
  } else {
    console.warn('dataService.storeMoodAnalysis: moodData.date is MISSING at time of storage.');
  }

  try {
    // Store the individual mood analysis object
    await AsyncStorage.setItem(MOOD_ANALYSIS_PREFIX_KEY + id, JSON.stringify(moodDataToStore));
    console.log(`dataService.storeMoodAnalysis: Successfully stored analysis with ID: ${id}`);

    // Update the index
    let indexArray = [];
    try {
      const existingIndexJson = await AsyncStorage.getItem(MOOD_ANALYSIS_INDEX_KEY);
      if (existingIndexJson !== null) {
        const parsedIndex = JSON.parse(existingIndexJson);
        if (Array.isArray(parsedIndex)) {
          indexArray = parsedIndex;
        } else {
          console.warn('dataService.storeMoodAnalysis: Existing index is not an array, re-initializing.');
        }
      }
    } catch (indexError) {
      // This catches errors from getItem or JSON.parse for the index
      console.error('dataService.storeMoodAnalysis: Error retrieving or parsing index, re-initializing.', indexError);
      // indexArray remains empty, effectively starting a new index
    }

    // Add the new id to the beginning of the index array
    indexArray.unshift(id);

    // Store the updated index
    await AsyncStorage.setItem(MOOD_ANALYSIS_INDEX_KEY, JSON.stringify(indexArray));
    console.log('dataService.storeMoodAnalysis: Successfully updated analysis index.');

  } catch (error) {
    // This catches errors from the main setItem calls (for individual moodData or for the index)
    console.error('dataService.storeMoodAnalysis: Failed to store mood analysis or update index.', error);
  }
};

/**
 * Retrieves a list of past mood analysis objects.
 *
 * @param {number} limit - The maximum number of mood history items to retrieve. Defaults to 7.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of mood analysis objects,
 *                                   sorted newest to oldest. Returns an empty array on failure or if no history.
 */
const getMoodHistory = async (limit = 7) => {
  try {
    const indexJson = await AsyncStorage.getItem(MOOD_ANALYSIS_INDEX_KEY);
    if (indexJson === null) {
      console.log('dataService.getMoodHistory: No mood history index found.');
      return [];
    }

    let idArray;
    try {
      idArray = JSON.parse(indexJson);
      if (!Array.isArray(idArray)) {
        console.error('dataService.getMoodHistory: Mood history index is corrupted (not an array).');
        return [];
      }
    } catch (parseError) {
      console.error('dataService.getMoodHistory: Failed to parse mood history index.', parseError);
      return [];
    }

    if (idArray.length === 0) {
      console.log('dataService.getMoodHistory: Mood history index is empty.');
      return [];
    }

    const idsToFetch = idArray.slice(0, limit);
    const moodHistory = [];

    for (const id of idsToFetch) {
      try {
        const moodDataJson = await AsyncStorage.getItem(MOOD_ANALYSIS_PREFIX_KEY + id);
        if (moodDataJson !== null) {
          const moodDataObject = JSON.parse(moodDataJson);
          moodHistory.push(moodDataObject);
        } else {
          // This case might happen if an item was in the index but its data was somehow removed.
          // Or if there's an issue with the ID.
          console.warn(`dataService.getMoodHistory: No data found for ID ${id}, though it was in the index.`);
        }
      } catch (itemError) {
        // Error reading or parsing a specific mood item
        console.error(`dataService.getMoodHistory: Error retrieving or parsing mood data for ID ${id}.`, itemError);
        // Optionally, continue to fetch other items
      }
    }

    console.log(`dataService.getMoodHistory: Successfully retrieved ${moodHistory.length} items.`);
    return moodHistory; // Already sorted newest to oldest due to unshift in storeMoodAnalysis

  } catch (error) {
    // Catch-all for any unexpected errors during the process (e.g., initial AsyncStorage.getItem for index)
    console.error('dataService.getMoodHistory: An unexpected error occurred.', error);
    return [];
  }
};

/**
 * Clears all stored mood analysis history, including the index and individual items.
 *
 * @returns {Promise<void>}
 */
const clearAllMoodHistory = async () => {
  try {
    const indexJson = await AsyncStorage.getItem(MOOD_ANALYSIS_INDEX_KEY);
    if (indexJson !== null) {
      let idArray = [];
      try {
        idArray = JSON.parse(indexJson);
        if (Array.isArray(idArray)) {
          for (const id of idArray) {
            try {
              await AsyncStorage.removeItem(MOOD_ANALYSIS_PREFIX_KEY + id);
            } catch (itemRemoveError) {
              console.error(`dataService.clearAllMoodHistory: Error removing item with ID ${id}.`, itemRemoveError);
              // Continue trying to remove other items
            }
          }
          console.log(`dataService.clearAllMoodHistory: Attempted to remove ${idArray.length} individual mood items.`);
        } else {
          console.warn('dataService.clearAllMoodHistory: Mood history index was corrupted (not an array), cannot remove individual items based on it.');
        }
      } catch (parseError) {
        console.error('dataService.clearAllMoodHistory: Failed to parse mood history index. Individual items might not be removed.', parseError);
        // Proceed to remove the index itself if parsing failed
      }
    } else {
      console.log('dataService.clearAllMoodHistory: No mood history index found to clear.');
      // No items to remove based on index, but still try to remove the index key itself in case it's an empty/corrupt string
    }

    // Remove the index itself
    await AsyncStorage.removeItem(MOOD_ANALYSIS_INDEX_KEY);
    console.log('dataService.clearAllMoodHistory: Successfully removed mood analysis index key.');
    console.log('dataService.clearAllMoodHistory: All mood history cleared (or attempted to clear).');

  } catch (error) {
    console.error('dataService.clearAllMoodHistory: An error occurred during clearing history.', error);
  }
};

export {getMockDailyData, storeMoodAnalysis, getMoodHistory, clearAllMoodHistory};
