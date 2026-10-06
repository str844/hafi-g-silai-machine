// Ensure window.fetch is writable and has a setter so libraries patching fetch do not throw
try {
  let currentFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    get: () => currentFetch,
    set: (newFetch) => {
      currentFetch = newFetch;
    },
    configurable: true,
    enumerable: true,
  });
} catch {}

// Google Maps Platform Quota Defense & Auth listener
if (typeof window !== 'undefined') {
  (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
    window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  };
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = args.map((a) => String(a)).join(' ');
    if (msg.includes('ApiNotActivatedMapError') || msg.includes('RefererNotAllowedMapError')) {
      window.dispatchEvent(new CustomEvent('gmp-auth-failure'));
      return;
    }
    origError.apply(console, args);
    if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  };
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
