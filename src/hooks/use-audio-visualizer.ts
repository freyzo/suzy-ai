// Real-time audio spectrum analysis for voice visualization
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAudioVisualizerOptions {
  enabled?: boolean;
  fftSize?: number;
  smoothingTimeConstant?: number;
  updateInterval?: number; // ms
}

export function useAudioVisualizer(options: UseAudioVisualizerOptions = {}) {
  const {
    enabled = true,
    fftSize = 256,
    smoothingTimeConstant = 0.8,
    updateInterval = 50,
  } = options;

  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));
  const [volume, setVolume] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>([]);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Process audio data
  const processAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) {
      animationFrameRef.current = requestAnimationFrame(processAudio);
      return;
    }

    const now = Date.now();
    if (now - lastUpdateRef.current < updateInterval) {
      animationFrameRef.current = requestAnimationFrame(processAudio);
      return;
    }
    lastUpdateRef.current = now;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i] * dataArrayRef.current[i];
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length);
    const normalizedVolume = Math.min(1, rms / 255);

    // Extract frequency bands
    const bands = 32; // Number of frequency bands to visualize
    const bandSize = Math.floor(dataArrayRef.current.length / bands);
    const frequencyBands: number[] = [];
    
    for (let i = 0; i < bands; i++) {
      let sum = 0;
      for (let j = 0; j < bandSize; j++) {
        sum += dataArrayRef.current[i * bandSize + j] || 0;
      }
      frequencyBands.push(sum / bandSize / 255);
    }

    setAudioData(new Uint8Array(dataArrayRef.current));
    setVolume(normalizedVolume);
    setFrequencyData(frequencyBands);

    animationFrameRef.current = requestAnimationFrame(processAudio);
  }, [updateInterval]);

  // Initialize audio context
  const initializeAudio = useCallback(async (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext({ sampleRate: 44100 });
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothingTimeConstant;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      analyserRef.current = analyser;
      sourceRef.current = source;
      dataArrayRef.current = dataArray;
      streamRef.current = stream;

      processAudio();
    } catch (error) {
      console.error('Failed to initialize audio visualizer:', error);
    }
  }, [fftSize, smoothingTimeConstant, processAudio]);

  // Start visualization
  const start = useCallback(async () => {
    if (!enabled) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await initializeAudio(stream);
    } catch (error) {
      console.error('Failed to access microphone for audio visualization:', error);
    }
  }, [enabled, initializeAudio]);

  // Stop visualization
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

    analyserRef.current = null;
    dataArrayRef.current = null;

    setAudioData(new Uint8Array(0));
    setVolume(0);
    setFrequencyData([]);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    audioData,
    volume,
    frequencyData,
    start,
    stop,
    isActive: analyserRef.current !== null,
  };
}





