// Gesture types and definitions
export type GestureType = 
  | 'none'
  | 'open_palm'
  | 'closed_fist'
  | 'pointing_up'
  | 'pointing_down'
  | 'pointing_left'
  | 'pointing_right'
  | 'thumbs_up'
  | 'thumbs_down'
  | 'peace'
  | 'ok'
  | 'rock'
  | 'wave'
  | 'pinch'
  | 'grab';

export interface Gesture {
  type: GestureType;
  confidence: number;
  hand: 'left' | 'right' | 'both';
  timestamp: number;
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  landmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
  confidence: number;
}

// MediaPipe Hands landmark indices
export const HAND_LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_FINGER_MCP: 5,
  INDEX_FINGER_PIP: 6,
  INDEX_FINGER_DIP: 7,
  INDEX_FINGER_TIP: 8,
  MIDDLE_FINGER_MCP: 9,
  MIDDLE_FINGER_PIP: 10,
  MIDDLE_FINGER_DIP: 11,
  MIDDLE_FINGER_TIP: 12,
  RING_FINGER_MCP: 13,
  RING_FINGER_PIP: 14,
  RING_FINGER_DIP: 15,
  RING_FINGER_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
};

// Gesture to animation mapping
export interface GestureAnimation {
  emotion?: string;
  animation?: string;
  mouthOpenSize?: number;
  headTilt?: number;
  eyebrowPosition?: number;
  bodyMotion?: string;
}

export const GESTURE_ANIMATION_MAP: Record<GestureType, GestureAnimation> = {
  none: {},
  open_palm: {
    emotion: 'happy',
    animation: 'wave',
    mouthOpenSize: 15,
  },
  closed_fist: {
    emotion: 'excited',
    animation: 'punch',
    mouthOpenSize: 20,
  },
  pointing_up: {
    emotion: 'surprised',
    animation: 'point_up',
    mouthOpenSize: 25,
  },
  pointing_down: {
    emotion: 'thoughtful',
    animation: 'point_down',
    mouthOpenSize: 10,
  },
  pointing_left: {
    emotion: 'neutral',
    animation: 'point_left',
    headTilt: -0.3,
  },
  pointing_right: {
    emotion: 'neutral',
    animation: 'point_right',
    headTilt: 0.3,
  },
  thumbs_up: {
    emotion: 'happy',
    animation: 'thumbs_up',
    mouthOpenSize: 20,
  },
  thumbs_down: {
    emotion: 'sad',
    animation: 'thumbs_down',
    mouthOpenSize: 5,
  },
  peace: {
    emotion: 'happy',
    animation: 'peace',
    mouthOpenSize: 18,
  },
  ok: {
    emotion: 'calm',
    animation: 'ok',
    mouthOpenSize: 12,
  },
  rock: {
    emotion: 'excited',
    animation: 'rock',
    mouthOpenSize: 22,
  },
  wave: {
    emotion: 'happy',
    animation: 'wave',
    mouthOpenSize: 15,
  },
  pinch: {
    emotion: 'thoughtful',
    animation: 'pinch',
    mouthOpenSize: 8,
  },
  grab: {
    emotion: 'excited',
    animation: 'grab',
    mouthOpenSize: 18,
  },
};


