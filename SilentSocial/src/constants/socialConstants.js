// Defines the allowed reaction types for mood posts.
// Using an object allows for easy lookup and iteration if needed.
export const REACTION_TYPES = {
  WAVE: 'wave',    // 👋
  HUG: 'hug',      // 🤗 (or a custom icon)
  VIBE: 'vibe',    // ✨ (or a custom icon for general good vibes)
  ENERGY: 'energy',  //⚡️ (or a custom icon for energetic/motivated)
  CALM: 'calm',    // 🧘 (or a custom icon for peaceful/calm)
};

// Optional: Helper to check if a type is valid
export const isValidReactionType = (type) => {
  return Object.values(REACTION_TYPES).includes(type);
};
