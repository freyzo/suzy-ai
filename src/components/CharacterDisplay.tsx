import { useState } from 'react';
import Screen from './Live2D/Screen';
import Live2DCanvas from './Live2D/Live2DCanvas';
import Live2DModelComponent from './Live2D/Live2DModel';
import { CharacterId, CHARACTERS } from './CharacterSelector';

type HairColor = 'original' | 'platinum-blonde' | 'blonde' | 'brown' | 'black' | 'red' | 'pink' | 'blue' | 'purple' | 'green';

interface CharacterDisplayProps {
  paused?: boolean;
  focusAt?: { x: number; y: number };
  xOffset?: number | string;
  yOffset?: number | string;
  scale?: number;
  mouthOpenSize?: number;
  characterId?: CharacterId;
}

function getHairColorFilter(color: string): string {
  const filters: Record<string, string> = {
    'platinum-blonde': 'hue-rotate(120deg) saturate(0.1) brightness(3.5) contrast(1.5) sepia(0.8)',
    'blonde': 'hue-rotate(45deg) saturate(1.2) brightness(1.3)',
    'brown': 'hue-rotate(15deg) saturate(0.8) brightness(0.7)',
    'black': 'brightness(0.3) saturate(0.5)',
    'red': 'hue-rotate(-30deg) saturate(1.5) brightness(1.1)',
    'pink': 'hue-rotate(300deg) saturate(1.3) brightness(1.2)',
    'blue': 'hue-rotate(200deg) saturate(1.4) brightness(1.1)',
    'purple': 'hue-rotate(270deg) saturate(1.2) brightness(1.0)',
    'green': 'hue-rotate(120deg) saturate(1.3) brightness(1.1)',
  };
  return filters[color] || 'none';
}

export default function CharacterDisplay({
  paused = false,
  focusAt = { x: 0, y: 0 },
  xOffset = 0,
  yOffset = 0,
  scale = 1,
  mouthOpenSize = 0,
  characterId = 'hiyori',
}: CharacterDisplayProps) {
  const [hairColor, setHairColor] = useState<HairColor>('original');
  const [useLive2D, setUseLive2D] = useState(true);
  const [modelLoadError, setModelLoadError] = useState(false);
  
  // Get character model source
  const character = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];
  const modelSrc = character.modelSrc;

  const toggleHairColor = () => {
    const colors: HairColor[] = ['original', 'platinum-blonde', 'blonde', 'brown', 'black', 'red', 'pink', 'blue', 'purple', 'green'];
    const currentIndex = colors.indexOf(hairColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    setHairColor(colors[nextIndex]);
  };

  return (
    <div
      className="character-container flex-1 min-w-[50%] h-full w-full relative max-md:min-w-full touch-manipulation min-h-0 min-w-0"
      style={{
        filter: hairColor === 'original' ? 'none' : getHairColorFilter(hairColor),
        transition: 'filter 0.3s ease',
        mixBlendMode: hairColor === 'platinum-blonde' ? 'color-dodge' : 'normal',
      }}
      onClick={toggleHairColor}
    >
      {useLive2D && !modelLoadError ? (
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
                  onModelLoaded={() => {
                    console.log('Live2D model loaded:', character.name);
                    setUseLive2D(true);
                    setModelLoadError(false);
                  }}
                  onModelError={() => {
                    console.warn('Live2D model failed to load, falling back to static image');
                    setModelLoadError(true);
                    setUseLive2D(false);
                  }}
                />
              )}
            </Live2DCanvas>
          )}
        </Screen>
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
      {/* Platinum blonde overlay */}
      {hairColor === 'platinum-blonde' && (
        <div className="platinum-overlay" />
      )}
    </div>
  );
}

