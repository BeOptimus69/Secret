import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const FriendRequestCard = ({ request, onAccept, onDecline }) => {
  // request object is expected to have at least: _id (friendshipId), requester ({ _id, username, email })
  const requesterName = request.requester ? request.requester.username : 'Unknown User';

  return (
    <View style={styles.card}>
      <Text style={styles.requestText}>
        <Text style={styles.username}>{requesterName}</Text> wants to be your friend.
      </Text>
      <View style={styles.actionsContainer}>
        <Button title="Decline" onPress={() => onDecline(request._id)} color="red" />
        <View style={styles.buttonSpacer} />
        <Button title="Accept" onPress={() => onAccept(request._id)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  requestText: {
    fontSize: 16,
    marginBottom: 10,
  },
  username: {
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Aligns buttons to the right
  },
  buttonSpacer: {
    width: 10, // Adds space between buttons
  }
});

export default FriendRequestCard;
