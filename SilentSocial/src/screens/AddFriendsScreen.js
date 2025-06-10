import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import friendService from '../services/friendService';

const AddFriendsScreen = ({ navigation }) => {
  const [recipientInput, setRecipientInput] = useState(''); // Could be ID, email, or username
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(''); // For success/error messages

  const handleSendRequest = async () => {
    if (!recipientInput.trim()) {
      setMessage('Please enter a user identifier (e.g., ID, email, or username).');
      Alert.alert('Input Required', 'Please enter a user identifier.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // For now, we assume recipientInput is the ObjectId of the target user,
      // as per current friendService.sendFriendRequest expectation.
      // A real app would need a backend search to resolve username/email to ID first.
      const response = await friendService.sendFriendRequest(recipientInput.trim());

      if (response.success) {
        setMessage(`Friend request sent to ${recipientInput}!`);
        Alert.alert('Success', `Friend request sent to ${recipientInput}!`);
        setRecipientInput(''); // Clear input on success
      } else {
        setMessage(response.message || 'Failed to send friend request.');
        Alert.alert('Error', response.message || 'Failed to send friend request.');
      }
    } catch (err) {
      setMessage('An unexpected error occurred. Please try again.');
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Add friends screen error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Friend</Text>
      <Text style={styles.instructions}>
        Enter the User ID of the person you want to add.
        (Note: In a future version, you'll be able to search by username or email.)
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter User ID" // Updated placeholder
        value={recipientInput}
        onChangeText={setRecipientInput}
        autoCapitalize="none"
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <Button title="Send Friend Request" onPress={handleSendRequest} />
      )}

      {message ? (
        <Text style={[styles.messageText, message.startsWith('Success') || message.startsWith('Friend request sent') ? styles.successText : styles.errorText]}>
          {message}
        </Text>
      ) : null}

      <View style={styles.backButtonContainer}>
        <Button title="Back to Friends" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // justifyContent: 'center', // Can make it feel a bit cramped with instructions
    backgroundColor: '#f8f8f8', // Consistent background
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 20,
    color: 'gray',
    fontSize: 14,
  },
  input: {
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  loader: {
    marginVertical: 15,
  },
  messageText: {
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 16,
  },
  successText: {
    color: 'green',
  },
  errorText: {
    color: 'red',
  },
  backButtonContainer: { // Added for better spacing of back button
    marginTop: 20,
  }
});

export default AddFriendsScreen;
