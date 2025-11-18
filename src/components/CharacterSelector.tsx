import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CharacterId = 'hiyori' | 'character2' | 'vrm-character';
export type CharacterType = 'live2d' | 'vrm';

export interface Character {
  id: CharacterId;
  name: string;
  type: CharacterType;
  modelSrc: string;
  previewImage?: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'hiyori',
    name: 'Hiyori',
    type: 'live2d',
    modelSrc: '/assets/live2d/models/hiyori_pro_zh.zip',
    previewImage: '/assets/live2d/models/hiyori_pro_zh/character-preview.png',
  },
  {
    id: 'character2',
    name: 'Character 2',
    type: 'live2d',
    modelSrc: '/assets/live2d/models/hiyori_pro_zh.zip', // Using same model for now, can be changed later
    previewImage: '/assets/live2d/models/hiyori_pro_zh/character-preview.png',
  },
  {
    id: 'vrm-character',
    name: 'VRM Character',
    type: 'vrm',
    modelSrc: '/assets/vrm/models/AvatarSample-B/AvatarSample_B.vrm', // Default VRM model path
    previewImage: undefined,
  },
];

interface CharacterSelectorProps {
  selectedCharacter: CharacterId;
  onCharacterChange: (characterId: CharacterId) => void;
  className?: string;
}

export default function CharacterSelector({
  selectedCharacter,
  onCharacterChange,
  className = '',
}: CharacterSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className} max-md:gap-1`}>
      <Users className="w-4 h-4 text-foreground/70 max-md:w-3 max-md:h-3" />
      <div className="flex items-center gap-2 bg-card/30 backdrop-blur-md border border-border/50 rounded-lg p-1 max-md:gap-1 max-md:p-0.5">
        {CHARACTERS.map((character) => (
          <Button
            key={character.id}
            variant={selectedCharacter === character.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onCharacterChange(character.id)}
            className="text-xs px-3 py-1 h-8 max-md:text-[10px] max-md:px-2 max-md:py-0.5 max-md:h-7 touch-manipulation min-h-[44px] min-w-[44px] max-md:min-h-[36px] max-md:min-w-[36px]"
          >
            {character.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

