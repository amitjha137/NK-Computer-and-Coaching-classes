import React, { useState } from 'react';
import {
  GraduationCap,
  Monitor,
  CheckCircle,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  Download,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppDownloadModal } from '../AppDownloadModal';

export const PublicShowcase: React.FC = () => {
  const { courses, setRole, enrollStudent, batches } = useApp();
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryCourse, setInquiryCourse] = useState(courses[0]?.id || '');
  const [submitted, setSubmitted] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;

    // Simulate online admission inquiry into admin database
    enrollStudent({
      name: inquiryName,
      fatherName: 'Guardian',
      mobile: inquiryPhone,
      parentMobile: inquiryPhone,
      email: `${inquiryName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: 'Online Admission Inquiry',
      courseId: inquiryCourse,
      batchId: batches[0]?.id || '',
      admissionDate: new Date().toISOString().split('T')[0],
      totalFee: 8500,
      emergencyContact: inquiryPhone,
      status: 'active',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });

    setSubmitted(true);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white pt-16 pb-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ISO 9001:2015 Certified Coaching & Computer Institute
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-tight">
              Excel in Boards & Master Computer Technologies at <span className="text-indigo-400">NK</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Premier academic coaching for Classes 9th-12th (CBSE & State Boards / JEE / NEET) combined with state-of-the-art Computer Academy (Python, Tally Prime, ADCA & Web Development).
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setRole('admin')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs uppercase tracking-wider shadow-xs cursor-pointer transition-all"
              >
                Go to Institute App Portals →
              </button>
              <button
                onClick={() => setShowDownloadModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs uppercase tracking-wider shadow-xs cursor-pointer transition-all"
              >
                <Smartphone className="w-4 h-4" />
                Install Mobile App (फ़ोन में इंस्टॉल)
              </button>
              <a
                href="#inquiry"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs uppercase tracking-wider border border-slate-700 shadow-xs transition-all"
              >
                Apply for Admission
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg font-display">Academic Excellence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Expert mentoring by N.K. Sharma & renowned faculty with chapter-wise DPPs, mock tests, and personalized doubt sessions.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg font-display">1:1 High-Tech Computer Lab</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every student receives an assigned PC (Core i5/i7, 16GB RAM) in Lab 1 or Lab 2 for hands-on programming & practicals.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg font-display">Transparent Fee & Receipts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated official fee receipts dispatched directly to parents' WhatsApp & SMS phones upon payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-black font-display text-slate-900">Featured Programs & Fees</h2>
            <p className="text-xs text-slate-500">
              Select between academic board coaching or professional computer diplomas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(c => (
              <div key={c.id} className="p-6 rounded-3xl border border-slate-200 bg-white hover:shadow-lg transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    c.type === 'computer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {c.type}
                  </span>
                  <span className="font-extrabold text-slate-900 text-base font-display">
                    ₹{c.fee.toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{c.duration} Curriculum</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{c.syllabusOverview}</p>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-700">Subjects Included:</p>
                  <p className="text-xs text-slate-500 mt-1">{c.subjects.join(' • ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Inquiry Form */}
      <section id="inquiry" className="py-16 bg-[#0F172A] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/90 rounded-2xl p-8 border border-slate-800 shadow-xl">
            <div className="text-center mb-6 space-y-1">
              <h3 className="text-2xl font-bold font-display text-white tracking-tight">Online Admission Inquiry</h3>
              <p className="text-xs text-slate-400">Fill in your details to book a free demo class or lab visit</p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-center space-y-2 text-emerald-200">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-400" />
                <h4 className="text-base font-bold text-white">Inquiry Submitted Successfully!</h4>
                <p className="text-xs">
                  Your admission inquiry has been added to our student registry. Our counselor will contact you shortly!
                </p>
                <button
                  onClick={() => setRole('admin')}
                  className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  View in Admin Portal
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Student / Candidate Name *</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={e => setInquiryName(e.target.value)}
                    placeholder="e.g. Ankit Verma"
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Parent / Student Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={e => setInquiryPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1.5">Interested Course *</label>
                  <select
                    value={inquiryCourse}
                    onChange={e => setInquiryCourse(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold uppercase tracking-wider text-xs shadow-xs cursor-pointer transition-all active:scale-[0.99]"
                >
                  Submit Admission Form
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">NK</div>
            <span className="font-bold text-slate-200">NK Coaching & Computer Classes</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDownloadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Mobile App Link</span>
            </button>
            <p>Helpline: +91 98290 11223</p>
          </div>
          <p>© 2026 NK Institute. All rights reserved.</p>
        </div>
      </footer>

      {/* Download Modal */}
      <AppDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  );
};
