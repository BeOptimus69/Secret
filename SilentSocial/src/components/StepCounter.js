import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {accelerometer, setUpdateIntervalForType, SensorTypes} from 'react-native-sensors';
import {map, filter} from 'rxjs/operators';

// Set update interval for accelerometer data (optional, defaults to 100ms)
// setUpdateIntervalForType(SensorTypes.accelerometer, 200); // 200ms

const StepCounter = () => {
  const [accelerometerData, setAccelerometerData] = useState({x: 0, y: 0, z: 0});
  const [error, setError] = useState(null);

  useEffect(() => {
    const subscription = accelerometer
      .pipe(
        // Optional: You can add operators here, e.g., to detect steps
        // For now, just map to the x, y, z values
        map(({x, y, z}) => ({x, y, z})),
      )
      .subscribe(
        data => {
          setAccelerometerData(data);
          setError(null); // Clear previous errors if data is received
        },
        err => {
          console.error('Accelerometer sensor error:', err);
          setError('Accelerometer sensor is not available or permission denied.');
          // Potentially check err.message or err.code for more specific error handling
        },
      );

    // Unsubscribe when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step Counter (Accelerometer)</Text>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>X: {accelerometerData.x.toFixed(2)}</Text>
          <Text style={styles.dataText}>Y: {accelerometerData.y.toFixed(2)}</Text>
          <Text style={styles.dataText}>Z: {accelerometerData.z.toFixed(2)}</Text>
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
  dataContainer: {
    alignItems: 'flex-start', // Align text to the left
  },
  dataText: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    fontStyle: 'italic',
  },
});

export default StepCounter;
