import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';

const FriendCard = ({ friend, onRemoveFriend }) => {
  // friend object is expected to have at least: _id, username, email (or other display info)

  const handleRemove = () => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${friend.username} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", onPress: () => onRemoveFriend(friend._id), style: "destructive" }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.username}>{friend.username}</Text>
        {friend.email && <Text style={styles.email}>{friend.email}</Text>}
        {/* Avatar placeholder can be added here */}
      </View>
      <Button title="Remove" onPress={handleRemove} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: 'gray',
  },
});

export default FriendCard;
