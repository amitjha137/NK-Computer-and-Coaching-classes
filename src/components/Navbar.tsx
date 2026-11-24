import React, { useState } from 'react';
import {
  ShieldAlert,
  GraduationCap,
  Users,
  UserCheck,
  Globe,
  Bell,
  Sparkles,
  PhoneCall,
  Menu,
  X,
  Download,
  Smartphone,
  LogOut,
  User,
  FolderArchive
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { AppDownloadModal } from './AppDownloadModal';
import { SourceCodeModal } from './SourceCodeModal';

export const Navbar: React.FC = () => {
  const { role, setRole, currentUser, logout, notices, students, teachers, instituteProfile } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNoticePopover, setShowNoticePopover] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showSourceCodeModal, setShowSourceCodeModal] = useState(false);

  const rolesConfig: { role: UserRole; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { role: 'admin', label: 'Admin Portal', icon: ShieldAlert, desc: 'Owner & Management' },
    { role: 'teacher', label: 'Teacher Portal', icon: UserCheck, desc: 'Faculty & Attendance' },
    { role: 'student', label: 'Student Portal', icon: GraduationCap, desc: 'Learning & Dashboard' },
    { role: 'parent', label: 'Parent Portal', icon: Users, desc: 'Progress & Fee Receipt' },
    { role: 'public', label: 'Website', icon: Globe, desc: 'Public Admissions' },
  ];

  const isDevDomain = typeof window !== 'undefined' && window.location.origin.includes('ais-dev-');
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800/90 shadow-sm text-white">
      {/* Context-aware smart banner for Preview vs Mobile Standalone */}
      {isDevDomain && (
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 px-3 py-1.5 text-center text-xs font-medium text-white flex flex-wrap items-center justify-center gap-2 border-b border-indigo-500/40">
          {isInIframe ? (
            <span>💻 <strong>AI Studio प्रिव्यू:</strong> ऐप को मोबाइल या लैपटॉप में इंस्टॉल करने के लिए लिंक्स व गाइड देखें:</span>
          ) : (
            <span>📱 <strong>NK Classes Mobile App:</strong> अपने फ़ोन में सीधे ऐप इंस्टॉल करने के लिए टैप करें:</span>
          )}
          <button
            onClick={() => setShowDownloadModal(true)}
            className="underline underline-offset-2 font-bold hover:text-indigo-100 cursor-pointer bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded text-[11px] transition-colors"
          >
            {isInIframe ? 'ऐप डाउनलोड व लिंक्स देखें' : '📲 Install App (फ़ोन में इंस्टॉल करें)'}
          </button>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRole('admin')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg tracking-wider shadow-sm group-hover:bg-indigo-500 transition-colors border border-indigo-400/30">
                {instituteProfile.shortName || 'NK'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-display line-clamp-1 max-w-[200px] sm:max-w-none">
                    {instituteProfile.name}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400 hidden sm:block line-clamp-1">
                  {instituteProfile.tagline || 'Coaching & Computer Classes'}
                </p>
              </div>
            </button>
          </div>

          {/* Role Switcher Tabs (Desktop) */}
          <div className="hidden lg:flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
            {rolesConfig.map(item => {
              const Icon = item.icon;
              const isActive = role === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => setRole(item.role)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs border border-indigo-500'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Icons & Helpline */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Direct Mobile App Download / Install Button */}
            <button
              onClick={() => setShowDownloadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs border border-emerald-400/30 transition-all cursor-pointer group"
              title="Install NK Mobile App on Phone"
            >
              <Smartphone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-emerald-200" />
              <span className="hidden sm:inline">Install Mobile App</span>
              <span className="sm:hidden">Install App</span>
            </button>

            {/* Direct Source Code Folder Download Button */}
            <button
              onClick={() => setShowSourceCodeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 hover:text-white text-xs font-bold shadow-xs border border-indigo-500/40 transition-all cursor-pointer group"
              title="प्रोजेक्ट का पूरा कोड फ़ोल्डर (.ZIP) डाउनलोड करें"
            >
              <FolderArchive className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Source Code (.ZIP)</span>
              <span className="md:hidden">Code</span>
            </button>

            {/* Quick Contact Badge */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">{instituteProfile.phone}</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNoticePopover(!showNoticePopover)}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
                title="View Notices"
              >
                <Bell className="w-5 h-5" />
                {notices.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-[#0F172A]"></span>
                )}
              </button>

              {/* Notification Popover */}
              {showNoticePopover && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                    <span className="font-bold text-sm text-slate-900">Institute Announcements</span>
                    <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200/60">
                      {notices.length} active
                    </span>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
                    {notices.slice(0, 4).map(notice => (
                      <div key={notice.id} className="p-3 rounded-xl bg-[#F8FAFC] hover:bg-slate-100/80 transition-colors border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            notice.category === 'Exam' ? 'bg-purple-50 text-purple-700 border border-purple-200/60' :
                            notice.category === 'Fee' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                          }`}>
                            {notice.category}
                          </span>
                          <span className="text-[10px] text-slate-400">{notice.date}</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 mt-1">{notice.title}</h4>
                        <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{notice.content}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowNoticePopover(false)}
                    className="w-full mt-3 py-2 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* Logged in User Profile & Logout (Desktop) */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="text-right">
                  <div className="text-xs font-bold text-white truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-indigo-300 capitalize font-medium">
                    {currentUser.role} Portal
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="लॉग आउट करें (Logout)"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span className="hidden md:inline text-rose-300">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0F172A] px-4 pt-3 pb-5 space-y-2.5">
          {currentUser && (
            <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700/80 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[11px] text-indigo-300 truncate font-medium">
                  {currentUser.email} • <span className="capitalize">{currentUser.role}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Switch Portal Role</p>
          <div className="grid grid-cols-1 gap-1.5">
            {rolesConfig.map(item => {
              const Icon = item.icon;
              const isActive = role === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => {
                    setRole(item.role);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl text-left text-xs font-semibold transition-all ${
                    isActive ? 'bg-indigo-600 text-white border border-indigo-500' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[11px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>{item.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Download Action */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                setShowDownloadModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-200" />
                <span>Install Mobile App (फ़ोन में इंस्टॉल करें)</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-semibold">1-Tap Install</span>
            </button>

            <button
              onClick={() => {
                setShowSourceCodeModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700/80 shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-indigo-400" />
                <span>Download Source Code (प्रोजेक्ट कोड फ़ोल्डर)</span>
              </div>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-md font-semibold">.ZIP</span>
            </button>
          </div>
        </div>
      )}

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />

      {/* Source Code Modal */}
      <SourceCodeModal
        isOpen={showSourceCodeModal}
        onClose={() => setShowSourceCodeModal(false)}
      />
    </header>
  );
};
