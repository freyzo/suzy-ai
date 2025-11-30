import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrlKey === undefined ? true : event.ctrlKey === shortcut.ctrlKey;
      const metaMatch = shortcut.metaKey === undefined ? true : event.metaKey === shortcut.metaKey;
      const shiftMatch = shortcut.shiftKey === undefined ? true : event.shiftKey === shortcut.shiftKey;
      const altMatch = shortcut.altKey === undefined ? true : event.altKey === shortcut.altKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Common keyboard shortcuts
export const COMMON_SHORTCUTS = {
  TOGGLE_MIC: { key: 'm', ctrlKey: true, description: 'Toggle microphone' },
  FULLSCREEN: { key: 'f', ctrlKey: true, description: 'Toggle fullscreen' },
  SCREENSHOT: { key: 's', ctrlKey: true, shiftKey: true, description: 'Take screenshot' },
  CHANGE_SCENE: { key: 'b', ctrlKey: true, description: 'Change background scene' },
  CHANGE_CHARACTER: { key: 'c', ctrlKey: true, description: 'Change character' },
};



