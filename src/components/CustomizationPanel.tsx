import { useState } from 'react';
import { X, Upload, Settings, Palette, Volume2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CharacterId } from './CharacterSelector';
import { SceneType } from '@/utils/environment-types';
import { UserPreferences, savePreferences, loadPreferences } from '@/utils/user-preferences';

interface CustomizationPanelProps {
  selectedCharacter: CharacterId;
  selectedScene: SceneType | null;
  onCharacterChange: (characterId: CharacterId) => void;
  onSceneChange: (scene: SceneType) => void;
  onPreferencesChange?: (preferences: Partial<UserPreferences>) => void;
}

export default function CustomizationPanel({
  selectedCharacter,
  selectedScene,
  onCharacterChange,
  onSceneChange,
  onPreferencesChange,
}: CustomizationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences());
  const [uploadingModel, setUploadingModel] = useState(false);

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    savePreferences({ [key]: value });
    onPreferencesChange?.(updated);
  };

  const handleModelUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'live2d' | 'vrm') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingModel(true);
    try {
      // In a real implementation, you would upload to a storage service
      // For now, we'll use local storage or IndexedDB
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          // Store model data (simplified - in production, use proper storage)
          const modelKey = `custom-${type}-${Date.now()}`;
          localStorage.setItem(modelKey, JSON.stringify({
            name: file.name,
            type,
            data: result,
            uploadedAt: Date.now(),
          }));
          
          // TODO: Integrate with character system
          console.log('Model uploaded:', modelKey);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload model:', error);
    } finally {
      setUploadingModel(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customization & Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="character" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="character">Character</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          <TabsContent value="character" className="space-y-4">
            <div className="space-y-2">
              <Label>Character</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedCharacter === 'hiyori' ? 'default' : 'outline'}
                  onClick={() => onCharacterChange('hiyori')}
                >
                  Hiyori
                </Button>
                <Button
                  variant={selectedCharacter === 'character2' ? 'default' : 'outline'}
                  onClick={() => onCharacterChange('character2')}
                >
                  Character 2
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Scene</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['office', 'cafe', 'studio', 'nature', 'forest', 'space', 'ocean'] as SceneType[]).map((scene) => (
                  <Button
                    key={scene}
                    variant={selectedScene === scene ? 'default' : 'outline'}
                    onClick={() => onSceneChange(scene)}
                    className="capitalize"
                  >
                    {scene}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Master Volume</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(preferences.volume * 100)}%</span>
                </div>
                <Slider
                  value={[preferences.volume]}
                  onValueChange={([value]) => handlePreferenceChange('volume', value)}
                  max={1}
                  step={0.01}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Music Volume</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(preferences.musicVolume * 100)}%</span>
                </div>
                <Slider
                  value={[preferences.musicVolume]}
                  onValueChange={([value]) => handlePreferenceChange('musicVolume', value)}
                  max={1}
                  step={0.01}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Sound Effects Volume</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(preferences.soundEffectsVolume * 100)}%</span>
                </div>
                <Slider
                  value={[preferences.soundEffectsVolume]}
                  onValueChange={([value]) => handlePreferenceChange('soundEffectsVolume', value)}
                  max={1}
                  step={0.01}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ambient-sounds">Ambient Sounds</Label>
                <Switch
                  id="ambient-sounds"
                  checked={preferences.ambientSoundsEnabled}
                  onCheckedChange={(checked) => handlePreferenceChange('ambientSoundsEnabled', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-scene">Auto Scene Change</Label>
                <Switch
                  id="auto-scene"
                  checked={preferences.autoSceneChange}
                  onCheckedChange={(checked) => handlePreferenceChange('autoSceneChange', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="emotion-indicator">Show Emotion Indicator</Label>
                <Switch
                  id="emotion-indicator"
                  checked={preferences.showEmotionIndicator}
                  onCheckedChange={(checked) => handlePreferenceChange('showEmotionIndicator', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="audio-visualizer">Show Audio Visualizer</Label>
                <Switch
                  id="audio-visualizer"
                  checked={preferences.showAudioVisualizer}
                  onCheckedChange={(checked) => handlePreferenceChange('showAudioVisualizer', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Live2D Model</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".zip,.moc3"
                    onChange={(e) => handleModelUpload(e, 'live2d')}
                    className="hidden"
                    id="live2d-upload"
                    disabled={uploadingModel}
                  />
                  <Label htmlFor="live2d-upload" asChild>
                    <Button variant="outline" disabled={uploadingModel} className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingModel ? 'Uploading...' : 'Choose Live2D Model'}
                    </Button>
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload VRM Model</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".vrm"
                    onChange={(e) => handleModelUpload(e, 'vrm')}
                    className="hidden"
                    id="vrm-upload"
                    disabled={uploadingModel}
                  />
                  <Label htmlFor="vrm-upload" asChild>
                    <Button variant="outline" disabled={uploadingModel} className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingModel ? 'Uploading...' : 'Choose VRM Model'}
                    </Button>
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

