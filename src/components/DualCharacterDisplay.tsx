// Dual Character Display Component
// Supports displaying two characters side by side (Live2D + VRM or two VRM characters)
import { useState } from 'react';
import CharacterDisplay from './CharacterDisplay';
import VRMScene from './VRM/VRMScene';
import { CharacterId, CHARACTERS } from './CharacterSelector';
import { EmotionAnimation } from '@/utils/emotion-types';

interface DualCharacterDisplayProps {
  character1Id: CharacterId;
  character2Id?: CharacterId;
  paused?: boolean;
  focusAt?: { x: number; y: number };
  emotionAnimation?: EmotionAnimation;
  onCharacter1Change?: (characterId: CharacterId) => void;
  onCharacter2Change?: (characterId: CharacterId) => void;
}

export default function DualCharacterDisplay({
  character1Id,
  character2Id,
  paused = false,
  focusAt = { x: 0, y: 0 },
  emotionAnimation,
  onCharacter1Change,
  onCharacter2Change,
}: DualCharacterDisplayProps) {
  const [activeCharacter, setActiveCharacter] = useState<'character1' | 'character2'>('character1');

  const character1 = CHARACTERS.find(c => c.id === character1Id) || CHARACTERS[0];
  const character2 = character2Id ? CHARACTERS.find(c => c.id === character2Id) : null;

  // Split focus point for dual characters
  const character1Focus = {
    x: focusAt.x - window.innerWidth * 0.25, // Offset left
    y: focusAt.y,
  };
  const character2Focus = {
    x: focusAt.x + window.innerWidth * 0.25, // Offset right
    y: focusAt.y,
  };

  return (
    <div className="relative w-full h-full flex flex-row gap-2 max-md:flex-col">
      {/* Character 1 */}
      <div className="flex-1 min-w-0 h-full relative overflow-hidden">
        <CharacterDisplay
          paused={paused}
          focusAt={character1Focus}
          xOffset={-5}
          yOffset={0}
          scale={character2 ? 0.85 : 1}
          characterId={character1Id}
          emotionAnimation={emotionAnimation}
        />
      </div>

      {/* Character 2 (if provided) */}
      {character2 && (
        <div className="flex-1 min-w-0 h-full relative overflow-hidden">
          {character2.type === 'vrm' ? (
            <VRMScene
              modelSrc={character2.modelSrc}
              paused={paused}
              focusAt={character2Focus}
              emotionAnimation={emotionAnimation}
              emotion={emotionAnimation?.emotion}
              onModelReady={() => console.log('Character 2 (VRM) loaded')}
            />
          ) : (
            <CharacterDisplay
              paused={paused}
              focusAt={character2Focus}
              xOffset={5}
              yOffset={0}
              scale={0.85}
              characterId={character2.id}
              emotionAnimation={emotionAnimation}
            />
          )}
        </div>
      )}

      {/* Character switching UI overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        <button
          onClick={() => {
            setActiveCharacter('character1');
            onCharacter1Change?.(character1Id);
          }}
          className={`px-4 py-2 rounded-lg backdrop-blur-md border transition-all ${
            activeCharacter === 'character1'
              ? 'bg-card/60 border-border'
              : 'bg-card/30 border-border/50'
          }`}
        >
          <span className="text-sm text-foreground">{character1.name}</span>
        </button>
        {character2 && (
          <button
            onClick={() => {
              setActiveCharacter('character2');
              onCharacter2Change?.(character2.id);
            }}
            className={`px-4 py-2 rounded-lg backdrop-blur-md border transition-all ${
              activeCharacter === 'character2'
                ? 'bg-card/60 border-border'
                : 'bg-card/30 border-border/50'
            }`}
          >
            <span className="text-sm text-foreground">{character2.name}</span>
          </button>
        )}
      </div>
    </div>
  );
}

