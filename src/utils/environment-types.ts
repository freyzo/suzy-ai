// Environment state types and utilities

export type SceneType = 'office' | 'cafe' | 'studio' | 'nature' | 'forest' | 'space' | 'ocean';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type WeatherType = 'clear' | 'rainy' | 'cloudy' | 'stormy' | 'snowy';

export interface EnvironmentState {
  scene: SceneType;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  ambientSounds: string[];
}

export interface SceneConfig {
  backgroundColor: string;
  gradientColors: string[];
  particleColors: string[];
  moodIntensity: number; // 0-1
}

export const SCENE_CONFIGS: Record<SceneType, SceneConfig> = {
  office: {
    backgroundColor: '#f5f5f5',
    gradientColors: ['#e8e8e8', '#d0d0d0', '#b8b8b8'],
    particleColors: ['#4a90e2', '#7b68ee', '#9370db'],
    moodIntensity: 0.3,
  },
  cafe: {
    backgroundColor: '#f4e4c1',
    gradientColors: ['#fff8dc', '#ffe4b5', '#deb887'],
    particleColors: ['#d2691e', '#cd853f', '#daa520'],
    moodIntensity: 0.5,
  },
  studio: {
    backgroundColor: '#1a1a1a',
    gradientColors: ['#2d2d2d', '#1a1a1a', '#0d0d0d'],
    particleColors: ['#ff6b6b', '#4ecdc4', '#ffe66d'],
    moodIntensity: 0.7,
  },
  nature: {
    backgroundColor: '#90ee90',
    gradientColors: ['#98fb98', '#90ee90', '#7cfc00'],
    particleColors: ['#228b22', '#32cd32', '#00ff00'],
    moodIntensity: 0.6,
  },
  forest: {
    backgroundColor: '#2d5016',
    gradientColors: ['#3d6b1f', '#2d5016', '#1f3a0f'],
    particleColors: ['#8b4513', '#228b22', '#32cd32'],
    moodIntensity: 0.4,
  },
  space: {
    backgroundColor: '#0a0a1a',
    gradientColors: ['#1a1a2e', '#0a0a1a', '#000000'],
    particleColors: ['#ffd700', '#ff69b4', '#00ffff'],
    moodIntensity: 0.8,
  },
  ocean: {
    backgroundColor: '#1e3a5f',
    gradientColors: ['#2e4a6f', '#1e3a5f', '#0e2a4f'],
    particleColors: ['#00bfff', '#1e90ff', '#87ceeb'],
    moodIntensity: 0.5,
  },
};

// Map emotions to scenes
export function getSceneFromEmotion(emotion: string): SceneType {
  const emotionSceneMap: Record<string, SceneType> = {
    happy: 'cafe',
    excited: 'studio',
    calm: 'nature',
    thoughtful: 'ocean',
    sad: 'forest',
    angry: 'space',
    surprised: 'studio',
    neutral: 'office',
    confused: 'ocean',
  };
  return emotionSceneMap[emotion] || 'office';
}


