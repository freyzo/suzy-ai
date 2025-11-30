import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress expected WebSocket closing errors from ElevenLabs SDK
// Set up early to catch errors before components mount
const isWebSocketClosingError = (message: string, source?: string, stack?: string): boolean => {
  const hasClosingError = message.includes('WebSocket is already in CLOSING') || 
                           message.includes('WebSocket is already in CLOSED') ||
                           message.includes('sendMessage') && (message.includes('CLOSING') || message.includes('CLOSED'));
  const hasWorkletContext = message.includes('onInputWorkletMessage') || 
                           (stack && stack.includes('onInputWorkletMessage')) ||
                           (source && source.includes('11labs'));
  return hasClosingError && (hasWorkletContext || !source || source.includes('11labs') || source.includes('elevenlabs'));
};

// Global error handler - must be set up before any errors occur
window.addEventListener('error', (event) => {
  const message = (event.message || '') + ' ' + (event.filename || '');
  const stack = event.error?.stack || '';
  if (isWebSocketClosingError(message, event.filename, stack)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}, true); // Use capture phase to catch errors early

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  const message = String(event.reason || '');
  const stack = event.reason?.stack || '';
  if (isWebSocketClosingError(message, undefined, stack)) {
    event.preventDefault();
    return false;
  }
});

// Console error filter - intercept all console.error calls
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

console.error = (...args: any[]) => {
  const message = args.map(arg => {
    if (arg instanceof Error) {
      return arg.message + ' ' + (arg.stack || '');
    }
    return String(arg);
  }).join(' ');
  
  const stack = args.find(arg => arg instanceof Error)?.stack || '';
  if (isWebSocketClosingError(message, undefined, stack)) {
    return; // Silently suppress
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const message = args.map(arg => String(arg)).join(' ');
  if (isWebSocketClosingError(message)) {
    return;
  }
  originalWarn.apply(console, args);
};

// Also intercept console.log in case errors are logged there
const originalLogApply = originalLog.apply.bind(originalLog);
console.log = (...args: any[]) => {
  const message = args.map(arg => String(arg)).join(' ');
  if (isWebSocketClosingError(message)) {
    return;
  }
  originalLogApply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
