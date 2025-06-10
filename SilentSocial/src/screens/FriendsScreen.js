import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // To refresh data when screen is focused
import friendService from '../services/friendService';
import FriendCard from '../components/FriendCard'; // Assuming path is correct

const FriendsScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [pendingRequestCount, setPendingRequestCount] = useState(0); // For badge on button
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    // For initial load or full refresh, set isLoading true
    if (!isRefreshing) setIsLoading(true);
    setError('');
    try {
      const friendsResponse = await friendService.listFriends();
      if (friendsResponse.success) {
        setFriends(friendsResponse.data || []);
      } else {
        setError(friendsResponse.message || 'Failed to load friends.');
        // Alert.alert('Error', friendsResponse.message || 'Failed to load friends.');
      }

      const pendingResponse = await friendService.listPendingRequests();
      if (pendingResponse.success && pendingResponse.data && pendingResponse.data.incoming) {
        setPendingRequestCount(pendingResponse.data.incoming.length);
      } else {
        // Don't necessarily error out if pending requests fail, friends list might still be useful
        console.warn('Could not load pending request count:', pendingResponse.message);
        setPendingRequestCount(0);
      }

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      // Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Friends screen fetch data error:', err);
    } finally {
      if (!isRefreshing) setIsLoading(false);
    }
  }, [isRefreshing]); // Add isRefreshing as dependency to control initial setIsLoading

  // useFocusEffect to refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  const handleRemoveFriend = async (friendIdToRemove) => {
    // As noted in friendService, removeFriend is a placeholder.
    // This will show the placeholder message from the service.
    // In a real scenario, it would attempt removal and then refresh data.
    Alert.alert(
        "Remove Friend",
        "This feature is currently in development and requires a dedicated backend endpoint for unfriend. The placeholder service function will be called.",
        [
            {text: "OK", onPress: async () => {
                const response = await friendService.removeFriend(friendIdToRemove); // This uses the placeholder
                if (!response.success) {
                    Alert.alert('Note', response.message || 'Placeholder for remove friend was called.');
                }
                // Potentially refresh list even if it's a placeholder to simulate
                // fetchData();
            }}
        ]
    );
  };

  if (isLoading && !isRefreshing && friends.length === 0 && pendingRequestCount === 0) { // Adjusted loading condition
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading friends data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerButtons}>
        <Button
          title="Add Friends"
          onPress={() => navigation.navigate('AddFriends')} // Assuming route name
        />
        <Button
          title={`Friend Requests ${pendingRequestCount > 0 ? `(${pendingRequestCount})` : ''}`}
          onPress={() => navigation.navigate('FriendRequests')} // Assuming route name
        />
      </View>

      {error && !isRefreshing && !isLoading ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={friends}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            onRemoveFriend={() => handleRemoveFriend(item._id)} // Pass friend's actual user ID
          />
        )}
        keyExtractor={(item) => item._id.toString()}
        ListEmptyComponent={!isLoading && !isRefreshing ? <Text style={styles.emptyText}>You have no friends yet. Add some!</Text> : null}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={friends.length === 0 && !isLoading && !isRefreshing ? styles.centered : {paddingHorizontal: 10}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Added a background color
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12, // Adjusted padding
    paddingHorizontal: 10,
    backgroundColor: '#fff', // Added background to header
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // Lighter border
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 10,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
});

export default FriendsScreen;
