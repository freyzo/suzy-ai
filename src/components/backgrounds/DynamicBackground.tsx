// Dynamic background that changes based on emotion and environment
import { useEffect, useState } from 'react';
import { EmotionType } from '@/utils/emotion-types';
import { SceneType, SCENE_CONFIGS } from '@/utils/environment-types';
import SceneBackgrounds from './SceneBackgrounds';

interface DynamicBackgroundProps {
  emotion?: EmotionType;
  scene?: SceneType;
  children?: React.ReactNode;
}

export default function DynamicBackground({
  emotion = 'neutral',
  scene,
  children,
}: DynamicBackgroundProps) {
  const [currentScene, setCurrentScene] = useState<SceneType>(scene || 'forest');
  const [transitionProgress, setTransitionProgress] = useState(1);

  useEffect(() => {
    // Always use the provided scene (no emotion-based auto-switching to prevent jumping)
    if (scene && scene !== currentScene) {
      setTransitionProgress(0);
      const duration = 5000; // 5 seconds for smoother, longer transition
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        setTransitionProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCurrentScene(scene);
          setTransitionProgress(1);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [scene, currentScene]);

  const sceneConfig = SCENE_CONFIGS[currentScene];

  // For forest scenes, use the fairy background images
  const isForestScene = currentScene === 'forest' || currentScene === 'forest2';
  const forestImage = currentScene === 'forest' ? '/fairy-forest.png' : '/fairy1-forest.png';
  
  // Create background style
  const backgroundStyle = isForestScene ? {
    backgroundImage: `url("${forestImage}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    transition: 'background-image 5s ease-in-out',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    width: '100vw',
    height: '100vh',
  } : {
    background: `linear-gradient(135deg, ${sceneConfig.gradientColors.join(', ')})`,
    transition: 'background 5s ease-in-out',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    width: '100vw',
    height: '100vh',
  };

  return (
    <div style={backgroundStyle}>
      {/* Scene-specific visual elements (only for non-forest scenes) */}
      {!isForestScene && <SceneBackgrounds scene={currentScene} />}
      
      <div className="relative z-[1] w-full h-full">
        {children}
      </div>
    </div>
  );
}

