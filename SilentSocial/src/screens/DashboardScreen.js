import React, {useState} from 'react';
import {View, Text, Button, StyleSheet, ActivityIndicator} from 'react-native';
import {analyzeMoodFromData} from '../services/aiService';
import {getMockDailyData, storeMoodAnalysis} from '../services/dataService';

const DashboardScreen = () => {
  const [moodAnalysis, setMoodAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeMood = async () => {
    setIsLoading(true);
    setError('');
    setMoodAnalysis(null);

    // Get mock daily data from dataService
    const dailyData = getMockDailyData();

    try {
      const result = await analyzeMoodFromData(dailyData);
      setMoodAnalysis(result);
      // Store the analysis result
      storeMoodAnalysis(result);
    } catch (err) {
      setError(err.message || 'Failed to analyze mood.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          <Text style={styles.resultsTitle}>Mood Analysis:</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 20,
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
  },
  resultsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: '90%',
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
    fontWeight: '600', // semi-bold
    marginBottom: 5,
    color: '#2980b9',
  },
  insightText: {
    fontSize: 14,
    marginBottom: 3,
    color: '#3498db',
  },
});

export default DashboardScreen;
