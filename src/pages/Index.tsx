import { useState, useEffect } from "react";
import VoiceOrb from "@/components/VoiceOrb";
import MicrophoneButton from "@/components/MicrophoneButton";
import { useConversation } from "@11labs/react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AnimatedParticles from "@/components/backgrounds/AnimatedParticles";
import Cross from "@/components/backgrounds/Cross";
import AnimatedWave from "@/components/backgrounds/AnimatedWave";
import ImageBackground from "@/components/backgrounds/ImageBackground";
import CharacterDisplay from "@/components/CharacterDisplay";
import CharacterSelector, { CharacterId } from "@/components/CharacterSelector";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();

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
    // Prevent multiple clicks
    if (isConnecting && conversation.status !== 'connected') {
      return;
    }

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
  };

  const isActive = conversation.status === "connected" || isConnecting;
  const isSpeaking = conversation.isSpeaking;

  // Character position and scale (responsive)
  const characterPosition = { x: isMobile ? 0 : -10, y: 0 };
  const characterScale = isMobile ? 0.85 : 1;

  const [isDark, setIsDark] = useState(false);
  const [mouthOpenSize, setMouthOpenSize] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>('hiyori');

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

      if (isSpeaking) {
        // When speaking: more dynamic lip-sync movement
        mouthPhase += deltaTime * 0.012; // Faster animation when speaking
        const baseSize = 28;
        const variation = Math.sin(mouthPhase) * 18; // Vary between 10-46
        const randomVariation = (Math.random() - 0.5) * 10; // Add randomness for natural movement
        setMouthOpenSize(Math.max(12, Math.min(55, baseSize + variation + randomVariation)));
      } else if (isActive || isConnecting) {
        // When active/connecting but not speaking: listening/idle movement
        mouthPhase += deltaTime * 0.004; // Moderate animation
        const baseSize = 4;
        const variation = Math.sin(mouthPhase) * 3;
        setMouthOpenSize(Math.max(1, Math.min(10, baseSize + variation)));
      } else {
        // When inactive: very subtle breathing-like movement
        mouthPhase += deltaTime * 0.002;
        const baseSize = 0.5;
        const variation = Math.sin(mouthPhase * 0.5) * 1;
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
  }, [isSpeaking, isActive, isConnecting]);

  return (
    <ImageBackground imageUrl="/fairy-forest.e17cbc2774.ko-fi.com (1).png">
      <AnimatedWave
        className="widgets top-widgets"
        fillColor={
          isDark
            ? 'oklch(35% calc(var(--chromatic-chroma) * 0.3) var(--chromatic-hue) / 0.4)'
            : 'color-mix(in srgb, oklch(95% calc(var(--chromatic-chroma-50) * 0.3) var(--chromatic-hue)) 40%, transparent)'
        }
      >
        <div className="relative flex flex-col z-[2] h-[100dvh] w-[100vw] overflow-hidden min-h-0">
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
                      disabled={isConnecting}
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
                    disabled={isConnecting}
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
    </ImageBackground>
  );
};

export default Index;
