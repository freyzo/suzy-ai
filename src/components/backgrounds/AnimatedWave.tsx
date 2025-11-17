import { useEffect, useMemo, useRef, useState } from 'react';

type WaveDirection = 'up' | 'down';
type MovementDirection = 'left' | 'right';

interface AnimatedWaveProps {
  height?: number;
  amplitude?: number;
  waveLength?: number;
  fillColor?: string;
  direction?: WaveDirection;
  movementDirection?: MovementDirection;
  animationSpeed?: number;
  children?: React.ReactNode;
  className?: string;
}

function generateSineWavePath(
  width: number,
  height: number,
  amplitude: number,
  waveLength: number,
  direction: WaveDirection,
): string {
  const points: string[] = [];
  const numberOfWaves = Math.ceil(width / waveLength);
  const totalWavesWidth = numberOfWaves * waveLength;
  const step = 1;
  const baseY = direction === 'up' ? amplitude : height - amplitude;

  points.push(`M 0 ${baseY}`);

  const factor = (Math.PI * 2) / waveLength;
  for (let x = 0; x <= totalWavesWidth; x += step) {
    const deltaY = amplitude * Math.sin(factor * x);
    const y = direction === 'up' ? baseY - deltaY : baseY + deltaY;
    points.push(`L ${x} ${y}`);
  }

  const closeY = direction === 'up' ? height : 0;
  points.push(`L ${totalWavesWidth} ${closeY}`);
  points.push(`L 0 ${closeY} Z`);

  return points.join(' ');
}

export default function AnimatedWave({
  height = 40,
  amplitude = 14,
  waveLength = 250,
  fillColor = 'oklch(95% 0.10 var(--chromatic-hue))',
  direction = 'down',
  movementDirection = 'left',
  animationSpeed = 50,
  children,
  className = '',
}: AnimatedWaveProps) {
  const [waveHeight, setWaveHeight] = useState(height);
  const [waveAmplitude, setWaveAmplitude] = useState(amplitude);
  const [waveLengthState, setWaveLengthState] = useState(waveLength);
  const [waveFillColor, setWaveFillColor] = useState(fillColor);
  const [directionState, setDirectionState] = useState<WaveDirection>(direction);
  const [movementDirectionState, setMovementDirectionState] = useState<MovementDirection>(movementDirection);

  useEffect(() => {
    setWaveHeight(height);
    setWaveAmplitude(amplitude);
    setWaveLengthState(waveLength);
    setWaveFillColor(fillColor);
    setDirectionState(direction);
    setMovementDirectionState(movementDirection);
  }, [height, amplitude, waveLength, fillColor, direction, movementDirection]);

  const fullHeight = useMemo(() => waveHeight + waveAmplitude * 2, [waveHeight, waveAmplitude]);

  const maskImage = useMemo(() => {
    const svg = `<svg width="${waveLengthState}" height="${fullHeight}" xmlns="http://www.w3.org/2000/svg">
      <path d="${generateSineWavePath(waveLengthState, fullHeight, waveAmplitude, waveLengthState, directionState)}"/>
    </svg>`;
    return `url(data:image/svg+xml;base64,${btoa(svg)})`;
  }, [waveLengthState, fullHeight, waveAmplitude, directionState]);

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute left-0 right-0 top-0 w-full overflow-hidden">
        <div
          className="colored-area wave"
          style={{
            background: waveFillColor,
            height: `${fullHeight}px`,
            maskImage,
            WebkitMaskImage: maskImage,
            '--wave-translate': `${-waveLengthState}px`,
            '--animation-duration': `${waveLengthState / animationSpeed}s`,
            animationDirection: movementDirectionState === 'left' ? 'normal' : 'reverse',
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

