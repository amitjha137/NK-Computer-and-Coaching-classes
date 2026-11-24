import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Laptop,
  Apple,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Info,
  Sparkles,
  Zap,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getPublicAppUrl, getDevAppUrl, SHARED_PUBLIC_APP_URL, DEV_APP_URL } from '../utils/appUrl';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInAppBrowser, triggerInstall, openInChrome, downloadOfflinePackage } = usePWAInstall();
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedDev, setCopiedDev] = useState(false);
  const [downloadedPackage, setDownloadedPackage] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'pc'>('android');
  const [selectedLinkType, setSelectedLinkType] = useState<'public' | 'dev'>('dev');
  const [showStepGuide, setShowStepGuide] = useState(false);

  if (!isOpen) return null;

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const publicAppUrl = getPublicAppUrl();
  const devAppUrl = getDevAppUrl();
  const currentSelectedUrl = selectedLinkType === 'public' ? publicAppUrl : devAppUrl;

  const handleCopyPublic = async () => {
    try {
      await navigator.clipboard.writeText(publicAppUrl);
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2500);
    } catch {
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2500);
    }
  };

  const handleCopyDev = async () => {
    try {
      await navigator.clipboard.writeText(devAppUrl);
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2500);
    } catch {
      setCopiedDev(true);
      setTimeout(() => setCopiedDev(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📚 *NK Coaching & Computer Classes Mobile App*\n\nNeeche diye link se app open karein aur phone me Install karein:\n👉 ${currentSelectedUrl}\n\n(Mobile me Chrome browser me open karke 3-dots se "Install app" ya "Add to Home screen" karein)`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const success = await triggerInstall();
      if (success) {
        onClose();
        return;
      }
    }
    setShowStepGuide(true);
    setActivePlatform(isIOS ? 'ios' : 'android');
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentSelectedUrl)}&margin=10`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative border-b border-indigo-500/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src="/pwa-192x192.png"
                alt="NK Classes Logo"
                className="w-14 h-14 rounded-2xl border-2 border-indigo-400/50 shadow-xl object-cover"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow border-2 border-slate-900">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                  NK Classes Mobile App
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Official PWA
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                कोचिंग एवं कंप्यूटर क्लासेस — मोबाइल में डाउनलोड व इंस्टॉल करें
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* If already installed */}
          {isInstalled && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">ऐप पहले से ही आपके डिवाइस में इनस्टॉल है!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  आप अपने फ़ोन के होम स्क्रीन ऐप आइकॉन से सीधे इसे खोल सकते हैं।
                </p>
              </div>
            </div>
          )}

          {/* If opened inside WhatsApp/Instagram In-App Browser */}
          {isInAppBrowser && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2.5 text-amber-900">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-900 text-sm">
                    ⚠️ WhatsApp / इन-ऐप ब्राउज़र में खुला है
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    WhatsApp में सीधे इंस्टॉल नहीं होता। नीचे दिए गए बटन पर क्लिक करके इसे <strong>Google Chrome</strong> में खोलें:
                  </p>
                </div>
              </div>
              <button
                onClick={() => openInChrome(currentSelectedUrl)}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Google Chrome (क्रोम ब्राउज़र में खोलें)</span>
              </button>
            </div>
          )}

          {/* One-Click Direct Install Button - ALWAYS VISIBLE FOR EASY INSTALL */}
          {!isInstalled && (
            <div className="p-4 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-500/40 text-center space-y-2.5 shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>{isInstallable ? 'One-Click Fast Install Available' : 'Direct Mobile Installation'}</span>
              </div>
              <button
                onClick={handleDirectInstall}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
              >
                <Download className="w-5 h-5" />
                <span>Install Mobile App Now (फ़ोन में इंस्टॉल करें)</span>
              </button>
              <p className="text-[11px] text-slate-300">
                सीधे आपके फ़ोन की होम स्क्रीन पर असली ऐप जैसा आइकॉन बन जाएगा (No Play Store required)
              </p>
            </div>
          )}

          {/* Visual Interactive Chrome 3-Dots Guide */}
          {showStepGuide && !isIOS && (
            <div className="p-4 bg-slate-900 text-white border-2 border-emerald-500/80 rounded-2xl space-y-3 animate-in fade-in zoom-in-95 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Chrome में 2-सेकंड में ऐप कैसे लगाएं:
                </span>
                <button
                  onClick={() => setShowStepGuide(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] truncate max-w-[200px]">ais-dev-...run.app</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold text-xs">यहाँ क्लिक करें 👉</span>
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/30 text-emerald-300 border border-emerald-400 animate-pulse font-extrabold text-sm">
                      ⋮
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-slate-200">1. Chrome में ऊपर दाईं ओर <strong>3-डॉट्स (⋮)</strong> पर टैप करें।</p>
                  <p className="text-emerald-300 font-bold bg-emerald-950/80 p-2 rounded-lg border border-emerald-500/40 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[10px]">✓</span>
                    <span>2. <strong>&quot;Install app&quot;</strong> या <strong>&quot;Add to Home screen&quot; (होम स्क्रीन में जोड़ें)</strong> चुनें!</span>
                  </p>
                  <p className="text-slate-300">3. <strong>&quot;Install&quot;</strong> दबाएं — ऐप तुरंत आपके मोबाइल में आ जाएगी।</p>
                </div>
              </div>
            </div>
          )}

          {/* If inside Preview iFrame: Provide Direct 1-Click Launch into Real Browser Tab */}
          {isInIframe && (
            <div className="p-4 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/40 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 font-bold text-sm text-indigo-200">
                <Laptop className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>लैपटॉप या मोबाइल में सीधे 1-क्लिक में ऐप इंस्टॉल करें:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ब्राउज़र सुरक्षा कारणों से AI Studio के इस छोटे प्रिव्यू फ्रेम के अंदर इंस्टॉल बटन सक्रिय नहीं होता। नीचे दिए गए बटन से इसे <strong>नए टैब</strong> में खोलें — वहां Chrome का <strong>&quot;Install App&quot;</strong> बटन तुरंत एक्टिव हो जाएगा!
              </p>
              <button
                onClick={() => window.open(devAppUrl, '_blank')}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Full Browser Tab (फुल टैब में खोलें व इंस्टॉल करें)</span>
              </button>
            </div>
          )}

          {/* Dual Error Explanation: 404 URL Not Found & 403 Forbidden */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>&quot;URL not found&quot; या &quot;403 Forbidden&quot; एरर का कारण और 100% समाधान:</span>
            </div>
            <div className="space-y-1.5 text-slate-700 leading-relaxed pl-7">
              <p>
                <strong>1. &quot;URL not found on this server (404)&quot; क्यों आया?</strong><br />
                Google AI Studio में जब तक आप ऊपर दाईं ओर स्थित <strong>&quot;Share&quot; (शेयर)</strong> बटन नहीं दबाते, तब तक गूगल सर्वर पब्लिक लिंक को एक्टिवेट नहीं करता।
              </p>
              <p>
                <strong>2. &quot;403 Forbidden&quot; क्यों आता है?</strong><br />
                अगर बिना शेयर किए आप सीधे एड्रेस बार की <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-[11px]">ais-dev-...</code> लिंक फ़ोन पर खोलते हैं, तो वह Google Account न मिलने पर 403 एरर देती है।
              </p>
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-950 font-semibold mt-2">
                👉 <strong>सबसे सरल समाधान (1 क्लिक):</strong> AI Studio स्क्रीन के ऊपर दाईं ओर (Top Right) <strong>&quot;Share&quot;</strong> बटन दबाएं! उसके बाद नीचे दिया गया <strong>पब्लिक लिंक</strong> किसी भी फ़ोन पर 100% बिना किसी एरर के ऐप इंस्टॉल कर देगा।
              </div>
            </div>
          </div>

          {/* Link Type Selector Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setSelectedLinkType('public')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                selectedLinkType === 'public'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌐 विकल्प 1: Public Share Link (सार्वजनिक लिंक)
            </button>
            <button
              onClick={() => setSelectedLinkType('dev')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
                selectedLinkType === 'dev'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔒 विकल्प 2: Dev Direct Link (डेवलपर लिंक)
            </button>
          </div>

          {/* Main Direct Download Link Box */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                {selectedLinkType === 'public'
                  ? 'पब्लिक ऐप लिंक (AI Studio में Share दबाने के बाद सक्रिय)'
                  : 'डायरेक्ट देव लिंक (फ़ोन में Google Login होने पर तुरंत सक्रिय)'}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                selectedLinkType === 'public'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {selectedLinkType === 'public' ? '100% Safe For All' : 'For Your Google Login'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-indigo-200/80 shadow-xs">
              <input
                type="text"
                readOnly
                value={currentSelectedUrl}
                className="w-full text-xs font-mono text-slate-700 bg-transparent outline-hidden px-2 select-all"
              />
              <button
                onClick={selectedLinkType === 'public' ? handleCopyPublic : handleCopyDev}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs ${
                  (selectedLinkType === 'public' ? copiedPublic : copiedDev)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {(selectedLinkType === 'public' ? copiedPublic : copiedDev) ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </>
                )}
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-100/80">
              <a
                href={currentSelectedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-600" /> New Tab में टेस्ट करें
              </a>

              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> WhatsApp पर भेजें
              </button>

              <button
                onClick={() => {
                  downloadOfflinePackage();
                  setDownloadedPackage(true);
                  setTimeout(() => setDownloadedPackage(false), 4000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                title="Direct WebApp Launcher File Download"
              >
                <Download className="w-3.5 h-3.5" />
                {downloadedPackage ? 'App फ़ाइल डाउनलोड हो गई!' : 'डायरेक्ट App फ़ाइल डाउनलोड करें'}
              </button>
            </div>
          </div>

          {/* QR Code & Mobile Scan Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="w-32 h-32 sm:w-36 sm:h-36 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              <img
                src={qrCodeUrl}
                alt="App QR Code"
                className="w-full h-full object-contain rounded-lg"
                loading="lazy"
              />
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-900 font-bold text-sm">
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>फोन कैमरा से QR कोड स्कैन करें</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                अपने मोबाइल के कैमरा या Google Lens से QR कोड स्कैन करें। लिंक सीधे Chrome/Safari में खुलेगी और बिना Play Store के 1-टैप में ऐप इंस्टॉल हो जाएगी।
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Safe &amp; Verified
                </span>
                <span>•</span>
                <span>Works Offline</span>
              </div>
            </div>
          </div>

          {/* Step-by-step Installation Guide */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                मोबाइल में ऐप डाउनलोड / इंस्टॉल करने के चरण:
              </h4>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-3 border border-slate-200">
              <button
                onClick={() => setActivePlatform('android')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePlatform === 'android'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Android (Chrome)
              </button>
              <button
                onClick={() => setActivePlatform('ios')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePlatform === 'ios'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Apple className="w-3.5 h-3.5" /> iPhone (Safari)
              </button>
              <button
                onClick={() => setActivePlatform('pc')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePlatform === 'pc'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> Laptop / PC
              </button>
            </div>

            {/* Instructions Content */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 space-y-2.5">
              {activePlatform === 'android' && (
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p>लिंक को <strong>Google Chrome</strong> ब्राउज़र में खोलें (WhatsApp के अंदर नहीं)।</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p>Chrome में ऊपर दाईं ओर <strong>3-डॉट्स (⋮)</strong> मेनू पर टैप करें।</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <p>वहां <strong>&quot;Install app&quot;</strong> या <strong>&quot;Add to Home screen&quot; (होम स्क्रीन में जोड़ें)</strong> चुनें।</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <p className="text-emerald-700 font-semibold">
                      <strong>&quot;Install&quot;</strong> पर क्लिक करें — NK Classes ऐप आपके फ़ोन के ऐप्स में आ जाएगी!
                    </p>
                  </div>
                </div>
              )}

              {activePlatform === 'ios' && (
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p>लिंक को iPhone/iPad के <strong>Safari</strong> ब्राउज़र में खोलें।</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p>नीचे सफारी टूलबार में <strong>Share</strong> बटन (⎋ तीर वाला आइकॉन) पर टैप करें।</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <p>नीचे स्क्रॉल करें और <strong>&quot;Add to Home Screen&quot; (+ होम स्क्रीन में जोड़ें)</strong> चुनें।</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <p className="text-emerald-700 font-semibold">
                      ऊपर <strong>&quot;Add&quot;</strong> दबाएं — ऐप iPhone होम स्क्रीन पर आ जाएगी!
                    </p>
                  </div>
                </div>
              )}

              {activePlatform === 'pc' && (
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <p>Google Chrome या Microsoft Edge ब्राउज़र में लिंक खोलें।</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <p>एड्रेस बार के दाईं ओर छोटा <strong>कंप्यूटर/इंस्टॉल आइकॉन (⊕)</strong> दिखेगा।</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <p className="text-emerald-700 font-semibold">
                      <strong>&quot;Install NK App&quot;</strong> पर क्लिक करें — डेस्कटॉप पर ऐप खुल जाएगी।
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advantages Grid */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="font-bold text-xs text-slate-800">No Play Store</p>
              <p className="text-[10px] text-slate-500">सीधा 1-टैप इनस्टॉल</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="font-bold text-xs text-slate-800">Full Screen</p>
              <p className="text-[10px] text-slate-500">असली ऐप जैसा फील</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Smartphone className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <p className="font-bold text-xs text-slate-800">0 MB Storage</p>
              <p className="text-[10px] text-slate-500">फोन हैंग नहीं होगा</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            NK Coaching &amp; Computer Classes • Mobile PWA v2.4
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close (बंद करें)
          </button>
        </div>
      </div>
    </div>
  );
};
