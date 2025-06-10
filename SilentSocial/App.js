import React from 'react';
import {StatusBar, useColorScheme, StyleSheet} from 'react-native'; // SafeAreaView might not be needed here if NavigationContainer handles it
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  // backgroundStyle might not be directly applied to NavigationContainer,
  // but can be used for screen options or individual screen styling if needed.
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <NavigationContainer>
      {/* StatusBar can be managed here or per screen */}
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor} // You might need to adjust how status bar bg is set with react-navigation
      />
      <Tab.Navigator
        screenOptions={{
          // headerShown: false, // Example: if you want to hide header for all tabs
          tabBarStyle: {backgroundColor: isDarkMode ? Colors.black : Colors.white}, // Basic tab bar styling
          tabBarActiveTintColor: isDarkMode ? Colors.white : Colors.blue,
          tabBarInactiveTintColor: isDarkMode ? Colors.gray : Colors.darkGray,
        }}>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Styles might be less relevant here or moved to screen-specific styling
// const styles = StyleSheet.create({
//   mainTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginTop: 20,
//     marginBottom: 20,
//   },
// });

export default App;
