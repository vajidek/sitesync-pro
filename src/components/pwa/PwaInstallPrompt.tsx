import React, { useState, useEffect } from 'react';
import { Smartphone, Download, WifiOff, X, Code2 } from 'lucide-react';
import { isPwaEnabled } from '../../pwa/registerSW';

export const PwaInstallPrompt: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showPrompt, setShowPrompt] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [, setIsInstalled] = useState(false);

  const pwaActive = isPwaEnabled();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (pwaActive) {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pwaActive]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;
  if (isOnline && !pwaActive && !deferredPrompt) return null;

  return (
    <div className="bg-[#0F172A] text-white px-3 sm:px-4 py-2 text-xs border-b border-slate-800 shadow-sm flex items-center justify-between w-full max-w-full overflow-x-hidden">
      <div className="flex items-center space-x-2 sm:space-x-2.5 max-w-7xl mx-auto w-full min-w-0">
        {!isOnline ? (
          <div className="flex items-center space-x-2 text-amber-300 font-bold min-w-0">
            <WifiOff className="w-4 h-4 animate-pulse flex-shrink-0" />
            <span className="truncate">Offline Mode • PWA background sync queues field logs locally until reconnected.</span>
          </div>
        ) : !pwaActive ? (
          <div className="flex items-center space-x-2 text-slate-300 min-w-0">
            <Code2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="truncate">
              <strong className="text-amber-400">PWA DISABLED</strong> • Service Worker is disabled (`VITE_PWA_ENABLE=false` or missing).
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-blue-300 min-w-0">
            <Smartphone className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="truncate">
              <strong>SiteSync Pro PWA Active</strong> • Service Worker registered (`VITE_PWA_ENABLE=true`).
            </span>
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="ml-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-[11px] transition flex items-center space-x-1 flex-shrink-0"
              >
                <Download className="w-3 h-3" />
                <span>Install App</span>
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowPrompt(false)}
        className="p-1 rounded text-slate-400 hover:text-white"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
