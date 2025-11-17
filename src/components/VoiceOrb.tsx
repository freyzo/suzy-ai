import { useEffect, useState } from "react";
import Butterfly from "./Butterfly";
import { useDeviceType } from "@/hooks/use-mobile";

interface VoiceOrbProps {
  isActive: boolean;
  isSpeaking: boolean;
}

const VoiceOrb = ({ isActive, isSpeaking }: VoiceOrbProps) => {
  const [intensity, setIntensity] = useState(0);
  const deviceType = useDeviceType();

  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setIntensity(Math.random() * 0.5 + 0.5);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setIntensity(0);
    }
  }, [isSpeaking]);

  // Responsive sizing
  const orbSize = deviceType === 'mobile' ? 'w-32 h-32' : deviceType === 'tablet' ? 'w-40 h-40' : 'w-48 h-48';
  const glowSize = deviceType === 'mobile' ? 'w-40 h-40' : deviceType === 'tablet' ? 'w-52 h-52' : 'w-64 h-64';
  const outerGlowSize = deviceType === 'mobile' ? 'w-48 h-48' : deviceType === 'tablet' ? 'w-60 h-60' : 'w-72 h-72';
  const ringSizes = deviceType === 'mobile' 
    ? ['w-36 h-36', 'w-40 h-40', 'w-44 h-44']
    : deviceType === 'tablet'
    ? ['w-48 h-48', 'w-52 h-52', 'w-56 h-56']
    : ['w-56 h-56', 'w-60 h-60', 'w-64 h-64'];
  const butterflyContainerSize = deviceType === 'mobile' ? '120px' : deviceType === 'tablet' ? '160px' : '200px';
  const butterflySizes = deviceType === 'mobile' ? [14, 12, 10] : deviceType === 'tablet' ? [17, 15, 13] : [20, 18, 16];
  const sparkleSize = deviceType === 'mobile' ? '3px' : deviceType === 'tablet' ? '4px' : '5px';

  return (
    <div className="relative flex items-center justify-center animate-float touch-manipulation" style={{ animationDelay: "0.2s" }}>
      {/* Sparkle particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-sparkle"
            style={{
              width: sparkleSize,
              height: sparkleSize,
              left: `${15 + (i * 12)}%`,
              top: `${10 + (i % 4) * 25}%`,
              animationDelay: `${i * 0.25}s`,
              animationDuration: '2.5s',
            }}
          />
        ))}
      </div>

      {/* Outer glow ring */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-radial from-orb-glow/40 to-transparent blur-3xl transition-all duration-500 ${
          isActive ? "scale-150 opacity-100" : "scale-100 opacity-50"
        }`}
        style={{
          transform: isSpeaking ? `scale(${1.5 + intensity * 0.5})` : undefined,
        }}
      />

      {/* Middle glow with shimmer */}
      <div
        className={`absolute ${glowSize} rounded-full bg-gradient-radial from-orb-primary/50 to-transparent blur-2xl transition-all duration-300 ${
          isActive ? "animate-orb-glow animate-shimmer" : "opacity-40"
        }`}
      />

      {/* Light rays effect */}
      {isActive && (
        <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '8s' }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                background: `conic-gradient(from ${i * 90}deg, transparent 0deg, hsl(var(--orb-primary) / 0.3) 5deg, transparent 10deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main orb - more translucent anime style */}
      <div
        className={`relative ${orbSize} rounded-full transition-all duration-500 backdrop-blur-sm ${
          isActive ? "animate-orb-pulse" : ""
        }`}
        style={{
          background: `radial-gradient(circle at 30% 30%, 
            hsl(var(--orb-secondary) / 0.9), 
            hsl(var(--orb-primary) / 0.7),
            hsl(var(--orb-primary) / 0.5))`,
          boxShadow: isSpeaking
            ? `0 0 ${60 + intensity * 40}px hsl(var(--orb-glow) / ${0.8 + intensity * 0.2}), 
               0 0 ${120 + intensity * 80}px hsl(var(--orb-glow) / ${0.5 + intensity * 0.2}),
               0 0 ${180 + intensity * 120}px hsl(var(--orb-glow) / ${0.3 + intensity * 0.2}),
               inset 0 0 60px hsl(var(--orb-glow) / 0.4),
               inset 0 0 120px rgba(255,255,255,0.15)`
            : `0 0 50px hsl(var(--orb-glow) / 0.5), 
               0 0 100px hsl(var(--orb-glow) / 0.3),
               inset 0 0 50px rgba(255,255,255,0.1)`,
          border: `2px solid ${isActive ? 'hsl(var(--orb-primary) / 0.6)' : 'hsl(var(--orb-primary) / 0.3)'}`,
        }}
      >
        {/* Inner shine with anime-style highlight */}
        <div
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 20%, transparent 60%)",
          }}
        />

        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 rounded-full opacity-40 animate-shimmer"
          style={{
            background: `linear-gradient(110deg, 
              transparent 0%, 
              rgba(255,255,255,0.4) 45%, 
              rgba(255,255,255,0.6) 50%, 
              rgba(255,255,255,0.4) 55%, 
              transparent 100%)`,
            backgroundSize: '200% 200%',
          }}
        />

        {/* Rotating gradient overlay */}
        <div
          className={`absolute inset-0 rounded-full opacity-40 ${
            isSpeaking ? "animate-orb-spin" : ""
          }`}
          style={{
            background: `conic-gradient(from 0deg, 
              hsl(var(--orb-primary) / 0.6), 
              hsl(var(--orb-secondary) / 0.8), 
              hsl(var(--orb-primary) / 0.6))`,
          }}
        />
      </div>

      {/* Speaking indicator rings - anime style */}
      {isSpeaking && (
        <>
          <div className={`absolute ${ringSizes[0]} rounded-full border-2 border-orb-primary/40 animate-ping`} />
          <div
            className={`absolute ${ringSizes[1]} rounded-full border-2 border-orb-primary/30 animate-ping`}
            style={{ animationDelay: "0.3s" }}
          />
          <div
            className={`absolute ${ringSizes[2]} rounded-full border border-orb-primary/20 animate-ping`}
            style={{ animationDelay: "0.6s" }}
          />
        </>
      )}

      {/* Animated butterflies - orbiting around the orb */}
      <div className="absolute inset-0 pointer-events-none" style={{ width: butterflyContainerSize, height: butterflyContainerSize, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Butterfly 
            size={butterflySizes[0]} 
            color="purple" 
            delay={0}
          />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Butterfly 
            size={butterflySizes[1]} 
            color="orange" 
            delay={1.3}
          />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Butterfly 
            size={butterflySizes[2]} 
            color="white" 
            delay={2.6}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceOrb;
