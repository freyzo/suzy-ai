// VRM Scene Component (React version)
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ACESFilmicToneMapping } from 'three';
import { useState, useEffect } from 'react';
import VRMModel from './VRMModel';
import { EmotionAnimation } from '@/utils/emotion-types';

interface VRMSceneProps {
  modelSrc?: string;
  modelFile?: File | null;
  paused?: boolean;
  focusAt?: { x: number; y: number };
  emotionAnimation?: EmotionAnimation;
  onModelReady?: () => void;
  onError?: (error: unknown) => void;
}

export default function VRMScene({
  modelSrc,
  modelFile,
  paused = false,
  focusAt = { x: 0, y: 0 },
  emotionAnimation,
  onModelReady,
  onError,
}: VRMSceneProps) {
  const [lookAtTarget, setLookAtTarget] = useState({ x: 0, y: 0, z: -1000 });

  // Update look at target based on focusAt (mouse position)
  useEffect(() => {
    if (focusAt) {
      // Convert screen coordinates to 3D world coordinates
      // Simple approximation: map mouse position to a plane in front of camera
      const normalizedX = (focusAt.x / window.innerWidth) * 2 - 1;
      const normalizedY = -(focusAt.y / window.innerHeight) * 2 + 1;
      
      setLookAtTarget({
        x: normalizedX * 0.5,
        y: normalizedY * 0.5 + 1.5, // Offset for character height
        z: -2,
      });
    }
  }, [focusAt]);

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, -1], fov: 40 }}
        gl={{ 
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={5}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} color="#FFFFFF" />
        <directionalLight 
          position={[0, 0, -10]} 
          intensity={2.02} 
          color="#fffbf5"
          castShadow
        />
        <hemisphereLight
          position={[0, 0, 0]}
          intensity={0.4}
          skyColor="#FFFFFF"
          groundColor="#000000"
        />

        {/* VRM Model */}
        <VRMModel
          modelSrc={modelSrc}
          modelFile={modelFile}
          idleAnimation="/assets/vrm/animations/idle_loop.vrma"
          paused={paused}
          lookAtTarget={lookAtTarget}
          onModelReady={onModelReady}
          onError={onError}
        />
      </Canvas>
    </div>
  );
}

