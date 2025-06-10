// Defines color gradients associated with different moods for UI elements.
// Each mood maps to an array of two colors for the start and end of the gradient.

export const MOOD_GRADIENTS = {
  // Positive Moods
  happy: ['#FFD700', '#FFA500'],       // Gold to Orange
  excited: ['#FF8C00', '#FF4500'],     // DarkOrange to OrangeRed
  grateful: ['#DAA520', '#B8860B'],    // GoldenRod to DarkGoldenRod
  motivated: ['#32CD32', '#228B22'],   // LimeGreen to ForestGreen
  joyful: ['#FFC0CB', '#FFB6C1'],      // Pink to LightPink (can adjust for more intensity)
  loved: ['#FF69B4', '#C71585'],       // HotPink to MediumVioletRed

  // Neutral/Calm Moods
  calm: ['#ADD8E6', '#87CEEB'],        // LightBlue to SkyBlue
  peaceful: ['#B0E0E6', '#AFEEEE'],    // PowderBlue to PaleTurquoise
  relaxed: ['#90EE90', '#8FBC8F'],     // LightGreen to DarkSeaGreen
  content: ['#F0E68C', '#EEE8AA'],     // Khaki to PaleGoldenRod
  focused: ['#4682B4', '#5F9EA0'],     // SteelBlue to CadetBlue

  // Negative Moods (using less alarming, more muted or cooler tones for "calm" app)
  sad: ['#B0C4DE', '#778899'],         // LightSteelBlue to LightSlateGray
  anxious: ['#D8BFD8', '#DDA0DD'],     // Thistle to Plum
  stressed: ['#FFB347', '#FF8C00'],   // Apricot (Orange-ish) to DarkOrange (less aggressive red)
  tired: ['#C0C0C0', '#A9A9A9'],       // Silver to DarkGray
  lonely: ['#E6E6FA', '#D8DAE8'],      // Lavender to a slightly darker Lavender

  // Default/Unknown
  default: ['#D3D3D3', '#A9A9A9'],     // LightGray to DarkGray
};

// Helper function to get gradient colors for a mood
// mood should be a string (e.g., "happy", "calm")
export const getGradientColors = (mood) => {
  const moodKey = mood ? mood.toLowerCase() : 'default';
  return MOOD_GRADIENTS[moodKey] || MOOD_GRADIENTS.default;
};

// Example of specific moods from the initial AI prompt, mapped to above:
// "calm|anxious|focused|social|lonely|motivated|stressed"
// social could map to 'happy' or a new specific one if desired.
// For now, any unmapped mood will get the default.
// Let's add 'social' explicitly:
MOOD_GRADIENTS.social = ['#FFC0CB', '#FF69B4']; // Pink to HotPink (energetic, positive)
