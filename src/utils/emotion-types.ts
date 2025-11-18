// Emotion types and utilities for character animation

export type EmotionType = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'excited'
  | 'calm'
  | 'confused'
  | 'thoughtful';

export interface EmotionVector {
  emotion: EmotionType;
  intensity: number; // 0-1
  confidence: number; // 0-1
  timestamp: number;
}

export interface EmotionState {
  current: EmotionVector;
  history: EmotionVector[];
  dominant: EmotionType;
  transitionDuration: number; // ms
}

// Emotion to animation mapping
export interface EmotionAnimation {
  mouthOpenSize: number;
  eyeBlinkRate: number;
  eyebrowPosition: number; // -1 (sad) to 1 (surprised)
  headTilt: number; // -1 (left) to 1 (right)
  bodyMotion?: string; // Live2D motion name
  colorTint?: string; // Optional color overlay
}

export const EMOTION_ANIMATIONS: Record<EmotionType, EmotionAnimation> = {
  neutral: {
    mouthOpenSize: 0,
    eyeBlinkRate: 0.5,
    eyebrowPosition: 0,
    headTilt: 0,
  },
  happy: {
    mouthOpenSize: 25,
    eyeBlinkRate: 0.3,
    eyebrowPosition: 0.3,
    headTilt: 0.1,
    bodyMotion: 'tap_body',
    colorTint: 'rgba(255, 255, 0, 0.1)',
  },
  sad: {
    mouthOpenSize: 5,
    eyeBlinkRate: 0.8,
    eyebrowPosition: -0.5,
    headTilt: -0.2,
    colorTint: 'rgba(0, 0, 255, 0.1)',
  },
  angry: {
    mouthOpenSize: 15,
    eyeBlinkRate: 0.2,
    eyebrowPosition: -0.7,
    headTilt: 0,
    colorTint: 'rgba(255, 0, 0, 0.1)',
  },
  surprised: {
    mouthOpenSize: 40,
    eyeBlinkRate: 0.1,
    eyebrowPosition: 1,
    headTilt: 0,
    colorTint: 'rgba(255, 200, 0, 0.15)',
  },
  excited: {
    mouthOpenSize: 35,
    eyeBlinkRate: 0.4,
    eyebrowPosition: 0.6,
    headTilt: 0.2,
    bodyMotion: 'tap_body',
    colorTint: 'rgba(255, 100, 0, 0.15)',
  },
  calm: {
    mouthOpenSize: 2,
    eyeBlinkRate: 0.4,
    eyebrowPosition: 0.1,
    headTilt: 0,
    colorTint: 'rgba(0, 255, 255, 0.05)',
  },
  confused: {
    mouthOpenSize: 10,
    eyeBlinkRate: 0.6,
    eyebrowPosition: 0.4,
    headTilt: 0.3,
    colorTint: 'rgba(200, 200, 0, 0.1)',
  },
  thoughtful: {
    mouthOpenSize: 3,
    eyeBlinkRate: 0.3,
    eyebrowPosition: -0.2,
    headTilt: -0.1,
    colorTint: 'rgba(150, 150, 255, 0.05)',
  },
};

// Interpolate between emotions for smooth transitions
export function interpolateEmotions(
  from: EmotionType,
  to: EmotionType,
  progress: number
): EmotionAnimation {
  const fromAnim = EMOTION_ANIMATIONS[from];
  const toAnim = EMOTION_ANIMATIONS[to];
  
  return {
    mouthOpenSize: fromAnim.mouthOpenSize + (toAnim.mouthOpenSize - fromAnim.mouthOpenSize) * progress,
    eyeBlinkRate: fromAnim.eyeBlinkRate + (toAnim.eyeBlinkRate - fromAnim.eyeBlinkRate) * progress,
    eyebrowPosition: fromAnim.eyebrowPosition + (toAnim.eyebrowPosition - fromAnim.eyebrowPosition) * progress,
    headTilt: fromAnim.headTilt + (toAnim.headTilt - fromAnim.headTilt) * progress,
    bodyMotion: progress > 0.5 ? toAnim.bodyMotion : fromAnim.bodyMotion,
    colorTint: progress > 0.5 ? toAnim.colorTint : fromAnim.colorTint,
  };
}


