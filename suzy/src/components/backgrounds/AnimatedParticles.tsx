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
}

interface AnimatedParticlesProps {
  particleCount?: number;
  colors?: string[];
  speed?: number;
  children?: React.ReactNode;
}

export default function AnimatedParticles({
  particleCount = 50,
  colors = ['#FFB6C1', '#87CEEB', '#DDA0DD', '#98FB98', '#F0E68C'],
  speed = 0.5,
  children,
}: AnimatedParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationIdRef = useRef<number | null>(null);

  const createParticle = (): Particle => ({
    id: Math.random(),
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 3 + 1,
    speedX: (Math.random() - 0.5) * speed,
    speedY: (Math.random() - 0.5) * speed,
    opacity: Math.random() * 0.5 + 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
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

    // Update and draw particles
    setParticles((prevParticles) => {
      const updated = prevParticles.map((particle) => {
        // Update position
        let newX = particle.x + particle.speedX;
        let newY = particle.y + particle.speedY;

        // Wrap around screen
        if (newX < 0) newX = canvas.width;
        if (newX > canvas.width) newX = 0;
        if (newY < 0) newY = canvas.height;
        if (newY > canvas.height) newY = 0;

        return { ...particle, x: newX, y: newY };
      });

      // Draw particles
      updated.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw connections between nearby particles
      updated.forEach((particle, i) => {
        updated.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.save();
            ctx.globalAlpha = ((100 - distance) / 100) * 0.2;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 1;
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
  }, [particleCount, colors, speed]);

  return (
    <div className="particles-background-container">
      <canvas
        ref={canvasRef}
        className="particles-canvas"
      />
      {children}
    </div>
  );
}

