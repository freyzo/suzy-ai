import { useState, useEffect, useRef, useCallback } from 'react';
import { SceneType } from '@/utils/environment-types';

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  loop?: boolean;
}

export interface SoundEffect {
  id: string;
  name: string;
  url: string;
}

// Ambient sounds for each scene
const AMBIENT_SOUNDS: Record<SceneType, string[]> = {
  office: [],
  cafe: [],
  studio: [],
  nature: [],
  forest: [],
  forest2: [],
  space: [],
  ocean: [],
};

export function useAudioSystem() {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [soundEffectsVolume, setSoundEffectsVolume] = useState(0.7);
  const [ambientSoundsEnabled, setAmbientSoundsEnabled] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [currentScene, setCurrentScene] = useState<SceneType>('forest');

  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const soundEffectAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Initialize music audio
  useEffect(() => {
    if (currentTrack && musicEnabled) {
      const audio = new Audio(currentTrack.url);
      audio.loop = currentTrack.loop ?? true;
      audio.volume = musicVolume;
      audio.play().catch(console.error);
      musicAudioRef.current = audio;

      return () => {
        audio.pause();
        audio.src = '';
      };
    } else if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current = null;
    }
  }, [currentTrack, musicEnabled, musicVolume]);

  // Update music volume
  useEffect(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Ambient sounds for scenes
  useEffect(() => {
    if (!ambientSoundsEnabled) {
      ambientAudioRefs.current.forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      ambientAudioRefs.current.clear();
      return;
    }

    const sounds = AMBIENT_SOUNDS[currentScene];
    sounds.forEach((soundUrl) => {
      if (!ambientAudioRefs.current.has(soundUrl)) {
        const audio = new Audio(soundUrl);
        audio.loop = true;
        audio.volume = 0.3;
        audio.play().catch(console.error);
        ambientAudioRefs.current.set(soundUrl, audio);
      }
    });

    // Stop sounds not in current scene
    ambientAudioRefs.current.forEach((audio, url) => {
      if (!sounds.includes(url)) {
        audio.pause();
        audio.src = '';
        ambientAudioRefs.current.delete(url);
      }
    });
  }, [currentScene, ambientSoundsEnabled]);

  const playSoundEffect = useCallback((effect: SoundEffect) => {
    if (!soundEffectsEnabled) return;

    let audio = soundEffectAudioRefs.current.get(effect.id);
    if (!audio) {
      audio = new Audio(effect.url);
      audio.volume = soundEffectsVolume;
      soundEffectAudioRefs.current.set(effect.id, audio);
    }

    audio.currentTime = 0;
    audio.play().catch(console.error);
  }, [soundEffectsEnabled, soundEffectsVolume]);

  const playMusic = useCallback((track: AudioTrack) => {
    setCurrentTrack(track);
    setMusicEnabled(true);
  }, []);

  const stopMusic = useCallback(() => {
    setMusicEnabled(false);
    setCurrentTrack(null);
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicEnabled((prev) => !prev);
  }, []);

  return {
    musicEnabled,
    musicVolume,
    soundEffectsEnabled,
    soundEffectsVolume,
    ambientSoundsEnabled,
    currentTrack,
    setMusicVolume,
    setSoundEffectsVolume,
    setSoundEffectsEnabled,
    setAmbientSoundsEnabled,
    setCurrentScene,
    playMusic,
    stopMusic,
    toggleMusic,
    playSoundEffect,
  };
}



