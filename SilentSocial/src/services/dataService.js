/**
 * dataService.js
 *
 * This service is responsible for fetching, aggregating, and storing user data.
 * For now, it provides mock data and simple storage logging.
 */

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
    // For now, locationPatterns, appUsage can be simplified or hardcoded
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

  console.log('dataService.getMockDailyData generated:', mockData);
  return mockData;
};

/**
 * Stores the mood analysis result.
 * Currently, this function only logs the data to the console.
 * Future enhancements will include persisting this data locally using AsyncStorage
 * or a similar local storage mechanism.
 *
 * @param {object} moodData - The mood analysis object received from aiService.js.
 */
const storeMoodAnalysis = (moodData) => {
  if (!moodData) {
    console.warn('dataService.storeMoodAnalysis: Received null or undefined moodData. Skipping storage.');
    return;
  }
  // TODO: Enhance this to store data persistently (e.g., using AsyncStorage)
  // This would involve serializing the moodData (e.g., JSON.stringify) and
  // storing it under a specific key, perhaps timestamped for historical tracking.
  console.log('dataService.storeMoodAnalysis: Storing mood analysis:', moodData);
};

export {getMockDailyData, storeMoodAnalysis};
