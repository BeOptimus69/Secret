import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import authService from '../services/authService'; // For user context if needed, though not directly used for data fetching here
import aiService from '../services/aiService';
import dataService from '../services/dataService';

const DashboardScreen = ({ navigation }) => {
  const [currentMoodAnalysis, setCurrentMoodAnalysis] = useState(null); // Stores result of a new analysis
  const [moodHistory, setMoodHistory] = useState([]);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState('');

  // Pagination state for mood history
  const [historyPage, setHistoryPage] = useState(1);
  const [totalHistoryPages, setTotalHistoryPages] = useState(1);
  const HISTORY_LIMIT = 7; // Items per page

  const fetchMoodHistory = useCallback(async (page = 1) => {
    setIsLoadingHistory(true);
    setError(''); // Clear previous errors specific to history loading
    try {
      const response = await dataService.getMoodHistory(HISTORY_LIMIT, page);
      if (response.success && response.data) {
        // If page is 1, replace history, else append
        setMoodHistory(prevHistory => page === 1 ? response.data : [...prevHistory, ...response.data]);
        setHistoryPage(page);
        if (response.pagination) {
          setTotalHistoryPages(response.pagination.totalPages || 1);
        }
      } else {
        setError(response.message || 'Failed to fetch mood history.');
        // Alert.alert('Error', response.message || 'Failed to fetch mood history.');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching history.');
      // Alert.alert('Error', 'An unexpected error occurred while fetching history.');
      console.error('Fetch mood history error:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchMoodHistory(1); // Fetch initial page of history on mount
  }, [fetchMoodHistory]);

  const handleAnalyzeTodaysMood = async () => {
    setIsLoadingAnalysis(true);
    setError('');
    setCurrentMoodAnalysis(null);
    try {
      // 1. Get data to analyze (mocked for now, later from sensors)
      const dataToAnalyze = dataService.getMockDailyData();
      // Ensure dataToAnalyze includes a date, primaryMood, etc. as expected by backend via dataService.storeMoodAnalysis
      // The `aiService` will now pass this to `dataService.storeMoodAnalysis` which syncs to backend.
      const response = await aiService.analyzeMoodFromData(dataToAnalyze);

      if (response.success && response.data) {
        // response.data here is the data confirmed by the backend after sync.
        setCurrentMoodAnalysis(response.data);
        // Alert.alert('Analysis Synced', 'Your mood data has been synced with the server.');
        // Refresh history to include the new entry
        fetchMoodHistory(1); // Reset to page 1 to see the latest
      } else {
        setError(response.message || 'Failed to analyze and sync mood data.');
        Alert.alert('Error', response.message || 'Failed to analyze and sync mood data.');
      }
    } catch (err) {
      setError('An unexpected error occurred during mood analysis.');
      Alert.alert('Error', 'An unexpected error occurred during mood analysis.');
      console.error('Handle analyze mood error:', err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleClearHistory = async () => {
    // This now only clears local cache, which might not be relevant if backend is source of truth
    // For a real "clear server history", a backend endpoint would be needed.
    Alert.alert(
      "Confirm Clear",
      "This will clear only the locally cached history (if any). Server history will remain. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: async () => {
            setIsLoadingHistory(true); // Indicate activity
            const response = await dataService.clearAllMoodHistory(); // Clears local
            if(response.success) {
              setMoodHistory([]); // Clear displayed history
              setCurrentMoodAnalysis(null); // Clear current analysis display
              setHistoryPage(1);
              setTotalHistoryPages(1);
              Alert.alert('Local Cache Cleared', 'Locally cached mood history has been cleared.');
            } else {
              Alert.alert('Error', response.message || 'Failed to clear local cache.');
            }
            setIsLoadingHistory(false);
          }
        }
      ]
    );
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyDate}>
        {new Date(item.date || item.id).toLocaleDateString()} {new Date(item.date || item.id).toLocaleTimeString()}
      </Text>
      <Text>Mood: {item.primaryMood}</Text>
      {item.summary ? <Text>Summary: {item.summary}</Text> : null}
      {item.shareablePost ? <Text>Post: {item.shareablePost}</Text> : null}
      {/* Display other fields from item (e.g. item.aiGenerated.insights) as needed */}
    </View>
  );

  const loadMoreHistory = () => {
    if (historyPage < totalHistoryPages && !isLoadingHistory) {
      fetchMoodHistory(historyPage + 1);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={isLoadingAnalysis ? "Analyzing & Syncing..." : "Analyze & Sync Today's Mood"}
          onPress={handleAnalyzeTodaysMood}
          disabled={isLoadingAnalysis || isLoadingHistory}
        />

        {isLoadingAnalysis && <ActivityIndicator style={styles.inlineLoader} size="small" color="#0000ff" />}

        {currentMoodAnalysis && (
          <View style={styles.currentAnalysisSection}>
            <Text style={styles.sectionTitle}>Last Synced Analysis ({new Date(currentMoodAnalysis.date).toLocaleDateString()}):</Text>
            <Text>Mood: {currentMoodAnalysis.primaryMood}</Text>
            {currentMoodAnalysis.summary && <Text>Summary: {currentMoodAnalysis.summary}</Text>}
            {/* Display more from currentMoodAnalysis as desired */}
          </View>
        )}

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Mood History (from Server)</Text>
          {isLoadingHistory && historyPage === 1 && <ActivityIndicator style={styles.fullPageLoader} size="large" color="#0000ff" />}
          <FlatList
            data={moodHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item._id || item.id} // Use _id from MongoDB if available
            ListEmptyComponent={!isLoadingHistory ? <Text style={styles.emptyHistoryText}>No mood history found.</Text> : null}
            onEndReached={loadMoreHistory}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isLoadingHistory && historyPage > 1 ? <ActivityIndicator style={styles.inlineLoader} size="small" /> : null}
            // To prevent ScrollView vs FlatList issues, FlatList shouldn't be nested in a ScrollView
            // with the same orientation unless the ScrollView is explicitly non-scrollable or FlatList has fixed height.
            // For now, assuming content won't be excessive or will be managed.
            // A better approach for very long lists is to remove the outer ScrollView if FlatList handles all scrolling.
          />
        </View>
         <View style={styles.clearButtonContainer}>
          <Button title="Clear Local History Cache" onPress={handleClearHistory} color="red" disabled={isLoadingAnalysis || isLoadingHistory} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light background for the scrollable area
  },
  container: {
    flex: 1, // Ensure container tries to fill ScrollView, useful if ScrollView has minHeight or similar
    padding: 15, // Slightly reduced padding
  },
  title: {
    fontSize: 26, // Slightly larger title
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333', // Darker text for better contrast
  },
  sectionTitle: {
    fontSize: 20, // Consistent section title size
    fontWeight: '600', // Semi-bold
    marginTop: 20,
    marginBottom: 10,
    color: '#444',
  },
  currentAnalysisSection: {
    padding: 15,
    marginVertical:10,
    backgroundColor: '#ffffff', // White background for cards
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0', // Light border
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  historySection: {
    marginTop: 15, // Adjusted margin
    marginBottom: 20, // Added margin at the bottom
  },
  historyItem: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e7e7', // Lighter separator
    borderRadius: 6,
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 13,
    color: '#555', // Darker gray for date
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14, // Slightly smaller error text
  },
  inlineLoader: {
    marginVertical: 10,
  },
  fullPageLoader: { // For initial history load
    marginVertical: 30,
  },
  emptyHistoryText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
  clearButtonContainer: {
    marginTop: 10, // Add some space before the clear button
  }
});

export default DashboardScreen;
