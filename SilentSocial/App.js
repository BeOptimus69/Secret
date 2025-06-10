import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native'; // Added Button for Logout
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // For Auth flow

import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen'; // Assuming this exists
// import SettingsScreen from './src/screens/SettingsScreen'; // Will be redefined
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

import authService from './src/services/authService';
import { ActivityIndicator } from 'react-native'; // For loading state

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Define SettingsScreen here or import if it's complex
const SettingsScreen = ({ onLogout }) => ( // Pass onLogout callback
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Settings Screen</Text>
    <Button title="Logout" onPress={onLogout} />
  </View>
);


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // To check initial auth state

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authStatus = await authService.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (e) {
        console.error("Error checking auth status:", e);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();

    // Optional: Listener for auth changes if authService emits events
    // This is a simplified way; a context or global state manager (Redux, Zustand) is better for complex apps
    // For this example, we'll rely on re-rendering triggered by successful login/logout
    // causing a re-evaluation of isAuthenticated state (e.g. by restarting the app or a manual state update)
    // A more robust solution would involve a global state/context that authService updates.
    // For now, successful login/register in their respective screens should trigger a state update
    // that causes App.js to re-evaluate. We will simulate this by making onLoginSuccess/onRegisterSuccess
    // in LoginScreen/RegisterScreen update a global state or call a function passed down from App.js
    // that sets setIsAuthenticated(true).
    // Let's simplify: Login/Register screens will now call a passed down function.

  }, []); // Check only on mount initially

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await authService.logout();
    setIsAuthenticated(false);
    setIsLoading(false);
  };


  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarActiveTintColor: '#1e90ff',
            tabBarInactiveTintColor: 'gray',
            // Example: using a function for tabBarIcon
            // tabBarIcon: ({ focused, color, size }) => {
            //   let iconName;
            //   if (route.name === 'Dashboard') iconName = focused ? 'ios-information-circle' : 'ios-information-circle-outline';
            //   else if (route.name === 'Profile') iconName = focused ? 'ios-person' : 'ios-person-outline';
            //   else if (route.name === 'Settings') iconName = focused ? 'ios-settings' : 'ios-settings-outline';
            //   return <Ionicons name={iconName} size={size} color={color} />; // Assuming Ionicons
            // },
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="Settings">
            {props => <SettingsScreen {...props} onLogout={handleLogout} />}
          </Tab.Screen>
        </Tab.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {props => <RegisterScreen {...props} onRegisterSuccess={handleRegisterSuccess} />}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;
