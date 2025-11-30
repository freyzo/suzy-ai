// Touch gesture support for mobile devices
import { useEffect, useRef, useState, useCallback } from 'react';
import { GestureType } from '@/utils/gesture-types';

interface TouchPoint {
  x: number;
  y: number;
  id: number;
  timestamp: number;
}

interface TouchGesture {
  type: GestureType;
  confidence: number;
  timestamp: number;
}

interface UseTouchGesturesOptions {
  enabled?: boolean;
  onGestureDetected?: (gesture: TouchGesture) => void;
  minSwipeDistance?: number;
  minPinchDistance?: number;
}

export function useTouchGestures(options: UseTouchGesturesOptions = {}) {
  const {
    enabled = true,
    onGestureDetected,
    minSwipeDistance = 50,
    minPinchDistance = 30,
  } = options;

  const [gesture, setGesture] = useState<TouchGesture>({
    type: 'none',
    confidence: 0,
    timestamp: Date.now(),
  });

  const touchesRef = useRef<Map<number, TouchPoint>>(new Map());
  const startTouchesRef = useRef<Map<number, TouchPoint>>(new Map());
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate distance between two points
  const calculateDistance = (p1: TouchPoint, p2: TouchPoint): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate angle between two points
  const calculateAngle = (p1: TouchPoint, p2: TouchPoint): number => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  };

  // Detect gesture from touch points
  const detectTouchGesture = useCallback((): TouchGesture | null => {
    const touches = Array.from(touchesRef.current.values());
    const startTouches = Array.from(startTouchesRef.current.values());

    if (touches.length === 0) {
      return null;
    }

    // Single touch gestures
    if (touches.length === 1 && startTouches.length === 1) {
      const touch = touches[0];
      const startTouch = startTouches[0];
      const distance = calculateDistance(startTouch, touch);
      const angle = calculateAngle(startTouch, touch);

      if (distance < minSwipeDistance) {
        // Tap or hold
        const duration = touch.timestamp - startTouch.timestamp;
        if (duration > 500) {
          // Long press = grab
          return {
            type: 'grab',
            confidence: 0.7,
            timestamp: Date.now(),
          };
        }
        // Short tap = open palm (tap gesture)
        return {
          type: 'open_palm',
          confidence: 0.6,
          timestamp: Date.now(),
        };
      }

      // Swipe gestures
      if (distance >= minSwipeDistance) {
        if (Math.abs(angle) < 30) {
          // Horizontal swipe
          return {
            type: angle > 0 ? 'pointing_right' : 'pointing_left',
            confidence: 0.8,
            timestamp: Date.now(),
          };
        } else if (Math.abs(angle) > 150) {
          // Horizontal swipe (opposite direction)
          return {
            type: angle > 0 ? 'pointing_left' : 'pointing_right',
            confidence: 0.8,
            timestamp: Date.now(),
          };
        } else if (angle > 30 && angle < 150) {
          // Downward swipe
          return {
            type: 'pointing_down',
            confidence: 0.8,
            timestamp: Date.now(),
          };
        } else {
          // Upward swipe
          return {
            type: 'pointing_up',
            confidence: 0.8,
            timestamp: Date.now(),
          };
        }
      }
    }

    // Two finger gestures
    if (touches.length === 2 && startTouches.length === 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const startTouch1 = startTouches[0];
      const startTouch2 = startTouches[1];

      const currentDistance = calculateDistance(touch1, touch2);
      const startDistance = calculateDistance(startTouch1, startTouch2);
      const distanceChange = currentDistance - startDistance;

      // Pinch gesture
      if (Math.abs(distanceChange) >= minPinchDistance) {
        return {
          type: distanceChange < 0 ? 'pinch' : 'open_palm',
          confidence: 0.7,
          timestamp: Date.now(),
        };
      }

      // Two finger swipe
      const avgX = (touch1.x + touch2.x) / 2;
      const avgY = (touch1.y + touch2.y) / 2;
      const startAvgX = (startTouch1.x + startTouch2.x) / 2;
      const startAvgY = (startTouch1.y + startTouch2.y) / 2;

      const swipeDistance = Math.sqrt(
        Math.pow(avgX - startAvgX, 2) + Math.pow(avgY - startAvgY, 2)
      );

      if (swipeDistance >= minSwipeDistance) {
        const swipeAngle = Math.atan2(avgY - startAvgY, avgX - startAvgX) * (180 / Math.PI);
        if (Math.abs(swipeAngle) < 30) {
          return {
            type: swipeAngle > 0 ? 'pointing_right' : 'pointing_left',
            confidence: 0.7,
            timestamp: Date.now(),
          };
        }
      }
    }

    // Three or more fingers - multi-touch gestures
    if (touches.length === 3) {
      // Three fingers = peace sign
      return {
        type: 'peace',
        confidence: 0.7,
        timestamp: Date.now(),
      };
    }
    if (touches.length === 4) {
      // Four fingers = open palm (multi-touch)
      return {
        type: 'open_palm',
        confidence: 0.6,
        timestamp: Date.now(),
      };
    }
    if (touches.length >= 5) {
      // Five fingers = full open palm
      return {
        type: 'open_palm',
        confidence: 0.8,
        timestamp: Date.now(),
      };
    }

    return null;
  }, [minSwipeDistance, minPinchDistance]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    e.preventDefault();
    startTouchesRef.current.clear();
    touchesRef.current.clear();

    Array.from(e.touches).forEach((touch) => {
      const point: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        id: touch.identifier,
        timestamp: Date.now(),
      };
      touchesRef.current.set(touch.identifier, point);
      startTouchesRef.current.set(touch.identifier, { ...point });
    });
  }, [enabled]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    e.preventDefault();
    
    Array.from(e.touches).forEach((touch) => {
      const point: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        id: touch.identifier,
        timestamp: Date.now(),
      };
      touchesRef.current.set(touch.identifier, point);
    });

    const detectedGesture = detectTouchGesture();
    if (detectedGesture && detectedGesture.type !== 'none') {
      setGesture(detectedGesture);
      onGestureDetected?.(detectedGesture);
    }
  }, [enabled, detectTouchGesture, onGestureDetected]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    e.preventDefault();

    // Remove ended touches
    Array.from(e.changedTouches).forEach((touch) => {
      touchesRef.current.delete(touch.identifier);
      startTouchesRef.current.delete(touch.identifier);
    });

    // Detect final gesture
    const detectedGesture = detectTouchGesture();
    if (detectedGesture && detectedGesture.type !== 'none') {
      setGesture(detectedGesture);
      onGestureDetected?.(detectedGesture);
      
      // Reset after a short delay
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
      gestureTimeoutRef.current = setTimeout(() => {
        setGesture({
          type: 'none',
          confidence: 0,
          timestamp: Date.now(),
        });
      }, 500);
    } else {
      setGesture({
        type: 'none',
        confidence: 0,
        timestamp: Date.now(),
      });
    }
  }, [enabled, detectTouchGesture, onGestureDetected]);

  // Setup touch event listeners
  useEffect(() => {
    if (!enabled) return;

    const element = document.body;
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    gesture,
    isActive: enabled,
  };
}

