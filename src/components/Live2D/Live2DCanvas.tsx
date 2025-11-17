import { Application } from '@pixi/app';
import { extensions } from '@pixi/extensions';
import { InteractionManager } from '@pixi/interaction';
import { Ticker, TickerPlugin } from '@pixi/ticker';
import { Live2DModel } from 'pixi-live2d-display/cubism4';
import { useEffect, useRef, useState } from 'react';

interface Live2DCanvasProps {
  width: number;
  height: number;
  resolution?: number;
  children?: (app: Application) => React.ReactNode;
}

export default function Live2DCanvas({
  width,
  height,
  resolution = 2,
  children,
}: Live2DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pixiAppReady, setPixiAppReady] = useState(false);
  const pixiAppRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!containerRef.current || pixiAppRef.current || width <= 0 || height <= 0) return;

    async function initLive2DPixiStage(parent: HTMLDivElement) {
      setPixiAppReady(false);

      // Register Live2D ticker and extensions
      Live2DModel.registerTicker(Ticker);
      extensions.add(TickerPlugin);
      extensions.add(InteractionManager);

      const app = new Application({
        width: width * resolution,
        height: height * resolution,
        backgroundAlpha: 0,
        preserveDrawingBuffer: true,
      });

      const canvas = app.view as HTMLCanvasElement;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.objectFit = 'cover';
      canvas.style.display = 'block';

      parent.appendChild(canvas);
      pixiAppRef.current = app;
      setPixiAppReady(true);
    }

    initLive2DPixiStage(containerRef.current);

    return () => {
      if (pixiAppRef.current) {
        pixiAppRef.current.destroy();
        pixiAppRef.current = null;
        setPixiAppReady(false);
      }
    };
  }, [width, height, resolution]); // Initialize with initial dimensions

  useEffect(() => {
    if (pixiAppRef.current) {
      pixiAppRef.current.renderer.resize(width * resolution, height * resolution);
    }
  }, [width, height, resolution]);

  return (
    <div ref={containerRef} className="h-full w-full min-h-[200px] min-w-[200px]">
      {pixiAppReady && pixiAppRef.current && width > 0 && height > 0 && children?.(pixiAppRef.current)}
    </div>
  );
}

