import { useState, lazy, Suspense, useEffect } from 'react';
import Screen from './Live2D/Screen';
import Live2DCanvas from './Live2D/Live2DCanvas';
import Live2DModelComponent from './Live2D/Live2DModel';
import { CharacterId, CHARACTERS } from './CharacterSelector';
import { EmotionAnimation } from '@/utils/emotion-types';

// Lazy load VRM components to prevent breaking if VRM dependencies fail
const VRMScene = lazy(() => 
  import('./VRM/VRMScene').catch((error) => {
    console.warn('VRM Scene not available:', error);
    return { 
      default: () => (
        <div className="w-full h-full flex items-center justify-center text-foreground/50">
          <div className="text-center">
            <p className="text-sm">3D Character not available</p>
            <p className="text-xs mt-2">Please use Live2D characters</p>
          </div>
        </div>
      )
    };
  })
);

interface CharacterDisplayProps {
  paused?: boolean;
  focusAt?: { x: number; y: number };
  xOffset?: number | string;
  yOffset?: number | string;
  scale?: number;
  mouthOpenSize?: number;
  characterId?: CharacterId;
  emotionAnimation?: EmotionAnimation;
}

export default function CharacterDisplay({
  paused = false,
  focusAt = { x: 0, y: 0 },
  xOffset = 0,
  yOffset = 0,
  scale = 1,
  mouthOpenSize = 0,
  characterId = 'hiyori',
  emotionAnimation,
}: CharacterDisplayProps) {
  const [useLive2D, setUseLive2D] = useState(true);
  const [modelLoadError, setModelLoadError] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  
  // Get character model source
  const character = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];
  const modelSrc = character.modelSrc;
  const isVRM = character.type === 'vrm';
  
  // Reset loading state when character changes
  useEffect(() => {
    setIsModelLoading(true);
    setModelLoadError(false);
  }, [characterId]);

  return (
    <div
      className="character-container flex-1 min-w-[50%] h-full w-full relative max-md:min-w-full touch-manipulation min-h-0 min-w-0"
      style={{
        boxShadow: emotionAnimation?.colorTint 
          ? `0 0 50px ${emotionAnimation.colorTint}` 
          : undefined,
      }}
    >
      {isVRM ? (
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-foreground/50">Loading 3D character...</div>}>
          <VRMScene
            modelSrc={modelSrc}
            paused={paused}
            focusAt={focusAt}
            emotionAnimation={emotionAnimation}
            onModelReady={() => {
              console.log('VRM model loaded:', character.name);
            }}
            onError={(error) => {
              console.error('VRM model failed to load:', error);
            }}
          />
        </Suspense>
      ) : useLive2D && !modelLoadError ? (
        <>
          {/* Show fallback image while loading */}
          {isModelLoading && (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden min-h-[200px] min-w-[200px] z-0">
              <div 
                className="relative w-full h-full flex items-end justify-center" 
                style={{
                  transform: typeof xOffset === 'string' 
                    ? `translateX(${xOffset}) translateY(${typeof yOffset === 'string' ? yOffset : `${yOffset}px`})` 
                    : `translateX(${xOffset}px) translateY(${typeof yOffset === 'string' ? yOffset : `${yOffset}px`})`,
                }}
              >
                <img
                  src="/assets/live2d/models/hiyori_free_zh/avatar.png"
                  alt="Suzy Character"
                  className="w-auto h-[95vh] max-h-[95vh] max-w-[50vw] max-md:max-w-[90vw] max-md:h-[80vh] object-contain object-bottom pointer-events-auto select-none z-10 opacity-50"
                  style={{
                    imageRendering: 'auto',
                    transform: `scale(${scale})`,
                    minHeight: '200px',
                    maxHeight: '100%',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
          <Screen key={characterId}>
            {(width, height) => (
              <Live2DCanvas width={width} height={height} resolution={2}>
                {(app) => (
                  <Live2DModelComponent
                    key={characterId}
                    app={app}
                    modelSrc={modelSrc}
                    width={width}
                    height={height}
                    paused={paused}
                    focusAt={focusAt}
                    xOffset={xOffset}
                    yOffset={yOffset}
                    scale={scale}
                    mouthOpenSize={mouthOpenSize}
                    emotionAnimation={emotionAnimation}
                    onModelLoaded={() => {
                      console.log('Live2D model loaded:', character.name);
                      setIsModelLoading(false);
                      setUseLive2D(true);
                      setModelLoadError(false);
                    }}
                    onModelError={() => {
                      console.warn('Live2D model failed to load, falling back to static image');
                      setIsModelLoading(false);
                      setModelLoadError(true);
                      setUseLive2D(false);
                    }}
                  />
                )}
              </Live2DCanvas>
            )}
          </Screen>
        </>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden min-h-[200px] min-w-[200px]">
          <div 
            className="relative w-full h-full flex items-end justify-center" 
            style={{
              transform: typeof xOffset === 'string' 
                ? `translateX(${xOffset}) translateY(${typeof yOffset === 'string' ? yOffset : `${yOffset}px`})` 
                : `translateX(${xOffset}px) translateY(${typeof yOffset === 'string' ? yOffset : `${yOffset}px`})`,
            }}
          >
            <img
              src="/assets/live2d/models/hiyori_free_zh/avatar.png"
              alt="Suzy Character"
              className="w-auto h-[95vh] max-h-[95vh] max-w-[50vw] max-md:max-w-[90vw] max-md:h-[80vh] object-contain object-bottom pointer-events-auto select-none z-10"
              style={{
                imageRendering: 'auto',
                transform: `scale(${scale})`,
                minHeight: '200px',
                maxHeight: '100%',
              }}
              onError={(e) => {
                console.error('Failed to load character image');
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

