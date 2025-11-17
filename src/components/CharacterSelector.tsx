import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CharacterId = 'hiyori' | 'character2';

export interface Character {
  id: CharacterId;
  name: string;
  modelSrc: string;
  previewImage?: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'hiyori',
    name: 'Hiyori',
    modelSrc: '/assets/live2d/models/hiyori_pro_zh.zip',
    previewImage: '/assets/live2d/models/hiyori_pro_zh/character-preview.png',
  },
  {
    id: 'character2',
    name: 'Character 2',
    modelSrc: '/assets/live2d/models/hiyori_pro_zh.zip', // Using same model for now, can be changed later
    previewImage: '/assets/live2d/models/hiyori_pro_zh/character-preview.png',
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
    <div className={`flex items-center gap-2 ${className}`}>
      <Users className="w-4 h-4 text-foreground/70" />
      <div className="flex items-center gap-2 bg-card/30 backdrop-blur-md border border-border/50 rounded-lg p-1">
        {CHARACTERS.map((character) => (
          <Button
            key={character.id}
            variant={selectedCharacter === character.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onCharacterChange(character.id)}
            className="text-xs px-3 py-1 h-8"
          >
            {character.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

