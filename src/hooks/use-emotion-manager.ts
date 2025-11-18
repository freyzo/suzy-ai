// Unified emotion manager that combines voice and facial emotion recognition
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { EmotionType, EmotionVector, EmotionState, EmotionAnimation, interpolateEmotions, EMOTION_ANIMATIONS } from '@/utils/emotion-types';
import { useVoiceEmotion } from './use-voice-emotion';
import { useFacialEmotion } from './use-facial-emotion';

interface UseEmotionManagerOptions {
  voiceEnabled?: boolean;
  facialEnabled?: boolean;
  fusionWeight?: {
    voice: number;
    facial: number;
  };
  historySize?: number;
  transitionDuration?: number; // ms
}

export function useEmotionManager(options: UseEmotionManagerOptions = {}) {
  const {
    voiceEnabled = true,
    facialEnabled = false,
    fusionWeight = { voice: 0.6, facial: 0.4 },
    historySize = 50,
    transitionDuration = 500,
  } = options;

  const voiceEmotion = useVoiceEmotion({ enabled: voiceEnabled });
  const facialEmotion = useFacialEmotion({ enabled: facialEnabled });

  const [emotionState, setEmotionState] = useState<EmotionState>({
    current: {
      emotion: 'neutral',
      intensity: 0,
      confidence: 0,
      timestamp: Date.now(),
    },
    history: [],
    dominant: 'neutral',
    transitionDuration,
  });

  const previousEmotionRef = useRef<EmotionType>('neutral');
  const transitionStartRef = useRef<number>(0);
  const transitionActiveRef = useRef<boolean>(false);

  // Fuse voice and facial emotions
  const fuseEmotions = useCallback((
    voice: EmotionVector,
    facial: EmotionVector
  ): EmotionVector => {
    if (!voiceEnabled && !facialEnabled) {
      return {
        emotion: 'neutral',
        intensity: 0,
        confidence: 0,
        timestamp: Date.now(),
      };
    }

    if (!voiceEnabled) return facial;
    if (!facialEnabled) return voice;

    // Weighted fusion based on confidence and weights
    const voiceWeight = fusionWeight.voice * voice.confidence;
    const facialWeight = fusionWeight.facial * facial.confidence;
    const totalWeight = voiceWeight + facialWeight;

    if (totalWeight === 0) {
      return {
        emotion: 'neutral',
        intensity: 0,
        confidence: 0,
        timestamp: Date.now(),
      };
    }

    // Select emotion based on higher weighted confidence
    const selectedEmotion = voiceWeight > facialWeight ? voice.emotion : facial.emotion;
    
    // Fuse intensity
    const fusedIntensity = (
      voice.intensity * voiceWeight + 
      facial.intensity * facialWeight
    ) / totalWeight;

    // Fuse confidence
    const fusedConfidence = Math.min(1, totalWeight);

    return {
      emotion: selectedEmotion,
      intensity: Math.max(0, Math.min(1, fusedIntensity)),
      confidence: Math.max(0, Math.min(1, fusedConfidence)),
      timestamp: Date.now(),
    };
  }, [voiceEnabled, facialEnabled, fusionWeight]);

  // Update emotion state with smooth transitions
  useEffect(() => {
    const fused = fuseEmotions(voiceEmotion.emotion, facialEmotion.emotion);
    
    setEmotionState(prev => {
      const newHistory = [...prev.history, fused].slice(-historySize);
      
      // Calculate dominant emotion from history
      const emotionCounts = new Map<EmotionType, number>();
      newHistory.forEach(e => {
        emotionCounts.set(e.emotion, (emotionCounts.get(e.emotion) || 0) + e.intensity);
      });
      
      let dominant: EmotionType = 'neutral';
      let maxCount = 0;
      emotionCounts.forEach((count, emotion) => {
        if (count > maxCount) {
          maxCount = count;
          dominant = emotion;
        }
      });

      // Handle transitions
      if (fused.emotion !== previousEmotionRef.current) {
        transitionStartRef.current = Date.now();
        transitionActiveRef.current = true;
        previousEmotionRef.current = fused.emotion;
      }

      return {
        current: fused,
        history: newHistory,
        dominant,
        transitionDuration: prev.transitionDuration,
      };
    });
  }, [voiceEmotion.emotion, facialEmotion.emotion, fuseEmotions, historySize]);

  // Get current animation with transition interpolation (memoized)
  const currentAnimation = useMemo((): EmotionAnimation => {
    const currentEmotion = emotionState.current.emotion;
    const now = Date.now();
    const elapsed = now - transitionStartRef.current;
    const progress = Math.min(1, elapsed / transitionDuration);

    if (!transitionActiveRef.current || progress >= 1) {
      transitionActiveRef.current = false;
      return EMOTION_ANIMATIONS[currentEmotion];
    }

    // Interpolate during transition
    const fromEmotion = previousEmotionRef.current === currentEmotion 
      ? 'neutral' 
      : previousEmotionRef.current;
    
    return interpolateEmotions(
      fromEmotion,
      currentEmotion,
      progress
    );
  }, [emotionState.current.emotion, emotionState.current.intensity, transitionDuration]);

  // Start both recognition systems
  const start = useCallback(async () => {
    if (voiceEnabled) {
      await voiceEmotion.start();
    }
    if (facialEnabled) {
      await facialEmotion.start();
    }
  }, [voiceEnabled, facialEnabled, voiceEmotion, facialEmotion]);

  // Stop both recognition systems
  const stop = useCallback(() => {
    if (voiceEnabled) {
      voiceEmotion.stop();
    }
    if (facialEnabled) {
      facialEmotion.stop();
    }
  }, [voiceEnabled, facialEnabled, voiceEmotion, facialEmotion]);

  return {
    emotionState,
    currentAnimation,
    start,
    stop,
    isActive: voiceEmotion.isActive || facialEmotion.isActive,
    videoRef: facialEmotion.videoRef,
    canvasRef: facialEmotion.canvasRef,
  };
}

