// Facial expression detection using MediaPipe Face Mesh
import { useEffect, useRef, useState, useCallback } from 'react';
import { EmotionType, EmotionVector } from '@/utils/emotion-types';

interface UseFacialEmotionOptions {
  enabled?: boolean;
  modelComplexity?: 0 | 1 | 2;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  updateInterval?: number; // ms
}

// MediaPipe Face Mesh landmark indices for key facial features
const FACE_LANDMARKS = {
  LEFT_EYE: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  RIGHT_EYE: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
  MOUTH: [61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318],
  LEFT_EYEBROW: [107, 55, 65, 52, 53, 46],
  RIGHT_EYEBROW: [336, 296, 334, 293, 300, 276],
  NOSE: [1, 2, 5, 4, 6],
};

export function useFacialEmotion(options: UseFacialEmotionOptions = {}) {
  const {
    enabled = true,
    modelComplexity = 1,
    minDetectionConfidence = 0.5,
    minTrackingConfidence = 0.5,
    updateInterval = 100,
  } = options;

  const [emotion, setEmotion] = useState<EmotionVector>({
    emotion: 'neutral',
    intensity: 0,
    confidence: 0,
    timestamp: Date.now(),
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceMeshRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Calculate facial feature metrics from landmarks
  const calculateFacialMetrics = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return null;

    // Calculate eye aspect ratio (EAR) for blink detection
    const leftEyePoints = FACE_LANDMARKS.LEFT_EYE.map(i => landmarks[i]);
    const rightEyePoints = FACE_LANDMARKS.RIGHT_EYE.map(i => landmarks[i]);
    
    const calculateEAR = (points: any[]) => {
      if (points.length < 6) return 0;
      const vertical1 = Math.hypot(
        points[1].x - points[5].x,
        points[1].y - points[5].y
      );
      const vertical2 = Math.hypot(
        points[2].x - points[4].x,
        points[2].y - points[4].y
      );
      const horizontal = Math.hypot(
        points[0].x - points[3].x,
        points[0].y - points[3].y
      );
      return (vertical1 + vertical2) / (2 * horizontal);
    };

    const leftEAR = calculateEAR(leftEyePoints);
    const rightEAR = calculateEAR(rightEyePoints);
    const avgEAR = (leftEAR + rightEAR) / 2;

    // Calculate mouth aspect ratio (MAR) for expression
    const mouthPoints = FACE_LANDMARKS.MOUTH.map(i => landmarks[i]);
    const mouthWidth = Math.hypot(
      mouthPoints[0].x - mouthPoints[6].x,
      mouthPoints[0].y - mouthPoints[6].y
    );
    const mouthHeight = Math.hypot(
      mouthPoints[2].x - mouthPoints[10].x,
      mouthPoints[2].y - mouthPoints[10].y
    );
    const mar = mouthHeight / mouthWidth;

    // Calculate eyebrow position
    const leftEyebrowY = FACE_LANDMARKS.LEFT_EYEBROW.reduce((sum, i) => sum + landmarks[i].y, 0) / FACE_LANDMARKS.LEFT_EYEBROW.length;
    const rightEyebrowY = FACE_LANDMARKS.RIGHT_EYEBROW.reduce((sum, i) => sum + landmarks[i].y, 0) / FACE_LANDMARKS.RIGHT_EYEBROW.length;
    const eyeY = (leftEyePoints.reduce((sum, p) => sum + p.y, 0) + rightEyePoints.reduce((sum, p) => sum + p.y, 0)) / (leftEyePoints.length + rightEyePoints.length);
    const eyebrowPosition = ((leftEyebrowY + rightEyebrowY) / 2 - eyeY) / 0.1; // Normalized

    return {
      eyeAspectRatio: avgEAR,
      mouthAspectRatio: mar,
      eyebrowPosition,
      isBlinking: avgEAR < 0.2,
      mouthOpen: mar > 0.3,
    };
  }, []);

  // Classify emotion from facial metrics
  const classifyEmotion = useCallback((metrics: any): EmotionVector => {
    if (!metrics) {
      return {
        emotion: 'neutral',
        intensity: 0,
        confidence: 0,
        timestamp: Date.now(),
      };
    }

    const { eyeAspectRatio, mouthAspectRatio, eyebrowPosition, isBlinking, mouthOpen } = metrics;

    let emotion: EmotionType = 'neutral';
    let intensity = 0;
    let confidence = 0.5;

    // Rule-based emotion classification from facial features
    if (mouthOpen && mouthAspectRatio > 0.5 && eyebrowPosition > 0.3) {
      emotion = 'surprised';
      intensity = Math.min(1, mouthAspectRatio * 1.5);
      confidence = 0.7;
    } else if (mouthAspectRatio > 0.4 && eyebrowPosition > 0.1) {
      emotion = 'happy';
      intensity = Math.min(1, mouthAspectRatio * 2);
      confidence = 0.65;
    } else if (mouthAspectRatio < 0.2 && eyebrowPosition < -0.2) {
      emotion = 'sad';
      intensity = Math.min(1, (0.2 - mouthAspectRatio) * 3 + Math.abs(eyebrowPosition));
      confidence = 0.6;
    } else if (mouthAspectRatio > 0.3 && eyebrowPosition < -0.3) {
      emotion = 'angry';
      intensity = Math.min(1, mouthAspectRatio + Math.abs(eyebrowPosition));
      confidence = 0.65;
    } else if (mouthAspectRatio < 0.15 && eyebrowPosition > 0.2) {
      emotion = 'thoughtful';
      intensity = 0.4;
      confidence = 0.55;
    } else if (mouthAspectRatio < 0.2 && eyebrowPosition > -0.1 && eyebrowPosition < 0.1) {
      emotion = 'calm';
      intensity = 0.3;
      confidence = 0.5;
    }

    return {
      emotion,
      intensity: Math.max(0, Math.min(1, intensity)),
      confidence: Math.max(0.3, Math.min(1, confidence)),
      timestamp: Date.now(),
    };
  }, []);

  // Process video frame
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !faceMeshRef.current || !canvasRef.current) {
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

      // Detect faces using MediaPipe
      const results = await faceMeshRef.current.detect({ image: canvas });
      
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const metrics = calculateFacialMetrics(landmarks);
        const newEmotion = classifyEmotion(metrics);
        setEmotion(newEmotion);
      } else {
        setEmotion({
          emotion: 'neutral',
          intensity: 0,
          confidence: 0,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error processing facial emotion:', error);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [calculateFacialMetrics, classifyEmotion, updateInterval]);

  // Initialize MediaPipe Face Mesh
  const initializeMediaPipe = useCallback(async () => {
    if (isInitializedRef.current) return;

    try {
      // Dynamically import MediaPipe (optional dependency)
      // Use runtime string-based import to prevent Vite static analysis
      let FaceMesh: any;
      try {
        // Use window to check if MediaPipe is available, or try dynamic import
        // This prevents Vite from analyzing the import at build time
        const mediapipeModule = '@mediapipe/face_mesh';
        
        // Try to import - if it fails, facial detection will be disabled
        // Using Function constructor prevents Vite from analyzing this
        const dynamicImport = (path: string) => import(/* @vite-ignore */ path);
        const faceMeshModule = await dynamicImport(mediapipeModule);
        FaceMesh = faceMeshModule.FaceMesh || (faceMeshModule as any).default?.FaceMesh;
        
        if (!FaceMesh) {
          throw new Error('FaceMesh class not found');
        }
      } catch (importError) {
        // MediaPipe not installed - facial emotion detection disabled
        console.warn('MediaPipe Face Mesh not available. Facial emotion detection disabled.');
        console.warn('To enable facial recognition, install: npm install @mediapipe/face_mesh @mediapipe/camera_utils');
        return;
      }

      const faceMesh = new FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence,
        minTrackingConfidence,
        modelComplexity,
      });

      faceMeshRef.current = faceMesh;
      isInitializedRef.current = true;
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
      // Fallback: facial emotion detection will be disabled
    }
  }, [modelComplexity, minDetectionConfidence, minTrackingConfidence]);

  // Start facial emotion recognition
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
      console.error('Failed to access webcam for facial emotion recognition:', error);
    }
  }, [enabled, initializeMediaPipe, processFrame]);

  // Stop facial emotion recognition
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

    setEmotion({
      emotion: 'neutral',
      intensity: 0,
      confidence: 0,
      timestamp: Date.now(),
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    emotion,
    start,
    stop,
    isActive: streamRef.current !== null,
    videoRef,
    canvasRef,
  };
}

