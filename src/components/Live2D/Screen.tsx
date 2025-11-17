import { useEffect, useRef, useState } from 'react';

interface ScreenProps {
  children: (width: number, height: number) => React.ReactNode;
}

export default function Screen({ children }: ScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateDimensions() {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth || window.innerWidth;
        const height = containerRef.current.clientHeight || window.innerHeight;
        // Ensure minimum dimensions to prevent blank screen
        setDimensions({
          width: Math.max(width, 100),
          height: Math.max(height, 100),
        });
      }
    }

    // Initial update
    updateDimensions();
    
    // Use ResizeObserver for container size changes
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);
    }
    
    // Fallback to window resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Also check periodically in case ResizeObserver doesn't fire
    const interval = setInterval(updateDimensions, 100);
    
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateDimensions);
      clearInterval(interval);
    };
  }, []);

  // Use fallback dimensions if container hasn't measured yet
  const displayWidth = dimensions.width > 0 ? dimensions.width : (typeof window !== 'undefined' ? window.innerWidth : 800);
  const displayHeight = dimensions.height > 0 ? dimensions.height : (typeof window !== 'undefined' ? window.innerHeight : 600);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[100dvh] min-w-[100px]">
      {children(displayWidth, displayHeight)}
    </div>
  );
}

