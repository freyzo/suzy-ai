import type { Application } from '@pixi/app';
import { Live2DFactory, Live2DModel, MotionPriority } from 'pixi-live2d-display/cubism4';
import { useEffect, useRef, useState } from 'react';
import '../../utils/live2d-zip-loader';

import { EmotionAnimation } from '@/utils/emotion-types';

interface Live2DModelProps {
  app: Application;
  modelSrc?: string;
  modelFile?: File | null;
  width: number;
  height: number;
  paused?: boolean;
  focusAt?: { x: number; y: number };
  disableFocusAt?: boolean;
  xOffset?: number | string;
  yOffset?: number | string;
  scale?: number;
  mouthOpenSize?: number;
  emotionAnimation?: EmotionAnimation;
  onModelLoaded?: () => void;
  onModelError?: () => void;
}

export default function Live2DModelComponent({
  app,
  modelSrc = '/assets/live2d/models/hiyori_pro_zh.zip',
  modelFile,
  width,
  height,
  paused = false,
  focusAt = { x: 0, y: 0 },
  disableFocusAt = false,
  xOffset = 0,
  yOffset = 0,
  scale = 1,
  mouthOpenSize = 0,
  emotionAnimation,
  onModelLoaded,
  onModelError,
}: Live2DModelProps) {
  const modelRef = useRef<Live2DModel | null>(null);
  const [loading, setLoading] = useState(false);
  const initialModelWidthRef = useRef(0);
  const initialModelHeightRef = useRef(0);
  const walkingRef = useRef({
    isWalking: false,
    walkPhase: 0, // 0 = idle, 1 = walking left, 2 = walking back
    walkProgress: 0,
    lastWalkTime: Date.now(),
    baseXOffset: 0,
    currentXOffset: 0
  });
  
  // Expose walk function to parent via ref (for manual triggering)
  const walkTriggerRef = useRef<(() => void) | null>(null);

  function parseOffset(offset: number | string, dimension: number): number {
    if (typeof offset === 'string' && offset.endsWith('%')) {
      return (parseFloat(offset.replace('%', '')) / 100) * dimension;
    }
    return typeof offset === 'number' ? offset : parseFloat(String(offset)) || 0;
  }

  function setScaleAndPosition() {
    if (!modelRef.current) return;

    const offsetFactor = 2.2;
    // Use walking offset if walking, otherwise use prop xOffset
    const effectiveXOffset = walkingRef.current.isWalking 
      ? walkingRef.current.currentXOffset 
      : parseOffset(xOffset, width);
    const yOff = parseOffset(yOffset, height);

    const heightScale = (height * 0.95 / initialModelHeightRef.current * offsetFactor);
    const widthScale = (width * 0.95 / initialModelWidthRef.current * offsetFactor);
    const finalScale = Math.min(heightScale, widthScale) * scale;

    modelRef.current.scale.set(finalScale, finalScale);
    modelRef.current.x = (width / 2) + effectiveXOffset;
    modelRef.current.y = height + yOff;
  }

  useEffect(() => {
    if (!app || loading) return;
    
    // If model already exists and modelSrc changed, destroy old model first
    if (modelRef.current && app && app.stage) {
      try {
        // Check if model is still a child of the stage before removing
        if (app.stage.children.includes(modelRef.current)) {
          app.stage.removeChild(modelRef.current);
        }
        modelRef.current.destroy();
      } catch (error) {
        console.warn('Error removing old Live2D model:', error);
      } finally {
        modelRef.current = null;
      }
    }

    async function loadModel() {
      setLoading(true);
      try {
        // Check if Live2D SDK is loaded
        if (typeof window !== 'undefined' && !(window as any).Live2DCubismCore) {
          console.warn('Live2D SDK not loaded. Make sure the script is included in index.html');
          setLoading(false);
          onModelError?.();
          return;
        }

        const modelInstance = new Live2DModel();
        
        if (modelFile) {
          await Live2DFactory.setupLive2DModel(modelInstance, [modelFile], { autoInteract: false });
        } else if (modelSrc) {
          await Live2DFactory.setupLive2DModel(modelInstance, modelSrc, { autoInteract: false });
        } else {
          console.warn('No Live2D model source provided');
          setLoading(false);
          onModelError?.();
          return;
        }

        modelRef.current = modelInstance;
        app.stage.addChild(modelInstance);
        
        initialModelWidthRef.current = modelInstance.width;
        initialModelHeightRef.current = modelInstance.height;
        modelInstance.anchor.set(0.5, 0.5);
        
        setScaleAndPosition();

        // Set up hit areas - click to trigger walking
        modelInstance.on('hit', (hitAreas) => {
          if (hitAreas.includes('body')) {
            modelInstance.motion('tap_body');
            // Also trigger walking when clicked (after a short delay)
            setTimeout(() => {
              if (walkTriggerRef.current && !walkingRef.current.isWalking) {
                walkTriggerRef.current();
              }
            }, 300); // Small delay to let tap_body motion play
          }
        });

        // Set mouth open size
        const coreModel = (modelInstance.internalModel as any).coreModel;
        if (coreModel) {
          coreModel.setParameterValueById('ParamMouthOpenY', mouthOpenSize);
        }

        onModelLoaded?.();
      } catch (error) {
        console.error('Failed to load Live2D model:', error);
        onModelError?.();
      } finally {
        setLoading(false);
      }
    }

    loadModel();

    return () => {
      if (modelRef.current && app && app.stage) {
        try {
          // Check if model is still a child of the stage before removing
          if (app.stage.children.includes(modelRef.current)) {
            app.stage.removeChild(modelRef.current);
          }
          modelRef.current.destroy();
        } catch (error) {
          console.warn('Error cleaning up Live2D model:', error);
        } finally {
          modelRef.current = null;
        }
      }
    };
  }, [app, modelSrc]); // Reload when app or modelSrc changes

  // Update scale and position when props change
  useEffect(() => {
    if (modelRef.current) {
      setScaleAndPosition();
    }
  }, [width, height, xOffset, yOffset, scale]);

  // Dynamic head movement - turn left/right naturally like Grok companions
  const headMovementRef = useRef({ 
    phase: 0, 
    targetAngle: 0, 
    currentAngle: 0, 
    baseTilt: 0,
    lastIdleMotion: Date.now(),
    idleMotionPhase: 0
  });
  
  useEffect(() => {
    if (!modelRef.current) return;
    
    let animationFrame: number;
    let lastTime = 0;
    
    const animateHead = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = Math.min(currentTime - lastTime, 33); // Cap at 33ms
      lastTime = currentTime;
      
      const coreModel = (modelRef.current?.internalModel as any)?.coreModel;
      if (!coreModel) {
        animationFrame = requestAnimationFrame(animateHead);
        return;
      }
      
      const movement = headMovementRef.current;
      movement.phase += deltaTime * 0.0006; // Slower, more natural movement
      movement.idleMotionPhase += deltaTime;
      
      // Generate smooth left/right head turns (like Grok companions)
      const baseAngle = Math.sin(movement.phase) * 10; // -10 to +10 degrees (wider range)
      const randomDrift = Math.sin(movement.phase * 0.25) * 4; // Additional slow drift
      movement.targetAngle = baseAngle + randomDrift;
      
      // Smooth interpolation to target angle
      movement.currentAngle += (movement.targetAngle - movement.currentAngle) * 0.03; // Slower interpolation
      
      // Apply mouse focus if enabled, otherwise use idle movement
      if (!disableFocusAt && focusAt.x !== 0 && focusAt.y !== 0) {
        // Convert mouse position to head angle (-20 to +20 degrees)
        const normalizedX = (focusAt.x / window.innerWidth) * 2 - 1; // -1 to 1
        const mouseAngle = normalizedX * 20;
        movement.currentAngle += (mouseAngle - movement.currentAngle) * 0.08; // Slower mouse follow
      }
      
      // Periodic idle motions (like Grok companions) - subtle body shifts every 8-12 seconds
      const timeSinceLastMotion = currentTime - movement.lastIdleMotion;
      if (timeSinceLastMotion > 8000 + Math.random() * 4000) {
        movement.lastIdleMotion = currentTime;
        movement.idleMotionPhase = 0;
      }
      
      try {
        // Head rotation (left/right) - natural turning like Grok companions
        coreModel.setParameterValueById('ParamAngleZ', movement.currentAngle);
        
        // Subtle head tilt based on movement (will be blended with emotion in mouth effect)
        const tilt = Math.sin(movement.phase * 0.4) * 2.5; // Slightly more tilt
        // Store base tilt for blending with emotion animations
        headMovementRef.current.baseTilt = tilt;
        
        // Body sway (subtle left/right movement) - makes it feel alive
        let bodySway = Math.sin(movement.phase * 0.3) * 2; // Increased sway
        
        // Periodic idle motion - subtle shifts
        if (movement.idleMotionPhase < 2000) {
          const idleIntensity = Math.sin((movement.idleMotionPhase / 2000) * Math.PI);
          const idleShift = idleIntensity * 3;
          bodySway += idleShift;
        }
        
        coreModel.setParameterValueById('ParamBodyAngleZ', bodySway);
        
        // Subtle body angle Y (forward/backward lean) - breathing-like
        const bodyLean = Math.sin(movement.phase * 0.25) * 1.5;
        coreModel.setParameterValueById('ParamBodyAngleY', bodyLean);
      } catch (e) {
        // Parameters might not exist, ignore
      }
      
      animationFrame = requestAnimationFrame(animateHead);
    };
    
    animationFrame = requestAnimationFrame(animateHead);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [disableFocusAt, focusAt]);
  
  // Walking animation - walk left then back
  useEffect(() => {
    if (!modelRef.current || paused) return;
    
    let animationFrame: number;
    let lastTime = 0;
    
    const animateWalking = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = Math.min(currentTime - lastTime, 33);
      lastTime = currentTime;
      
      const walking = walkingRef.current;
      const timeSinceLastWalk = currentTime - walking.lastWalkTime;
      
      // Function to start walking (can be called manually)
      const startWalking = () => {
        if (!walking.isWalking) {
          walking.isWalking = true;
          walking.walkPhase = 1; // Start walking left
          walking.walkProgress = 0;
          walking.baseXOffset = parseOffset(xOffset, width);
          
          // Trigger walking motion if available
          try {
            const walkMotions = ['walk', 'walk_left', 'idle_01', 'idle_02'];
            for (const motionName of walkMotions) {
              try {
                modelRef.current?.motion(motionName, MotionPriority.NORMAL);
                break; // Use first available motion
              } catch (e) {
                // Try next motion
              }
            }
          } catch (e) {
            // No walking motion available, that's okay
          }
        }
      };
      
      // Expose walk function for manual triggering
      walkTriggerRef.current = startWalking;
      
      // Start walking automatically every 10-15 seconds (more frequent)
      if (!walking.isWalking && timeSinceLastWalk > 10000 + Math.random() * 5000) {
        startWalking();
      }
      
      if (walking.isWalking) {
        walking.walkProgress += deltaTime;
        const walkDuration = 2000; // 2 seconds to walk left
        const returnDuration = 2000; // 2 seconds to walk back
        
        if (walking.walkPhase === 1) {
          // Walking left
          const progress = Math.min(walking.walkProgress / walkDuration, 1);
          const easeProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2; // Ease in-out
          
          const walkDistance = -width * 0.15; // Walk 15% of screen width to the left
          walking.currentXOffset = walking.baseXOffset + (walkDistance * easeProgress);
          
          if (progress >= 1) {
            walking.walkPhase = 2;
            walking.walkProgress = 0;
          }
        } else if (walking.walkPhase === 2) {
          // Walking back
          const progress = Math.min(walking.walkProgress / returnDuration, 1);
          const easeProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2; // Ease in-out
          
          const walkDistance = -width * 0.15;
          walking.currentXOffset = walking.baseXOffset + (walkDistance * (1 - easeProgress));
          
          if (progress >= 1) {
            // Finished walking, reset
            walking.isWalking = false;
            walking.walkPhase = 0;
            walking.walkProgress = 0;
            walking.currentXOffset = walking.baseXOffset;
            walking.lastWalkTime = currentTime;
          }
        }
        
        // Update position
        setScaleAndPosition();
      }
      
      animationFrame = requestAnimationFrame(animateWalking);
    };
    
    animationFrame = requestAnimationFrame(animateWalking);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [paused, xOffset, width, height]);
  
  // Update focus (keep for compatibility)
  useEffect(() => {
    if (modelRef.current && !disableFocusAt) {
      modelRef.current.focus(focusAt.x, focusAt.y);
    }
  }, [focusAt, disableFocusAt]);

  // Update mouth with smooth interpolation
  useEffect(() => {
    if (modelRef.current) {
      const coreModel = (modelRef.current.internalModel as any).coreModel;
      if (coreModel) {
        // Use emotion animation if provided, otherwise use mouthOpenSize
        const finalMouthSize = emotionAnimation?.mouthOpenSize ?? mouthOpenSize;
        
        // Set main mouth open parameter
        coreModel.setParameterValueById('ParamMouthOpenY', finalMouthSize);
        
        // Apply emotion-based parameters
        if (emotionAnimation) {
          try {
            // Mouth form (smile/frown) based on emotion
            const mouthForm = emotionAnimation.eyebrowPosition * 0.5;
            coreModel.setParameterValueById('ParamMouthForm', mouthForm);
          } catch (e) {
            // Parameter might not exist, ignore
          }
          
          try {
            // Head tilt based on emotion (combined with dynamic movement)
            const emotionTilt = emotionAnimation.headTilt * 15; // degrees
            // Blend emotion tilt with dynamic base tilt
            const baseTilt = headMovementRef.current.baseTilt || 0;
            const blendedTilt = emotionTilt * 0.6 + baseTilt * 0.4; // Blend emotion with dynamic movement
            coreModel.setParameterValueById('ParamAngleX', blendedTilt);
          } catch (e) {
            // Parameter might not exist, ignore
          }
          
          try {
            // Eyebrow position based on emotion
            const eyebrowY = emotionAnimation.eyebrowPosition * 0.5;
            coreModel.setParameterValueById('ParamBrowLY', eyebrowY);
            coreModel.setParameterValueById('ParamBrowRY', eyebrowY);
          } catch (e) {
            // Parameter might not exist, ignore
          }
          
          // Trigger emotion-based motion if available
          if (emotionAnimation.bodyMotion && modelRef.current) {
            try {
              modelRef.current.motion(emotionAnimation.bodyMotion, MotionPriority.NORMAL);
            } catch (e) {
              // Motion might not exist, ignore
            }
          }
        } else {
          // Fallback to original behavior
          try {
            const mouthForm = Math.sin(mouthOpenSize * 0.1) * 0.3;
            coreModel.setParameterValueById('ParamMouthForm', mouthForm);
          } catch (e) {
            // Parameter might not exist, ignore
          }
          
          try {
            const mouthShape = Math.cos(mouthOpenSize * 0.15) * 0.2;
            coreModel.setParameterValueById('ParamMouthShape', mouthShape);
          } catch (e) {
            // Parameter might not exist, ignore
          }
        }
      }
    }
  }, [mouthOpenSize, emotionAnimation]);

  // Handle pause
  useEffect(() => {
    if (paused) {
      app.stop();
    } else {
      app.start();
    }
  }, [paused, app]);

  return null;
}

