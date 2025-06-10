import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Or your preferred storage

// Define the base URL for your backend
// Ensure this is correct for your local development environment (Android emulator/iOS simulator)
// For Android Emulator, localhost of the machine is usually 10.0.2.2
// For iOS Simulator, localhost generally works.
// Consider making this configurable (e.g., via an environment file later)
const API_BASE_URL = 'http://10.0.2.2:5002/api'; // Example for Android Emulator if server on same machine

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  async (config) => {
    // Retrieve token from storage (this assumes you store it with key 'userToken')
    // This key should match what you use in authService.js
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle API errors consistently
const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', error.response.data);
    return {
      success: false,
      status: error.response.status,
      message: error.response.data.message || 'An error occurred',
      data: error.response.data,
    };
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error Request:', error.request);
    return {
      success: false,
      message: 'No response from server. Check network connection or server status.',
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error Message:', error.message);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred.',
    };
  }
};

const get = async (url, params = {}) => {
  try {
    const response = await apiClient.get(url, { params });
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const post = async (url, data) => {
  try {
    const response = await apiClient.post(url, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const put = async (url, data) => {
  try {
    const response = await apiClient.put(url, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

const del = async (url) => { // 'delete' is a reserved keyword
  try {
    const response = await apiClient.delete(url);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

export default {
  get,
  post,
  put,
  delete: del,
  API_BASE_URL, // Export for reference if needed elsewhere
};
