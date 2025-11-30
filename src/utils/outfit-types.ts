// Outfit and accessory system types
import { CharacterId } from '@/components/CharacterSelector';

export type OutfitCategory = 'outfit' | 'accessory' | 'hair' | 'expression' | 'color';

export interface Outfit {
  id: string;
  name: string;
  category: OutfitCategory;
  characterId: CharacterId | 'all'; // 'all' means available for all characters
  previewImage?: string;
  description?: string;
  
  // Live2D specific
  live2dParams?: Record<string, number>; // Parameter name -> value mapping
  live2dMotion?: string; // Motion file path
  
  // VRM specific
  vrmMaterialOverrides?: {
    materialName: string;
    texturePath?: string;
    color?: string;
    metallic?: number;
    roughness?: number;
  }[];
  
  // Universal (for accessories that overlay)
  overlayImage?: string;
  overlayPosition?: { x: number; y: number; scale: number };
  
  // Color tint (for simple color changes)
  colorTint?: string;
}

export interface OutfitSet {
  id: string;
  name: string;
  characterId: CharacterId | 'all';
  outfits: string[]; // Array of outfit IDs
  previewImage?: string;
}

// Default outfits library
export const DEFAULT_OUTFITS: Outfit[] = [
  // Hiyori outfits
  {
    id: 'hiyori-default',
    name: 'Default Outfit',
    category: 'outfit',
    characterId: 'hiyori',
    description: 'Hiyori\'s default outfit',
  },
  {
    id: 'hiyori-casual',
    name: 'Casual',
    category: 'outfit',
    characterId: 'hiyori',
    description: 'Casual everyday outfit',
    live2dParams: {
      'ParamBodyAngleX': 0,
      'ParamBodyAngleY': 0,
      'ParamBodyAngleZ': 0,
    },
    colorTint: '#E8F4F8',
  },
  {
    id: 'hiyori-formal',
    name: 'Formal',
    category: 'outfit',
    characterId: 'hiyori',
    description: 'Formal attire',
    colorTint: '#F5F5F5',
  },
  
  // Accessories
  {
    id: 'glasses',
    name: 'Glasses',
    category: 'accessory',
    characterId: 'all',
    description: 'Stylish glasses',
    overlayImage: '/assets/accessories/glasses.png',
    overlayPosition: { x: 0, y: 0, scale: 1 },
  },
  {
    id: 'hat',
    name: 'Hat',
    category: 'accessory',
    characterId: 'all',
    description: 'Casual hat',
    overlayImage: '/assets/accessories/hat.png',
    overlayPosition: { x: 0, y: -50, scale: 1.2 },
  },
  
  // Hair styles (via Live2D parameters)
  {
    id: 'hair-default',
    name: 'Default Hair',
    category: 'hair',
    characterId: 'all',
    description: 'Default hair style',
  },
  {
    id: 'hair-short',
    name: 'Short Hair',
    category: 'hair',
    characterId: 'all',
    description: 'Short hair style',
    live2dParams: {
      'ParamHairFront': 0.5,
    },
  },
  
  // Color themes
  {
    id: 'color-warm',
    name: 'Warm Colors',
    category: 'color',
    characterId: 'all',
    description: 'Warm color palette',
    colorTint: '#FFE5CC',
  },
  {
    id: 'color-cool',
    name: 'Cool Colors',
    category: 'color',
    characterId: 'all',
    description: 'Cool color palette',
    colorTint: '#CCE5FF',
  },
  {
    id: 'color-vibrant',
    name: 'Vibrant',
    category: 'color',
    characterId: 'all',
    description: 'Vibrant color palette',
    colorTint: '#FFCCE5',
  },
];

export const DEFAULT_OUTFIT_SETS: OutfitSet[] = [
  {
    id: 'hiyori-casual-set',
    name: 'Casual Set',
    characterId: 'hiyori',
    outfits: ['hiyori-casual', 'hair-default'],
  },
  {
    id: 'hiyori-formal-set',
    name: 'Formal Set',
    characterId: 'hiyori',
    outfits: ['hiyori-formal', 'hair-default'],
  },
];

// Get outfits for a specific character
export function getOutfitsForCharacter(characterId: CharacterId): Outfit[] {
  return DEFAULT_OUTFITS.filter(
    outfit => outfit.characterId === characterId || outfit.characterId === 'all'
  );
}

// Get outfits by category
export function getOutfitsByCategory(
  characterId: CharacterId,
  category: OutfitCategory
): Outfit[] {
  return getOutfitsForCharacter(characterId).filter(
    outfit => outfit.category === category
  );
}

// Get outfit by ID
export function getOutfitById(outfitId: string): Outfit | undefined {
  return DEFAULT_OUTFITS.find(outfit => outfit.id === outfitId);
}


