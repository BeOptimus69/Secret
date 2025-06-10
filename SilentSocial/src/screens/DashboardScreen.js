import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, Button, StyleSheet, ActivityIndicator, FlatList, ScrollView} from 'react-native';
import {analyzeMoodFromData} from '../services/aiService';
import {getMockDailyData, storeMoodAnalysis, getMoodHistory, clearAllMoodHistory} from '../services/dataService';

const DashboardScreen = () => {
  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchMoodHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const history = await getMoodHistory(); // Default limit is 7
      setMoodHistory(history);
    } catch (err) {
      console.error("DashboardScreen: Failed to fetch mood history", err);
      setError("Failed to load mood history."); // Optionally display this error
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoodHistory();
  }, [fetchMoodHistory]);

  const handleAnalyzeMood = async () => {
    setIsLoading(true);
    setError('');
    setMoodAnalysis(null);

    const dailyData = getMockDailyData();

    try {
      const result = await analyzeMoodFromData(dailyData);
      setMoodAnalysis(result);
      await storeMoodAnalysis(result); // Ensure this is awaited
      fetchMoodHistory(); // Refresh history
    } catch (err) {
      setError(err.message || 'Failed to analyze mood.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    setIsLoading(true); // Use main loading indicator for simplicity
    try {
      await clearAllMoodHistory();
      fetchMoodHistory(); // Refresh history
    } catch (err) {
      console.error("DashboardScreen: Failed to clear history", err);
      setError("Failed to clear mood history.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderHistoryItem = ({item}) => (
    <View style={styles.historyItemContainer}>
      <Text style={styles.historyItemDate}>
        {item.date ? (new Date(item.date).toLocaleDateString() + ' ' + new Date(item.date).toLocaleTimeString()) : `ID: ${item.id}`}
      </Text>
      <Text style={styles.historyItemMood}>Primary Mood: {item.primaryMood}</Text>
      <Text style={styles.historyItemSummary}>Summary: {item.summary}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Daily Mood Dashboard</Text>

        <View style={styles.buttonContainer}>
          <Button title="Analyze Today's Mood" onPress={handleAnalyzeMood} disabled={isLoading} />
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Analyzing mood...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {moodAnalysis && !isLoading && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Current Mood Analysis:</Text>
            <Text style={styles.resultText}>Primary Mood: {moodAnalysis.primaryMood}</Text>
            <Text style={styles.resultText}>Summary: {moodAnalysis.summary}</Text>
            <Text style={styles.resultText}>Shareable Post: "{moodAnalysis.shareablePost}"</Text>
            {moodAnalysis.insights && moodAnalysis.insights.length > 0 && (
              <View style={styles.insightsContainer}>
                <Text style={styles.insightsTitle}>Insights:</Text>
                {moodAnalysis.insights.map((insight, index) => (
                  <Text key={index} style={styles.insightText}>- {insight}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.historySectionContainer}>
          <Text style={styles.historyTitle}>Mood History</Text>
          {isHistoryLoading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : moodHistory.length === 0 ? (
            <Text style={styles.noHistoryText}>No mood history yet.</Text>
          ) : (
            <FlatList
              data={moodHistory}
              renderItem={renderHistoryItem}
              keyExtractor={item => item.id}
              style={styles.historyList}
              // Nested FlatLists/ScrollViews can be tricky. Ensure parent ScrollView is set up.
              // If performance issues, consider fixed height for FlatList or other optimizations.
            />
          )}
           <View style={styles.clearButtonContainer}>
            <Button title="Clear All History" onPress={handleClearHistory} disabled={isLoading} color="red" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  container: {
    flex: 1, // This flex might not be strictly needed if ScrollView is the top container for actual content display
    padding: 20,
    alignItems: 'center',
    // backgroundColor: '#f7f7f7', // Moved to ScrollView
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 10, // Reduced margin
  },
  clearButtonContainer: {
    width: '80%',
    marginTop: 15,
    marginBottom: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    fontSize: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 10, // Reduced margin
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: '95%', // Adjusted width
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495e',
    lineHeight: 22,
  },
  insightsContainer: {
    marginTop: 10,
    paddingLeft: 10,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#2980b9',
  },
  insightText: {
    fontSize: 14,
    marginBottom: 3,
    color: '#3498db',
  },
  historySectionContainer: {
    marginTop: 20,
    width: '95%',
    alignItems: 'center', // Center title and FlatList content if needed
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noHistoryText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#777',
    marginTop: 10,
  },
  historyList: {
    width: '100%', // Ensure FlatList takes available width
  },
  historyItemContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 6,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1.0,
    elevation: 1,
  },
  historyItemDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  historyItemMood: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 3,
  },
  historyItemSummary: {
    fontSize: 13,
    color: '#555',
  }
});

export default DashboardScreen;
