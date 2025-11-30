// Hand tracking using MediaPipe Hands
// Source pattern: use-facial-emotion.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { Gesture, GestureType, HandData, HAND_LANDMARKS } from '@/utils/gesture-types';

interface UseHandTrackingOptions {
  enabled?: boolean;
  modelComplexity?: 0 | 1;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  maxNumHands?: number;
  updateInterval?: number; // ms
  onGestureDetected?: (gesture: Gesture) => void;
}

// Calculate distance between two landmarks
function calculateDistance(landmark1: any, landmark2: any): number {
  const dx = landmark1.x - landmark2.x;
  const dy = landmark1.y - landmark2.y;
  const dz = landmark1.z - landmark2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Check if finger is extended
function isFingerExtended(landmarks: any[], fingerIndices: number[]): boolean {
  const tip = landmarks[fingerIndices[3]];
  const pip = landmarks[fingerIndices[2]];
  const mcp = landmarks[fingerIndices[1]];
  
  // Finger is extended if tip is above PIP and PIP is above MCP
  return tip.y < pip.y && pip.y < mcp.y;
}

// Detect gesture from hand landmarks
function detectGesture(landmarks: any[], handedness: string): GestureType {
  if (!landmarks || landmarks.length < 21) return 'none';

  const thumbExtended = landmarks[HAND_LANDMARKS.THUMB_TIP].x > landmarks[HAND_LANDMARKS.THUMB_IP].x;
  const indexExtended = isFingerExtended(landmarks, [
    HAND_LANDMARKS.INDEX_FINGER_MCP,
    HAND_LANDMARKS.INDEX_FINGER_PIP,
    HAND_LANDMARKS.INDEX_FINGER_DIP,
    HAND_LANDMARKS.INDEX_FINGER_TIP,
  ]);
  const middleExtended = isFingerExtended(landmarks, [
    HAND_LANDMARKS.MIDDLE_FINGER_MCP,
    HAND_LANDMARKS.MIDDLE_FINGER_PIP,
    HAND_LANDMARKS.MIDDLE_FINGER_DIP,
    HAND_LANDMARKS.MIDDLE_FINGER_TIP,
  ]);
  const ringExtended = isFingerExtended(landmarks, [
    HAND_LANDMARKS.RING_FINGER_MCP,
    HAND_LANDMARKS.RING_FINGER_PIP,
    HAND_LANDMARKS.RING_FINGER_DIP,
    HAND_LANDMARKS.RING_FINGER_TIP,
  ]);
  const pinkyExtended = isFingerExtended(landmarks, [
    HAND_LANDMARKS.PINKY_MCP,
    HAND_LANDMARKS.PINKY_PIP,
    HAND_LANDMARKS.PINKY_DIP,
    HAND_LANDMARKS.PINKY_TIP,
  ]);

  const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

  // Open palm: all fingers extended
  if (extendedCount === 4 && thumbExtended) {
    return 'open_palm';
  }

  // Closed fist: no fingers extended
  if (extendedCount === 0 && !thumbExtended) {
    return 'closed_fist';
  }

  // Pointing up: only index finger extended
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP];
    const wrist = landmarks[HAND_LANDMARKS.WRIST];
    if (indexTip.y < wrist.y) {
      return 'pointing_up';
    }
    if (indexTip.y > wrist.y) {
      return 'pointing_down';
    }
    if (indexTip.x < wrist.x) {
      return handedness === 'Left' ? 'pointing_right' : 'pointing_left';
    }
    return handedness === 'Left' ? 'pointing_left' : 'pointing_right';
  }

  // Peace sign: index and middle extended
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return 'peace';
  }

  // OK sign: thumb and index form circle, others extended
  const thumbTip = landmarks[HAND_LANDMARKS.THUMB_TIP];
  const indexTip = landmarks[HAND_LANDMARKS.INDEX_FINGER_TIP];
  const thumbIndexDistance = calculateDistance(thumbTip, indexTip);
  if (thumbIndexDistance < 0.05 && middleExtended && ringExtended && pinkyExtended) {
    return 'ok';
  }

  // Thumbs up: thumb extended up, others closed
  if (thumbExtended && extendedCount === 0) {
    if (thumbTip.y < landmarks[HAND_LANDMARKS.THUMB_MCP].y) {
      return 'thumbs_up';
    }
    return 'thumbs_down';
  }

  // Rock: index and pinky extended
  if (indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
    return 'rock';
  }

  // Wave: open palm moving horizontally (requires movement tracking)
  // Check if palm is open and moving side to side
  if (extendedCount >= 3) {
    // This will be enhanced with movement tracking in processFrame
    return 'wave';
  }

  // Pinch: thumb and index close together
  if (thumbIndexDistance < 0.03 && extendedCount <= 1) {
    return 'pinch';
  }

  // Grab: partial fist
  if (extendedCount === 1 || extendedCount === 2) {
    return 'grab';
  }

  return 'none';
}

// Detect wave gesture from hand movement history
function detectWaveFromMovement(history: Array<{ x: number; y: number; timestamp: number }>): boolean {
  if (history.length < 5) return false;
  
  // Check for horizontal oscillation (side-to-side movement)
  const recent = history.slice(-5);
  const xPositions = recent.map(h => h.x);
  const yPositions = recent.map(h => h.y);
  
  // Calculate horizontal variance (should be high for waving)
  const xMean = xPositions.reduce((a, b) => a + b, 0) / xPositions.length;
  const xVariance = xPositions.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0) / xPositions.length;
  
  // Calculate vertical variance (should be low for waving)
  const yMean = yPositions.reduce((a, b) => a + b, 0) / yPositions.length;
  const yVariance = yPositions.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0) / yPositions.length;
  
  // Wave detection: high horizontal movement, low vertical movement
  return xVariance > 0.01 && yVariance < 0.005;
}

