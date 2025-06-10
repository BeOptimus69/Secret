import apiService from './apiService';

// Send a friend request
// recipientId can be the MongoDB ObjectId of the target user.
const sendFriendRequest = async (recipientId) => {
  if (!recipientId) {
    return { success: false, message: 'Recipient ID is required.' };
  }
  try {
    // The backend route is POST /api/friends/request
    // It expects { "recipientId": "someUserId" } in the body
    const response = await apiService.post('/friends/request', { recipientId });
    return response; // apiService already formats this to { success, data/message }
  } catch (error) {
    // This catch is mostly for unexpected client-side errors before apiService is called
    // or if apiService itself throws an unhandled exception (though it shouldn't)
    console.error('Client-side error in sendFriendRequest:', error);
    return { success: false, message: error.message || 'Client error sending friend request.' };
  }
};

// Accept a friend request
// requestId is the MongoDB ObjectId of the Friendship document
const acceptFriendRequest = async (requestId) => {
  if (!requestId) {
    return { success: false, message: 'Request ID is required.' };
  }
  try {
    // The backend route is POST /api/friends/accept/:requestId
    const response = await apiService.post(`/friends/accept/${requestId}`, {}); // Empty body for this POST
    return response;
  } catch (error) {
    console.error('Client-side error in acceptFriendRequest:', error);
    return { success: false, message: error.message || 'Client error accepting friend request.' };
  }
};

// Decline a pending friend request or Cancel a sent pending request
// requestId is the MongoDB ObjectId of the Friendship document
const declineOrCancelFriendRequest = async (requestId) => {
  if (!requestId) {
    return { success: false, message: 'Request ID is required.' };
  }
  try {
    // The backend route is DELETE /api/friends/request/:requestId
    const response = await apiService.delete(`/friends/request/${requestId}`);
    return response;
  } catch (error) {
    console.error('Client-side error in declineOrCancelFriendRequest:', error);
    return { success: false, message: error.message || 'Client error declining/cancelling request.' };
  }
};

// List all accepted friends for the current user
const listFriends = async () => {
  try {
    // The backend route is GET /api/friends/list
    const response = await apiService.get('/friends/list');
    return response; // Expected: { success: true, data: [friendObjects], count: number }
  } catch (error) {
    console.error('Client-side error in listFriends:', error);
    return { success: false, message: error.message || 'Client error listing friends.' };
  }
};

// List pending friend requests (incoming and outgoing)
const listPendingRequests = async () => {
  try {
    // The backend route is GET /api/friends/pending
    const response = await apiService.get('/friends/pending');
    // Expected: { success: true, data: { incoming: [], outgoing: [] } }
    return response;
  } catch (error) {
    console.error('Client-side error in listPendingRequests:', error);
    return { success: false, message: error.message || 'Client error listing pending requests.' };
  }
};

// Remove a friend (unfriend)
// This is more complex as it needs the Friendship document ID.
// The backend's DELETE /api/friends/request/:requestId is for pending/declined.
// A true "unfriend" for an 'accepted' friendship would typically involve:
// 1. Finding the Friendship document ID for the two users.
// 2. Deleting that Friendship document.
// This might require a new backend endpoint like DELETE /api/friends/:friendshipId (if ID known)
// or DELETE /api/friends/user/:friendUserId (backend finds and deletes friendship).
// For now, this function will be a placeholder or assume a simplified scenario.
// Let's assume we'd ideally call a specific "unfriend" endpoint if it existed.
// If we must use declineOrCancelFriendRequest, we need the friendshipId of an *accepted* friendship.
// This implies the component calling removeFriend might need to know this ID.
const removeFriend = async (friendshipId) => {
    // This function assumes `friendshipId` is the ID of the 'accepted' Friendship document.
    // If only `friendUserId` is known, client would need to:
    // 1. Fetch all friendships (or a specific one if an endpoint exists)
    // 2. Find the specific friendship ID with this friendUserId
    // 3. Then call this function.
    // This is a simplification for now. A dedicated backend unfriend by friendUserId would be better.
  if (!friendshipId) {
    return { success: false, message: 'Friendship ID is required to remove a friend.' };
  }
  console.warn(
    'removeFriend: This function currently assumes you are passing the ID of the Friendship document ' +
    'for an *accepted* friendship. It will attempt to use the decline/cancel endpoint. ' +
    'A dedicated backend unfriend endpoint (e.g., taking friendUserId or friendshipId of accepted state) is recommended for robustness.'
  );
  try {
    // Re-purposing declineOrCancel for unfriend if the backend allows deleting 'accepted' friendships via this route.
    // The current backend `declineOrCancelFriendRequest` only deletes 'pending' requests.
    // SO, THIS WILL LIKELY FAIL for 'accepted' friendships with current backend.
    // This highlights the need for a dedicated backend "unfriend" endpoint.
    // For now, let's call it and expect it might fail for accepted, or backend needs adjustment.
    // A more correct approach for now would be to NOT use this for 'accepted' state unless backend changes.
    // Let's assume we will add a new backend endpoint later: DELETE /api/friends/unfriend/:friendshipId
    // For now, this is a placeholder and will likely not work as intended for unfriend.
    // const response = await apiService.delete(`/friends/unfriend/${friendshipId}`);
    // return response;

    console.log(`Attempting to remove friend via placeholder for friendship ID: ${friendshipId}. This needs a proper backend endpoint.`);
    return { success: false, message: 'Unfriend functionality requires a dedicated backend endpoint. This is a placeholder.' };

  } catch (error) {
    console.error('Client-side error in removeFriend:', error);
    return { success: false, message: error.message || 'Client error removing friend.' };
  }
};


export default {
  sendFriendRequest,
  acceptFriendRequest,
  declineOrCancelFriendRequest,
  listFriends,
  listPendingRequests,
  removeFriend, // Note: Implementation details need backend support
};
