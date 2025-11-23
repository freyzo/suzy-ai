import { useState, useEffect, useRef } from "react";
import VoiceOrb from "@/components/VoiceOrb";
import MicrophoneButton from "@/components/MicrophoneButton";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VoiceResponsiveParticles from "@/components/backgrounds/VoiceResponsiveParticles";
import VoiceVisualizer from "@/components/backgrounds/VoiceVisualizer";
import DynamicBackground from "@/components/backgrounds/DynamicBackground";
import BackgroundSelector from "@/components/backgrounds/BackgroundSelector";
import Cross from "@/components/backgrounds/Cross";
import AnimatedWave from "@/components/backgrounds/AnimatedWave";
import CharacterDisplay from "@/components/CharacterDisplay";
import CharacterSelector, { CharacterId } from "@/components/CharacterSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEmotionManager } from "@/hooks/use-emotion-manager";
import { useEnvironment } from "@/hooks/use-environment";
import { useAudioVisualizer } from "@/hooks/use-audio-visualizer";
import { SceneType, SCENE_CONFIGS } from "@/utils/environment-types";

const Index = () => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouthOpenSize, setMouthOpenSize] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>('hiyori');
  const [selectedScene, setSelectedScene] = useState<SceneType | null>(null);
  const [isDark, setIsDark] = useState(false);
  const isMobile = useIsMobile();
  const isProcessingClick = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setIsConnecting(false);
      toast({
        title: "Connected",
        description: "Ready to chat with Suzy",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      setIsConnecting(false);
      setMouthOpenSize(0);
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      setIsConnecting(false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to voice service",
        variant: "destructive",
      });
    },
    onMessage: (message) => {
      console.log("Message received:", message);
    },
  });

  // Ensures microphone permission with clear error messages
  const ensureMicAccess = async () => {
    try {
      const anyNav: any = navigator as any;
      if (anyNav?.permissions?.query) {
        try {
          const status = await anyNav.permissions.query({ name: 'microphone' as PermissionName });
          console.log('Mic permission status:', status.state);
          if (status.state === 'denied') {
            throw new Error('Microphone access is blocked. Click the lock icon > Site settings > Microphone: Allow, then reload.');
          }
        } catch (_) {
          // Permissions API unsupported or failed; fall back to getUserMedia
        }
      }
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const e = err as DOMException & { message?: string };
      if (e?.name === 'NotAllowedError') {
        throw new Error('Microphone permission denied. Click the lock icon in the address bar and allow the microphone, then reload.');
      }
      if (e?.name === 'NotFoundError') {
        throw new Error('No microphone found. Connect an input device or check system settings.');
      }
      if (e?.name === 'SecurityError') {
        throw new Error('Microphone requires a secure context (https). Please reload over https.');
      }
      throw new Error(e?.message || 'Unable to access microphone.');
    }
  };

  const handleMicClick = async () => {
    // Prevent multiple simultaneous clicks
    if (isProcessingClick.current) {
      return;
    }

    // Prevent clicks during connection phase
    if (isConnecting && conversation.status !== 'connected') {
      return;
    }

    isProcessingClick.current = true;
    setIsProcessing(true);

    try {
      // Check if we should stop (connected)
      if (conversation.status === 'connected') {
        // Stop the conversation
        try {
          console.log('Stopping conversation, status:', conversation.status);
          setIsConnecting(false);
          
          // Call endSession and wait for it
          const endPromise = conversation.endSession();
          if (endPromise && typeof endPromise.then === 'function') {
            await endPromise;
          }
          
          // Reset state
          setMouthOpenSize(0);
          
          // Stop emotion recognition when conversation ends
          try {
            emotionManager.stop();
          } catch (error) {
            console.warn('Failed to stop emotion recognition:', error);
          }
          
          // Double check status after a brief delay
          setTimeout(() => {
            if (conversation.status === 'connected') {
              console.warn('Conversation still connected after endSession, forcing stop');
              // Try to end again
              conversation.endSession().catch(console.error);
            }
          }, 500);
          
          console.log('Conversation stopped');
        } catch (error) {
          console.error('Error ending conversation:', error);
          setIsConnecting(false);
          setMouthOpenSize(0);
          // Force stop even if there's an error
          try {
            conversation.endSession();
          } catch (e) {
            console.error('Force stop also failed:', e);
          }
          toast({
            title: 'Error',
            description: 'Failed to stop conversation',
            variant: 'destructive',
          });
        }
      } else if (isConnecting) {
        // If still connecting, just cancel the connection
        setIsConnecting(false);
        setMouthOpenSize(0);
      } else {
        // Start the conversation
        setIsConnecting(true);
        // Open mouth slightly when starting
        setMouthOpenSize(5);
        
        try {
          await ensureMicAccess();

          // Start emotion recognition when conversation starts
          try {
            await emotionManager.start();
          } catch (error) {
            console.warn('Failed to start emotion recognition:', error);
          }

          // Get signed URL from backend function
          const { data, error } = await supabase.functions.invoke('elevenlabs-session', {
            body: { agentId: 'agent_9101k8j89ntmex29dyn3dg27emf0' },
          });
          if (error) {
            throw new Error(error.message || 'Failed to get session URL');
          }

          const { signedUrl } = (data || {}) as { signedUrl?: string };
          if (!signedUrl) {
            throw new Error('No signed URL returned by voice service');
          }

          await conversation.startSession({ signedUrl });
        } catch (error) {
          console.error('Error starting conversation:', error);
          setIsConnecting(false);
          setMouthOpenSize(0);
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to start conversation',
            variant: 'destructive',
          });
        }
      }
    } finally {
      // Reset processing flag after a short delay to prevent rapid clicks
      setTimeout(() => {
        isProcessingClick.current = false;
        setIsProcessing(false);
      }, 300);
    }
  };

  const isActive = conversation.status === "connected" || isConnecting;
  const isSpeaking = conversation.isSpeaking;

  // Character position and scale (responsive)
  const characterPosition = { x: isMobile ? 0 : -10, y: 0 };
  const characterScale = isMobile ? 0.85 : 1;
  
  // Emotion recognition system
  const emotionManager = useEmotionManager({
    voiceEnabled: true,
    facialEnabled: false, // Set to true to enable webcam facial detection
    fusionWeight: { voice: 1.0, facial: 0.0 },
  });
  
  // Ensure currentAnimation is always defined with safe fallback
  const emotionAnimation = emotionManager?.currentAnimation ?? {
    mouthOpenSize: 0,
    eyeBlinkRate: 0.5,
    eyebrowPosition: 0,
    headTilt: 0,
    colorTint: undefined,
  };

  // Environment system
  const currentEmotion = emotionManager?.emotionState?.current?.emotion || 'neutral';
  const environment = useEnvironment({
    currentEmotion,
    isActive,
    isSpeaking,
  });

  // Get particle colors from selected scene or current environment
  const particleColors = selectedScene 
    ? (SCENE_CONFIGS[selectedScene]?.particleColors || ['#4ecdc4'])
    : (environment?.particleColors || ['#4ecdc4']);

  // Audio visualizer
  const audioVisualizer = useAudioVisualizer({
    enabled: isActive,
    fftSize: 256,
    smoothingTimeConstant: 0.8,
    updateInterval: 50,
  });

  // Start/stop audio visualizer with conversation
  const audioVisualizerRef = useRef(audioVisualizer);
  const audioVisualizerStartedRef = useRef(false);
  
  // Update ref when audioVisualizer changes (but don't trigger re-render)
  if (audioVisualizerRef.current !== audioVisualizer) {
    audioVisualizerRef.current = audioVisualizer;
  }
  
  useEffect(() => {
    const visualizer = audioVisualizerRef.current;
    if (!visualizer) return;
    
    if (isActive && !audioVisualizerStartedRef.current) {
      visualizer.start().catch(console.error);
      audioVisualizerStartedRef.current = true;
    } else if (!isActive && audioVisualizerStartedRef.current) {
      visualizer.stop();
      audioVisualizerStartedRef.current = false;
    }
  }, [isActive]);

  // Initialize chromatic hue and detect dark mode (from airi)
  useEffect(() => {
    document.documentElement.style.setProperty('--chromatic-hue', '220.44');
    
    // Detect dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  // Dynamic mouth movement animation - syncs with voice tap
  useEffect(() => {
    let animationFrame: number;
    let lastTime = 0;
    let mouthPhase = 0;

    const animateMouth = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Check if current emotion is sad - slow down animations
      const isSadEmotion = currentEmotion === 'sad';
      const speedMultiplier = isSadEmotion ? 0.3 : 0.6; // Much slower overall, even slower for sad

      if (isSpeaking) {
        // When speaking: more dynamic lip-sync movement (slower)
        mouthPhase += deltaTime * 0.006 * speedMultiplier; // Reduced from 0.012
        const baseSize = 28;
        const variation = Math.sin(mouthPhase) * 12; // Reduced from 18
        const randomVariation = (Math.random() - 0.5) * 6; // Reduced from 10
        setMouthOpenSize(Math.max(12, Math.min(55, baseSize + variation + randomVariation)));
      } else if (isActive || isConnecting) {
        // When active/connecting but not speaking: listening/idle movement (slower)
        mouthPhase += deltaTime * 0.002 * speedMultiplier; // Reduced from 0.004
        const baseSize = 4;
        const variation = Math.sin(mouthPhase) * 2; // Reduced from 3
        setMouthOpenSize(Math.max(1, Math.min(10, baseSize + variation)));
      } else {
        // When inactive: very subtle breathing-like movement (slower)
        mouthPhase += deltaTime * 0.001 * speedMultiplier; // Reduced from 0.002
        const baseSize = 0.5;
        const variation = Math.sin(mouthPhase * 0.5) * 0.5; // Reduced from 1
        setMouthOpenSize(Math.max(0, Math.min(3, baseSize + variation)));
      }

      animationFrame = requestAnimationFrame(animateMouth);
    };

    animationFrame = requestAnimationFrame(animateMouth);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isSpeaking, isActive, isConnecting, currentEmotion]);

  // Mood lighting based on emotion
  const moodColor = emotionAnimation?.colorTint || environment?.particleColors?.[0] || '#4ecdc4';

  // Use manual scene selection if set, otherwise use stable default (not emotion-based to prevent jumping)
  const backgroundScene = selectedScene || 'forest';

  return (
    <DynamicBackground emotion={currentEmotion} scene={backgroundScene}>
      <VoiceResponsiveParticles
        particleCount={80}
        colors={particleColors}
        baseSpeed={0.5}
        audioVolume={audioVisualizer?.volume || 0}
        frequencyData={audioVisualizer?.frequencyData || []}
      >
        <AnimatedWave
          className="widgets top-widgets"
          fillColor={
            isDark
              ? `oklch(35% calc(var(--chromatic-chroma) * 0.3) var(--chromatic-hue) / 0.4)`
              : `color-mix(in srgb, ${moodColor}40 40%, transparent)`
          }
        >
          {/* Mood lighting overlay */}
          <div
            className="fixed inset-0 pointer-events-none transition-opacity duration-1000 z-[1]"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${moodColor}20 0%, transparent 70%)`,
              opacity: isActive ? 0.6 : 0.2,
            }}
          />
          
          <div className="relative flex flex-col z-[2] h-[100dvh] w-[100vw] overflow-hidden min-h-0">
          {/* Background selector - top right */}
          <div className="absolute top-4 right-4 z-20 max-md:top-2 max-md:right-2">
            <BackgroundSelector
              selectedScene={selectedScene || 'forest'}
              onSceneChange={(scene) => {
                setSelectedScene(scene);
              }}
            />
          </div>

          {/* Main content area */}
          <div className="relative flex flex-1 flex-row gap-y-0 gap-x-2 max-md:flex-col min-h-0 min-w-0">
            {/* Character display - takes up left side */}
            <div className="flex-1 min-w-[50%] h-full relative max-md:min-w-full min-h-0 min-w-0 overflow-visible">
              <CharacterDisplay
                paused={paused}
                focusAt={mousePosition}
                xOffset={`${isMobile ? characterPosition.x : characterPosition.x - 10}%`}
                yOffset="0%"
                scale={characterScale}
                mouthOpenSize={mouthOpenSize}
                characterId={selectedCharacter}
                emotionAnimation={emotionAnimation}
              />
            </div>

            {/* Interactive area - Voice controls */}
            {!isMobile && (
              <div className="absolute right-4 bottom-4 flex flex-col gap-4 z-10 max-lg:right-2 max-lg:bottom-2">
                {/* Voice interface */}
                <div className="flex items-center gap-8 max-lg:gap-4">
                  {/* Microphone */}
                  <div className="flex flex-col items-center gap-4 max-lg:gap-2">
                    <MicrophoneButton
                      isActive={isActive}
                      onClick={handleMicClick}
                      disabled={isConnecting || isProcessing}
                    />
                    <p className="text-sm text-foreground/80 max-lg:text-xs">
                      {isConnecting
                        ? "Connecting..."
                        : isActive
                        ? "Tap to end"
                        : "Tap to speak"}
                    </p>
                  </div>

                  {/* Voice Orb */}
                  <div className="flex flex-col items-center gap-4 max-lg:gap-2">
                    <VoiceOrb isActive={isActive} isSpeaking={isSpeaking} />
                    <p className="text-sm text-foreground/80 max-lg:text-xs">
                      {isSpeaking ? "Speaking..." : isActive ? "Listening..." : "Ready"}
                    </p>
                  </div>
                </div>
                
                {/* Voice Visualizer */}
                {isActive && audioVisualizer?.frequencyData?.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <VoiceVisualizer
                      frequencyData={audioVisualizer.frequencyData || []}
                      volume={audioVisualizer?.volume || 0}
                      width={300}
                      height={80}
                      barCount={32}
                      color={moodColor}
                    />
                  </div>
                )}
                
                {/* Emotion indicator */}
                {isActive && emotionManager?.emotionState?.current?.emotion !== 'neutral' && (
                  <div className="mt-2 px-4 py-2 bg-card/40 backdrop-blur-md border border-border/50 rounded-lg text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-xs text-foreground/70">
                      Emotion: <span className="font-semibold capitalize">{emotionManager?.emotionState?.current?.emotion || 'neutral'}</span>
                      {' '}
                      <span className="text-foreground/50">
                        ({Math.round((emotionManager?.emotionState?.current?.intensity || 0) * 100)}%)
                      </span>
                    </p>
                    <p className="text-xs text-foreground/50 mt-1">
                      Scene: <span className="font-semibold capitalize">{environment?.environmentState?.scene || 'forest'}</span>
                    </p>
                  </div>
                )}

                {/* Info card */}
                {isActive && (
                  <div className="mt-4 p-6 bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl max-w-md text-center animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-lg max-lg:p-4 max-lg:max-w-xs">
                    <p className="text-sm text-foreground/90 leading-relaxed max-lg:text-xs">
                      Ask me about my experience, building scalable services, or my passion for AI/ML.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mobile interactive area */}
            {isMobile && (
              <div className="absolute right-2 bottom-2 flex flex-col gap-3 z-10 touch-manipulation">
                <div className="flex items-center gap-4">
                  <MicrophoneButton
                    isActive={isActive}
                    onClick={handleMicClick}
                    disabled={isConnecting || isProcessing}
                  />
                  <VoiceOrb isActive={isActive} isSpeaking={isSpeaking} />
                </div>
                {isActive && (
                  <div className="p-3 bg-card/30 backdrop-blur-md border border-border/50 rounded-xl text-center shadow-lg max-w-[200px]">
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      {isConnecting
                        ? "Connecting..."
                        : isActive
                        ? "Tap to end"
                        : "Tap to speak"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </AnimatedWave>
      </VoiceResponsiveParticles>
    </DynamicBackground>
  );
};

export default Index;
