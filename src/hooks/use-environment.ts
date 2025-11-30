// Environment state management hook
import { useState, useEffect, useMemo } from 'react';
import { EmotionType } from '@/utils/emotion-types';
import { EnvironmentState, SceneType, TimeOfDay, WeatherType, getSceneFromEmotion, SCENE_CONFIGS } from '@/utils/environment-types';

interface UseEnvironmentOptions {
  currentEmotion?: EmotionType;
  isActive?: boolean;
  isSpeaking?: boolean;
}

export function useEnvironment(options: UseEnvironmentOptions = {}) {
  const { currentEmotion = 'neutral', isActive = false, isSpeaking = false } = options;

  const [environmentState, setEnvironmentState] = useState<EnvironmentState>({
    scene: 'forest',
    timeOfDay: 'afternoon',
    weather: 'clear',
    ambientSounds: [],
  });

  // Determine scene based on emotion
  const emotionScene = useMemo(() => {
    return getSceneFromEmotion(currentEmotion);
  }, [currentEmotion]);

  // Update environment based on emotion and activity
  useEffect(() => {
    const newScene = emotionScene;
    const currentHour = new Date().getHours();
    
    let timeOfDay: TimeOfDay = 'afternoon';
    if (currentHour >= 5 && currentHour < 12) timeOfDay = 'morning';
    else if (currentHour >= 12 && currentHour < 17) timeOfDay = 'afternoon';
    else if (currentHour >= 17 && currentHour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    setEnvironmentState({
      scene: newScene,
      timeOfDay,
      weather: 'clear',
      ambientSounds: [],
    });
  }, [emotionScene]);

  const sceneConfig = SCENE_CONFIGS[environmentState.scene];

  return {
    environmentState,
    sceneConfig,
    backgroundColor: sceneConfig.backgroundColor,
    particleColors: sceneConfig.particleColors,
    moodIntensity: sceneConfig.moodIntensity,
  };
}







