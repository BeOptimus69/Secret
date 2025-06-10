import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import friendService from '../services/friendService';
import FriendRequestCard from '../components/FriendRequestCard'; // For incoming requests

const FriendRequestsScreen = ({ navigation }) => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async () => {
    if(!isRefreshing) setIsLoading(true); // Only show full loader on initial load
    setError('');
    try {
      const response = await friendService.listPendingRequests();
      if (response.success && response.data) {
        setIncomingRequests(response.data.incoming || []);
        setOutgoingRequests(response.data.outgoing || []);
      } else {
        setError(response.message || 'Failed to load friend requests.');
        // Alert.alert('Error', response.message || 'Failed to load friend requests.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      // Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Friend requests screen fetch error:', err);
    } finally {
      if(!isRefreshing) setIsLoading(false);
    }
  }, [isRefreshing]); // isRefreshing added to dependencies

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchRequests();
    setIsRefreshing(false);
  }, [fetchRequests]);

  const handleAcceptRequest = async (requestId) => {
    setIsLoading(true); // Indicate loading for action
    const response = await friendService.acceptFriendRequest(requestId);
    if (response.success) {
      Alert.alert('Success', 'Friend request accepted!');
      fetchRequests(); // Refresh list
    } else {
      Alert.alert('Error', response.message || 'Failed to accept friend request.');
      setIsLoading(false); // Stop loading on error
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setIsLoading(true); // Indicate loading for action
    const response = await friendService.declineOrCancelFriendRequest(requestId);
    if (response.success) {
      Alert.alert('Success', 'Friend request declined.');
      fetchRequests(); // Refresh list
    } else {
      Alert.alert('Error', response.message || 'Failed to decline friend request.');
      setIsLoading(false); // Stop loading on error
    }
  };

  const handleCancelOutgoingRequest = async (requestId) => {
    setIsLoading(true); // Indicate loading for action
    const response = await friendService.declineOrCancelFriendRequest(requestId);
    if (response.success) {
      Alert.alert('Success', 'Friend request cancelled.');
      fetchRequests(); // Refresh list
    } else {
      Alert.alert('Error', response.message || 'Failed to cancel friend request.');
      setIsLoading(false); // Stop loading on error
    }
  };

  const renderOutgoingRequestItem = ({ item }) => (
    <View style={styles.outgoingRequestItem}>
      <Text style={styles.requestItemText}>Request sent to <Text style={styles.username}>{item.recipient.username}</Text></Text>
      <Button title="Cancel" onPress={() => handleCancelOutgoingRequest(item._id)} color="orange" />
    </View>
  );

  if (isLoading && !isRefreshing && incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading requests...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#007bff"]} tintColor={"#007bff"}/>}
    >
      <Text style={styles.title}>Friend Requests</Text>
      {error && !isRefreshing && !isLoading ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.sectionTitle}>Incoming Requests ({incomingRequests.length})</Text>
      {incomingRequests.length === 0 && !isLoading && !isRefreshing ? (
        <Text style={styles.emptyText}>No incoming friend requests.</Text>
      ) : (
        <FlatList
          data={incomingRequests}
          renderItem={({ item }) => (
            <FriendRequestCard
              request={item}
              onAccept={handleAcceptRequest}
              onDecline={handleDeclineRequest}
            />
          )}
          keyExtractor={(item) => item._id.toString()}
          scrollEnabled={false} // Important if FlatList is inside ScrollView
        />
      )}

      <Text style={styles.sectionTitle}>Outgoing Requests ({outgoingRequests.length})</Text>
      {outgoingRequests.length === 0 && !isLoading && !isRefreshing ? (
        <Text style={styles.emptyText}>No outgoing friend requests.</Text>
      ) : (
        <FlatList
          data={outgoingRequests}
          renderItem={renderOutgoingRequestItem}
          keyExtractor={(item) => item._id.toString()}
          scrollEnabled={false} // Important if FlatList is inside ScrollView
        />
      )}
      <View style={styles.backButtonContainer}>
        <Button title="Back to Friends" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Light background for the whole screen
  },
  scrollViewContent: {
    paddingBottom: 20, // Ensure space for the last items/button
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 24, // Slightly larger
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600', // Semi-bold
    marginTop: 25, // More space above section titles
    marginBottom: 12,
    paddingHorizontal: 15,
    color: '#444',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 10,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: 'gray',
    paddingHorizontal: 15,
  },
  outgoingRequestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9e9e9',
    marginHorizontal:15, // Give some horizontal margin
    marginVertical: 6, // Space between items
    borderRadius: 8,
  },
  username: {
      fontWeight: 'bold',
      color: '#333',
  },
  requestItemText: { // For outgoing requests text styling
    fontSize: 15,
    flexShrink: 1, // Allow text to shrink if button takes space
    marginRight: 8, // Space before button
  },
  backButtonContainer: { // Ensure button is nicely spaced
      marginTop: 30,
      marginHorizontal: 15,
      marginBottom: 10, // Space at the very bottom
  }
});

export default FriendRequestsScreen;
