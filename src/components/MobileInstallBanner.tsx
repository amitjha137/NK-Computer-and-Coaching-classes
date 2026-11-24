import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles, ArrowRight, ExternalLink, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  onOpenInstallModal: () => void;
}

export const MobileInstallBanner: React.FC<Props> = ({ onOpenInstallModal }) => {
  const { isInstalled, isInstallable, isInAppBrowser, triggerInstall, openInChrome } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showInlineGuide, setShowInlineGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Do not show if already running inside installed standalone app or dismissed
  if (isInstalled || dismissed) {
    return null;
  }

  const handleAction = async () => {
    if (isInAppBrowser) {
      openInChrome();
      return;
    }

    if (isInstallable) {
      const installed = await triggerInstall();
      if (installed) {
        setInstallSuccess(true);
        setTimeout(() => setDismissed(true), 4000);
      } else {
        setShowInlineGuide(true);
      }
    } else {
      setShowInlineGuide(true);
    }
  };

  return (
    <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:max-w-md z-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/50 rounded-2xl shadow-2xl p-3 text-white backdrop-blur-md animate-in slide-in-from-bottom-3">
      {/* If Installation just completed successfully */}
      {installSuccess ? (
        <div className="flex items-center gap-3 p-1 text-emerald-300">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-extrabold text-white text-sm">ऐप आपके मोबाइल में इंस्टॉल हो गई है!</p>
            <p className="text-emerald-300 mt-0.5">अब अपने फ़ोन की होम स्क्रीन पर बने <strong>NK Classes</strong> ऐप आइकॉन से सीधे खोलें।</p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Banner Bar */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0 cursor-pointer" onClick={handleAction}>
              <img
                src="/pwa-192x192.png"
                alt="NK Logo"
                className="w-11 h-11 rounded-xl object-cover border-2 border-indigo-400 shadow-md"
              />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div className="flex-1 min-w-0 cursor-pointer" onClick={handleAction}>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white truncate">Install NK Classes App</span>
                <span className="text-[9px] bg-emerald-500/30 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-400/30">
                  Android App
                </span>
              </div>
              <p className="text-[11px] text-indigo-200 truncate">
                फ़ोन में इंस्टॉल करें (बिना ब्राउज़र के चलाएं)
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleAction}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>Download / Install</span>
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inline Step-by-Step Guide: Opens instantly if browser prompt is pending */}
          {showInlineGuide && (
            <div className="mt-3 pt-3 border-t border-indigo-500/30 text-xs space-y-2.5 animate-in fade-in zoom-in-95">
              {isInAppBrowser ? (
                <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-200 space-y-2">
                  <p className="font-bold text-amber-300">⚠️ आप WhatsApp / In-App ब्राउज़र में हैं</p>
                  <p className="text-[11px] text-amber-200 leading-relaxed">
                    सीधे फ़ोन में इंस्टॉल करने के लिए नीचे दिए गए बटन से Chrome में खोलें:
                  </p>
                  <button
                    onClick={() => openInChrome()}
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg flex items-center justify-center gap-1.5 shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Google Chrome (क्रोम में खोलें)</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-800/90 rounded-xl border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                    <span>📱 Chrome में सीधे इंस्टॉल करने का तरीका:</span>
                    <button
                      onClick={() => setShowInlineGuide(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between text-[11px] text-slate-300">
                    <span>1. ऊपर दाईं ओर <strong>3-डॉट्स (⋮)</strong> दबाएं</span>
                    <span className="bg-emerald-500/30 text-emerald-300 font-extrabold px-2 py-0.5 rounded border border-emerald-400 animate-pulse text-sm">
                      ⋮
                    </span>
                  </div>

                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    2. मेनू में से <strong className="text-emerald-300">&quot;Install app&quot;</strong> या <strong className="text-emerald-300">&quot;Add to Home screen&quot; (होम स्क्रीन में जोड़ें)</strong> दबाएं!
                  </p>

                  <div className="bg-indigo-950/60 p-2 rounded-lg border border-indigo-500/30 text-[11px] text-indigo-200 leading-relaxed">
                    ✨ <strong>महत्वपूर्ण:</strong> इंस्टॉल होने के बाद अपने फ़ोन की <strong>होम स्क्रीन पर बने &quot;NK Classes&quot; ऐप आइकॉन</strong> से खोलें — यह बिना किसी ब्राउज़र या URL बार के बिल्कुल असली Android ऐप की तरह चलेगी!
                  </div>

                  <button
                    onClick={onOpenInstallModal}
                    className="w-full py-1.5 text-center text-[11px] text-indigo-300 hover:text-white underline cursor-pointer"
                  >
                    अन्य तरीके व QR कोड देखें
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

