import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  QrCode,
  FileDown,
  Check
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getPublicAppUrl, getDevAppUrl } from '../utils/appUrl';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallMobileAppModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInAppBrowser, triggerInstall, openInChrome, downloadOfflinePackage } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [fileDownloaded, setFileDownloaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'auto' | 'android' | 'ios'>('auto');
  const [linkType, setLinkType] = useState<'public' | 'dev'>('dev');
  const [showStepGuide, setShowStepGuide] = useState(false);

  if (!isOpen) return null;

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const rawPublicUrl = getPublicAppUrl();
  const rawDevUrl = getDevAppUrl();
  const baseSelectedUrl = linkType === 'public' ? rawPublicUrl : rawDevUrl;
  const currentUrl = `${baseSelectedUrl}?download=true`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadFile = () => {
    downloadOfflinePackage();
    setFileDownloaded(true);
    setTimeout(() => setFileDownloaded(false), 4000);
  };

  const handleDirectInstall = async () => {
    if (isInAppBrowser) {
      openInChrome();
      return;
    }
    if (isInstallable) {
      const success = await triggerInstall();
      if (success) {
        onClose();
        return;
      }
    }
    // If browser didn't pop up directly or is waiting, show animated step-by-step guidance
    setShowStepGuide(true);
    setActiveTab(isIOS ? 'ios' : 'android');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden text-white my-auto max-h-[90vh] flex flex-col">
        {/* Header with App Brand Banner */}
        <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 border-b border-indigo-500/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="/pwa-192x192.png"
                alt="NK Classes App"
                className="w-16 h-16 rounded-2xl border-2 border-indigo-400 shadow-xl object-cover"
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full shadow border-2 border-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Official Mobile App
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v2.4 PWA
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">NK Classes Mobile App</h2>
              <p className="text-xs text-indigo-200">कोचिंग एवं कंप्यूटर क्लासेस - अपने फ़ोन में चलाएं</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Already installed banner */}
          {isInstalled && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-200">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">ऐप पहले से ही आपके डिवाइस में इनस्टॉल है!</p>
                <p className="text-xs text-emerald-300 mt-0.5">आप अपने होम स्क्रीन ऐप आइकॉन से सीधे इसे खोल सकते हैं।</p>
              </div>
            </div>
          )}

          {/* In-app browser warning (WhatsApp / Instagram / FB) with 1-Click Launch */}
          {isInAppBrowser && (
            <div className="p-4 bg-amber-950/80 border border-amber-500/50 rounded-2xl space-y-2 text-amber-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-300 text-sm">WhatsApp / In-App ब्राउज़र में खुला है</p>
                  <p className="mt-1 leading-relaxed">
                    WhatsApp में ऐप इंस्टॉल बटन सीधे नहीं खुलता। नीचे दिए गए बटन से इसे सीधे <strong>Google Chrome</strong> में खोलें:
                  </p>
                </div>
              </div>
              <button
                onClick={() => openInChrome(currentUrl)}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Google Chrome (क्रोम में खोलें)</span>
              </button>
            </div>
          )}

          {/* Primary Mobile Install Button - ALWAYS VISIBLE */}
          {!isInstalled && (
            <div className="p-4 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-950 border-2 border-emerald-500/50 rounded-2xl text-center space-y-3 shadow-xl">
              <div className="flex items-center justify-center gap-2 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>डायरेक्ट 1-क्लिक मोबाइल ऐप डाउनलोड / इनस्टॉल</span>
              </div>
              <button
                onClick={handleDirectInstall}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
              >
                <Download className="w-5 h-5 animate-bounce" />
                <span>Direct Download &amp; Install App / फ़ोन में इनस्टॉल करें</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="text-xs text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-1.5 cursor-pointer bg-emerald-950/50 hover:bg-emerald-900/50 px-3 py-1.5 rounded-xl border border-emerald-500/30"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download App File (.html shortcut)</span>
                </button>
              </div>

              {fileDownloaded && (
                <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>सफल! ऐप फ़ाइल आपके फ़ोन के डाउनलोड फ़ोल्डर में सेव हो गई।</span>
                </div>
              )}

              <p className="text-[11px] text-slate-300 leading-relaxed">
                बिना प्ले स्टोर के सीधे आपके फ़ोन की होम स्क्रीन पर ऐप का असली आइकॉन बन जाएगा।
              </p>
            </div>
          )}

          {/* Visual Interactive Step-by-Step Chrome Helper (Shows when clicked or toggled) */}
          {showStepGuide && !isIOS && (
            <div className="p-4 bg-slate-800/95 border-2 border-emerald-500/60 rounded-2xl space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Chrome में 2-सेकंड में इंस्टॉल करने का तरीका:
                </span>
                <button
                  onClick={() => setShowStepGuide(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Simulated Mobile Chrome Toolbar illustration */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
                  <span className="truncate max-w-[200px] text-[11px] font-mono text-slate-400">ais-dev-...run.app</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold text-xs">यहाँ टैप करें 👉</span>
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500 animate-pulse font-extrabold text-sm">
                      ⋮
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-800/95 rounded-lg border border-indigo-500/40 text-xs space-y-1.5">
                  <p className="text-slate-200 font-semibold">1. Chrome के ऊपर दाईं ओर बने <strong>3-डॉट्स (⋮)</strong> पर टैप करें।</p>
                  <p className="text-emerald-300 font-bold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/30 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">✓</span>
                    <span>2. मेनू में <strong>&quot;Install app&quot;</strong> या <strong>&quot;Add to Home screen&quot; (होम स्क्रीन में जोड़ें)</strong> चुनें!</span>
                  </p>
                  <p className="text-slate-300">3. <strong>&quot;Install&quot;</strong> दबाएं — ऐप तुरंत आपके फ़ोन के होम स्क्रीन पर आ जाएगी।</p>
                </div>
              </div>
            </div>
          )}

          {/* If inside iFrame preview: Provide 1-Click Launch into Real Browser Tab */}
          {isInIframe && (
            <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/40 rounded-2xl text-center space-y-3 shadow-lg">
              <div className="flex items-center justify-center gap-2 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>लैपटॉप व मोबाइल में 1-क्लिक इंस्टॉल</span>
              </div>
              <button
                onClick={() => window.open(rawDevUrl, '_blank')}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Open in Full Browser Tab (फुल टैब में खोलें व इंस्टॉल करें)</span>
              </button>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                प्रिव्यू फ्रेम की जगह पूरे नए टैब में खुलते ही Chrome के एड्रेस बार में <strong>Install</strong> आइकॉन आ जाता है।
              </p>
            </div>
          )}

          {/* Device Tabs for Step-by-Step Instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                मोबाइल में इनस्टॉल / डाउनलोड करने का तरीका:
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700/80 mb-3 text-xs">
              <button
                onClick={() => setActiveTab('android')}
                className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'android' || (activeTab === 'auto' && !isIOS)
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Android (Chrome)</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'ios' || (activeTab === 'auto' && isIOS)
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>iPhone / iPad (iOS)</span>
              </button>
            </div>

            {/* Android Instructions */}
            {(activeTab === 'android' || (activeTab === 'auto' && !isIOS)) && (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs shrink-0">1</span>
                  <p className="text-xs text-slate-200">
                    इस लिंक को अपने मोबाइल के <strong>Google Chrome</strong> ब्राउज़र में खोलें।
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs shrink-0">2</span>
                  <p className="text-xs text-slate-200">
                    Chrome में ऊपर दाईं ओर <strong>3-डॉट्स (⋮)</strong> मेनू पर क्लिक करें।
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs shrink-0">3</span>
                  <p className="text-xs text-slate-200">
                    सूची में से <strong>"Install app"</strong> या <strong>"Add to Home screen" (होम स्क्रीन में जोड़ें)</strong> पर टैप करें।
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">✓</span>
                  <p className="text-xs text-emerald-300 font-semibold">
                    'Install' पर क्लिक करें — NK Classes ऐप आपके मोबाइल के होम स्क्रीन और ऐप ड्रॉअर में आ जाएगी!
                  </p>
                </div>
              </div>
            )}

            {/* iOS Safari Instructions */}
            {(activeTab === 'ios' || (activeTab === 'auto' && isIOS)) && (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs shrink-0">1</span>
                  <p className="text-xs text-slate-200">
                    इस लिंक को <strong>Safari</strong> ब्राउज़र में खोलें।
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs shrink-0">2</span>
                  <p className="text-xs text-slate-200">
                    सफारी में नीचे स्थित <strong>Share (⎋ / शेयर आइकॉन)</strong> बटन पर टैप करें।
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs shrink-0">3</span>
                  <p className="text-xs text-slate-200">
                    नीचे स्क्रॉल करें और <strong>"Add to Home Screen" (+ होम स्क्रीन में जोड़ें)</strong> पर टैप करें।
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">✓</span>
                  <p className="text-xs text-emerald-300 font-semibold">
                    ऊपर दाईं ओर <strong>"Add"</strong> पर क्लिक करें — ऐप आपके iPhone पर इंस्टॉल हो जाएगी!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Dual Error Explanation: 404 Not Found & 403 Forbidden */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>&quot;URL not found (404)&quot; या &quot;403 Forbidden&quot; का समाधान:</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300 leading-relaxed pl-6">
              <p>
                <strong>404 URL Not Found क्यों आया?</strong> Google AI Studio में जब तक आप ऊपर दाईं ओर स्थित <strong>&quot;Share&quot; (शेयर)</strong> बटन नहीं दबाते, तब तक पब्लिक लिंक सक्रिय नहीं होती।
              </p>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-semibold mt-1">
                👉 <strong>1-क्लिक समाधान:</strong> ऊपर AI Studio में <strong>&quot;Share&quot;</strong> बटन दबाएं, उसके बाद नीचे दी गई <strong>पब्लिक लिंक</strong> किसी भी फ़ोन पर तुरंत खुल जाएगी!
              </div>
            </div>
          </div>

          {/* Link Type Selector Tabs */}
          <div className="flex p-1 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs font-bold">
            <button
              onClick={() => setLinkType('public')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                linkType === 'public'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Public Share Link (सार्वजनिक)
            </button>
            <button
              onClick={() => setLinkType('dev')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                linkType === 'dev'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔒 Dev Direct Link (डेवलपर)
            </button>
          </div>

          {/* Direct Link Share & Copy */}
          <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                {linkType === 'public'
                  ? 'Public Link (AI Studio में Share बटन दबाने के बाद सक्रिय):'
                  : 'Dev Link (अगर मोबाइल Chrome में आपका Google Account लॉगिन है):'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-slate-950 text-indigo-300 font-mono text-xs px-3 py-2 rounded-xl border border-slate-700 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-700/50">
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open App in New Tab
              </a>
              <button
                onClick={() => {
                  const text = encodeURIComponent(
                    `📚 *NK Classes Mobile App*\n\nNeeche diye link se app mobile me Install karein:\n👉 ${currentUrl}\n\n(Mobile me Chrome me open karke 3-dots se "Install app" karein)`
                  );
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share on WhatsApp
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <div className="w-24 h-24 bg-white p-1.5 rounded-xl shrink-0 flex items-center justify-center">
              <img src={qrCodeUrl} alt="Public App QR Code" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>फोन कैमरा से QR कोड स्कैन करें</span>
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                अपने मोबाइल के कैमरा से स्कैन करें — यह सीधे पब्लिक लिंक खोलेगा और बिना 403 एरर के ऐप इंस्टॉल हो जाएगी।
              </p>
            </div>
          </div>

          {/* Key Advantages Checklist */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="font-bold text-[11px] text-white">No Play Store</p>
              <p className="text-[10px] text-slate-400">सीधा 1-टैप इनस्टॉल</p>
            </div>
            <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="font-bold text-[11px] text-white">Full Screen</p>
              <p className="text-[10px] text-slate-400">असली ऐप जैसा फील</p>
            </div>
            <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <Smartphone className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <p className="font-bold text-[11px] text-white">0 MB Storage</p>
              <p className="text-[10px] text-slate-400">मोबाइल हैंग नहीं होगा</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">NK Coaching & Computer Classes</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Close (बंद करें)
          </button>
        </div>
      </div>
    </div>
  );
};
