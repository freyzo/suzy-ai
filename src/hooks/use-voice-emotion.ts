// Voice emotion recognition using Web Audio API and audio feature analysis
import { useEffect, useRef, useState, useCallback } from 'react';
import { EmotionType, EmotionVector } from '@/utils/emotion-types';

interface VoiceFeatures {
  pitch: number; // Hz
  energy: number; // 0-1
  spectralCentroid: number; // Hz
  zeroCrossingRate: number; // 0-1
  mfcc: number[]; // Mel-frequency cepstral coefficients (simplified)
}

interface UseVoiceEmotionOptions {
  enabled?: boolean;
  sampleRate?: number;
  bufferSize?: number;
  updateInterval?: number; // ms
}

export function useVoiceEmotion(options: UseVoiceEmotionOptions = {}) {
  const {
    enabled = true,
    sampleRate = 44100,
    bufferSize = 2048,
    updateInterval = 100,
  } = options;

  const [emotion, setEmotion] = useState<EmotionVector>({
    emotion: 'neutral',
    intensity: 0,
    confidence: 0,
    timestamp: Date.now(),
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Extract audio features from audio buffer
  const extractFeatures = useCallback((audioData: Float32Array): VoiceFeatures => {
    const length = audioData.length;
    
    // Calculate pitch using autocorrelation
    let maxCorrelation = 0;
    let pitch = 0;
    const minPeriod = Math.floor(sampleRate / 800); // Max 800Hz
    const maxPeriod = Math.floor(sampleRate / 80); // Min 80Hz

    for (let lag = minPeriod; lag < maxPeriod && lag < length / 2; lag++) {
      let correlation = 0;
      for (let i = 0; i < length - lag; i++) {
        correlation += audioData[i] * audioData[i + lag];
      }
      correlation /= length - lag;
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        pitch = sampleRate / lag;
      }
    }

    // Calculate energy (RMS)
    let energy = 0;
    for (let i = 0; i < length; i++) {
      energy += audioData[i] * audioData[i];
    }
    energy = Math.sqrt(energy / length);

    // Calculate spectral centroid
    const fftSize = analyserRef.current?.fftSize || 2048;
    const fftData = new Float32Array(fftSize);
    if (analyserRef.current) {
      analyserRef.current.getFloatTimeDomainData(fftData);
    }
    
    let spectralCentroid = 0;
    let magnitudeSum = 0;
    for (let i = 0; i < fftSize / 2; i++) {
      const frequency = (i * sampleRate) / fftSize;
      const magnitude = Math.abs(fftData[i] || 0);
      spectralCentroid += frequency * magnitude;
      magnitudeSum += magnitude;
    }
    spectralCentroid = magnitudeSum > 0 ? spectralCentroid / magnitudeSum : 0;

    // Calculate zero crossing rate
    let zeroCrossings = 0;
    for (let i = 1; i < length; i++) {
      if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zeroCrossingRate = zeroCrossings / length;

    // Simplified MFCC (using spectral features as proxy)
    const mfcc: number[] = [];
    for (let i = 0; i < 13; i++) {
      mfcc.push(Math.random() * 0.1); // Placeholder - would need proper MFCC calculation
    }

    return {
      pitch,
      energy,
      spectralCentroid,
      zeroCrossingRate,
      mfcc,
    };
  }, [sampleRate]);

  // Classify emotion from audio features using rule-based approach
  // In production, this would use a trained ML model
  const classifyEmotion = useCallback((features: VoiceFeatures): EmotionVector => {
    const { pitch, energy, spectralCentroid, zeroCrossingRate } = features;

    let emotion: EmotionType = 'neutral';
    let intensity = 0;
    let confidence = 0.5;

    // Rule-based emotion classification
    // High pitch + high energy = excited/happy
    if (pitch > 200 && energy > 0.3) {
      emotion = energy > 0.5 ? 'excited' : 'happy';
      intensity = Math.min(1, (pitch - 150) / 200 + energy);
      confidence = 0.7;
    }
    // Low pitch + low energy = sad/calm
    else if (pitch < 120 && energy < 0.2) {
      emotion = energy < 0.1 ? 'sad' : 'calm';
      intensity = Math.min(1, (120 - pitch) / 100 + (0.2 - energy));
      confidence = 0.6;
    }
    // High energy + high spectral centroid = angry/surprised
    else if (energy > 0.4 && spectralCentroid > 2000) {
      emotion = pitch > 180 ? 'surprised' : 'angry';
      intensity = Math.min(1, energy + (spectralCentroid - 1500) / 2000);
      confidence = 0.65;
    }
    // Medium pitch + medium energy = neutral/thoughtful
    else if (pitch > 120 && pitch < 180 && energy > 0.1 && energy < 0.3) {
      emotion = zeroCrossingRate > 0.1 ? 'thoughtful' : 'neutral';
      intensity = 0.3;
      confidence = 0.5;
    }
    // High zero crossing rate = confused/excited
    else if (zeroCrossingRate > 0.15) {
      emotion = energy > 0.3 ? 'excited' : 'confused';
      intensity = Math.min(1, zeroCrossingRate * 5);
      confidence = 0.55;
    }

    return {
      emotion,
      intensity: Math.max(0, Math.min(1, intensity)),
      confidence: Math.max(0.3, Math.min(1, confidence)),
      timestamp: Date.now(),
    };
  }, []);

  // Process audio stream
  const processAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const now = Date.now();
    if (now - lastUpdateRef.current < updateInterval) {
      animationFrameRef.current = requestAnimationFrame(processAudio);
      return;
    }
    lastUpdateRef.current = now;

    analyserRef.current.getFloatTimeDomainData(dataArrayRef.current);
    
    const features = extractFeatures(dataArrayRef.current);
    const newEmotion = classifyEmotion(features);
    
    setEmotion(newEmotion);
    
    animationFrameRef.current = requestAnimationFrame(processAudio);
  }, [extractFeatures, classifyEmotion, updateInterval]);

  // Initialize audio context and analyser
  const initializeAudio = useCallback(async (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext({ sampleRate });
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = bufferSize;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Float32Array(analyser.fftSize);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      dataArrayRef.current = dataArray;
      streamRef.current = stream;

      processAudio();
    } catch (error) {
      console.error('Failed to initialize audio analysis:', error);
    }
  }, [sampleRate, bufferSize, processAudio]);

  // Start emotion recognition
  const start = useCallback(async () => {
    if (!enabled) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await initializeAudio(stream);
    } catch (error) {
      console.error('Failed to access microphone for emotion recognition:', error);
    }
  }, [enabled, initializeAudio]);

  // Stop emotion recognition
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;

    setEmotion({
      emotion: 'neutral',
      intensity: 0,
      confidence: 0,
      timestamp: Date.now(),
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    emotion,
    start,
    stop,
    isActive: audioContextRef.current !== null,
  };
}


