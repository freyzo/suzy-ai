// VRM Model Component (React version converted from Vue)
import { useEffect, useRef, useState } from 'react';
import type { Group } from 'three';
import { AnimationMixer, Mesh, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import { useFrame } from '@react-three/fiber';

import { clipFromVRMAnimation, loadVRMAnimation, useBlink, useIdleEyeSaccades } from '@/utils/vrm-animation';
import { loadVrm } from '@/utils/vrm-core';
import { useVRMEmote } from '@/utils/vrm-expression';

interface VRMModelProps {
  modelSrc?: string;
  modelFile?: File | null;
  idleAnimation?: string;
  paused?: boolean;
  lookAtTarget?: { x: number; y: number; z: number };
  emotion?: string;
  onLoadProgress?: (progress: number) => void;
  onModelReady?: () => void;
  onError?: (error: unknown) => void;
}

export default function VRMModel({
  modelSrc,
  modelFile,
  idleAnimation = '/assets/vrm/animations/idle_loop.vrma',
  paused = false,
  lookAtTarget = { x: 0, y: 0, z: -1000 },
  emotion,
  onLoadProgress,
  onModelReady,
  onError,
}: VRMModelProps) {
  const groupRef = useRef<Group>(null);
  const vrmRef = useRef<any | null>(null);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const blinkRef = useRef(useBlink());
  const idleEyeSaccadesRef = useRef(useIdleEyeSaccades());
  const vrmEmoteRef = useRef<ReturnType<typeof useVRMEmote> | null>(null);
  
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelCreating, setModelCreating] = useState(false);

  // Get normalized model source (file URL or string URL)
  const getModelSrc = () => {
    if (modelFile) {
      return URL.createObjectURL(modelFile);
    }
    return modelSrc || '';
  };

  useEffect(() => {
    let isMounted = true;
    const modelSrcNormalized = getModelSrc();

    async function loadModel() {
      if (!modelSrcNormalized || modelCreating) return;
      
      setModelCreating(true);
      setModelLoaded(false);

      try {
        // Check if VRM loader is available
        if (typeof window === 'undefined') return;
        
        const vrmInfo = await loadVrm(modelSrcNormalized, {
          lookAt: true,
          onProgress: (progress) => {
            const percent = (100 * progress.loaded / progress.total);
            onLoadProgress?.(Number(percent.toFixed(2)));
          },
        });

        if (!isMounted || !vrmInfo || !vrmInfo._vrm || !groupRef.current) {
          return;
        }

        const {
          _vrm,
          _vrmGroup,
        } = vrmInfo;

        vrmRef.current = _vrm;
        
        // Add VRM group to the React Three Fiber group
        groupRef.current.add(_vrmGroup);

        // Load and play idle animation (optional)
        if (idleAnimation) {
          try {
            const animation = await loadVRMAnimation(idleAnimation);
            const clip = await clipFromVRMAnimation(_vrm, animation);
            
            if (clip && mixerRef.current) {
              mixerRef.current.clipAction(clip).play();
            } else if (clip) {
              mixerRef.current = new AnimationMixer(_vrm.scene);
              mixerRef.current.clipAction(clip).play();
            }
          } catch (err) {
            // Animation is optional, just log a warning
            console.warn('VRM idle animation not available (this is optional):', err);
          }
        }

        // Set material properties
        _vrm.scene.traverse((child) => {
          if (child instanceof Mesh && child.material) {
            const material = Array.isArray(child.material) ? child.material : [child.material];
            material.forEach((mat) => {
              if (mat instanceof MeshStandardMaterial || mat instanceof MeshPhysicalMaterial) {
                mat.envMapIntensity = 1.0;
                mat.needsUpdate = true;
              }
            });
          }
        });

        // Initialize VRM emotion system
        vrmEmoteRef.current = useVRMEmote(_vrm);

        setModelLoaded(true);
        onModelReady?.();
      } catch (err) {
        console.error('Failed to load VRM model:', err);
        onError?.(err);
      } finally {
        if (isMounted) {
          setModelCreating(false);
        }
      }
    }

    loadModel();

    return () => {
      isMounted = false;
      // Cleanup
      if (vrmRef.current && groupRef.current) {
        try {
          const { VRMUtils } = require('@pixiv/three-vrm');
          VRMUtils.deepDispose(vrmRef.current.scene);
          vrmRef.current.scene.removeFromParent();
        } catch (e) {
          console.warn('Error disposing VRM:', e);
        }
      }
      if (modelFile) {
        URL.revokeObjectURL(getModelSrc());
      }
    };
  }, [modelSrc, modelFile]);

  // Update emotion when it changes
  useEffect(() => {
    if (emotion && vrmEmoteRef.current && modelLoaded) {
      vrmEmoteRef.current.setEmotion(emotion);
    }
  }, [emotion, modelLoaded]);

  // Animation loop
  useFrame((state, delta) => {
    if (paused || !vrmRef.current) return;

    // Update animation mixer
    mixerRef.current?.update(delta);

    // Update VRM
    vrmRef.current.update(delta);
    vrmRef.current.lookAt?.update?.(delta);

    // Update blink
    blinkRef.current.update(vrmRef.current, delta);

    // Update eye saccades
    idleEyeSaccadesRef.current.update(vrmRef.current, lookAtTarget, delta);

    // Update VRM emotion expressions
    vrmEmoteRef.current?.update(delta);
  });

  return <group ref={groupRef} />;
}

