import apiService from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_TOKEN_KEY = 'userToken';
const USER_DATA_KEY = 'userData';

const login = async (email, password) => {
  try {
    const response = await apiService.post('/auth/login', { email, password });
    if (response.success && response.data.token) {
      await AsyncStorage.setItem(USER_TOKEN_KEY, response.data.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data)); // Store all user data returned
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.message || 'Login failed' };
    }
  } catch (error) {
    // This catch might be redundant if apiService's handleError already formats it
    console.error('Login service error:', error);
    return { success: false, message: error.message || 'An unexpected error occurred during login.' };
  }
};

const register = async (username, email, password) => {
  try {
    const response = await apiService.post('/auth/register', { username, email, password });
    if (response.success && response.data.token) {
      await AsyncStorage.setItem(USER_TOKEN_KEY, response.data.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data));
      return { success: true, data: response.data };
    } else {
      return { success: false, message: response.message || 'Registration failed' };
    }
  } catch (error) {
    console.error('Register service error:', error);
    return { success: false, message: error.message || 'An unexpected error occurred during registration.' };
  }
};

const logout = async () => {
  try {
    await AsyncStorage.removeItem(USER_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
    // Optionally, notify backend to invalidate token if such an endpoint exists
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Logout failed.' };
  }
};

const getToken = async () => {
  try {
    return await AsyncStorage.getItem(USER_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const getCurrentUser = async () => {
  try {
    const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Function to check if user is authenticated (e.g., for initial navigation logic)
const isAuthenticated = async () => {
  const token = await getToken();
  return !!token; // Returns true if token exists, false otherwise
};

export default {
  login,
  register,
  logout,
  getToken,
  getCurrentUser,
  isAuthenticated,
};
