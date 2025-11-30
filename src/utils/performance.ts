// Performance optimization utilities

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy load images
export function lazyLoadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Preload resources
export function preloadResources(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map((url) => lazyLoadImage(url)));
}

// Check if device is low-end
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const hardwareConcurrency = navigator.hardwareConcurrency || 2;
  const deviceMemory = (navigator as any).deviceMemory || 4;
  
  return hardwareConcurrency <= 2 || deviceMemory <= 2;
}

// Reduce particle count for low-end devices
export function getOptimalParticleCount(baseCount: number): number {
  return isLowEndDevice() ? Math.floor(baseCount * 0.5) : baseCount;
}

// Memory cleanup utility
export function cleanupResources(resources: Array<{ dispose?: () => void; destroy?: () => void }>) {
  resources.forEach((resource) => {
    try {
      if (resource.dispose) resource.dispose();
      if (resource.destroy) resource.destroy();
    } catch (error) {
      console.warn('Failed to cleanup resource:', error);
    }
  });
}



