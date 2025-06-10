import React from 'react';
import {SafeAreaView, StatusBar, Text, useColorScheme, StyleSheet, ScrollView} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import ScreenTimeTracker from './src/components/ScreenTimeTracker';
import StepCounter from './src/components/StepCounter';
import LocationTracker from './src/components/LocationTracker';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Text style={[styles.mainTitle, {color: isDarkMode ? Colors.lighter : Colors.darker}]}>
          Hello World from SilentSocial!
        </Text>
        <ScreenTimeTracker />
        <StepCounter />
        <LocationTracker />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default App;
