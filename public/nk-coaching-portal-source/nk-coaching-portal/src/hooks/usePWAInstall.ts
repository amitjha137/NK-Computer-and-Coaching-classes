import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Global variable so we never miss the event if it fires before React mounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('nk-pwa-prompt-ready'));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [hasAutoPrompted, setHasAutoPrompted] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already running as installed app)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);

    // Detect user agent
    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    const androidDevice = /android/.test(ua);
    setIsIOS(iosDevice);
    setIsAndroid(androidDevice);

    // Detect in-app browsers like WhatsApp, Instagram, FB, etc.
    const inApp = /fbav|instagram|fban|whatsapp|line|micromessenger|snapchat|twitter/i.test(ua);
    setIsInAppBrowser(inApp);

    // Check if prompt was already captured globally
    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(globalDeferredPrompt);
    };

    const handlePromptReady = () => {
      if (globalDeferredPrompt) {
        setDeferredPrompt(globalDeferredPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('nk-pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if URL has ?download=true or ?install=true
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if ((searchParams.get('download') === 'true' || searchParams.get('install') === 'true') && !hasAutoPrompted) {
        setHasAutoPrompted(true);
        // Delay slightly so UI is ready
        setTimeout(() => {
          if (globalDeferredPrompt) {
            globalDeferredPrompt.prompt().catch(() => {});
          }
        }, 1200);
      }
    } catch {}

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('nk-pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [hasAutoPrompted]);

  const openInChrome = (customUrl?: string) => {
    if (typeof window === 'undefined') return;
    const url = customUrl || window.location.href;
    const rawUrl = url.replace(/^https?:\/\//, '');
    // Android Chrome Intent to launch external Chrome browser from inside in-app webviews
    window.location.href = `intent://${rawUrl}#Intent;scheme=https;package=com.android.chrome;end`;
  };

  const triggerInstall = async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.error('Install prompt error:', err);
    }
    return false;
  };

  // Helper to trigger direct file download of an offline WebApp shortcut for mobile users
  const downloadOfflinePackage = () => {
    if (typeof window === 'undefined') return;
    const currentUrl = window.location.href;
    const htmlContent = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NK Classes Mobile App</title>
  <meta name="theme-color" content="#4F46E5">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <style>
    body { font-family: sans-serif; background: #0F172A; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; box-sizing: border-box; }
    .card { background: #1E293B; border: 1px solid #4F46E5; border-radius: 20px; padding: 24px; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .btn { display: inline-block; background: #10B981; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; margin-top: 16px; font-size: 16px; }
  </style>
  <script>
    window.location.replace("${currentUrl}");
  </script>
</head>
<body>
  <div class="card">
    <h2 style="margin:0 0 10px 0; color:#818CF8;">NK Classes Mobile App</h2>
    <p style="font-size:14px; color:#CBD5E1;">ऐप लोड हो रहा है... यदि स्वचालित रूप से न खुले तो नीचे बटन दबाएं:</p>
    <a class="btn" href="${currentUrl}">ऐप खोलें (Open App)</a>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'NK-Classes-Mobile-App.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    isInstallable: !!deferredPrompt || !!globalDeferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isInAppBrowser,
    triggerInstall,
    install: triggerInstall,
    openInChrome,
    downloadOfflinePackage,
  };
}
