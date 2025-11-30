// Analytics integration utilities
// Supports multiple analytics providers

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

class Analytics {
  private enabled: boolean = true;

  init() {
    // Initialize analytics providers
    // Add your analytics provider initialization here
    // Example: Google Analytics, Plausible, etc.
    
    if (typeof window !== 'undefined' && import.meta.env.PROD) {
      this.enabled = true;
    } else {
      this.enabled = false;
    }
  }

  track(event: AnalyticsEvent) {
    if (!this.enabled) return;

    try {
      // Track event with your analytics provider
      // Example implementations:
      
      // Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.name, event.properties);
      }

      // Plausible
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible(event.name, { props: event.properties });
      }

      // Custom analytics endpoint
      if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
        fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        }).catch(console.error);
      }

      // Console log in development
      if (import.meta.env.DEV) {
        console.log('[Analytics]', event.name, event.properties);
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  pageview(path: string) {
    this.track({ name: 'pageview', properties: { path } });
  }

  setUser(userId: string, properties?: Record<string, any>) {
    this.track({ name: 'user_identified', properties: { userId, ...properties } });
  }
}

export const analytics = new Analytics();

// Initialize on import
if (typeof window !== 'undefined') {
  analytics.init();
}

// Common events
export const AnalyticsEvents = {
  CONVERSATION_STARTED: 'conversation_started',
  CONVERSATION_ENDED: 'conversation_ended',
  CHARACTER_CHANGED: 'character_changed',
  SCENE_CHANGED: 'scene_changed',
  SETTINGS_OPENED: 'settings_opened',
  SCREENSHOT_TAKEN: 'screenshot_taken',
  SOCIAL_SHARED: 'social_shared',
  FULLSCREEN_TOGGLED: 'fullscreen_toggled',
  MODEL_UPLOADED: 'model_uploaded',
};



