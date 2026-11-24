import React, { useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  BookOpen,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Computer,
  Award,
  Download,
  Smartphone,
  ExternalLink,
  Share2,
  FileDown,
  HelpCircle,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

type AuthRole = 'student' | 'parent' | 'teacher' | 'admin';

interface AuthPortalProps {
  onOpenInstallModal?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onOpenInstallModal }) => {
  const { login, register, instituteProfile } = useApp();
  const { isInstallable, isInstalled, isInAppBrowser, triggerInstall, openInChrome, downloadOfflinePackage } = usePWAInstall();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<AuthRole>('student');
  const [showDirectGuide, setShowDirectGuide] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const rolesConfig: {
    id: AuthRole;
    title: string;
    hindiTitle: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badgeBg: string;
    activeBorder: string;
  }[] = [
    {
      id: 'student',
      title: 'Student',
      hindiTitle: 'विद्यार्थी',
      subtitle: 'Classes, Tests, Homework & Digital ID',
      icon: GraduationCap,
      accentColor: 'text-sky-600',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      activeBorder: 'border-sky-500 bg-sky-50/50 shadow-sky-100 ring-2 ring-sky-500/20'
    },
    {
      id: 'parent',
      title: 'Parent',
      hindiTitle: 'अभिभावक',
      subtitle: 'Attendance, Fee Receipts & Progress',
      icon: Users,
      accentColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      activeBorder: 'border-emerald-500 bg-emerald-50/50 shadow-emerald-100 ring-2 ring-emerald-500/20'
    },
    {
      id: 'teacher',
      title: 'Teacher',
      hindiTitle: 'शिक्षक / फैकल्टी',
      subtitle: 'Attendance, Timetable & Computer Lab',
      icon: BookOpen,
      accentColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      activeBorder: 'border-indigo-500 bg-indigo-50/50 shadow-indigo-100 ring-2 ring-indigo-500/20'
    },
    {
      id: 'admin',
      title: 'Admin',
      hindiTitle: 'डायरेक्टर / एडमिन',
      subtitle: 'Fee Records, Admissions & Institute Control',
      icon: ShieldCheck,
      accentColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      activeBorder: 'border-amber-500 bg-amber-50/50 shadow-amber-100 ring-2 ring-amber-500/20'
    }
  ];

  const handleDemoSelect = (role: AuthRole, demoEmail: string, demoPass: string, demoName: string) => {
    setErrorMsg(null);
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword(demoPass);
    setName(demoName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('कृपया ईमेल और पासवर्ड दोनों दर्ज करें (Please enter both Email and Password).');
        setIsLoading(false);
        return;
      }

      const result = login({
        email,
        password,
        role: selectedRole
      });

      if (!result.success) {
        setErrorMsg(result.message || 'Login failed. Please check credentials.');
        setIsLoading(false);
      } else {
        setSuccessMsg('लॉगिन सफल! पोर्टल में प्रवेश कर रहे हैं...');
      }
    } else {
      // Register validation
      if (!name.trim()) {
        setErrorMsg('कृपया अपना पूरा नाम दर्ज करें (Please enter your full name).');
        setIsLoading(false);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('कृपया वैध ईमेल आईडी दर्ज करें (Please enter a valid email address).');
        setIsLoading(false);
        return;
      }
      if (password.length < 4) {
        setErrorMsg('पासवर्ड कम से कम 4 अक्षरों का होना चाहिए (Password must be at least 4 chars).');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('दोनों पासवर्ड एक जैसे नहीं हैं (Passwords do not match).');
        setIsLoading(false);
        return;
      }

      const result = register({
        name,
        email,
        password,
        role: selectedRole,
        phone
      });

      if (!result.success) {
        setErrorMsg(result.message || 'Registration failed.');
        setIsLoading(false);
      } else {
        setSuccessMsg('खाता सफलतापूर्वक बन गया! पोर्टल में प्रवेश कर रहे हैं...');
      }
    }
  };

  const handleDirectDownloadOrInstall = async () => {
    if (isInAppBrowser) {
      openInChrome();
      return;
    }

    if (isInstallable) {
      const installed = await triggerInstall();
      if (installed) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
        return;
      }
    }

    // If browser prompt didn't fire or not supported, show inline guide or open modal
    setShowDirectGuide(true);
    if (onOpenInstallModal) {
      onOpenInstallModal();
    }
  };

  const handleDownloadFile = () => {
    downloadOfflinePackage();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleShareOnWhatsApp = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const text = encodeURIComponent(
      `📱 *NK Classes Mobile App*\n\nNeeche diye link par click karke direct mobile me Install / Download karein:\n👉 ${url}\n\n(Note: Chrome me open karke 3-dots se 'Install app' ya 'Add to Home screen' karein)`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-3 sm:p-6 text-slate-100">
      {/* Background ambient accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* PROMINENT DIRECT MOBILE APP DOWNLOAD BANNER (Top of Screen) */}
      <div className="w-full max-w-xl mb-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="NK Logo"
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-slate-900"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Direct Mobile App
                </span>
                <span className="text-[10px] font-bold text-slate-300">
                  0.5 MB • Android &amp; iOS
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                डायरेक्ट मोबाइल ऐप डाउनलोड करें
              </h2>
              <p className="text-xs text-emerald-200/90 leading-tight">
                लिंक से सीधे 1-क्लिक में फ़ोन की होम स्क्रीन पर ऐप इंस्टॉल हो जाएगी
              </p>
            </div>
          </div>
        </div>

        {/* In-app Browser Notice (WhatsApp / Instagram / FB) */}
        {isInAppBrowser && (
          <div className="mt-3 p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-xs text-amber-200 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>WhatsApp / In-App ब्राउज़र में खुला है</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              WhatsApp सीधे ऐप डाउनलोड नहीं होने देता। नीचे बटन दबाकर इसे तुरंत <strong>Google Chrome</strong> में खोलें ताकि ऐप सीधे इंस्टॉल हो सके:
            </p>
            <button
              type="button"
              onClick={() => openInChrome()}
              className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Google Chrome में खोलें और इंस्टॉल करें</span>
            </button>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Main Direct Download / Install Button */}
          <button
            type="button"
            onClick={handleDirectDownloadOrInstall}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>{isInstalled ? 'App Installed (खोलें)' : 'Download / Install App'}</span>
          </button>

          {/* Quick Share on WhatsApp */}
          <button
            type="button"
            onClick={handleShareOnWhatsApp}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp पर शेयर करें</span>
          </button>
        </div>

        {/* Secondary Options (Offline File Download + Steps Guide) */}
        <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
          <button
            type="button"
            onClick={handleDownloadFile}
            className="text-emerald-300 hover:text-emerald-200 flex items-center gap-1 font-semibold underline underline-offset-2 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Offline App File (.html) सेव करें</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDirectGuide(!showDirectGuide)}
            className="text-slate-300 hover:text-white flex items-center gap-1 font-medium cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showDirectGuide ? 'गाइड छुपाएं' : 'इंस्टॉल करने के 3 आसान स्टेप्स'}</span>
          </button>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>सफल! ऐप आपके फ़ोन के डाउनलोड/होम स्क्रीन पर सेट हो गई है।</span>
          </div>
        )}

        {/* Collapsible Step-by-Step Direct Guide */}
        {showDirectGuide && (
          <div className="mt-3 p-3 bg-slate-900/90 rounded-2xl border border-emerald-500/30 text-xs space-y-2 animate-in fade-in">
            <p className="font-extrabold text-emerald-300 text-xs flex items-center gap-1.5">
              <span>📱 मोबाइल में इंस्टॉल करने का 10-सेकंड का तरीका:</span>
            </p>
            <div className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
              <div className="p-2 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between">
                <span>1. मोबाइल Chrome में ऊपर दाईं ओर <strong>3-डॉट्स (⋮)</strong> दबाएं</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-black rounded border border-emerald-500/40">
                  ⋮
                </span>
              </div>
              <div className="p-2 bg-slate-800/90 rounded-xl border border-slate-700 text-emerald-300 font-bold">
                2. मेनू में से <strong>&quot;Install app&quot;</strong> या <strong>&quot;Add to Home screen&quot;</strong> पर टैप करें।
              </div>
              <div className="p-2 bg-indigo-950/60 rounded-xl border border-indigo-500/30 text-indigo-200">
                3. <strong>&quot;Install&quot;</strong> दबाते ही NK Classes ऐप का आइकॉन आपके फ़ोन के होम स्क्रीन पर बन जाएगा और बिना ब्राउज़र के असली Android ऐप जैसे खुलेगी!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden backdrop-blur-md">
        {/* Institute Top Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none">
            <Computer className="w-40 h-40" />
          </div>

          <div className="flex items-center gap-3.5">
            <img
              src="/pwa-192x192.png"
              alt="NK Classes Logo"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/40 shadow-lg bg-indigo-900 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/25">
                  Session 2026-27
                </span>
                <span className="text-[10px] font-medium text-indigo-200 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-300" />
                  ISO Certified
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1 truncate">
                {instituteProfile?.name || 'NK Coaching & Computer Classes'}
              </h1>
              <p className="text-xs text-indigo-100/90 font-medium">
                पोर्टल लॉगिन व रजिस्ट्रेशन (Login &amp; Register Portal)
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs (Login vs Register) */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-indigo-950/40 backdrop-blur-sm rounded-xl border border-white/15">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>लॉगिन (Sign In)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-indigo-100 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>नया रजिस्ट्रेशन (Register)</span>
            </button>
          </div>
        </div>

        {/* Portal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="font-semibold">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <div className="font-semibold">{successMsg}</div>
            </div>
          )}

          {/* 1. Role Selection Grid: Student, Parent, Teacher, Admin */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {mode === 'login' ? 'लॉगिन का प्रकार चुनें (Login as):' : 'रजिस्टर का प्रकार चुनें (Register as):'}
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {rolesConfig.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(r.id);
                      setErrorMsg(null);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? `${r.activeBorder} shadow-sm`
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-white shadow-sm' : 'bg-white border border-slate-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${r.accentColor}`} />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className={`w-4 h-4 ${r.accentColor}`} />
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900">{r.title}</span>
                        <span className="text-[11px] text-slate-500 font-medium">({r.hindiTitle})</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                        {r.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Form Input Fields */}
          <div className="space-y-3.5">
            {/* Name Field (Only in Register mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पूरा नाम (Full Name) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="जैसे: Rahul Sharma / Er. N.K. Sharma"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email ID Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ईमेल आईडी (Email ID) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@nkclasses.in या name@gmail.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Mobile Number Field (Only in Register mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  मोबाइल नंबर (Mobile Number / WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98290 12345 (फीस रसीद व नोटिस हेतु)"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  पासवर्ड (Password) <span className="text-rose-500">*</span>
                </label>
                {mode === 'login' && (
                  <span className="text-[11px] text-indigo-600 font-medium">
                    (डिफ़ॉल्ट: password123)
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="अपना पासवर्ड डालें"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Only in Register mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पासवर्ड दोबारा डालें (Confirm Password) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="पासवर्ड की पुष्टि करें"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-75"
          >
            {isLoading ? (
              <span>प्रोसेस हो रहा है...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>लॉगिन करें (Sign In as {selectedRole.toUpperCase()})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>खाता बनाएं और प्रवेश करें (Register &amp; Enter)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* 3. Quick 1-Click Demo Accounts Chips */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                त्वरित 1-क्लिक डेमो लॉगिन (1-Click Instant Demo):
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoSelect('student', 'student@nkclasses.in', 'password123', 'Aman Sharma')}
                className="p-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl text-left cursor-pointer transition-colors"
              >
                <div className="font-bold text-xs text-sky-900">Student</div>
                <div className="text-[10px] text-sky-600 truncate">student@nkclasses.in</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('parent', 'parent@nkclasses.in', 'password123', 'Mr. Satish Sharma')}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left cursor-pointer transition-colors"
              >
                <div className="font-bold text-xs text-emerald-900">Parent</div>
                <div className="text-[10px] text-emerald-600 truncate">parent@nkclasses.in</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('teacher', 'teacher@nkclasses.in', 'password123', 'Prof. Rajesh Verma')}
                className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-left cursor-pointer transition-colors"
              >
                <div className="font-bold text-xs text-indigo-900">Teacher</div>
                <div className="text-[10px] text-indigo-600 truncate">teacher@nkclasses.in</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('admin', 'admin@nkclasses.in', 'password123', 'Er. N. K. Sharma')}
                className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left cursor-pointer transition-colors"
              >
                <div className="font-bold text-xs text-amber-900">Admin</div>
                <div className="text-[10px] text-amber-600 truncate">admin@nkclasses.in</div>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <p className="text-xs text-slate-400 mt-4 text-center">
        NK Coaching &amp; Computer Classes • Portal Security &amp; Attendance v2.4
      </p>
    </div>
  );
};
