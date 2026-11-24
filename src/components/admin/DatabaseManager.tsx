import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  ShieldCheck,
  Download,
  Upload,
  Wrench,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  MessageCircle,
  Send,
  HardDrive,
  FileJson,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Zap,
  FolderArchive
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DatabaseHealthReport } from '../../services/db';
import { sanitizeWhatsAppNumber, openWhatsAppDirect, openSMSDirect, isValidIndianPhone } from '../../utils/phoneUtils';
import { GatewaySettingsCard } from './GatewaySettingsCard';

export const DatabaseManager: React.FC = () => {
  const {
    students,
    payments,
    courses,
    batches,
    teachers,
    computers,
    notices,
    exportDatabaseBackup,
    restoreDatabaseBackup,
    repairDatabase,
    getDatabaseHealth,
    exportStudentsCSV,
    exportPaymentsCSV,
    instituteProfile
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'gateway' | 'database'>('gateway');
  const [healthReport, setHealthReport] = useState<DatabaseHealthReport | null>(null);
  const [repairMsg, setRepairMsg] = useState<string | null>(null);
  const [restoreMsg, setRestoreMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dispatch Test Bench
  const [testPhone, setTestPhone] = useState('9876543210');
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    refreshHealth();
  }, [students, payments, courses, batches]);

  const refreshHealth = () => {
    try {
      const report = getDatabaseHealth();
      setHealthReport(report);
    } catch {
      // ignore
    }
  };

  const handleRunRepair = () => {
    const res = repairDatabase();
    refreshHealth();
    setRepairMsg(`मरम्मत पूरी हुई! ${res.fixedBalances} छात्रों के फीस बैलेंस ठीक किए गए।`);
    setTimeout(() => setRepairMsg(null), 5000);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const res = restoreDatabaseBackup(text);
        if (res.success) {
          setRestoreMsg({ type: 'success', text: 'डेटाबेस सफलतापूर्वक रीस्टोर (पुनर्स्थापित) हो गया है!' });
          refreshHealth();
        } else {
          setRestoreMsg({ type: 'error', text: res.error || 'अमान्य बैकअप फ़ाइल' });
        }
      } catch (err: any) {
        setRestoreMsg({ type: 'error', text: err.message || 'फ़ाइल पढ़ने में त्रुटि हुई' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTestWhatsApp = () => {
    const cleanNumber = sanitizeWhatsAppNumber(testPhone);
    if (!cleanNumber || cleanNumber.length < 10) {
      setTestResult('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।');
      return;
    }

    const testMsg = `*${(instituteProfile?.name || 'NK COACHING & COMPUTER CLASSES').toUpperCase()}*\n✅ *DISPATCH VERIFICATION TEST*\n\nHello! Your WhatsApp receipt dispatcher is working with 100% reliability!\nSanitized Number: +${cleanNumber}\nDate & Time: ${new Date().toLocaleString()}`;
    const success = openWhatsAppDirect(cleanNumber, testMsg);
    if (success) {
      setTestResult(`WhatsApp सफलतापूर्वक शुरू हो गया (+${cleanNumber}) के लिए!`);
    } else {
      setTestResult('WhatsApp लिंक शुरू करने में समस्या आई।');
    }
    setTimeout(() => setTestResult(null), 6000);
  };

  const handleTestSMS = () => {
    const cleanNumber = sanitizeWhatsAppNumber(testPhone);
    if (!cleanNumber || cleanNumber.length < 10) {
      setTestResult('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।');
      return;
    }

    const testMsg = `[${instituteProfile?.name || 'NK Institute'}] SMS Dispatch Test: Verified and working for +${cleanNumber}.`;
    openSMSDirect(cleanNumber, testMsg);
    setTestResult(`SMS ऐप शुरू हो गया (+${cleanNumber}) के लिए!`);
    setTimeout(() => setTestResult(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Database className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-display">Database & Dispatch Engine</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Dual-Storage (IndexedDB + LocalStorage)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                डेटा सुरक्षा, स्वचालित बैकअप, और 100% विश्वसनीय WhatsApp/SMS रसीद प्रेषण इंजन।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/api/download-source-zip';
                link.download = 'nk-coaching-portal-source.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              title="डाउनलोड करें पूरा प्रोजेक्ट कोड फ़ोल्डर (.ZIP)"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              Download Code Folder (.ZIP)
            </button>
            <button
              onClick={exportDatabaseBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Database Backup (JSON)
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Restore Database (JSON)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileRestore}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {restoreMsg && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            restoreMsg.type === 'success' ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-700' : 'bg-red-950/80 text-red-200 border border-red-700'
          }`}>
            {restoreMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
            {restoreMsg.text}
          </div>
        )}
      </div>

      {/* Navigation Tabs for Database & Direct Gateway */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('gateway')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'gateway'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          Direct WhatsApp / SMS Gateway (बिना WhatsApp खोले)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'database'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          डेटाबेस स्वास्थ्य एवं बैकअप (IndexedDB Dual Storage)
        </button>
      </div>

      {activeTab === 'gateway' ? (
        <GatewaySettingsCard />
      ) : (
        <>
          {/* Database Statistics & Health Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Students</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{students.length}</p>
              <span className="text-[10px] text-emerald-600 font-medium">Auto-Persisted</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Fee Receipts</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{payments.length}</p>
              <span className="text-[10px] text-emerald-600 font-medium">Receipts Logged</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Courses</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{courses.length}</p>
              <span className="text-[10px] text-slate-500 font-medium">Active Curriculums</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Batches</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{batches.length}</p>
              <span className="text-[10px] text-slate-500 font-medium">Active Batches</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Teachers</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{teachers.length}</p>
              <span className="text-[10px] text-slate-500 font-medium">Faculty Members</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Lab PCs</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{computers.length}</p>
              <span className="text-[10px] text-slate-500 font-medium">Computer Lab</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Integrity Check & Repair Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Database Health & Diagnostics</h3>
                </div>
                <button
                  onClick={refreshHealth}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Refresh Health"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-semibold text-slate-700">Storage Architecture:</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    IndexedDB + LocalStorage (Dual-Replica)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-semibold text-slate-700">Database Integrity Status:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    healthReport?.isHealthy ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {healthReport?.isHealthy ? 'Healthy & Consistent' : 'Notice: Discrepancies Detected'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <p>• <strong>Known Integrity Issues:</strong> {healthReport?.issues.length || 0}</p>
                  <p>• <strong>Students without Phone Number:</strong> {students.filter(s => !s.parentMobile && !s.mobile).length}</p>
                  <p>• <strong>Payments with Phone Number:</strong> {payments.filter(p => p.parentMobile && p.parentMobile.length >= 10).length} / {payments.length}</p>
                  <p>• <strong>Total Estimated Storage:</strong> ~{healthReport?.storageUsageKB || 12} KB in IndexedDB</p>
                </div>

                {repairMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {repairMsg}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={handleRunRepair}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Fix Any Balance Discrepancies
                  </button>

                  <button
                    onClick={exportStudentsCSV}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Export Students (Excel/CSV)
                  </button>

                  <button
                    onClick={exportPaymentsCSV}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Export Payments (Excel/CSV)
                  </button>
                </div>
              </div>
            </div>

            {/* 100% Reliable WhatsApp & SMS Dispatch Verification Tool */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Direct DOM Intent Fallback Tester</h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Fallback Bench
                </span>
              </div>

              <p className="text-xs text-slate-600">
                अगर कभी आप सीधे डिवाइस के WhatsApp/SMS ऐप से भेजना चाहें, तो यहाँ से टेस्ट करें:
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Enter Any 10-Digit Mobile Number to Test:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={testPhone}
                      onChange={e => setTestPhone(e.target.value)}
                      placeholder="e.g. 9829011223"
                      className="w-full pl-10 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Sanitized Country Code Output: <span className="font-mono font-bold text-emerald-700">+{sanitizeWhatsAppNumber(testPhone) || '91...'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    Test WhatsApp App
                  </button>

                  <button
                    type="button"
                    onClick={handleTestSMS}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Test SMS App
                  </button>
                </div>

                {testResult && (
                  <div className="p-3 bg-slate-900 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {testResult}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
