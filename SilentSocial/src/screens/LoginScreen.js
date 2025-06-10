import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import authService from '../services/authService';
// You'll need to set up navigation properly. For now, let's assume a function
// prop `onLoginSuccess` is passed, and another `onNavigateToRegister`
// In a real app, you'd use @react-navigation/native.

const LoginScreen = ({ navigation, onLoginSuccess }) => { // Add onLoginSuccess to props
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.login(email, password);
      setIsLoading(false);
      if (response.success) {
        // Alert.alert('Login Success', 'Welcome back!'); // Optional: for quick feedback
        if (navigation.replace && typeof navigation.replace === 'function') {
          // Replace the auth stack with the main app, common pattern
          // This depends on your navigator structure in App.js
          // For now, we call the callback to update App.js state
        }
        onLoginSuccess(); // Call the callback
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
        Alert.alert('Login Failed', response.message || 'Please check your credentials.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected error occurred. Please try again.');
      Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
      console.error('Login screen error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isLoading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={isLoading} />
      <View style={styles.switchScreenContainer}>
        <Text>Don't have an account?</Text>
        <Button
          title="Register here"
          onPress={() => navigation.navigate('Register')} // Assuming 'Register' is a route name
          disabled={isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  switchScreenContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  }
});

export default LoginScreen;
