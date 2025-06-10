import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, useColorScheme, Alert,
  Platform, UIManager, LayoutAnimation, Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getGradientColors } from '../constants/moodColors';
import { REACTION_TYPES, isValidReactionType } from '../constants/socialConstants'; // New Import
import { formatDistanceToNowStrict } from 'date-fns'; // New Import

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
  reactions: [], // Add reactions to default
};

const cardWidth = Dimensions.get('window').width * 0.92;

const MoodShareCard = ({
  moodData = defaultMoodData,
  onShare,
  onEdit,
  onDelete,
  isOwnPost = false,
  onReact, // New Prop
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
  const formattedDate = displayDate
    ? formatDistanceToNowStrict(new Date(displayDate), { addSuffix: true })
    : 'some time ago';

  const handleDelete = () => {
    if (onDelete) {
      Alert.alert("Delete Post", "Are you sure you want to delete this mood post?",
        [{ text: "Cancel", style: "cancel" }, { text: "Delete", onPress: onDelete, style: "destructive" }],
        { cancelable: true });
    }
  };

  const handleShare = () => {
    if (onShare) {
      Alert.alert("Share Post", "Do you want to share this mood post?",
        [{ text: "Cancel", style: "cancel" }, { text: "Share", onPress: onShare }],
        { cancelable: true });
    }
  };

  const handleReaction = (reactionType) => {
    if (onReact && moodData && moodData._id) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animate reaction changes
      onReact(moodData._id, reactionType);
    }
  };

  // Calculate reaction counts
  const reactionCounts = (moodData.reactions || []).reduce((acc, reaction) => {
    acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
    return acc;
  }, {});

  return (
    <LinearGradient colors={gradientColors} style={styles.cardContainer}>
      <View style={styles.header}>
        <View style={styles.userInfo} accessible={true} accessibilityLabel={`Post by ${moodData.user ? moodData.user.username : 'Anonymous'}`}>
          <UserAvatar />
          <Text style={[styles.username, { color: baseTextColor }]} accessible={true} accessibilityLabel={`Username: ${moodData.user ? moodData.user.username : 'Anonymous'}`}>
            {moodData.user ? moodData.user.username : 'Anonymous'}
          </Text>
        </View>
        {isOwnPost && onEdit && (
          <View style={styles.actionsMenu}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton} accessible={true} accessibilityLabel="Edit this mood post" accessibilityRole="button">
              <Text style={[styles.actionText, { color: baseTextColor }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.mainContent}>
        <Text style={[styles.summaryText, { color: baseTextColor }]} accessible={true} accessibilityLabel={`Mood summary: ${displayContent}`}>
          {displayContent}
        </Text>
      </View>

      {moodData.rawData && (moodData.rawData.steps > 0 || moodData.rawData.screenTime > 0) && (
        <View style={[styles.activityHighlights, { borderTopColor: subtleBorderColor, borderBottomColor: subtleBorderColor }]}>
          {typeof moodData.rawData.steps === 'number' && moodData.rawData.steps > 0 && (
            <Text style={[styles.activityText, { color: secondaryTextColor }]} accessible={true} accessibilityLabel={`Steps taken: ${moodData.rawData.steps}`}>
              Steps: {moodData.rawData.steps}
            </Text>
          )}
          {typeof moodData.rawData.screenTime === 'number' && moodData.rawData.screenTime > 0 && (
            <Text style={[styles.activityText, { color: secondaryTextColor }]} accessible={true} accessibilityLabel={`Screen time: ${moodData.rawData.screenTime} hours`}>
              Screen: {moodData.rawData.screenTime}h
            </Text>
          )}
        </View>
      )}

      {/* Reactions Section */}
      <View style={[styles.reactionsSection, { borderTopColor: subtleBorderColor }]}>
        <View style={styles.reactionButtonsContainer}>
          {Object.values(REACTION_TYPES).map((reactionType) => (
            <TouchableOpacity
              key={reactionType}
              onPress={() => handleReaction(reactionType)}
              style={styles.reactionButton}
              accessible={true}
              accessibilityLabel={`React with ${reactionType}`}
              accessibilityRole="button"
            >
              {/* Placeholder for actual icons */}
              <Text style={styles.reactionButtonText}>{reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.reactionCountsContainer}>
          {Object.entries(reactionCounts).map(([type, count]) => (
            count > 0 ? <Text key={type} style={styles.reactionCountText}>{`${type}: ${count}`}</Text> : null
          ))}
        </View>
      </View>


      <View style={[styles.footer, { borderTopColor: subtleBorderColor }]}>
        <Text style={[styles.timestamp, { color: secondaryTextColor }]} accessible={true} accessibilityLabel={`Posted ${formattedDate}`}>
          {formattedDate}
        </Text>
        <Text style={[styles.privacy, { color: secondaryTextColor }]} accessible={true} accessibilityLabel={`Privacy setting: ${moodData.privacyLevel}`}>
          {moodData.privacyLevel}
        </Text>
        <View style={styles.footerActions}>
          {isOwnPost && onDelete && (
             <TouchableOpacity onPress={handleDelete} style={styles.actionButton} accessible={true} accessibilityLabel="Delete this mood post" accessibilityRole="button">
                <Text style={[styles.actionText, styles.deleteActionText, {color: '#FFC0CB'}]}>Delete</Text>
             </TouchableOpacity>
          )}
           {onShare && (
            <TouchableOpacity onPress={handleShare} style={styles.actionButton} accessible={true} accessibilityLabel="Share this mood post" accessibilityRole="button">
              <Text style={[styles.actionText, { color: baseTextColor }]}>Share</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  cardContainer: { /* existing styles */ width: cardWidth, alignSelf: 'center', borderRadius: 20, padding: 20, marginVertical: 12, minHeight: 250, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 4.5, elevation: 6, justifyContent: 'space-between' },
  header: { /* existing styles */ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  userInfo: { /* existing styles */ flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { /* existing styles */ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.35)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { /* existing styles */ fontWeight: 'bold', fontSize: 20, color: '#FFFFFF' },
  username: { /* existing styles */ fontWeight: 'bold', fontSize: 18 },
  actionsMenu: {},
  actionButton: { /* existing styles */ paddingVertical: 6, paddingHorizontal: 8 },
  actionText: { /* existing styles */ fontSize: 15, marginLeft: 5  },
  deleteActionText: { /* existing styles */ fontWeight: '500' },
  mainContent: { /* existing styles */ alignItems: 'center', marginVertical: 25, flex: 1,  justifyContent: 'center' },
  summaryText: { /* existing styles */ fontSize: 20, textAlign: 'center', paddingHorizontal: 10, lineHeight: 28 },
  activityHighlights: { /* existing styles */ flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, marginTop:15 },
  activityText: { /* existing styles */ fontSize: 13 },

  reactionsSection: {
    paddingVertical: 10,
    marginTop: 15,
    borderTopWidth: 1,
    // borderTopColor will be set by subtleBorderColor in JSX
  },
  reactionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  reactionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)', // Semi-transparent button
  },
  reactionButtonText: {
    color: '#FFFFFF', // White text for buttons
    fontSize: 12,
    fontWeight: '500',
  },
  reactionCountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow counts to wrap
    justifyContent: 'center', // Center the counts if they wrap
    marginTop: 5,
  },
  reactionCountText: {
    fontSize: 11,
    color: '#E0E0E0', // Light gray for counts
    marginHorizontal: 5,
    fontStyle: 'italic',
  },

  footer: { /* existing styles */ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 12, borderTopWidth: 1 },
  timestamp: { /* existing styles */ fontSize: 12 },
  privacy: { /* existing styles */ fontSize: 12, textTransform: 'capitalize' },
  footerActions: { /* existing styles */ flexDirection: 'row', alignItems: 'center' }
});

export default MoodShareCard;
