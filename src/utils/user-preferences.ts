// User preferences and settings management
export interface UserPreferences {
  characterId: string;
  scene: string;
  volume: number;
  musicVolume: number;
  soundEffectsVolume: number;
  ambientSoundsEnabled: boolean;
  autoSceneChange: boolean;
  showEmotionIndicator: boolean;
  showAudioVisualizer: boolean;
  fullscreenOnStart: boolean;
  theme: 'light' | 'dark' | 'auto';
  gestureControlsEnabled: boolean;
  handTrackingEnabled: boolean;
  touchGesturesEnabled: boolean;
  outfitIds?: string[]; // Array of applied outfit IDs per character
  characterOutfits?: Record<string, string[]>; // characterId -> outfitIds mapping
}

const DEFAULT_PREFERENCES: UserPreferences = {
  characterId: 'hiyori',
  scene: 'forest',
  volume: 0.7,
  musicVolume: 0.5,
  soundEffectsVolume: 0.7,
  ambientSoundsEnabled: true,
  autoSceneChange: false,
  showEmotionIndicator: true,
  showAudioVisualizer: true,
  fullscreenOnStart: false,
  theme: 'auto',
  gestureControlsEnabled: true,
  handTrackingEnabled: true,
  touchGesturesEnabled: true,
};

const STORAGE_KEY = 'suzy-ai-preferences';

export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load preferences:', error);
  }
  return { ...DEFAULT_PREFERENCES };
}

export function savePreferences(preferences: Partial<UserPreferences>): void {
  try {
    const current = loadPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save preferences:', error);
  }
}

export function resetPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to reset preferences:', error);
  }
}


