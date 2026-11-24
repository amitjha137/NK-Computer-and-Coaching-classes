import React, { useState } from 'react';
import {
  X,
  Trash2,
  RotateCcw,
  Building2,
  Check,
  AlertTriangle,
  Sparkles,
  Phone,
  MapPin,
  QrCode,
  User,
  Calendar,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SetupInstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'clear' | 'profile';
}

export const SetupInstituteModal: React.FC<SetupInstituteModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'clear'
}) => {
  const {
    students,
    payments,
    isDemoData,
    clearDemoData,
    loadDemoData,
    instituteProfile,
    updateInstituteProfile
  } = useApp();

  const [activeTab, setActiveTab] = useState<'clear' | 'profile'>(defaultTab);
  const [profileForm, setProfileForm] = useState(instituteProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);
  const [restoredSuccess, setRestoredSuccess] = useState(false);

  if (!isOpen) return null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstituteProfile(profileForm);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleClear = () => {
    clearDemoData();
    setClearedSuccess(true);
    setTimeout(() => {
      setClearedSuccess(false);
    }, 2500);
  };

  const handleRestore = () => {
    loadDemoData();
    setRestoredSuccess(true);
    setTimeout(() => {
      setRestoredSuccess(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0F172A] text-white p-5 sm:p-6 relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg border border-amber-400/30 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                  कोचिंग सेटअप &amp; डेटा मैनेजमेंट
                </h3>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Settings
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                डेमो डेटा हटाएं, अपनी कोचिंग का नाम बदलें और शुरू से शुरुआत करें
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('clear')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'clear'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              1. डेमो डेटा हटाएं (Start Fresh)
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              2. कोचिंग की जानकारी (Name &amp; Phone)
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {activeTab === 'clear' && (
            <div className="space-y-5">
              {/* Explanation Card */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4.5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 text-xs text-amber-900 leading-relaxed">
                    <h4 className="font-bold text-sm text-amber-950">
                      यह 6 छात्र और ₹44,000 की फीस क्यों दिख रही थी?
                    </h4>
                    <p>
                      ऐप को पहली बार खोलते ही आपको खाली स्क्रीन न दिखे, बल्कि आप देख सकें कि <strong>फीस रसीद कैसे बनती है, WhatsApp पर मैसेज कैसे जाता है, डिजिटल आईडी कार्ड और कंप्यूटर लैब कैसे काम करता है</strong> — इसलिए यह <strong>सैंपल (डेमो) डेटा</strong> दिया गया था।
                    </p>
                    <p className="font-semibold text-amber-800 pt-1">
                      👉 यदि आप अपनी असली कोचिंग शुरू कर रहे हैं, तो नीचे दिए गए लाल बटन पर क्लिक करके इसे 0 कर दें और अपने असली विद्यार्थियों की एंट्री करें।
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Status Box */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Enrolled Students</span>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">{students.length} छात्र</div>
                  <span className="text-[10px] text-slate-500">
                    {students.length > 0 ? (isDemoData ? 'डेमो डेटा' : 'असली डेटा') : 'खाली (0)'}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Fee Records</span>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">{payments.length} रसीदें</div>
                  <span className="text-[10px] text-slate-500">
                    ₹{payments.reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Institute Status</span>
                  <div className={`text-sm font-bold mt-1.5 ${students.length === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {students.length === 0 ? '✓ Fresh (0)' : 'Sample Active'}
                  </div>
                </div>
              </div>

              {clearedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  सारा डेमो डेटा साफ़ हो चुका है! अब आप अपनी पहली एडमिशन शुरू कर सकते हैं।
                </div>
              )}

              {restoredSuccess && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  सैंपल डेटा वापस लोड हो गया है।
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Start Fresh (शुरू से अपनी कोचिंग का डेटा डालें)</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    यह बटन दबाने से सभी सैंपल छात्र (राहुल, प्रिया आदि) और ₹44,000 की फीस शून्य (0) हो जाएगी और कंप्यूटर लैब पूरी खाली हो जाएगी ताकि आप अपने असली स्टूडेंट्स ऐड कर सकें।
                  </p>
                  <button
                    onClick={handleClear}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    सारा डेमो डेटा साफ़ करें (Start Fresh with 0 Data)
                  </button>
                </div>

                {students.length === 0 && (
                  <div className="flex items-center justify-between p-3.5 bg-slate-100 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-600">
                      अगर कभी ऐप के फीचर्स का टेस्ट करना हो तो आप वापस सैंपल डेटा लोड कर सकते हैं:
                    </span>
                    <button
                      onClick={handleRestore}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                      डेमो डेटा वापस लाएं
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600">
                यहाँ जो जानकारी आप डालेंगे, वह <strong>फीस रसीद (Fee Receipt), माता-पिता को भेजे जाने वाले WhatsApp मैसेज, छात्र पहचान पत्र (ID Card)</strong> और वेबसाइट पर दिखाई देगी।
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  कोचिंग की जानकारी सफलतापूर्वक सेव हो गई है!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" /> कोचिंग / सेंटर का पूरा नाम
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                    placeholder="उदा. NK Coaching & Computer Classes"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> सेंटर का शॉर्ट नाम / लोगो टेक्स्ट
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.shortName}
                    onChange={(e) => setProfileForm({ ...profileForm, shortName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                    placeholder="उदा. NK"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> हेल्पलाइन / WhatsApp नंबर
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                    placeholder="उदा. +91 98290 11223"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-purple-600" /> फीस के लिए UPI ID / नंबर
                  </label>
                  <input
                    type="text"
                    value={profileForm.upiId}
                    onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                    placeholder="उदा. 9829011223@upi"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" /> कोचिंग का पूरा पता (रसीद पर छपेगा)
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                    placeholder="उदा. Station Road, Civil Lines"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" /> डायरेक्टर / संचालक का नाम
                  </label>
                  <input
                    type="text"
                    value={profileForm.directorName}
                    onChange={(e) => setProfileForm({ ...profileForm, directorName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                    placeholder="उदा. Er. N. K. Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" /> वर्तमान सत्र (Academic Session)
                  </label>
                  <input
                    type="text"
                    value={profileForm.sessionYear}
                    onChange={(e) => setProfileForm({ ...profileForm, sessionYear: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                    placeholder="उदा. 2026-27"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Profile Details
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {profileForm.name} • Session {profileForm.sessionYear}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
