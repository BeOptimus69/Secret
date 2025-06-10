import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import authService from '../services/authService';
// Assuming navigation prop from React Navigation

const RegisterScreen = ({ navigation, onRegisterSuccess }) => { // Add onRegisterSuccess to props
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.register(username, email, password);
      setIsLoading(false);
      if (response.success) {
        // Alert.alert('Registration Success', 'Welcome!'); // Optional
        onRegisterSuccess(); // Call the callback
      } else {
        setError(response.message || 'Registration failed. Please try again.');
        Alert.alert('Registration Failed', response.message || 'Please try again.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected error occurred. Please try again.');
      Alert.alert('Registration Error', 'An unexpected error occurred. Please try again.');
      console.error('Register screen error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
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
        placeholder="Password (min. 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isLoading ? "Registering..." : "Register"} onPress={handleRegister} disabled={isLoading} />
      <View style={styles.switchScreenContainer}>
        <Text>Already have an account?</Text>
        <Button
          title="Login here"
          onPress={() => navigation.navigate('Login')} // Assuming 'Login' is a route name
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

export default RegisterScreen;
