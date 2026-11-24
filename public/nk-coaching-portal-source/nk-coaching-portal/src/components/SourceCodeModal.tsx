import React, { useState } from 'react';
import {
  FolderArchive,
  Download,
  FolderTree,
  Terminal,
  Copy,
  Check,
  X,
  FileCode,
  Folder,
  Layers,
  ChevronRight,
  ExternalLink,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface SourceCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourceCodeModal: React.FC<SourceCodeModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleDirectDownload = () => {
    setDownloading(true);
    // Trigger download via anchor
    const link = document.createElement('a');
    link.href = '/api/download-source-zip';
    link.download = 'nk-coaching-portal-source.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 2000);
  };

  const fileTree = [
    {
      name: 'nk-coaching-portal/',
      type: 'dir',
      children: [
        {
          name: 'src/',
          type: 'dir',
          children: [
            {
              name: 'components/',
              type: 'dir',
              children: [
                { name: 'admin/ (Dashboard, Fees, DB Manager, Gateways)', type: 'file' },
                { name: 'teacher/ (Attendance, Tests, Marks)', type: 'file' },
                { name: 'student/ (Portal, Online Tests, Notes)', type: 'file' },
                { name: 'parent/ (Receipts, Progress, Direct Alerts)', type: 'file' },
                { name: 'public/ (Website, Admissions, Courses)', type: 'file' },
                { name: 'FeeReceiptModal.tsx (Thermal/PDF & WhatsApp Receipt)', type: 'file' },
                { name: 'CertificateModal.tsx (Official Certificate Generator)', type: 'file' },
                { name: 'DigitalIDCardModal.tsx (QR Student Identity Cards)', type: 'file' },
                { name: 'TakeTestModal.tsx (Online Computer Examination)', type: 'file' },
                { name: 'Navbar.tsx (Multi-role Navigation)', type: 'file' }
              ]
            },
            {
              name: 'services/',
              type: 'dir',
              children: [
                { name: 'dispatchService.ts (Direct WhatsApp & SMS Engine)', type: 'file' },
                { name: 'db.ts (IndexedDB + LocalStorage Sync Engine)', type: 'file' }
              ]
            },
            {
              name: 'context/',
              type: 'dir',
              children: [
                { name: 'AppContext.tsx (Central State & Business Logic)', type: 'file' }
              ]
            },
            {
              name: 'data/',
              type: 'dir',
              children: [
                { name: 'initialData.ts (Demo Records, Courses & Batches)', type: 'file' }
              ]
            },
            { name: 'types.ts (All TypeScript Interfaces)', type: 'file' },
            { name: 'App.tsx (Main Application Shell)', type: 'file' },
            { name: 'main.tsx (React 18 Entry Point)', type: 'file' },
            { name: 'index.css (Tailwind CSS styling)', type: 'file' }
          ]
        },
        {
          name: 'public/',
          type: 'dir',
          children: [
            { name: 'manifest.json (PWA Web App Manifest)', type: 'file' },
            { name: 'sw.js (Service Worker for Offline Mode)', type: 'file' },
            { name: 'icon.svg (Institute Logo SVG)', type: 'file' },
            { name: 'assets/ (Images, Badges, Illustrations)', type: 'dir' }
          ]
        },
        { name: 'server.ts (Node.js & Express API Gateway Server)', type: 'file' },
        { name: 'package.json (Dependencies & Build Scripts)', type: 'file' },
        { name: 'tsconfig.json (TypeScript Config)', type: 'file' },
        { name: 'vite.config.ts (Vite Dev & Build Pipeline)', type: 'file' },
        { name: 'README.md (Complete Setup Guide in Hindi & English)', type: 'file' }
      ]
    }
  ];

  const terminalCommands = `# 1. Downloaded ZIP file ko unzip (extract) karein
unzip nk-coaching-portal-source.zip
cd nk-coaching-portal

# 2. Saare node packages install karein
npm install

# 3. Development server run karein
npm run dev

# Browser me kholein:
# http://localhost:3000`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-inner border border-indigo-400/40">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                प्रोजेक्ट सोर्स कोड फ़ोल्डर (Full Source Code)
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Ready to Download
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                अभी तक का संपूर्ण प्रोजेक्ट कोड एक ज़िप फ़ोल्डर में उपलब्ध है
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Hero Bar */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 border-b border-indigo-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              1-क्लिक में पूरा कोड फ़ोल्डर (.ZIP) डाउनलोड करें
            </h4>
            <p className="text-xs text-slate-600">
              इसमें Frontend (React+Vite), Backend (server.ts), WhatsApp Dispatch API, IndexedDB, Tailwind, और सभी कम्पोनेंट्स शामिल हैं।
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDirectDownload}
              disabled={downloading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? 'ज़िप फ़ाइल तैयार हो रही है...' : 'Download Code Folder (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Setup Instructions */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>अपने कंप्यूटर पर चलाने के कमांड (Terminal Commands)</span>
              </div>
              <button
                onClick={() => handleCopy(terminalCommands, 'terminal')}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {copiedSection === 'terminal' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>कमांड्स कॉपी करें</span>
                  </>
                )}
              </button>
            </div>
            <pre className="font-mono text-xs text-slate-300 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-slate-800/80 overflow-x-auto">
              {terminalCommands}
            </pre>
          </div>

          {/* Folder Hierarchy Visualizer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-600" />
                प्रोजेक्ट फ़ोल्डर संरचना (Folder Hierarchy)
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">30+ Production Source Files</span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 text-xs font-mono space-y-1.5 max-h-64 overflow-y-auto">
              <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                <span>nk-coaching-portal/</span>
              </div>
              
              <div className="pl-4 border-l border-slate-300/80 space-y-1.5 mt-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-600 fill-amber-100" />
                  <span>src/</span>
                </div>
                <div className="pl-4 border-l border-slate-200 space-y-1 text-slate-600 text-[11px]">
                  <div>📁 components/admin/ (Admin Dashboard, DatabaseManager, FeeAnalytics)</div>
                  <div>📁 components/teacher/ (Attendance, Online Tests, Homework)</div>
                  <div>📁 components/student/ (Student Portal, Mock Tests, Notes)</div>
                  <div>📁 components/parent/ (Progress Tracking, Fee Receipts)</div>
                  <div>📁 components/public/ (Admission Inquiries, Course Catalog)</div>
                  <div>📁 services/ (dispatchService.ts, db.ts IndexedDB engine)</div>
                  <div>📁 context/ (AppContext.tsx central provider)</div>
                  <div>📄 types.ts (Data models & role definitions)</div>
                  <div>📄 App.tsx & main.tsx</div>
                </div>

                <div className="font-semibold text-slate-800 flex items-center gap-1.5 pt-1">
                  <Folder className="w-3.5 h-3.5 text-blue-600 fill-blue-100" />
                  <span>public/</span>
                </div>
                <div className="pl-4 border-l border-slate-200 space-y-1 text-slate-600 text-[11px]">
                  <div>📄 manifest.json (PWA configuration)</div>
                  <div>📄 sw.js (Offline service worker)</div>
                  <div>📁 assets/ (Course graphics & badges)</div>
                </div>

                <div className="text-indigo-700 font-medium pt-1">
                  📄 server.ts (Express API server + Direct WhatsApp dispatch)
                </div>
                <div className="text-slate-600 text-[11px]">📄 package.json, tsconfig.json, vite.config.ts</div>
                <div className="text-emerald-700 font-semibold text-[11px]">📄 README.md (Full documentation)</div>
              </div>
            </div>
          </div>

          {/* Highlights & Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-1">
              <span className="text-[11px] font-bold text-indigo-900 block">1. Frontend (React 18 + Vite)</span>
              <p className="text-[11px] text-indigo-700 leading-snug">
                Tailwind CSS, Lucide Icons, Print-ready thermal receipt and offline-ready PWA.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
              <span className="text-[11px] font-bold text-emerald-900 block">2. Backend (Express Node.js)</span>
              <p className="text-[11px] text-emerald-700 leading-snug">
                Port 3000 background server, direct WhatsApp Cloud API & SMS dispatch.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
              <span className="text-[11px] font-bold text-amber-900 block">3. Dual Storage DB</span>
              <p className="text-[11px] text-amber-700 leading-snug">
                IndexedDB + LocalStorage sync, JSON export/restore & 1-click balance repair.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">
            फ़ाइल का नाम: <code className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono font-bold">nk-coaching-portal-source.zip</code>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
            >
              बंद करें (Close)
            </button>
            <button
              onClick={handleDirectDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
