import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeviceType } from "@/hooks/use-mobile";

interface MicrophoneButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const MicrophoneButton = ({ isActive, onClick, disabled }: MicrophoneButtonProps) => {
  const deviceType = useDeviceType();
  
  // Responsive sizing: mobile gets larger touch targets (min 48px, we use 64px for greasy fingers)
  const buttonSize = deviceType === 'mobile' ? 'w-16 h-16' : deviceType === 'tablet' ? 'w-28 h-28' : 'w-32 h-32';
  const iconSize = deviceType === 'mobile' ? 'w-8 h-8' : deviceType === 'tablet' ? 'w-10 h-10' : 'w-12 h-12';
  const glowSize = deviceType === 'mobile' ? 'w-20 h-20' : deviceType === 'tablet' ? 'w-28 h-28' : 'w-32 h-32';
  const outerGlowSize = deviceType === 'mobile' ? 'w-24 h-24' : deviceType === 'tablet' ? 'w-36 h-36' : 'w-40 h-40';
  const rippleSizes = deviceType === 'mobile' 
    ? ['w-20 h-20', 'w-24 h-24', 'w-28 h-28']
    : deviceType === 'tablet'
    ? ['w-36 h-36', 'w-40 h-40', 'w-44 h-44']
    : ['w-40 h-40', 'w-44 h-44', 'w-48 h-48'];

  return (
    <div className="relative flex items-center justify-center animate-float touch-manipulation">
      {/* Sparkle particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-sparkle"
            style={{
              width: deviceType === 'mobile' ? '3px' : '4px',
              height: deviceType === 'mobile' ? '3px' : '4px',
              left: `${20 + (i * 15)}%`,
              top: `${15 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s',
            }}
          />
        ))}
      </div>

      {/* Outer glow ring */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-radial from-primary/40 to-transparent blur-3xl transition-all duration-500 ${
          isActive ? "scale-150 opacity-100" : "scale-100 opacity-50"
        }`}
      />

      {/* Middle glow with shimmer */}
      <div
        className={`absolute ${glowSize} rounded-full bg-gradient-radial from-primary/50 to-transparent blur-2xl transition-all duration-300 ${
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
                background: `conic-gradient(from ${i * 90}deg, transparent 0deg, hsl(var(--primary) / 0.2) 5deg, transparent 10deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main button - more translucent anime style */}
      <Button
        onClick={onClick}
        disabled={disabled}
        size="lg"
        className={`
          relative ${buttonSize} rounded-full transition-all duration-500 border-0
          backdrop-blur-sm touch-manipulation min-h-[48px] min-w-[48px]
          ${isActive ? "animate-orb-pulse" : ""}
        `}
        style={{
          background: isActive
            ? `radial-gradient(circle at 30% 30%, 
                hsl(var(--orb-secondary) / 0.9), 
                hsl(var(--primary) / 0.7),
                hsl(var(--primary) / 0.5))`
            : `radial-gradient(circle at 30% 30%, 
                hsl(var(--card) / 0.6), 
                hsl(var(--muted) / 0.4),
                transparent)`,
          boxShadow: isActive
            ? `0 0 50px hsl(var(--primary-glow) / 0.8), 
               0 0 100px hsl(var(--primary-glow) / 0.5),
               0 0 150px hsl(var(--primary-glow) / 0.3),
               inset 0 0 50px hsl(var(--primary-glow) / 0.3),
               inset 0 0 100px rgba(255,255,255,0.1)`
            : `0 0 30px hsl(var(--primary) / 0.3), 
               0 0 60px hsl(var(--primary) / 0.2),
               inset 0 0 30px rgba(255,255,255,0.1)`,
          border: `2px solid ${isActive ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--primary) / 0.2)'}`,
        }}
      >
        {/* Inner shine with anime-style highlight */}
        <div
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 20%, transparent 60%)",
          }}
        />

        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 rounded-full opacity-40 animate-shimmer"
          style={{
            background: `linear-gradient(110deg, 
              transparent 0%, 
              rgba(255,255,255,0.3) 45%, 
              rgba(255,255,255,0.5) 50%, 
              rgba(255,255,255,0.3) 55%, 
              transparent 100%)`,
            backgroundSize: '200% 200%',
          }}
        />

        {/* Rotating gradient overlay when active */}
        {isActive && (
          <div
            className="absolute inset-0 rounded-full opacity-40 animate-orb-spin"
            style={{
              background: `conic-gradient(from 0deg, 
                hsl(var(--primary) / 0.6), 
                hsl(var(--orb-secondary) / 0.8), 
                hsl(var(--primary) / 0.6))`,
            }}
          />
        )}

        {/* Icon with glow */}
        <div className="relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
          {isActive ? (
            <MicOff className={`${iconSize} text-white`} style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary-glow)))' }} />
          ) : (
            <Mic className={`${iconSize} text-white/90`} style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.5))' }} />
          )}
        </div>
      </Button>

      {/* Ripple effect when active - anime style */}
      {isActive && (
        <>
          <div className={`absolute ${rippleSizes[0]} rounded-full border-2 border-primary/40 animate-ping`} />
          <div
            className={`absolute ${rippleSizes[1]} rounded-full border-2 border-primary/30 animate-ping`}
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className={`absolute ${rippleSizes[2]} rounded-full border border-primary/20 animate-ping`}
            style={{ animationDelay: "1s" }}
          />
        </>
      )}
    </div>
  );
};

export default MicrophoneButton;
