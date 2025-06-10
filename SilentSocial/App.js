import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import AddFriendsScreen from './src/screens/AddFriendsScreen';
import FriendRequestsScreen from './src/screens/FriendRequestsScreen';
import SocialFeedScreen from './src/screens/SocialFeedScreen'; // New import

import authService from './src/services/authService';

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();
const FriendsStackNav = createNativeStackNavigator();

const SettingsScreen = ({ onLogout }) => (
  <View style={styles.centeredScreen}>
    <Text>Settings Screen</Text>
    <Button title="Logout" onPress={onLogout} />
  </View>
);

function FriendsStackNavigator() {
  return (
    <FriendsStackNav.Navigator>
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
            // Example: Add common header styling for tabs if not using headerShown: false
            // headerStyle: { backgroundColor: '#1e90ff' },
            // headerTintColor: '#fff',
          }}
        >
          <Tab.Screen
            name="Feed"
            component={SocialFeedScreen}
            options={{
              title: 'Feed',
              // tabBarIcon: ({ color, size }) => ( /* Placeholder for Icon */ ),
            }}
          />
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen
            name="FriendsTab"
            component={FriendsStackNavigator}
            options={{
              title: 'Friends',
              headerShown: false, // Let the stack navigator handle its own header
              // tabBarIcon: ({ color, size }) => ( /* Placeholder for Icon */ ),
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

const styles = StyleSheet.create({
  centeredScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default App;
