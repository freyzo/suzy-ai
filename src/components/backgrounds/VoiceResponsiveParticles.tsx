// Enhanced particles that respond to voice/audio
import { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  baseSpeed: number;
}

interface VoiceResponsiveParticlesProps {
  particleCount?: number;
  colors?: string[];
  baseSpeed?: number;
  audioVolume?: number;
  frequencyData?: number[];
  children?: React.ReactNode;
}

export default function VoiceResponsiveParticles({
  particleCount = 50,
  colors = ['#FFB6C1', '#87CEEB', '#DDA0DD', '#98FB98', '#F0E68C'],
  baseSpeed = 0.5,
  audioVolume = 0,
  frequencyData = [],
  children,
}: VoiceResponsiveParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationIdRef = useRef<number | null>(null);

  const createParticle = (): Particle => ({
    id: Math.random(),
    x: Math.random() * (window.innerWidth || 1920),
    y: Math.random() * (window.innerHeight || 1080),
    size: Math.random() * 3 + 1,
    speedX: (Math.random() - 0.5) * baseSpeed,
    speedY: (Math.random() - 0.5) * baseSpeed,
    opacity: Math.random() * 0.5 + 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
    baseSpeed,
  });

  const initParticles = () => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push(createParticle());
    }
    setParticles(newParticles);
  };

  const updateParticles = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate audio-reactive multipliers
    const volumeMultiplier = 1 + audioVolume * 3; // Increase speed based on volume
    const avgFrequency = frequencyData.length > 0
      ? frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length
      : 0;
    const frequencyMultiplier = 1 + avgFrequency * 2;

    // Update and draw particles
    setParticles((prevParticles) => {
      const updated = prevParticles.map((particle, index) => {
        // Apply audio-reactive speed changes
        const speedMultiplier = volumeMultiplier * frequencyMultiplier;
        let newX = particle.x + particle.speedX * speedMultiplier;
        let newY = particle.y + particle.speedY * speedMultiplier;

        // Apply frequency-based vertical movement
        if (frequencyData.length > 0) {
          const bandIndex = Math.floor((index % frequencyData.length));
          const frequencyValue = frequencyData[bandIndex] || 0;
          newY += Math.sin(Date.now() * 0.001 + index) * frequencyValue * 5;
        }

        // Wrap around screen
        if (newX < 0) newX = canvas.width;
        if (newX > canvas.width) newX = 0;
        if (newY < 0) newY = canvas.height;
        if (newY > canvas.height) newY = 0;

        // Update opacity based on volume
        const dynamicOpacity = Math.min(1, particle.opacity + audioVolume * 0.5);

        return {
          ...particle,
          x: newX,
          y: newY,
          opacity: dynamicOpacity,
        };
      });

      // Draw particles
      updated.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = audioVolume * 10;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * (1 + audioVolume), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw connections between nearby particles (more connections when volume is high)
      const connectionDistance = 100 + audioVolume * 50;
      updated.forEach((particle, i) => {
        updated.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.save();
            ctx.globalAlpha = ((connectionDistance - distance) / connectionDistance) * 0.3 * (1 + audioVolume);
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 1 + audioVolume;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      return updated;
    });
  };

  const animate = () => {
    updateParticles();
    animationIdRef.current = requestAnimationFrame(animate);
  };

  const resizeCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  useEffect(() => {
    initParticles();
    resizeCanvas();
    animate();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [particleCount, colors, baseSpeed]);

  return (
    <div className="particles-background-container">
      <canvas
        ref={canvasRef}
        className="particles-canvas"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      />
      {children}
    </div>
  );
}


