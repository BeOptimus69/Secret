import React, {useState} from 'react';
import {View, Text, Button, StyleSheet, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const LocationTracker = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'SilentSocial App needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          setPermissionGranted(true);
          return true;
        } else {
          console.log('Location permission denied');
          setError('Location permission denied.');
          setPermissionGranted(false);
          return false;
        }
      } catch (err) {
        console.warn(err);
        setError(`Permission request error: ${err.message}`);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      // For iOS, permission is typically requested when getCurrentPosition is called the first time.
      // Or use a library like react-native-permissions for more granular control.
      // For this basic component, we'll assume permission will be handled by Geolocation.getCurrentPosition.
      setPermissionGranted(true); // Assume granted for now, Geolocation will handle actual request.
      return true;
    }
    return false; // Default for other platforms
  };

  const getCurrentLocation = async () => {
    setError(null); // Clear previous errors
    setLocation(null); // Clear previous location

    if (!permissionGranted) {
      const granted = await requestLocationPermission();
      if (!granted) {
        return; // Don't proceed if permission not granted
      }
    }

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude, accuracy} = position.coords;
        setLocation({latitude, longitude, accuracy});
        setError(null);
      },
      err => {
        console.error('Error getting location:', err);
        setError(`Error: ${err.message} (Code: ${err.code})`);
        setLocation(null);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // Attempt to request permission on component mount (optional)
  // useEffect(() => {
  //   requestLocationPermission();
  // }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Tracker</Text>
      {!permissionGranted && Platform.OS === 'android' && (
        <Button title="Request Location Permission" onPress={requestLocationPermission} />
      )}
      <Button title="Get Current Location" onPress={getCurrentLocation} />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {location && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>Latitude: {location.latitude.toFixed(5)}</Text>
          <Text style={styles.dataText}>Longitude: {location.longitude.toFixed(5)}</Text>
          <Text style={styles.dataText}>Accuracy: {location.accuracy.toFixed(2)} meters</Text>
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
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    alignItems: 'flex-start',
  },
  dataText: {
    fontSize: 14,
    marginBottom: 3,
  },
  errorText: {
    marginVertical: 10,
    fontSize: 14,
    color: 'red',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default LocationTracker;
