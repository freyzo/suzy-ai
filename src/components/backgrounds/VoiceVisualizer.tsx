// Real-time audio spectrum visualization component
import { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  frequencyData?: number[];
  volume?: number;
  width?: number;
  height?: number;
  barCount?: number;
  color?: string;
}

export default function VoiceVisualizer({
  frequencyData = [],
  volume = 0,
  width = 300,
  height = 100,
  barCount = 32,
  color = '#4ecdc4',
}: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || frequencyData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw frequency bars
    const barWidth = width / barCount;
    const maxBarHeight = height * 0.8;

    // Helper function to add opacity to color
    const addOpacityToColor = (colorStr: string, opacity: number): string => {
      // If it's already rgba/rgb, extract and modify
      if (colorStr.startsWith('rgba')) {
        const match = colorStr.match(/rgba?\(([^)]+)\)/);
        if (match) {
          const values = match[1].split(',').map(v => v.trim());
          if (values.length >= 3) {
            return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
          }
        }
      } else if (colorStr.startsWith('rgb')) {
        const match = colorStr.match(/rgb\(([^)]+)\)/);
        if (match) {
          const values = match[1].split(',').map(v => v.trim());
          if (values.length >= 3) {
            return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
          }
        }
      }
      // For hex colors, convert to rgba
      if (colorStr.startsWith('#')) {
        const hex = colorStr.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      // Fallback: try to append opacity as hex (for 6-char hex)
      if (colorStr.startsWith('#') && colorStr.length === 7) {
        const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
        return `${colorStr}${opacityHex}`;
      }
      return colorStr;
    };

    frequencyData.slice(0, barCount).forEach((value, index) => {
      const barHeight = value * maxBarHeight;
      const x = index * barWidth;
      const y = height - barHeight;

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, addOpacityToColor(color, 0.5));

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 2, barHeight);

      // Add glow effect based on volume
      if (volume > 0.3) {
        ctx.shadowBlur = volume * 10;
        ctx.shadowColor = color;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
        ctx.shadowBlur = 0;
      }
    });

    // Draw waveform overlay
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const step = width / frequencyData.length;
    frequencyData.forEach((value, index) => {
      const x = index * step;
      const y = height - value * maxBarHeight;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }, [frequencyData, volume, width, height, barCount, color]);

  return (
    <canvas
      ref={canvasRef}
      className="voice-visualizer"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '8px',
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
      }}
    />
  );
}


