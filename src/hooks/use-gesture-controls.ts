// Unified gesture controls hook - combines hand tracking and touch gestures
import { useEffect, useRef, useState, useCallback } from 'react';
import { useHandTracking } from './use-hand-tracking';
import { useTouchGestures } from './use-touch-gestures';
import { Gesture, GestureType, GESTURE_ANIMATION_MAP } from '@/utils/gesture-types';
import { EmotionAnimation } from '@/utils/emotion-types';
import { useIsMobile } from './use-mobile';

interface UseGestureControlsOptions {
  enabled?: boolean;
  handTrackingEnabled?: boolean;
  touchGesturesEnabled?: boolean;
  onGestureAnimation?: (animation: EmotionAnimation) => void;
}

export function useGestureControls(options: UseGestureControlsOptions = {}) {
  const {
    enabled = true,
    handTrackingEnabled = true,
    touchGesturesEnabled = true,
    onGestureAnimation,
  } = options;

  const isMobile = useIsMobile();
  const [currentGesture, setCurrentGesture] = useState<GestureType>('none');
  const [gestureAnimation, setGestureAnimation] = useState<EmotionAnimation | null>(null);
  const lastGestureRef = useRef<GestureType>('none');
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hand tracking (for desktop/webcam)
  const handTracking = useHandTracking({
    enabled: enabled && handTrackingEnabled && !isMobile,
    onGestureDetected: (gesture) => {
      setCurrentGesture(gesture.type);
    },
  });

  // Touch gestures (for mobile)
  const touchGestures = useTouchGestures({
    enabled: enabled && touchGesturesEnabled && isMobile,
    onGestureDetected: (gesture) => {
      setCurrentGesture(gesture.type);
    },
  });

  // Convert gesture to animation
  const gestureToAnimation = useCallback((gestureType: GestureType): EmotionAnimation | null => {
    if (gestureType === 'none') return null;

    const mapping = GESTURE_ANIMATION_MAP[gestureType];
    if (!mapping) return null;

    return {
      emotion: mapping.emotion as any,
      mouthOpenSize: mapping.mouthOpenSize || 0,
      eyebrowPosition: mapping.eyebrowPosition || 0,
      headTilt: mapping.headTilt || 0,
      eyeBlinkRate: 0.5,
      colorTint: undefined,
    };
  }, []);

  // Update animation when gesture changes
  useEffect(() => {
    if (currentGesture === lastGestureRef.current) return;
    
    lastGestureRef.current = currentGesture;
    
    // Clear previous timeout
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
    }

    const animation = gestureToAnimation(currentGesture);
    
    if (animation) {
      setGestureAnimation(animation);
      onGestureAnimation?.(animation);

      // Reset gesture after animation duration
      gestureTimeoutRef.current = setTimeout(() => {
        setCurrentGesture('none');
        setGestureAnimation(null);
      }, 2000); // 2 second animation
    } else {
      setGestureAnimation(null);
    }
  }, [currentGesture, gestureToAnimation, onGestureAnimation]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
    };
  }, []);

  return {
    gesture: currentGesture,
    gestureAnimation,
    handTracking,
    touchGestures,
    isActive: handTracking.isActive || touchGestures.isActive,
    start: async () => {
      if (!isMobile && handTrackingEnabled) {
        await handTracking.start();
      }
    },
    stop: () => {
      handTracking.stop();
    },
  };
}


