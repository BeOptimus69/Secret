import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, useColorScheme, Alert,
  Platform, UIManager, LayoutAnimation, Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getGradientColors } from '../constants/moodColors';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const defaultMoodData = {
  _id: '1',
  user: { username: 'User', avatarUrl: null },
  mood: 'default',
  summary: 'A day in the life, feeling the vibes and reflecting on moments.',
  content: '',
  rawData: { steps: 0, screenTime: 0 },
  createdAt: new Date().toISOString(),
  privacyLevel: 'friends',
};

const cardWidth = Dimensions.get('window').width * 0.92;

const MoodShareCard = ({
  moodData = defaultMoodData,
  onShare,
  onEdit,
  onDelete,
  isOwnPost = false,
}) => {
  const colorScheme = useColorScheme();
  const baseTextColor = '#FFFFFF';
  const secondaryTextColor = '#E0E0E0';
  const subtleBorderColor = 'rgba(255,255,255,0.25)';
  const gradientColors = getGradientColors(moodData.mood);

  const UserAvatar = () => (
    <View style={styles.avatarPlaceholder} accessible={true} accessibilityLabel={`Avatar for ${moodData.user ? moodData.user.username : 'Anonymous'}`}>
      <Text style={styles.avatarText}>
        {moodData.user && moodData.user.username ? moodData.user.username.substring(0,1).toUpperCase() : 'U'}
      </Text>
    </View>
  );

  const displayContent = moodData.content || moodData.summary || '';
  const displayDate = moodData.createdAt || moodData.date;

  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        "Delete Post",
        "Are you sure you want to delete this mood post?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", onPress: onDelete, style: "destructive" }
        ],
        { cancelable: true }
      );
    }
  };

  const handleShare = () => {
    if (onShare) {
      Alert.alert(
        "Share Post",
        "Do you want to share this mood post?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Share", onPress: onShare }
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.cardContainer}>
      <View style={styles.header}>
        <View style={styles.userInfo} accessible={true} accessibilityLabel={`Post by ${moodData.user ? moodData.user.username : 'Anonymous'}`}>
          <UserAvatar />
          <Text
            style={[styles.username, { color: baseTextColor }]}
            accessible={true} // Redundant if userInfo is already labelled, but good for direct focus
            accessibilityLabel={`Username: ${moodData.user ? moodData.user.username : 'Anonymous'}`}
          >
            {moodData.user ? moodData.user.username : 'Anonymous'}
          </Text>
        </View>
        {isOwnPost && onEdit && (
          <View style={styles.actionsMenu}>
            <TouchableOpacity
              onPress={onEdit}
              style={styles.actionButton}
              accessible={true}
              accessibilityLabel="Edit this mood post"
              accessibilityRole="button"
            >
              <Text style={[styles.actionText, { color: baseTextColor }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.mainContent}>
        <Text
          style={[styles.summaryText, { color: baseTextColor }]}
          accessible={true}
          accessibilityLabel={`Mood summary: ${displayContent}`}
        >
          {displayContent}
        </Text>
      </View>

      {moodData.rawData && (moodData.rawData.steps > 0 || moodData.rawData.screenTime > 0) && (
        <View style={[styles.activityHighlights, { borderTopColor: subtleBorderColor, borderBottomColor: subtleBorderColor }]}>
          {typeof moodData.rawData.steps === 'number' && moodData.rawData.steps > 0 && (
            <Text
              style={[styles.activityText, { color: secondaryTextColor }]}
              accessible={true}
              accessibilityLabel={`Steps taken: ${moodData.rawData.steps}`}
            >
              Steps: {moodData.rawData.steps}
            </Text>
          )}
          {typeof moodData.rawData.screenTime === 'number' && moodData.rawData.screenTime > 0 && (
            <Text
              style={[styles.activityText, { color: secondaryTextColor }]}
              accessible={true}
              accessibilityLabel={`Screen time: ${moodData.rawData.screenTime} hours`}
            >
              Screen: {moodData.rawData.screenTime}h
            </Text>
          )}
        </View>
      )}

      <View style={[styles.footer, { borderTopColor: subtleBorderColor }]}>
        <Text
          style={[styles.timestamp, { color: secondaryTextColor }]}
          accessible={true}
          accessibilityLabel={`Posted on ${displayDate ? new Date(displayDate).toLocaleDateString() : 'Unknown date'}`}
        >
          {displayDate ? new Date(displayDate).toLocaleDateString() : 'Date N/A'}
        </Text>
        <Text
          style={[styles.privacy, { color: secondaryTextColor }]}
          accessible={true}
          accessibilityLabel={`Privacy setting: ${moodData.privacyLevel}`}
        >
          {moodData.privacyLevel}
        </Text>
        <View style={styles.footerActions}>
          {isOwnPost && onDelete && (
             <TouchableOpacity
                onPress={handleDelete}
                style={styles.actionButton}
                accessible={true}
                accessibilityLabel="Delete this mood post"
                accessibilityRole="button"
              >
                <Text style={[styles.actionText, styles.deleteActionText, {color: '#FFC0CB'}]}>Delete</Text>
             </TouchableOpacity>
          )}
           {onShare && (
            <TouchableOpacity
              onPress={handleShare}
              style={styles.actionButton}
              accessible={true}
              accessibilityLabel="Share this mood post"
              accessibilityRole="button"
            >
              <Text style={[styles.actionText, { color: baseTextColor }]}>Share</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    alignSelf: 'center',
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
    minHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4.5,
    elevation: 6,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#FFFFFF', // Ensure avatar text is white for contrast on placeholder
  },
  username: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  actionsMenu: {},
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 15,
    marginLeft: 5,
  },
  deleteActionText: {
    fontWeight: '500',
  },
  mainContent: {
    alignItems: 'center',
    marginVertical: 25,
    flex: 1,
    justifyContent: 'center',
  },
  summaryText: {
    fontSize: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 28,
  },
  activityHighlights: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop:15,
  },
  activityText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  timestamp: {
    fontSize: 12,
  },
  privacy: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});

export default MoodShareCard;