export function useHandTracking(options: UseHandTrackingOptions = {}) {
  const {
    enabled = true,
    modelComplexity = 1,
    minDetectionConfidence = 0.5,
    minTrackingConfidence = 0.5,
    maxNumHands = 2,
    updateInterval = 100,
    onGestureDetected,
  } = options;

  const [gesture, setGesture] = useState<Gesture>({
    type: 'none',
    confidence: 0,
    hand: 'both',
    timestamp: Date.now(),
  });

  const [hands, setHands] = useState<HandData[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handsRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);
  const handPositionHistoryRef = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);
  const lastGestureRef = useRef<GestureType>('none');

  // Process video frame
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !handsRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = Date.now();
    if (now - lastUpdateRef.current < updateInterval) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }
    lastUpdateRef.current = now;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Detect hands using MediaPipe
      const results = await handsRef.current.detect({ image: canvas });
      
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const handDataArray: HandData[] = [];
        let detectedGesture: Gesture | null = null;

        results.multiHandLandmarks.forEach((landmarks: any[], index: number) => {
          const handedness = results.multiHandedness?.[index]?.label || 'Right';
          const confidence = results.multiHandedness?.[index]?.score || 0.5;
          
          // Track hand position for wave detection
          const wrist = landmarks[HAND_LANDMARKS.WRIST];
          const currentTime = Date.now();
          handPositionHistoryRef.current.push({
            x: wrist.x,
            y: wrist.y,
            timestamp: currentTime,
          });
          
          // Keep only last 10 positions (about 1 second of history at 10fps)
          if (handPositionHistoryRef.current.length > 10) {
            handPositionHistoryRef.current.shift();
          }
          
          let gestureType = detectGesture(landmarks, handedness);
          
          // Enhance wave detection with movement tracking
          if (gestureType === 'wave' || (gestureType === 'open_palm' && detectWaveFromMovement(handPositionHistoryRef.current))) {
            gestureType = 'wave';
          }
          
          handDataArray.push({
            landmarks: landmarks.map((lm: any) => ({ x: lm.x, y: lm.y, z: lm.z })),
            handedness: handedness as 'Left' | 'Right',
            confidence,
          });

          // Use the most confident gesture
          if (!detectedGesture || confidence > detectedGesture.confidence) {
            detectedGesture = {
              type: gestureType,
              confidence,
              hand: handedness === 'Left' ? 'left' : 'right',
              timestamp: Date.now(),
            };
          }
        });

        setHands(handDataArray);
        
        if (detectedGesture && detectedGesture.type !== 'none') {
          setGesture(detectedGesture);
          onGestureDetected?.(detectedGesture);
        } else {
          setGesture({
            type: 'none',
            confidence: 0,
            hand: 'both',
            timestamp: Date.now(),
          });
        }
      } else {
        setHands([]);
        setGesture({
          type: 'none',
          confidence: 0,
          hand: 'both',
          timestamp: Date.now(),
        });
        handPositionHistoryRef.current = [];
      }
    } catch (error) {
      console.error('Error processing hand tracking:', error);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [updateInterval, onGestureDetected]);

  // Initialize MediaPipe Hands
  const initializeMediaPipe = useCallback(async () => {
    if (isInitializedRef.current) return;

    try {
      let Hands: any;
      try {
        const mediapipeModule = '@mediapipe/hands';
        const dynamicImport = (path: string) => import(/* @vite-ignore */ path);
        const handsModule = await dynamicImport(mediapipeModule);
        Hands = handsModule.Hands || (handsModule as any).default?.Hands;
        
        if (!Hands) {
          throw new Error('Hands class not found');
        }
      } catch (importError) {
        console.warn('MediaPipe Hands not available. Gesture controls disabled.');
        console.warn('To enable gesture controls, install: npm install @mediapipe/hands @mediapipe/camera_utils');
        return;
      }

      const hands = new Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands,
        modelComplexity,
        minDetectionConfidence,
        minTrackingConfidence,
      });

      handsRef.current = hands;
      isInitializedRef.current = true;
    } catch (error) {
      console.error('Failed to initialize MediaPipe Hands:', error);
    }
  }, [modelComplexity, minDetectionConfidence, minTrackingConfidence, maxNumHands]);

  // Start hand tracking
  const start = useCallback(async () => {
    if (!enabled) return;

    try {
      await initializeMediaPipe();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        videoRef.current.onloadedmetadata = () => {
          processFrame();
        };
      }
    } catch (error) {
      console.error('Failed to access webcam for hand tracking:', error);
    }
  }, [enabled, initializeMediaPipe, processFrame]);

  // Stop hand tracking
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setHands([]);
    setGesture({
      type: 'none',
      confidence: 0,
      hand: 'both',
      timestamp: Date.now(),
    });
    handPositionHistoryRef.current = [];
    lastGestureRef.current = 'none';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    gesture,
    hands,
    start,
    stop,
    isActive: streamRef.current !== null,
    videoRef,
    canvasRef,
  };
}

