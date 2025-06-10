import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native'; // StyleSheet might be needed if not already there
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // For Auth flow

import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
// SettingsScreen is defined inline or imported
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FriendsScreen from './src/screens/FriendsScreen'; // New
import AddFriendsScreen from './src/screens/AddFriendsScreen'; // New
import FriendRequestsScreen from './src/screens/FriendRequestsScreen'; // New

import authService from './src/services/authService';

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator(); // For Auth flow
const FriendsStackNav = createNativeStackNavigator(); // New Stack for Friends Tab

// SettingsScreen (can be kept inline or moved to its own file)
const SettingsScreen = ({ onLogout }) => ( // Pass onLogout callback
  <View style={styles.centeredScreen}>
    <Text>Settings Screen</Text>
    <Button title="Logout" onPress={onLogout} />
  </View>
);

// Friends Stack Navigator
function FriendsStackNavigator() {
  return (
    <FriendsStackNav.Navigator
      screenOptions={{
        // Common header styling for the Friends stack can go here
        // headerStyle: { backgroundColor: '#f4511e' },
        // headerTintColor: '#fff',
        // headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <FriendsStackNav.Screen
        name="FriendsList"
        component={FriendsScreen}
        options={{ title: 'My Friends' }}
      />
      <FriendsStackNav.Screen
        name="AddFriends"
        component={AddFriendsScreen}
        options={{ title: 'Add Friends' }}
      />
      <FriendsStackNav.Screen
        name="FriendRequests"
        component={FriendRequestsScreen}
        options={{ title: 'Friend Requests' }}
      />
    </FriendsStackNav.Navigator>
  );
}

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleRegisterSuccess = () => setIsAuthenticated(true);
  const handleLogout = async () => {
    setIsLoading(true);
    await authService.logout();
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#1e90ff',
            tabBarInactiveTintColor: 'gray',
            // headerShown: false, // Use this if each stack/screen manages its own header
          }}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen
            name="FriendsTab" // Changed name to avoid conflict with screen name 'Friends'
            component={FriendsStackNavigator}
            options={{
              title: 'Friends', // Title for the tab
              headerShown: false // Important: Hide Tab Nav header, let Stack Nav handle it
            }}
          />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="Settings">
            {props => <SettingsScreen {...props} onLogout={handleLogout} />}
          </Tab.Screen>
        </Tab.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login">
            {props => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
          </AuthStack.Screen>
          <AuthStack.Screen name="Register">
            {props => <RegisterScreen {...props} onRegisterSuccess={handleRegisterSuccess} />}
          </AuthStack.Screen>
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({ // Added StyleSheet for consistency
  centeredScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default App;
