import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl,
  Alert, Platform, UIManager, LayoutAnimation
} from 'react-native'; // Added Platform, UIManager, LayoutAnimation
import { useFocusEffect } from '@react-navigation/native';
import socialService from '../services/socialService';
import MoodShareCard from '../components/MoodShareCard';
import authService from '../services/authService';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const POSTS_PER_PAGE = 10;

const SocialFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await authService.getCurrentUser();
      if (user && user._id) {
        setCurrentUserId(user._id);
      }
    };
    fetchCurrentUser();
  }, []);

  const fetchFeedPosts = useCallback(async (pageToFetch = 1, isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else if (pageToFetch === 1 && posts.length === 0) {
      setIsLoading(true);
    } else if (pageToFetch > 1) {
      setIsLoadingMore(true);
    }
    setError('');

    try {
      const response = await socialService.getSocialFeed(pageToFetch, POSTS_PER_PAGE);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animate list changes
      if (response.success && response.data && response.data.data) {
        const fetchedPosts = response.data.data;
        const pagination = response.data.pagination;
        setPosts(prevPosts => (pageToFetch === 1 || isRefresh) ? fetchedPosts : [...prevPosts, ...fetchedPosts]);
        setCurrentPage(pagination.currentPage);
        setTotalPages(pagination.totalPages);
        setHasMorePosts(pagination.currentPage < pagination.totalPages);
      } else {
        setPosts(prev => pageToFetch === 1 || isRefresh ? [] : prev); // Clear posts on error for page 1/refresh
        setError(response.message || 'Failed to fetch social feed.');
      }
    } catch (err) {
      console.error('Fetch social feed error:', err);
      setPosts(prev => pageToFetch === 1 || isRefresh ? [] : prev); // Clear posts on catch for page 1/refresh
      setError('An unexpected error occurred while fetching the feed. Please try again.');
    } finally {
      if (isRefresh) setIsRefreshing(false);
      if (pageToFetch === 1) setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [posts.length]); // posts.length added as dep to re-evaluate initial isLoading condition

  useFocusEffect(
    useCallback(() => {
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animate if posts clear out
      setPosts([]);
      setCurrentPage(1);
      setHasMorePosts(true);
      fetchFeedPosts(1, false);
    }, [fetchFeedPosts]) // fetchFeedPosts is stable, this effect runs on focus
  );

  const handleSharePost = (postId) => {
    Alert.alert('Share Action', `Sharing post: ${postId} (feature pending)`);
  };

  const handleEditPost = (postId) => {
    Alert.alert('Edit Action', `Editing post: ${postId} (feature pending)`);
  };

  const handleDeletePost = (postId) => {
    Alert.alert('Delete Action', `Deleting post: ${postId} (feature pending)`);
  };

  const handleReactToPost = async (postId, reactionType) => {
    try {
      const response = await socialService.reactToMoodPost(postId, reactionType);
      if (response.success && response.data) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animate update
        setPosts(currentPosts =>
          currentPosts.map(p =>
            (p._id === postId || p.id === postId) ? response.data : p
          )
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to react to post.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while reacting to the post.');
      console.error('handleReactToPost error:', error);
    }
  };

  const renderFeedItem = ({ item }) => {
    const postIsOwn = item.user && currentUserId ? item.user._id === currentUserId : false;
    return (
      <MoodShareCard
        moodData={item}
        isOwnPost={postIsOwn}
        onShare={() => handleSharePost(item._id)}
        onEdit={postIsOwn ? () => handleEditPost(item._id) : undefined}
        onDelete={postIsOwn ? () => handleDeletePost(item._id) : undefined}
        onReact={handleReactToPost}
      />
    );
  };

  if (isLoading && currentPage === 1 && posts.length === 0) {
    return (
      <View style={styles.centeredMessageContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item._id || item.id.toString()}
        ListEmptyComponent={!isLoading && !isRefreshing && !isLoadingMore ? (
            <View style={styles.centeredMessageContainer}>
                 <Text style={styles.emptyFeedText}>No posts in your feed yet. Be the first or add some friends!</Text>
            </View>
        ) : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchFeedPosts(1, true)}
            colors={["#007bff", "#60A5FA"]} // Primary and secondary refresh colors
            tintColor={"#007bff"}
          />
        }
        onEndReached={() => {
          if (hasMorePosts && !isLoadingMore) {
            fetchFeedPosts(currentPage + 1);
          }
        }}
        onEndReachedThreshold={0.7}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#007bff" style={styles.footerLoader}/> : null}
        contentContainerStyle={posts.length === 0 ? styles.centeredMessageContainer : styles.listContentContainer}
      />
      {error && !isLoading && !isRefreshing && !isLoadingMore && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // A light, neutral background for the feed screen
  },
  listContentContainer: {
    paddingHorizontal: Platform.OS === 'ios' ? 8 : 5, // Slightly more padding on iOS
    paddingBottom: 20, // Ensure space for footer loader or last item
  },
  centeredMessageContainer: { // Used for loading, empty, and potentially error states full screen
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyFeedText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  errorContainer: { // Specific container for error message for better positioning
    position: 'absolute', // Or relative depending on desired placement
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: '#ffcccc', // More distinct error background
    borderTopWidth: 1,
    borderTopColor: '#ffaaaa',
  },
  errorText: {
    color: '#cc0000', // Darker red for better contrast
    textAlign: 'center',
    fontSize: 14,
  },
  footerLoader: {
    marginVertical: 20,
  }
});

export default SocialFeedScreen;
