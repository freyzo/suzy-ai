// Outfit and accessory selector component
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CharacterId } from './CharacterSelector';
import {
  Outfit,
  OutfitCategory,
  getOutfitsForCharacter,
  getOutfitsByCategory,
  DEFAULT_OUTFIT_SETS,
} from '@/utils/outfit-types';
import { outfitManager } from '@/utils/outfit-manager';
import { Shirt, Sparkles, Palette, Scissors } from 'lucide-react';

interface OutfitSelectorProps {
  characterId: CharacterId;
  onOutfitChange?: (outfitIds: string[]) => void;
  className?: string;
}

const CATEGORY_ICONS: Record<OutfitCategory, React.ReactNode> = {
  outfit: <Shirt className="w-4 h-4" />,
  accessory: <Sparkles className="w-4 h-4" />,
  hair: <Scissors className="w-4 h-4" />,
  color: <Palette className="w-4 h-4" />,
  expression: <Sparkles className="w-4 h-4" />,
};

export default function OutfitSelector({
  characterId,
  onOutfitChange,
  className = '',
}: OutfitSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<OutfitCategory>('outfit');
  const appliedOutfits = outfitManager.getAppliedOutfits(characterId);
  const appliedOutfitIds = appliedOutfits?.outfitIds || [];

  const outfits = getOutfitsForCharacter(characterId);
  const categoryOutfits = getOutfitsByCategory(characterId, selectedCategory);

  const handleOutfitToggle = (outfitId: string) => {
    const isApplied = appliedOutfitIds.includes(outfitId);
    
    if (isApplied) {
      outfitManager.removeOutfit(characterId, outfitId);
    } else {
      outfitManager.applyOutfit(characterId, outfitId);
    }

    const updated = outfitManager.getAppliedOutfits(characterId);
    onOutfitChange?.(updated?.outfitIds || []);
  };

  const handleOutfitSetApply = (outfitSet: typeof DEFAULT_OUTFIT_SETS[0]) => {
    outfitManager.clearOutfits(characterId);
    outfitManager.applyOutfitSet(characterId, outfitSet.outfits);
    
    const updated = outfitManager.getAppliedOutfits(characterId);
    onOutfitChange?.(updated?.outfitIds || []);
  };

  const categories: OutfitCategory[] = ['outfit', 'accessory', 'hair', 'color'];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label>Outfits & Accessories</Label>
        
        {/* Outfit Sets */}
        {DEFAULT_OUTFIT_SETS.filter(set => 
          set.characterId === characterId || set.characterId === 'all'
        ).length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-foreground/70">Outfit Sets</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_OUTFIT_SETS
                .filter(set => set.characterId === characterId || set.characterId === 'all')
                .map(set => (
                  <Button
                    key={set.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleOutfitSetApply(set)}
                    className="text-xs"
                  >
                    {set.name}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as OutfitCategory)}>
          <TabsList className="grid w-full grid-cols-4">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {CATEGORY_ICONS[category]}
                <span className="ml-1 capitalize">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-2">
              <ScrollArea className="h-[200px]">
                <div className="grid grid-cols-2 gap-2 pr-4">
                  {getOutfitsByCategory(characterId, category).map(outfit => {
                    const isSelected = appliedOutfitIds.includes(outfit.id);
                    return (
                      <Button
                        key={outfit.id}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleOutfitToggle(outfit.id)}
                        className="h-auto flex-col gap-1 p-2 text-xs"
                      >
                        {outfit.previewImage ? (
                          <img
                            src={outfit.previewImage}
                            alt={outfit.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            {CATEGORY_ICONS[category]}
                          </div>
                        )}
                        <span className="text-[10px]">{outfit.name}</span>
                      </Button>
                    );
                  })}
                  {getOutfitsByCategory(characterId, category).length === 0 && (
                    <div className="col-span-2 text-center text-xs text-foreground/50 py-4">
                      No {category} available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        {/* Applied Outfits Summary */}
        {appliedOutfitIds.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-xs text-foreground/70">Applied</Label>
            <div className="flex flex-wrap gap-1">
              {appliedOutfitIds.map(outfitId => {
                const outfit = outfits.find(o => o.id === outfitId);
                if (!outfit) return null;
                return (
                  <Button
                    key={outfitId}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOutfitToggle(outfitId)}
                    className="text-xs h-6 px-2"
                  >
                    {outfit.name} ×
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


