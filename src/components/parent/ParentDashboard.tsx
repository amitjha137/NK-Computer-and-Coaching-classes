import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  PhoneCall,
  Calendar,
  CreditCard,
  Download,
  Share2,
  Award,
  Clock,
  ShieldCheck,
  MessageCircle,
  Camera,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChangePhotoModal } from '../ChangePhotoModal';

export const ParentDashboard: React.FC = () => {
  const {
    students,
    selectedStudentId,
    setSelectedStudentId,
    courses,
    batches,
    payments,
    testResults,
    setActiveReceipt,
    homeworks,
    updateStudent
  } = useApp();

  const [showChangePhotoModal, setShowChangePhotoModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const child = students.find(s => s.id === selectedStudentId) || students[0];
  const course = courses.find(c => c.id === child?.courseId);
  const batch = batches.find(b => b.id === child?.batchId);

  const childPayments = payments.filter(p => p.studentId === child?.id);
  const childResults = testResults.filter(r => r.studentId === child?.id);
  const remainingDue = child ? Math.max(0, child.totalFee - child.paidFee) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Parent Header */}
      <div className="bg-[#0F172A] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {child ? (
                <div
                  onClick={() => setShowChangePhotoModal(true)}
                  className="relative group cursor-pointer"
                  title="बच्चे की फ़ोटो बदलने के लिए क्लिक करें"
                >
                  <img
                    src={child.photoUrl}
                    alt={child.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-md ring-2 ring-emerald-500/20 group-hover:brightness-75 transition-all"
                  />
                  <span className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 bg-slate-900/50 transition-opacity">
                    <Camera className="w-5 h-5 drop-shadow" />
                    <span className="text-[9px] font-bold tracking-tight mt-0.5">बदलें</span>
                  </span>
                  <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow border-2 border-[#0F172A]">
                    <Camera className="w-3 h-3" />
                  </span>
                </div>
              ) : (
                <div className="w-14 h-14 bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    PARENT GUARDIAN PORTAL
                  </span>
                  <span className="text-xs text-slate-400">Live SMS & WhatsApp Linked</span>
                </div>
                <h1 className="text-2xl font-bold font-display tracking-tight text-white mt-1">
                  Parent of {child?.name}
                </h1>
                <p className="text-xs text-slate-400">
                  Registered Parent Phone: <strong className="text-slate-200 font-mono">{child?.parentMobile}</strong>
                </p>
              </div>
            </div>

            {/* Child Selector Demo & Quick Change Photo */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              {child && (
                <button
                  onClick={() => setShowChangePhotoModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 rounded-xl text-xs font-semibold transition-all border border-emerald-500/40 cursor-pointer shadow-xs"
                  title="बच्चे की फ़ोटो बदलें"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Change Ward Photo / फ़ोटो बदलें</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <span>Select Ward:</span>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="bg-slate-800 text-slate-100 text-xs rounded-xl p-2 border border-slate-700 font-medium"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentId}) — {s.fatherName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Today's Attendance Notification Alert (Key Highlight) */}
        <div className="bg-emerald-50 rounded-3xl border-2 border-emerald-300/80 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Today's Attendance Status
              </span>
              <h3 className="text-base font-bold text-emerald-950 font-display">
                {child?.name} is PRESENT today in {batch?.room}
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Clocked in at 08:02 AM • Overall Attendance Rate: <strong>{child?.attendanceRate}%</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white border border-emerald-200 text-emerald-900 rounded-full font-bold text-xs">
              SMS & WhatsApp Sent to {child?.parentMobile}
            </span>
          </div>
        </div>

        {/* Fee Management & Instant Receipts Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold font-display text-slate-900">
                  Fee Payment & Official Receipts
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Receipts are instantly sent to parent's phone when entered by institute administration
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-6 text-xs">
              <div>
                <span className="text-slate-500">Total Course Fee:</span>
                <p className="font-bold text-slate-900 text-sm">₹{child?.totalFee.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-slate-500">Paid Amount:</span>
                <p className="font-bold text-emerald-600 text-sm">₹{child?.paidFee.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-slate-500">Pending Due:</span>
                <p className={`font-bold text-sm ${remainingDue > 0 ? 'text-amber-700' : 'text-emerald-600'}`}>
                  {remainingDue > 0 ? `₹${remainingDue.toLocaleString('en-IN')}` : 'NIL (Cleared ✅)'}
                </p>
              </div>
            </div>
          </div>

          {/* List of Paid Receipts */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Issued Digital Receipts</h3>
            <div className="divide-y divide-slate-100">
              {childPayments.length > 0 ? (
                childPayments.map(p => (
                  <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-900 text-sm">{p.receiptNo}</span>
                        <span className="text-xs text-slate-400">• Paid on {p.date}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Dispatched via WhatsApp
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Amount: <strong className="text-emerald-700 text-base">₹{p.amount.toLocaleString('en-IN')}</strong> via {p.paymentMethod}
                      </p>
                      <p className="text-[11px] text-slate-500">Remarks: {p.remarks}</p>
                    </div>

                    <button
                      onClick={() => setActiveReceipt(p)}
                      className="self-start sm:self-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View & Print Official Receipt
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No fee receipts on record yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Academic Progress & Test Marks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Performance */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" /> Recent Test Performance
              </h3>
              <span className="text-xs font-bold text-slate-500">Report Card</span>
            </div>

            <div className="space-y-3">
              {childResults.map(res => (
                <div key={res.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Chapter MCQ Test</h4>
                    <p className="text-[11px] text-slate-500">Submitted: {res.submittedAt}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-indigo-900 font-display">
                      {res.score} / {res.totalMarks}
                    </span>
                    <p className="text-[11px] font-bold text-emerald-600">{res.percentage}% (Rank #{res.rank || 1})</p>
                  </div>
                </div>
              ))}
              {childResults.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No tests submitted yet this month.</p>
              )}
            </div>
          </div>

          {/* Quick Helpline / Direct Call to Institute */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <PhoneCall className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold font-display text-slate-900">Institute Direct Contact</h3>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Parents can reach out directly to the director or course faculty for inquiries regarding their child's attendance, practical files, or fee assistance.
              </p>
              <div className="mt-4 p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs space-y-1">
                <p className="font-bold text-indigo-950">N.K. Sharma (Director & Academic Head)</p>
                <p className="text-indigo-800">Direct Helpline: <strong>+91 98290 11223</strong></p>
                <p className="text-indigo-700">Office Hours: 08:00 AM – 07:00 PM</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href="tel:+919829011223"
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call Director
              </a>
              <a
                href="https://wa.me/919829011223"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Office
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Change Ward Photo Modal */}
      {showChangePhotoModal && child && (
        <ChangePhotoModal
          isOpen={showChangePhotoModal}
          onClose={() => setShowChangePhotoModal(false)}
          currentPhotoUrl={child.photoUrl}
          name={child.name}
          roleLabel={`Student Ward (${child.studentId})`}
          onSave={(newUrl) => {
            updateStudent(child.id, { photoUrl: newUrl });
            setToastMessage('बच्चे की फ़ोटो सफलतापूर्वक अपडेट हो गई! (Ward Photo Updated)');
            setTimeout(() => setToastMessage(null), 4000);
          }}
        />
      )}

      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
