// Outfit manager - handles applying outfits and accessories to characters
import { Outfit, getOutfitById } from './outfit-types';
import { CharacterId } from '@/components/CharacterSelector';

export interface AppliedOutfit {
  characterId: CharacterId;
  outfitIds: string[]; // Array of outfit IDs currently applied
  outfits: Outfit[]; // Resolved outfit objects
}

export class OutfitManager {
  private appliedOutfits: Map<CharacterId, AppliedOutfit> = new Map();

  // Apply an outfit to a character
  applyOutfit(characterId: CharacterId, outfitId: string): void {
    const outfit = getOutfitById(outfitId);
    if (!outfit) {
      console.warn(`Outfit not found: ${outfitId}`);
      return;
    }

    const current = this.appliedOutfits.get(characterId) || {
      characterId,
      outfitIds: [],
      outfits: [],
    };

    // Remove existing outfit of the same category
    const filteredOutfits = current.outfits.filter(
      o => o.category !== outfit.category
    );
    const filteredIds = filteredOutfits.map(o => o.id);

    // Add new outfit
    const updated: AppliedOutfit = {
      characterId,
      outfitIds: [...filteredIds, outfitId],
      outfits: [...filteredOutfits, outfit],
    };

    this.appliedOutfits.set(characterId, updated);
  }

  // Remove an outfit
  removeOutfit(characterId: CharacterId, outfitId: string): void {
    const current = this.appliedOutfits.get(characterId);
    if (!current) return;

    const updated: AppliedOutfit = {
      characterId,
      outfitIds: current.outfitIds.filter(id => id !== outfitId),
      outfits: current.outfits.filter(o => o.id !== outfitId),
    };

    if (updated.outfitIds.length === 0) {
      this.appliedOutfits.delete(characterId);
    } else {
      this.appliedOutfits.set(characterId, updated);
    }
  }

  // Apply multiple outfits (outfit set)
  applyOutfitSet(characterId: CharacterId, outfitIds: string[]): void {
    outfitIds.forEach(outfitId => {
      this.applyOutfit(characterId, outfitId);
    });
  }

  // Clear all outfits for a character
  clearOutfits(characterId: CharacterId): void {
    this.appliedOutfits.delete(characterId);
  }

  // Get applied outfits for a character
  getAppliedOutfits(characterId: CharacterId): AppliedOutfit | null {
    return this.appliedOutfits.get(characterId) || null;
  }

  // Get Live2D parameters from applied outfits
  getLive2DParams(characterId: CharacterId): Record<string, number> {
    const applied = this.getAppliedOutfits(characterId);
    if (!applied) return {};

    const params: Record<string, number> = {};
    applied.outfits.forEach(outfit => {
      if (outfit.live2dParams) {
        Object.assign(params, outfit.live2dParams);
      }
    });

    return params;
  }

  // Get color tint from applied outfits
  getColorTint(characterId: CharacterId): string | undefined {
    const applied = this.getAppliedOutfits(characterId);
    if (!applied) return undefined;

    // Get the most recent color outfit
    const colorOutfit = applied.outfits
      .filter(o => o.category === 'color')
      .pop();

    return colorOutfit?.colorTint;
  }

  // Get overlay accessories
  getOverlayAccessories(characterId: CharacterId): Outfit[] {
    const applied = this.getAppliedOutfits(characterId);
    if (!applied) return [];

    return applied.outfits.filter(
      outfit => outfit.category === 'accessory' && outfit.overlayImage
    );
  }

  // Get VRM material overrides
  getVRMMaterialOverrides(characterId: CharacterId): Outfit['vrmMaterialOverrides'] {
    const applied = this.getAppliedOutfits(characterId);
    if (!applied) return undefined;

    const overrides: Outfit['vrmMaterialOverrides'] = [];
    applied.outfits.forEach(outfit => {
      if (outfit.vrmMaterialOverrides) {
        overrides.push(...outfit.vrmMaterialOverrides);
      }
    });

    return overrides.length > 0 ? overrides : undefined;
  }
}

// Singleton instance
export const outfitManager = new OutfitManager();


