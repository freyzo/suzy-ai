// Background selector component for manual scene selection
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { SceneType, SCENE_CONFIGS } from "@/utils/environment-types";

interface BackgroundSelectorProps {
  selectedScene: SceneType;
  onSceneChange: (scene: SceneType) => void;
  className?: string;
}

const SCENE_NAMES: Record<SceneType, string> = {
  office: 'Office',
  cafe: 'Cafe',
  studio: 'Studio',
  nature: 'Nature',
  forest: 'Forest',
  forest2: 'Forest 2',
  space: 'Space',
  ocean: 'Ocean',
};

export default function BackgroundSelector({
  selectedScene,
  onSceneChange,
  className = '',
}: BackgroundSelectorProps) {
  return (
    <div className={`flex flex-col items-end gap-2 ${className} max-md:gap-1`}>
      <div className="flex flex-col gap-2 bg-card/30 backdrop-blur-md border border-border/50 rounded-lg p-1 max-md:gap-1 max-md:p-0.5 overflow-y-auto max-h-[calc(100vh-8rem)]">
        {Object.keys(SCENE_CONFIGS).map((scene) => {
          const sceneKey = scene as SceneType;
          const config = SCENE_CONFIGS[sceneKey];
          return (
            <Button
              key={sceneKey}
              variant={selectedScene === sceneKey ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSceneChange(sceneKey)}
              className="text-xs px-3 py-1 h-8 w-full max-md:text-[10px] max-md:px-2 max-md:py-0.5 max-md:h-7 touch-manipulation min-h-[44px] max-md:min-h-[36px] whitespace-nowrap"
              style={{
                backgroundColor: selectedScene === sceneKey 
                  ? config.gradientColors[0] 
                  : undefined,
                borderColor: selectedScene === sceneKey 
                  ? config.particleColors[0] 
                  : undefined,
              }}
            >
              {SCENE_NAMES[sceneKey]}
            </Button>
          );
        })}
      </div>
      <Palette className="w-4 h-4 text-foreground/70 max-md:w-3 max-md:h-3" />
    </div>
  );
}


