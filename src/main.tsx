import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './pwa/registerSW';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { setupFetchInterceptor } from './lib/fetchInterceptor';

// Initialize global JWT fetch interceptor for ERP API requests
try {
  setupFetchInterceptor();
} catch (e) {
  console.warn('Fetch interceptor init warning:', e);
}

// Initialize PWA environment registration
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

