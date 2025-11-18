# Emotion Recognition & Response System

## Overview

The emotion recognition system analyzes user voice and facial expressions in real-time to drive character animations. This creates a more immersive and responsive interaction experience.

## Architecture

### Components

1. **Voice Emotion Recognition** (`use-voice-emotion.ts`)
   - Uses Web Audio API to analyze audio features
   - Extracts: pitch, energy, spectral centroid, zero-crossing rate
   - Classifies emotions using rule-based ML approach
   - Works entirely client-side, no external API needed

2. **Facial Emotion Recognition** (`use-facial-emotion.ts`)
   - Uses MediaPipe Face Mesh for facial landmark detection
   - Analyzes: eye aspect ratio, mouth aspect ratio, eyebrow position
   - Optional feature (requires webcam permission)
   - Falls back gracefully if MediaPipe not available

3. **Emotion Manager** (`use-emotion-manager.ts`)
   - Fuses voice and facial emotion data
   - Manages emotion state and history
   - Handles smooth transitions between emotions
   - Provides animation parameters for character

4. **Emotion Types** (`emotion-types.ts`)
   - Defines emotion types and animation mappings
   - Provides interpolation for smooth transitions
   - Maps emotions to Live2D character parameters

## Supported Emotions

- **neutral**: Default state
- **happy**: High pitch + energy, positive expressions
- **sad**: Low pitch + energy, downward expressions
- **angry**: High energy + spectral centroid, tense expressions
- **surprised**: High pitch + wide mouth, raised eyebrows
- **excited**: Very high energy, animated expressions
- **calm**: Low energy, relaxed expressions
- **confused**: High zero-crossing rate, mixed signals
- **thoughtful**: Medium energy, contemplative expressions

## Usage

```typescript
import { useEmotionManager } from '@/hooks/use-emotion-manager';

const emotionManager = useEmotionManager({
  voiceEnabled: true,
  facialEnabled: false, // Set to true to enable webcam
  fusionWeight: { voice: 0.6, facial: 0.4 },
});

// Start emotion recognition
await emotionManager.start();

// Access current emotion
const currentEmotion = emotionManager.emotionState.current;

// Get animation parameters
const animation = emotionManager.currentAnimation;

// Stop recognition
emotionManager.stop();
```

## Integration with Character Display

The emotion system automatically integrates with `CharacterDisplay` component:

```typescript
<CharacterDisplay
  emotionAnimation={emotionManager.currentAnimation}
  // ... other props
/>
```

## Character Animation Mapping

Each emotion maps to specific Live2D parameters:

- **Mouth Open Size**: Controls lip-sync intensity
- **Eyebrow Position**: Controls facial expression (-1 to 1)
- **Head Tilt**: Adds natural movement (-1 to 1)
- **Body Motion**: Triggers Live2D motion animations
- **Color Tint**: Adds subtle color overlay for mood

## Performance Considerations

- Voice analysis runs at ~10Hz (100ms intervals)
- Facial analysis runs at ~10Hz (100ms intervals)
- Emotion fusion happens synchronously
- Smooth transitions prevent jarring animation changes
- History limited to 50 samples to prevent memory issues

## Future Enhancements

1. **ML Model Integration**: Replace rule-based classification with trained models
2. **Sentiment Analysis**: Add text-based sentiment from conversation transcripts
3. **Context Awareness**: Consider conversation history for emotion prediction
4. **Custom Emotions**: Allow user-defined emotion profiles
5. **Emotion Persistence**: Save emotion patterns for personalized responses

## Dependencies

- **Required**: None (voice analysis uses Web Audio API)
- **Optional**: `@mediapipe/face_mesh` for facial detection

Install MediaPipe for facial recognition:
```bash
npm install @mediapipe/face_mesh @mediapipe/camera_utils
```

## Technical Details

### Voice Feature Extraction

- **Pitch**: Autocorrelation-based fundamental frequency detection
- **Energy**: RMS (Root Mean Square) calculation
- **Spectral Centroid**: Frequency-weighted average of spectrum
- **Zero-Crossing Rate**: Rate of sign changes in signal

### Facial Feature Extraction

- **Eye Aspect Ratio (EAR)**: Detects blinks and eye state
- **Mouth Aspect Ratio (MAR)**: Detects mouth opening
- **Eyebrow Position**: Relative to eye position for expression

### Emotion Classification

Currently uses rule-based approach:
- Threshold-based decision trees
- Weighted feature combinations
- Confidence scoring based on feature strength

Future: Replace with ML model (TensorFlow.js, ONNX.js, or WebNN)

