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

  function parseOffset(offset: number | string, dimension: number): number {
    if (typeof offset === 'string' && offset.endsWith('%')) {
      return (parseFloat(offset.replace('%', '')) / 100) * dimension;
    }
    return typeof offset === 'number' ? offset : parseFloat(String(offset)) || 0;
  }

  function setScaleAndPosition() {
    if (!modelRef.current) return;

    const offsetFactor = 2.2;
    const xOff = parseOffset(xOffset, width);
    const yOff = parseOffset(yOffset, height);

    const heightScale = (height * 0.95 / initialModelHeightRef.current * offsetFactor);
    const widthScale = (width * 0.95 / initialModelWidthRef.current * offsetFactor);
    const finalScale = Math.min(heightScale, widthScale) * scale;

    modelRef.current.scale.set(finalScale, finalScale);
    modelRef.current.x = (width / 2) + xOff;
    modelRef.current.y = height + yOff;
  }

  useEffect(() => {
    if (!app || loading) return;
    
    // If model already exists and modelSrc changed, destroy old model first
    if (modelRef.current) {
      app.stage.removeChild(modelRef.current);
      modelRef.current.destroy();
      modelRef.current = null;
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

        // Set up hit areas
        modelInstance.on('hit', (hitAreas) => {
          if (hitAreas.includes('body')) {
            modelInstance.motion('tap_body');
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
      if (modelRef.current && app) {
        app.stage.removeChild(modelRef.current);
        modelRef.current.destroy();
        modelRef.current = null;
      }
    };
  }, [app, modelSrc]); // Reload when app or modelSrc changes

  // Update scale and position when props change
  useEffect(() => {
    if (modelRef.current) {
      setScaleAndPosition();
    }
  }, [width, height, xOffset, yOffset, scale]);

  // Update focus
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
            // Head tilt based on emotion
            const headAngleX = emotionAnimation.headTilt * 15; // degrees
            coreModel.setParameterValueById('ParamAngleX', headAngleX);
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

