import React, {useState} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_DATA_KEY = 'mockScreenTimeData';

const ScreenTimeTracker = () => {
  const [loadedData, setLoadedData] = useState(null);
  const [status, setStatus] = useState('');

  const saveMockData = async () => {
    try {
      const mockData = {appName: 'TestApp', usage: 60}; // 60 minutes
      await AsyncStorage.setItem(MOCK_DATA_KEY, JSON.stringify(mockData));
      setStatus('Mock data saved successfully!');
      setLoadedData(null); // Clear previously loaded data
    } catch (error) {
      setStatus(`Error saving data: ${error.message}`);
    }
  };

  const loadMockData = async () => {
    try {
      const dataString = await AsyncStorage.getItem(MOCK_DATA_KEY);
      if (dataString !== null) {
        const data = JSON.parse(dataString);
        setLoadedData(data);
        setStatus('Data loaded successfully!');
      } else {
        setLoadedData(null);
        setStatus('No data found.');
      }
    } catch (error) {
      setLoadedData(null);
      setStatus(`Error loading data: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screen Time Tracker</Text>
      <View style={styles.buttonContainer}>
        <Button title="Save Mock Data" onPress={saveMockData} />
        <Button title="Load Mock Data" onPress={loadMockData} />
      </View>
      <Text style={styles.statusText}>{status}</Text>
      {loadedData && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>App Name: {loadedData.appName}</Text>
          <Text style={styles.dataText}>Usage (minutes): {loadedData.usage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  statusText: {
    marginVertical: 10,
    fontStyle: 'italic',
  },
  dataContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  dataText: {
    fontSize: 14,
  },
});

export default ScreenTimeTracker;
