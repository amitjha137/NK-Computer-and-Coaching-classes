import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  Monitor,
  GraduationCap,
  Calendar,
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Send,
  Printer,
  Award,
  IdCard,
  QrCode,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Laptop,
  Check,
  PhoneCall,
  UserCheck,
  FileText,
  Download,
  Trash2,
  Edit,
  Plus,
  X,
  BarChart3,
  Sparkles,
  Building2,
  RotateCcw,
  Info,
  Camera,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student, ComputerPC, Course, Batch, Teacher, Notice } from '../../types';
import { FeeAnalytics } from './FeeAnalytics';
import { SetupInstituteModal } from './SetupInstituteModal';
import { ChangePhotoModal } from '../ChangePhotoModal';
import { DatabaseManager } from './DatabaseManager';

export const AdminDashboard: React.FC = () => {
  const {
    students,
    courses,
    batches,
    payments,
    computers,
    notices,
    teachers,
    recordFeePayment,
    enrollStudent,
    updateStudent,
    deleteStudent,
    allocateComputer,
    updateComputerStatus,
    updateComputer,
    setActiveReceipt,
    setActiveIdCardStudent,
    setActiveCertificateStudent,
    sendFeeReminderToParent,
    addNotice,
    updateNotice,
    deleteNotice,
    addCourse,
    updateCourse,
    deleteCourse,
    addBatch,
    updateBatch,
    deleteBatch,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    exportStudentsCSV,
    exportPaymentsCSV,
    instituteProfile,
    isDemoData,
    clearDemoData,
    loadDemoData
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'analytics' | 'fees' | 'admissions' | 'students' | 'batches' | 'lab' | 'notices' | 'staff' | 'database'
  >('overview');

  // Setup Institute & Clear Demo Modal State
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupModalTab, setSetupModalTab] = useState<'clear' | 'profile'>('clear');

  // Edit Modals State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingComputer, setEditingComputer] = useState<ComputerPC | null>(null);

  // Batch Category Filter: all | coaching (School Nursery-12th) | computer (Coding & Computer)
  const [batchFilterCategory, setBatchFilterCategory] = useState<'all' | 'coaching' | 'computer'>('all');

  // Add Course Modal State
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    name: '',
    type: 'computer' as 'coaching' | 'computer',
    duration: '3 Months',
    fee: 6500,
    syllabusOverview: '',
    subjectsStr: ''
  });

  // Add Batch Modal State
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatchData, setNewBatchData] = useState({
    name: '',
    category: 'coaching' as 'coaching' | 'computer',
    classLevel: 'Nursery',
    courseId: courses[0]?.id || '',
    teacherId: teachers[0]?.id || '',
    timing: '08:00 AM - 09:30 AM',
    days: 'Mon - Fri',
    room: 'Room 101',
    capacity: 25
  });

  // Add Faculty Modal State
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherData, setNewTeacherData] = useState({
    name: '',
    subject: '',
    mobile: '',
    email: '',
    salary: 25000,
    joiningDate: new Date().toISOString().split('T')[0],
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  });

  // New Admission Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    mobile: '',
    parentMobile: '',
    email: '',
    address: '',
    courseId: courses[0]?.id || '',
    batchId: batches[0]?.id || '',
    totalFee: 8500,
    admissionDate: new Date().toISOString().split('T')[0],
    emergencyContact: ''
  });

  // Record Fee Form State
  const [feeForm, setFeeForm] = useState({
    studentId: students[0]?.id || '',
    amount: 2000,
    paymentMethod: 'UPI' as 'Cash' | 'UPI' | 'Card' | 'Bank Transfer',
    remarks: 'Monthly Installment',
    parentMobile: students[0]?.parentMobile || students[0]?.mobile || ''
  });

  // Computer Allocation State
  const [allottingPC, setAllottingPC] = useState<ComputerPC | null>(null);
  const [allotStudentId, setAllotStudentId] = useState<string>('');

  // Maintenance state
  const [maintenancePC, setMaintenancePC] = useState<ComputerPC | null>(null);
  const [maintenanceIssue, setMaintenanceIssue] = useState('');

  // Notice Form State
  const [newNoticeText, setNewNoticeText] = useState({
    title: '',
    content: '',
    category: 'General' as 'General' | 'Batch' | 'Exam' | 'Holiday' | 'Fee' | 'Important',
    author: 'Admin Office'
  });

  // Search filter
  const [studentSearch, setStudentSearch] = useState('');
  // Change photo modal targets
  const [photoTargetStudent, setPhotoTargetStudent] = useState<Student | null>(null);
  const [photoTargetTeacher, setPhotoTargetTeacher] = useState<Teacher | null>(null);
  // In-app Toast message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Computations
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalPendingDues = students.reduce((acc, s) => acc + Math.max(0, s.totalFee - s.paidFee), 0);
  const totalEnrolled = students.length;
  const workingPCs = computers.filter(c => c.status !== 'maintenance').length;

  const handleAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.parentMobile) {
      showToast('कृपया छात्र का नाम और अभिभावक का मोबाइल नंबर भरें', 'error');
      return;
    }

    const created = enrollStudent({
      ...newStudent,
      emergencyContact: newStudent.emergencyContact || newStudent.parentMobile,
      status: 'active',
      photoUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`
    });

    showToast(`छात्र ${created.name} सफलतापूर्वक पंजीकृत हो गया! (ID: ${created.studentId})`, 'success');
    // switch to fees or students
    setFeeForm(prev => ({ ...prev, studentId: created.id, amount: 2000 }));
    setActiveTab('students');
  };

  const handleRecordFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeForm.studentId) {
      showToast('कृपया पहले छात्र का चयन करें', 'error');
      return;
    }
    const st = students.find(s => s.id === feeForm.studentId);
    if (!st) {
      showToast('कृपया छात्र का चयन करें', 'error');
      return;
    }

    if (feeForm.amount <= 0) {
      showToast('कृपया मान्य फीस राशि दर्ज करें', 'error');
      return;
    }

    const targetMobile = feeForm.parentMobile?.trim() || st.parentMobile || st.mobile;

    recordFeePayment({
      studentId: feeForm.studentId,
      amount: Number(feeForm.amount),
      paymentMethod: feeForm.paymentMethod,
      remarks: feeForm.remarks,
      parentMobile: targetMobile
    });

    showToast(`₹${feeForm.amount} की फीस रसीद कट गई और अभिभावक (${targetMobile}) को भेज दी गई!`, 'success');
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.parentMobile.includes(studentSearch)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-in fade-in slide-in-from-top duration-300 ${
          toastMessage.type === 'success' 
            ? 'bg-slate-950 text-white border-emerald-500/50' 
            : 'bg-rose-950 text-white border-rose-500/50'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/70 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Admin Top Header Banner */}
      <div className="bg-[#0F172A] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold border border-indigo-500/30">
                  ADMIN CONSOLE
                </span>
                <span className="text-xs text-slate-400">Session {instituteProfile.sessionYear}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight mt-1 text-white">
                {instituteProfile.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Centralized Institute Command Center • Student Admissions, Automated Parent Fee Receipts & Computer Lab Grid
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  setSetupModalTab('clear');
                  setShowSetupModal(true);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isDemoData
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 ring-2 ring-amber-300/40 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title="डेमो डेटा हटाएं या कोचिंग सेटअप करें"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{isDemoData ? 'डेमो डेटा हटाएं (0 से शुरू)' : 'कोचिंग सेटअप'}</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all border border-slate-700 shadow-xs cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Fee Analytics
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Record Fee & Send Receipt
              </button>
              <button
                onClick={() => setActiveTab('admissions')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                New Admission
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto mt-6 pt-3 border-t border-slate-800 text-xs no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'analytics', label: 'Fee Analytics', icon: BarChart3 },
              { id: 'fees', label: 'Fees & Receipts', icon: CreditCard },
              { id: 'admissions', label: 'New Admission', icon: PlusCircle },
              { id: 'students', label: 'Students List', icon: Users },
              { id: 'lab', label: 'Computer Lab Grid', icon: Monitor },
              { id: 'batches', label: 'Courses & Batches', icon: BookOpen },
              { id: 'staff', label: 'Teachers & Staff', icon: UserCheck },
              { id: 'notices', label: 'Announcements', icon: AlertTriangle },
              { id: 'database', label: 'Database & Backup', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Demo Data Notice Banner */}
            {isDemoData && (
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
                    <Sparkles className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-amber-950">
                        यह 6 छात्र और ₹44,000 सिर्फ डेमो (Sample) डेटा है
                      </h3>
                      <span className="bg-amber-200/80 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                        Demo Mode
                      </span>
                    </div>
                    <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                      दिख रहे छात्र और फीस सिर्फ उदाहरण के लिए हैं। अपनी कोचिंग के छात्रों और फीस की एंट्री 0 से शुरू करने के लिए सारा डेमो डेटा 1-क्लिक में हटाएं।
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSetupModalTab('clear');
                      setShowSetupModal(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    सारा डेमो डेटा साफ़ करें (Start Fresh)
                  </button>
                  <button
                    onClick={() => {
                      setSetupModalTab('profile');
                      setShowSetupModal(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    कोचिंग का नाम बदलें
                  </button>
                </div>
              </div>
            )}

            {/* Fresh Zero State - Welcoming New Setup */}
            {students.length === 0 && (
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/30">
                <div className="max-w-3xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-3">
                    <CheckCircle className="w-3.5 h-3.5" />
                    आपकी कोचिंग पूरी तरह तैयार है (0 Students, Fresh Start)
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                    {instituteProfile.name}
                  </h2>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    डेमो डेटा हट चुका है। अब आप अपने पहले छात्र का एडमिशन कर सकते हैं, फीस रसीद जनरेट कर सकते हैं, और कंप्यूटर लैब में सीटें आवंटित कर सकते हैं।
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                    <button
                      onClick={() => setActiveTab('admissions')}
                      className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      पहला छात्र रजिस्टर करें (+ Admission)
                    </button>
                    <button
                      onClick={() => setActiveTab('fees')}
                      className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      फीस रसीद काटें (Record Fee)
                    </button>
                    <button
                      onClick={() => {
                        setSetupModalTab('profile');
                        setShowSetupModal(true);
                      }}
                      className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-indigo-300" />
                      कोचिंग का नाम व पता बदलें
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Key Metrics Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900 font-display">{totalEnrolled}</span>
                  <span className="text-xs text-emerald-600 font-semibold ml-2">Active Students</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Across {batches.length} coaching & computer batches</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Fee Collected</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900 font-display">₹{totalRevenue.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-emerald-600 font-semibold ml-2">Realized</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-slate-400">{payments.length} verified digital receipts</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    Analytics &rarr;
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Fee Dues</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-amber-700 font-display">₹{totalPendingDues.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[11px] text-amber-600/80 mt-1 font-medium">
                  {totalPendingDues === 0 ? 'All fees clear (No dues)' : '1-click WhatsApp reminders available'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Computer Lab Setup</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Monitor className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900 font-display">{computers.filter(c => c.assignedStudentId).length} / {computers.length}</span>
                  <span className="text-xs text-blue-600 font-semibold ml-2">Allocated</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Dual Labs • {workingPCs} PCs Operational</p>
              </div>
            </div>

            {/* Quick Fee Receipt Action Banner (Highlighted Request Feature) */}
            <div className="bg-[#0F172A] text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-xs font-semibold border border-emerald-500/40">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Automatic Parent Dispatch Engine
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
                    Record Fee & Dispatch Instant Receipt to Parents
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Jab bacha fees bharta hai, detail save karte hi receipt parents ke registered phone number par WhatsApp aur SMS confirmation ke sath chali jaati hai.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('fees')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  Open Fee Counter
                </button>
              </div>
            </div>

            {/* Two Column Section: Recent Fee Payments & Pending Fees */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Fee Payments */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base font-display">Recent Fee Payments</h3>
                    <p className="text-xs text-slate-500">Live receipts dispatched to parents</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('fees')}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-2">
                  {payments.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">अभी कोई फीस रसीद नहीं कटी है</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">नया एडमिशन करने के बाद यहाँ से 1-क्लिक में रसीद काटें</p>
                    </div>
                  ) : (
                    payments.slice(0, 5).map(payment => (
                      <div key={payment.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{payment.studentName}</span>
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                              {payment.receiptNo}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {payment.courseName} • Mode: <span className="font-semibold text-slate-700">{payment.paymentMethod}</span>
                          </p>
                          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                            Sent to parent: {payment.parentMobile}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-600 font-display">
                            +₹{payment.amount.toLocaleString('en-IN')}
                          </span>
                          <div className="mt-1">
                            <button
                              onClick={() => setActiveReceipt(payment)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md cursor-pointer"
                            >
                              <FileText className="w-3 h-3" /> View Receipt
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Dues & 1-Click WhatsApp Reminder */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base font-display">Pending Fee Reminders</h3>
                    <p className="text-xs text-slate-500">Send instant reminder alerts to parents</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                    Due List
                  </span>
                </div>

                <div className="divide-y divide-slate-100 mt-2">
                  {students.filter(s => s.totalFee > s.paidFee).length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">कोई बकाया फीस नहीं है</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {students.length === 0 ? 'विद्यार्थियों का नया एडमिशन होने पर उनकी बकाया फीस यहाँ दिखेगी' : 'सभी नामांकित छात्रों का शुल्क पूर्णतः क्लियर है'}
                      </p>
                    </div>
                  ) : (
                    students
                      .filter(s => s.totalFee > s.paidFee)
                      .slice(0, 5)
                      .map(student => {
                      const due = student.totalFee - student.paidFee;
                      return (
                        <div key={student.id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{student.name}</p>
                            <p className="text-xs text-slate-500">
                              Father: {student.fatherName} • Mobile: {student.parentMobile}
                            </p>
                            <p className="text-xs text-amber-800 font-semibold mt-0.5">
                              Due: ₹{due.toLocaleString('en-IN')} of ₹{student.totalFee.toLocaleString('en-IN')}
                            </p>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <button
                              onClick={() => sendFeeReminderToParent(student)}
                              className="flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                              title="Send WhatsApp Fee Reminder"
                            >
                              <Send className="w-3 h-3" /> WhatsApp Reminder
                            </button>
                            <button
                              onClick={() => {
                                setFeeForm(prev => ({ ...prev, studentId: student.id, amount: due }));
                                setActiveTab('fees');
                              }}
                              className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Pay
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Computer Lab Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">Computer Lab Real-Time Status</h3>
                  <p className="text-xs text-slate-500">PC allocations for practical sessions</p>
                </div>
                <button
                  onClick={() => setActiveTab('lab')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Manage All {computers.length} PCs →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {computers.slice(0, 12).map(pc => (
                  <div
                    key={pc.id}
                    onClick={() => setActiveTab('lab')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      pc.status === 'occupied'
                        ? 'bg-blue-50 border-blue-300 text-blue-950'
                        : pc.status === 'maintenance'
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md mx-auto flex items-center justify-center mb-1 font-mono text-xs font-bold">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <p className="font-mono font-bold text-xs">{pc.pcCode}</p>
                    <p className="text-[10px] font-medium capitalize mt-0.5 truncate">
                      {pc.status === 'occupied' ? pc.assignedStudentName : pc.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: FEE ANALYTICS (Recharts Powered) */}
        {activeTab === 'analytics' && (
          <FeeAnalytics
            onNavigateToFees={() => setActiveTab('fees')}
            onOpenRecordFee={(studentId) => {
              const student = students.find(s => s.id === studentId);
              const due = student ? Math.max(0, student.totalFee - student.paidFee) : 2000;
              setFeeForm(prev => ({ ...prev, studentId, amount: due }));
              setActiveTab('fees');
            }}
          />
        )}

        {/* TAB 2: FEES & RECEIPTS (High Priority Feature) */}
        {activeTab === 'fees' && (
          <div className="space-y-8">
            {/* Fee Collection Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">Record Fee Payment</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter fee payment details — receipt is immediately generated and dispatched to the parent's phone!
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> View Fee Analytics
                  </button>
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs">
                    Instant Receipt Engine
                  </span>
                </div>
              </div>

              <form onSubmit={handleRecordFeeSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Select Student */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Select Student *
                    </label>
                    {students.length === 0 ? (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                        <span className="text-amber-900 font-medium">⚠️ कोई छात्र पंजीकृत नहीं है। फीस काटने के लिए पहले नया एडमिशन करें।</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('admissions')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer ml-2"
                        >
                          + New Admission
                        </button>
                      </div>
                    ) : (
                      <select
                        value={feeForm.studentId}
                        onChange={e => {
                          const sId = e.target.value;
                          const st = students.find(s => s.id === sId);
                          const due = st ? Math.max(0, st.totalFee - st.paidFee) : 2000;
                          setFeeForm(prev => ({
                            ...prev,
                            studentId: sId,
                            amount: due || 1000,
                            parentMobile: st?.parentMobile || st?.mobile || ''
                          }));
                        }}
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                        required
                      >
                        <option value="">-- छात्र चुनें (Select Student) --</option>
                        {students.map(s => {
                          const due = s.totalFee - s.paidFee;
                          return (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.studentId}) — Pending Due: ₹{due.toLocaleString('en-IN')} (Parent: {s.parentMobile})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  {/* Amount to Pay */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Amount Received (₹) *
                    </label>
                    <input
                      type="number"
                      value={feeForm.amount}
                      onChange={e => setFeeForm({ ...feeForm, amount: Number(e.target.value) })}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="e.g. 2000"
                      min="100"
                      required
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Payment Mode *
                    </label>
                    <select
                      value={feeForm.paymentMethod}
                      onChange={e => setFeeForm({ ...feeForm, paymentMethod: e.target.value as any })}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                      <option value="Cash">Cash (Front Desk)</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                      <option value="Card">Debit / Credit Card</option>
                    </select>
                  </div>
                </div>

                {/* Recipient WhatsApp Phone & Remarks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Parent's WhatsApp Mobile *
                    </label>
                    <input
                      type="text"
                      value={feeForm.parentMobile}
                      onChange={e => setFeeForm({ ...feeForm, parentMobile: e.target.value })}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full p-3 rounded-xl border border-emerald-400 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30"
                      required
                    />
                    <p className="text-[10px] text-emerald-700 mt-1">
                      Receipt will be dispatched to this exact phone number
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Remarks / Reference Note
                    </label>
                    <input
                      type="text"
                      value={feeForm.remarks}
                      onChange={e => setFeeForm({ ...feeForm, remarks: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                      placeholder="e.g. Second Installment / UPI Ref"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      Save & Send Receipt
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Payments Ledger Table */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">All Issued Fee Receipts</h3>
                  <p className="text-xs text-slate-500">Every receipt is digitally signed and verifiable</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={exportPaymentsCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" /> Export Receipts CSV
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                    Total Collected: ₹{totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                      <th className="py-3 px-4">Receipt No.</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4 text-right">Amount Paid</th>
                      <th className="py-3 px-4 text-right">Remaining Due</th>
                      <th className="py-3 px-4 text-center">Parent Mobile</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center">
                          <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-bold text-slate-700 text-sm">अभी कोई फीस रसीद जारी नहीं हुई है</p>
                          <p className="text-xs text-slate-400 mt-1">ऊपर दिए गए फॉर्म से फीस रिकॉर्ड करें या नया एडमिशन जोड़ें।</p>
                        </td>
                      </tr>
                    ) : (
                      payments.map(payment => (
                      <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-900">{payment.receiptNo}</td>
                        <td className="py-3 px-4 text-slate-500">{payment.date}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{payment.studentName}</td>
                        <td className="py-3 px-4 text-slate-600">{payment.courseName}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            {payment.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600 font-display text-sm">
                          ₹{payment.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-800">
                          {payment.remainingDue === 0 ? (
                            <span className="text-emerald-600 font-bold">Paid ✅</span>
                          ) : (
                            `₹${payment.remainingDue.toLocaleString('en-IN')}`
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">{payment.parentMobile}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setActiveReceipt(payment)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            <FileText className="w-3 h-3" /> View / Print
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NEW ADMISSION */}
        {activeTab === 'admissions' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <PlusCircle className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">Student Admission & Enrollment</h2>
                  <p className="text-xs text-slate-500">
                    System automatically generates unique Student ID (e.g. NK-2026-00{students.length + 1})
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAdmissionSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Vikas Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.fatherName}
                    onChange={e => setNewStudent({ ...newStudent, fatherName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Rajesh Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Parent Registered Mobile (For WhatsApp Fee Receipts) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newStudent.parentMobile}
                    onChange={e => setNewStudent({ ...newStudent, parentMobile: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="e.g. +91 98765 00000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Student Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={newStudent.mobile}
                    onChange={e => setNewStudent({ ...newStudent, mobile: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Course *
                  </label>
                  <select
                    value={newStudent.courseId}
                    onChange={e => {
                      const c = courses.find(item => item.id === e.target.value);
                      setNewStudent({
                        ...newStudent,
                        courseId: e.target.value,
                        totalFee: c?.fee || 8500
                      });
                    }}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        [{course.type.toUpperCase()}] {course.name} (₹{course.fee})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assign Batch *
                  </label>
                  <select
                    value={newStudent.batchId}
                    onChange={e => setNewStudent({ ...newStudent, batchId: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} • {batch.timing} ({batch.room})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Total Agreed Course Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={newStudent.totalFee}
                    onChange={e => setNewStudent({ ...newStudent, totalFee: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 font-display"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admission Date
                  </label>
                  <input
                    type="date"
                    value={newStudent.admissionDate}
                    onChange={e => setNewStudent({ ...newStudent, admissionDate: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={newStudent.address}
                  onChange={e => setNewStudent({ ...newStudent, address: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  placeholder="Street, locality, city and pincode"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('students')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-200 cursor-pointer"
                >
                  Enroll Student & Generate ID
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: STUDENTS LIST */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900">Enrolled Students Directory</h2>
                <p className="text-xs text-slate-500">Manage student profiles, ID cards, certificates, and fees</p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={exportStudentsCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" /> Export CSV
                </button>
                {/* Search Box */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    placeholder="Search name, ID or mobile..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course & Batch</th>
                    <th className="py-3 px-4">Parent Phone</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Computer PC</th>
                    <th className="py-3 px-4 text-right">Fee Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(student => {
                    const course = courses.find(c => c.id === student.courseId);
                    const batch = batches.find(b => b.id === student.batchId);
                    const due = student.totalFee - student.paidFee;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => setPhotoTargetStudent(student)}
                              className="relative group cursor-pointer shrink-0"
                              title="Click to Change Photo / फ़ोटो बदलें"
                            >
                              <img
                                src={student.photoUrl}
                                alt={student.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 group-hover:brightness-75 transition-all"
                              />
                              <span className="absolute inset-0 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 bg-slate-900/60 transition-opacity">
                                <Camera className="w-3.5 h-3.5" />
                              </span>
                              <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-0.5 rounded-full shadow">
                                <Camera className="w-2.5 h-2.5" />
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{student.name}</p>
                              <p className="font-mono text-[10px] text-indigo-700 font-semibold">{student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800">{course?.name}</p>
                          <p className="text-[11px] text-slate-400">{batch?.name}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">{student.parentMobile}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            {student.attendanceRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {student.allottedComputerId ? (
                            <span className="font-mono text-[11px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                              {student.allottedComputerId}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-bold text-slate-900">₹{student.paidFee} / ₹{student.totalFee}</p>
                          {due > 0 ? (
                            <span className="text-[10px] font-bold text-amber-700">Due: ₹{due}</span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600">Full Paid ✅</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setPhotoTargetStudent(student)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Change Student Photo / फ़ोटो बदलें"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setActiveIdCardStudent(student)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Generate Student ID Card"
                            >
                              <IdCard className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => course && setActiveCertificateStudent({ student, course })}
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Generate Completion Certificate"
                            >
                              <Award className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setFeeForm(prev => ({ ...prev, studentId: student.id, amount: due || 1000 }));
                                setActiveTab('fees');
                              }}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Record Fee Payment"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingStudent(student)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Student Profile"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                deleteStudent(student.id);
                                showToast(`${student.name} को डेटाबेस से हटा दिया गया`, 'success');
                              }}
                              className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="max-w-xs mx-auto text-slate-400">
                          <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                          <p className="font-bold text-slate-700 text-sm">
                            {studentSearch ? 'कोई छात्र नहीं मिला' : 'कोई छात्र पंजीकृत नहीं है'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {studentSearch ? 'कृपया दूसरा नाम या मोबाइल नंबर सर्च करें।' : 'अपनी कोचिंग के असली विद्यार्थियों का पहला एडमिशन करने के लिए बटन दबाएं।'}
                          </p>
                          {!studentSearch && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('admissions')}
                              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                            >
                              <PlusCircle className="w-4 h-4" /> नया एडमिशन करें
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: COMPUTER LAB MANAGEMENT (Computer Centre Focus) */}
        {activeTab === 'lab' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      COMPUTER LAB 1 & 2
                    </span>
                    <span className="text-xs text-slate-500">16 Workstations Available</span>
                  </div>
                  <h2 className="text-xl font-bold font-display text-slate-900 mt-1">
                    Computer Lab Management & Student Allocation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Assign specific PCs to students (e.g. Rahul Kumar ➔ PC-04 for Python 8:00 AM) and manage hardware maintenance
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
                  </span>
                  <span className="flex items-center gap-1 text-blue-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Occupied
                  </span>
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Maintenance
                  </span>
                </div>
              </div>

              {/* Workstations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                {computers.map(pc => (
                  <div
                    key={pc.id}
                    className={`p-4 rounded-2xl border transition-all relative ${
                      pc.status === 'occupied'
                        ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                        : pc.status === 'maintenance'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {/* PC Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          pc.status === 'occupied' ? 'bg-blue-600 text-white' :
                          pc.status === 'maintenance' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-mono font-black text-sm">{pc.pcCode}</p>
                          <span className="text-[10px] text-slate-400">{pc.labRoom}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        pc.status === 'occupied' ? 'bg-blue-200 text-blue-900' :
                        pc.status === 'maintenance' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {pc.status}
                      </span>
                    </div>

                    {/* Student Allocation Info if occupied */}
                    {pc.status === 'occupied' && pc.assignedStudentName && (
                      <div className="mt-3 p-2.5 bg-white/80 rounded-xl border border-blue-200 text-xs">
                        <p className="text-[11px] text-slate-500">Allocated Student:</p>
                        <p className="font-bold text-slate-900 text-sm">{pc.assignedStudentName}</p>
                        <p className="text-[10px] text-blue-800 mt-0.5">{pc.assignedBatch}</p>
                        <p className="text-[10px] text-slate-600 font-mono mt-0.5">{pc.assignedTimeSlot}</p>
                      </div>
                    )}

                    {/* Maintenance Alert if maintenance */}
                    {pc.status === 'maintenance' && (
                      <div className="mt-3 p-2.5 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-900">
                        <p className="font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Issue Reported:
                        </p>
                        <p className="text-[11px] mt-0.5">{pc.issueReported || 'Under routine servicing'}</p>
                      </div>
                    )}

                    {/* Specs & Software info */}
                    <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                      <p className="truncate"><strong>Specs:</strong> {pc.specs}</p>
                      <p className="truncate"><strong>Software:</strong> {pc.installedSoftware.slice(0, 3).join(', ')}</p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2">
                        {pc.status === 'occupied' ? (
                          <button
                            onClick={() => allocateComputer(pc.id, undefined)}
                            className="text-red-600 hover:text-red-800 font-bold text-[11px] cursor-pointer"
                          >
                            Deallocate
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setAllottingPC(pc);
                              setAllotStudentId(students[0]?.id || '');
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] cursor-pointer"
                          >
                            + Allot
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const nextStatus = pc.status === 'maintenance' ? 'working' : 'maintenance';
                            updateComputerStatus(pc.id, nextStatus, nextStatus === 'maintenance' ? 'Hardware inspection' : undefined);
                          }}
                          className="text-slate-500 hover:text-slate-800 font-semibold text-[11px] cursor-pointer"
                        >
                          {pc.status === 'maintenance' ? 'Mark Working' : 'Report Issue'}
                        </button>
                      </div>

                      <button
                        onClick={() => setEditingComputer(pc)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Edit PC Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal for Allotting PC */}
            {allottingPC && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
                  <h3 className="text-lg font-bold font-display text-slate-900">
                    Allot {allottingPC.pcCode} to Student
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Select an enrolled student for lab workstation</p>

                  <div className="my-4 space-y-3">
                    <label className="block text-xs font-bold text-slate-700">Choose Student:</label>
                    <select
                      value={allotStudentId}
                      onChange={e => setAllotStudentId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.studentId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setAllottingPC(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        allocateComputer(allottingPC.id, allotStudentId);
                        setAllottingPC(null);
                      }}
                      className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      Confirm Allotment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: COURSES & BATCHES */}
        {activeTab === 'batches' && (
          <div className="space-y-8">
            {/* Batches Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">Batches & Timings</h2>
                  <p className="text-xs text-slate-500">School coaching classes (Nursery to 12th) & Computer/Coding training batches</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Create New Batch
                </button>
              </div>

              {/* Categorized Filter Tabs (School vs Coding) */}
              <div className="flex flex-wrap items-center gap-2 mb-6 pb-2 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setBatchFilterCategory('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    batchFilterCategory === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Batches ({batches.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBatchFilterCategory('coaching')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    batchFilterCategory === 'coaching'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  <span>🏫 School Classes (Nursery - 12th)</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    batchFilterCategory === 'coaching' ? 'bg-purple-700 text-white' : 'bg-purple-200 text-purple-800'
                  }`}>
                    {batches.filter(b => b.category === 'coaching').length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setBatchFilterCategory('computer')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    batchFilterCategory === 'computer'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <span>💻 Computer & Coding Classes</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    batchFilterCategory === 'computer' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-800'
                  }`}>
                    {batches.filter(b => b.category === 'computer').length}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {batches
                  .filter(batch => batchFilterCategory === 'all' || batch.category === batchFilterCategory)
                  .map(batch => {
                    const course = courses.find(c => c.id === batch.courseId);
                    const teacher = teachers.find(t => t.id === batch.teacherId);
                    const isSchool = batch.category === 'coaching';
                    return (
                      <div key={batch.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isSchool ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {isSchool ? '🏫 School' : '💻 Coding/Computer'}
                              </span>
                              {batch.classLevel && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  {batch.classLevel}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                                {batch.room}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-base mt-2">{batch.name}</h3>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingBatch(batch)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                              title="Edit Batch"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteBatch(batch.id);
                                showToast(`बैच ${batch.name} हटा दिया गया!`, 'success');
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium">Course: {course?.name || 'Standard Curriculum'}</p>
                        <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-200/60">
                          <p><strong>Timing:</strong> {batch.timing}</p>
                          <p><strong>Days:</strong> {batch.days}</p>
                          <p><strong>Faculty:</strong> {teacher?.name || 'Assigned Instructor'}</p>
                          <p><strong>Capacity:</strong> {batch.enrolledStudentIds?.length || 0} / {batch.capacity} Students</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Courses Overview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">Institute Courses & Curriculum</h2>
                  <p className="text-xs text-slate-500">School classes (Nursery to 12th) & Computer Centre (Python, Tally, ADCA, Web Dev)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Add New Course
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map(course => (
                  <div key={course.id} className="p-5 rounded-2xl border border-slate-200 hover:shadow-sm transition-all space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          course.type === 'computer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {course.type === 'computer' ? '💻 Computer / Coding' : '🏫 School / Coaching'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-sm text-slate-900 font-display mr-1">₹{course.fee.toLocaleString('en-IN')}</span>
                        <button
                          type="button"
                          onClick={() => setEditingCourse(course)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Course"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteCourse(course.id);
                            showToast(`कोर्स ${course.name} हटा दिया गया!`, 'success');
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{course.name}</h3>
                    <p className="text-xs text-slate-500">{course.duration} Duration</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{course.syllabusOverview}</p>

                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-700">Subjects / Modules:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {course.subjects.map((sub, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: TEACHERS & STAFF */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900">Faculty & Staff Management</h2>
                <p className="text-xs text-slate-500">Instructors, computer lab mentors, and contact details</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTeacherModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" /> Add Faculty Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {teachers.map(teacher => (
                <div key={teacher.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => setPhotoTargetTeacher(teacher)}
                      className="relative group cursor-pointer shrink-0"
                      title="फ़ैकल्टी फ़ोटो बदलें (Change Photo)"
                    >
                      <img
                        src={teacher.photoUrl}
                        alt={teacher.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 group-hover:brightness-75 transition-all"
                      />
                      <span className="absolute inset-0 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 bg-slate-900/60 transition-opacity">
                        <Camera className="w-5 h-5" />
                      </span>
                      <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow">
                        <Camera className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-base">{teacher.name}</h3>
                      <p className="text-xs font-semibold text-indigo-700">{teacher.subject}</p>
                      <p className="text-xs text-slate-500">Phone: {teacher.mobile}</p>
                      <p className="text-xs text-slate-500">Email: {teacher.email}</p>
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          Active Faculty
                        </span>
                        <span className="text-[11px] text-slate-400">Since {teacher.joiningDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPhotoTargetTeacher(teacher)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Change Faculty Photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTeacher(teacher)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Edit Faculty"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteTeacher(teacher.id);
                        showToast(`शिक्षक ${teacher.name} हटा दिए गए!`, 'success');
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Remove Faculty"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: ANNOUNCEMENTS & NOTICES */}
        {activeTab === 'notices' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Notice Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs h-fit space-y-4">
              <h3 className="font-bold text-slate-900 text-base font-display">Publish New Notice</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notice Title *</label>
                  <input
                    type="text"
                    value={newNoticeText.title}
                    onChange={e => setNewNoticeText({ ...newNoticeText, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                    placeholder="e.g. Holiday on Friday"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newNoticeText.category}
                    onChange={e => setNewNoticeText({ ...newNoticeText, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Exam">Exam / Test</option>
                    <option value="Fee">Fee Notice</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Batch">Batch Specific</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notice Message *</label>
                  <textarea
                    rows={4}
                    value={newNoticeText.content}
                    onChange={e => setNewNoticeText({ ...newNoticeText, content: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                    placeholder="Write announcement details..."
                  ></textarea>
                </div>
                <button
                  onClick={() => {
                    if (!newNoticeText.title || !newNoticeText.content) return;
                    addNotice(newNoticeText);
                    setNewNoticeText({ title: '', content: '', category: 'General', author: 'Admin Office' });
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Broadcast Notice
                </button>
              </div>
            </div>

            {/* Notices List */}
            <div className="lg:col-span-2 space-y-4">
              {notices.map(notice => (
                <div key={notice.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      notice.category === 'Exam' ? 'bg-purple-100 text-purple-800' :
                      notice.category === 'Fee' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {notice.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{notice.date}</span>
                      <button
                        type="button"
                        onClick={() => deleteNotice(notice.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{notice.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{notice.content}</p>
                  <p className="text-[10px] text-slate-400 pt-1">By: {notice.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* TAB 9: DATABASE & DISPATCH ENGINE */}
        {activeTab === 'database' && (
          <DatabaseManager />
        )}
      </main>

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-display">Edit Student Profile</h3>
                <p className="text-xs text-slate-400 font-mono">{editingStudent.studentId} • {editingStudent.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Photo Display & Change Trigger */}
              <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div
                  onClick={() => setPhotoTargetStudent(editingStudent)}
                  className="relative group cursor-pointer shrink-0"
                  title="Click to Change Photo"
                >
                  <img
                    src={editingStudent.photoUrl}
                    alt={editingStudent.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm group-hover:brightness-75 transition-all"
                  />
                  <span className="absolute inset-0 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 bg-slate-900/60 transition-opacity">
                    <Camera className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-xs">Profile & ID Card Photograph</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Upload passport size photo, choose avatar, or paste image URL</p>
                  <button
                    type="button"
                    onClick={() => setPhotoTargetStudent(editingStudent)}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Photo / फ़ोटो बदलें</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={editingStudent.fatherName}
                    onChange={e => setEditingStudent({ ...editingStudent, fatherName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={editingStudent.motherName}
                    onChange={e => setEditingStudent({ ...editingStudent, motherName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Mobile</label>
                  <input
                    type="tel"
                    value={editingStudent.mobile}
                    onChange={e => setEditingStudent({ ...editingStudent, mobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Mobile (WhatsApp) *</label>
                  <input
                    type="tel"
                    value={editingStudent.parentMobile}
                    onChange={e => setEditingStudent({ ...editingStudent, parentMobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Course Fee (₹)</label>
                <input
                  type="number"
                  value={editingStudent.totalFee}
                  onChange={e => setEditingStudent({ ...editingStudent, totalFee: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Course</label>
                <select
                  value={editingStudent.courseId}
                  onChange={e => setEditingStudent({ ...editingStudent, courseId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Batch</label>
                <select
                  value={editingStudent.batchId}
                  onChange={e => setEditingStudent({ ...editingStudent, batchId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.timing})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={editingStudent.address}
                  onChange={e => setEditingStudent({ ...editingStudent, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateStudent(editingStudent.id, editingStudent);
                    setEditingStudent(null);
                  }}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD COURSE MODAL */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-display">Add New Course</h3>
                <p className="text-xs text-slate-400">Coaching or Computer Training Curriculum</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newCourseData.name) return;
                const subjects = newCourseData.subjectsStr
                  ? newCourseData.subjectsStr.split(',').map(s => s.trim()).filter(Boolean)
                  : ['Core Module', 'Practical Lab'];
                addCourse({
                  name: newCourseData.name,
                  type: newCourseData.type,
                  duration: newCourseData.duration,
                  fee: Number(newCourseData.fee),
                  subjects,
                  syllabusOverview: newCourseData.syllabusOverview || 'Comprehensive syllabus including theory, hands-on lab practicals, and regular test series.',
                  iconName: newCourseData.type === 'computer' ? 'Computer' : 'BookOpen'
                });
                setShowAddCourseModal(false);
                setNewCourseData({
                  name: '',
                  type: 'computer',
                  duration: '3 Months',
                  fee: 6500,
                  syllabusOverview: '',
                  subjectsStr: ''
                });
              }}
              className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  value={newCourseData.name}
                  onChange={e => setNewCourseData({ ...newCourseData, name: e.target.value })}
                  placeholder="e.g. Data Science & Machine Learning"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCourseData.type}
                    onChange={e => setNewCourseData({ ...newCourseData, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="computer">Computer Course</option>
                    <option value="coaching">Academic Coaching</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newCourseData.duration}
                    onChange={e => setNewCourseData({ ...newCourseData, duration: e.target.value })}
                    placeholder="e.g. 6 Months"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Course Fee (₹) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  value={newCourseData.fee}
                  onChange={e => setNewCourseData({ ...newCourseData, fee: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subjects / Modules (comma-separated)</label>
                <input
                  type="text"
                  value={newCourseData.subjectsStr}
                  onChange={e => setNewCourseData({ ...newCourseData, subjectsStr: e.target.value })}
                  placeholder="Python, Pandas, NumPy, Machine Learning"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Syllabus Overview</label>
                <textarea
                  rows={3}
                  value={newCourseData.syllabusOverview}
                  onChange={e => setNewCourseData({ ...newCourseData, syllabusOverview: e.target.value })}
                  placeholder="Outline what students will learn..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD BATCH MODAL */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-display">Create New Batch</h3>
                <p className="text-xs text-slate-400">School coaching classes (Nursery to 12th) or Computer & Coding classes</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBatchModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newBatchData.name) return;
                addBatch({
                  name: newBatchData.name,
                  category: newBatchData.category,
                  classLevel: newBatchData.classLevel,
                  courseId: newBatchData.courseId || courses[0]?.id || '',
                  teacherId: newBatchData.teacherId || teachers[0]?.id || '',
                  timing: newBatchData.timing,
                  days: newBatchData.days,
                  room: newBatchData.room,
                  capacity: Number(newBatchData.capacity) || 25
                });
                setShowAddBatchModal(false);
                showToast(`नया बैच ${newBatchData.name} जोड़ दिया गया!`, 'success');
                setNewBatchData({
                  name: '',
                  category: 'coaching',
                  classLevel: 'Nursery',
                  courseId: courses[0]?.id || '',
                  teacherId: teachers[0]?.id || '',
                  timing: '08:00 AM - 09:30 AM',
                  days: 'Mon - Fri',
                  room: 'Room 101',
                  capacity: 25
                });
              }}
              className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Batch Code / Name *</label>
                <input
                  type="text"
                  required
                  value={newBatchData.name}
                  onChange={e => setNewBatchData({ ...newBatchData, name: e.target.value })}
                  placeholder="e.g. 10th Board Foundation 2025"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch Category *</label>
                  <select
                    value={newBatchData.category}
                    onChange={e => {
                      const cat = e.target.value as 'coaching' | 'computer';
                      setNewBatchData({
                        ...newBatchData,
                        category: cat,
                        classLevel: cat === 'coaching' ? 'Nursery' : 'Python Programming',
                        room: cat === 'coaching' ? 'Room 101' : 'Lab 1'
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-indigo-700"
                  >
                    <option value="coaching">🏫 School Class (Nursery to 12th)</option>
                    <option value="computer">💻 Coding & Computer Class</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {newBatchData.category === 'coaching' ? 'Target School Class *' : 'Coding / Course Track *'}
                  </label>
                  {newBatchData.category === 'coaching' ? (
                    <select
                      value={newBatchData.classLevel}
                      onChange={e => setNewBatchData({ ...newBatchData, classLevel: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      {[
                        'Nursery', 'LKG', 'UKG', 'Class 1st', 'Class 2nd', 'Class 3rd',
                        'Class 4th', 'Class 5th', 'Class 6th', 'Class 7th', 'Class 8th',
                        'Class 9th', 'Class 10th', 'Class 11th', 'Class 12th'
                      ].map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={newBatchData.classLevel}
                      onChange={e => setNewBatchData({ ...newBatchData, classLevel: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      {[
                        'Python Programming', 'Full Stack Web Dev', 'Basic Computer & Typing',
                        'DCA & ADCA', 'Tally Prime & GST', 'C / C++ & DSA', 'Graphic & UI/UX Design'
                      ].map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Associated Course</label>
                  <select
                    value={newBatchData.courseId}
                    onChange={e => setNewBatchData({ ...newBatchData, courseId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Faculty / Instructor</label>
                  <select
                    value={newBatchData.teacherId}
                    onChange={e => setNewBatchData({ ...newBatchData, teacherId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Classroom / Lab</label>
                  <select
                    value={newBatchData.room}
                    onChange={e => setNewBatchData({ ...newBatchData, room: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Room 101">Classroom 101</option>
                    <option value="Room 102">Classroom 102</option>
                    <option value="Lab 1">Computer Lab 1</option>
                    <option value="Lab 2">Computer Lab 2</option>
                    <option value="Hall A">Auditorium Hall A</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Capacity</label>
                  <input
                    type="number"
                    value={newBatchData.capacity}
                    onChange={e => setNewBatchData({ ...newBatchData, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch Timing</label>
                  <input
                    type="text"
                    value={newBatchData.timing}
                    onChange={e => setNewBatchData({ ...newBatchData, timing: e.target.value })}
                    placeholder="e.g. 09:00 AM - 10:30 AM"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Days</label>
                  <input
                    type="text"
                    value={newBatchData.days}
                    onChange={e => setNewBatchData({ ...newBatchData, days: e.target.value })}
                    placeholder="e.g. Mon - Sat"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BATCH MODAL */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-display">Edit Batch Details</h3>
                <p className="text-xs text-slate-400">Update batch name, curriculum, timings or faculty</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBatch(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                updateBatch(editingBatch.id, editingBatch);
                setEditingBatch(null);
                showToast(`बैच ${editingBatch.name} अपडेट हो गया!`, 'success');
              }}
              className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Batch Code / Name *</label>
                <input
                  type="text"
                  required
                  value={editingBatch.name}
                  onChange={e => setEditingBatch({ ...editingBatch, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch Category *</label>
                  <select
                    value={editingBatch.category}
                    onChange={e => setEditingBatch({ ...editingBatch, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-indigo-700"
                  >
                    <option value="coaching">🏫 School Class (Nursery - 12th)</option>
                    <option value="computer">💻 Coding & Computer Class</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Class / Track</label>
                  <input
                    type="text"
                    value={editingBatch.classLevel || ''}
                    onChange={e => setEditingBatch({ ...editingBatch, classLevel: e.target.value })}
                    placeholder="e.g. Class 10th or Python Pro"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Associated Course</label>
                  <select
                    value={editingBatch.courseId}
                    onChange={e => setEditingBatch({ ...editingBatch, courseId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Faculty / Instructor</label>
                  <select
                    value={editingBatch.teacherId}
                    onChange={e => setEditingBatch({ ...editingBatch, teacherId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room / Lab</label>
                  <input
                    type="text"
                    value={editingBatch.room}
                    onChange={e => setEditingBatch({ ...editingBatch, room: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Capacity</label>
                  <input
                    type="number"
                    value={editingBatch.capacity}
                    onChange={e => setEditingBatch({ ...editingBatch, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Timing</label>
                  <input
                    type="text"
                    value={editingBatch.timing}
                    onChange={e => setEditingBatch({ ...editingBatch, timing: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Days</label>
                  <input
                    type="text"
                    value={editingBatch.days}
                    onChange={e => setEditingBatch({ ...editingBatch, days: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-display">Edit Course Details</h3>
                <p className="text-xs text-slate-400">Update curriculum syllabus, fees or duration</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                updateCourse(editingCourse.id, editingCourse);
                setEditingCourse(null);
                showToast(`कोर्स ${editingCourse.name} अपडेट हो गया!`, 'success');
              }}
              className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Name *</label>
                <input
                  type="text"
                  required
                  value={editingCourse.name}
                  onChange={e => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingCourse.type}
                    onChange={e => setEditingCourse({ ...editingCourse, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="computer">Computer / Coding Course</option>
                    <option value="coaching">Academic School Coaching</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingCourse.duration}
                    onChange={e => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Fee (₹) *</label>
                <input
                  type="number"
                  required
                  value={editingCourse.fee}
                  onChange={e => setEditingCourse({ ...editingCourse, fee: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subjects / Modules (comma-separated)</label>
                <input
                  type="text"
                  value={editingCourse.subjects.join(', ')}
                  onChange={e => setEditingCourse({
                    ...editingCourse,
                    subjects: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Syllabus Overview</label>
                <textarea
                  rows={3}
                  value={editingCourse.syllabusOverview}
                  onChange={e => setEditingCourse({ ...editingCourse, syllabusOverview: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEACHER MODAL */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-display">Edit Faculty Details</h3>
                <p className="text-xs text-slate-400">Update teacher profile, phone, subject or salary</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                updateTeacher(editingTeacher.id, editingTeacher);
                setEditingTeacher(null);
                showToast(`शिक्षक ${editingTeacher.name} की जानकारी अपडेट हो गई!`, 'success');
              }}
              className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto"
            >
              {/* Photo Display & Change Trigger */}
              <div className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div
                  onClick={() => setPhotoTargetTeacher(editingTeacher)}
                  className="relative group cursor-pointer shrink-0"
                  title="Click to Change Photo"
                >
                  <img
                    src={editingTeacher.photoUrl}
                    alt={editingTeacher.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm group-hover:brightness-75 transition-all"
                  />
                  <span className="absolute inset-0 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 bg-slate-900/60 transition-opacity">
                    <Camera className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-xs">Faculty Profile Photo</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Upload local photo, select avatar, or paste image URL</p>
                  <button
                    type="button"
                    onClick={() => setPhotoTargetTeacher(editingTeacher)}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Photo / फ़ोटो बदलें</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty Name *</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.name}
                  onChange={e => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject / Specialization *</label>
                <input
                  type="text"
                  required
                  value={editingTeacher.subject}
                  onChange={e => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={editingTeacher.mobile}
                    onChange={e => setEditingTeacher({ ...editingTeacher, mobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingTeacher.email}
                    onChange={e => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={editingTeacher.salary}
                    onChange={e => setEditingTeacher({ ...editingTeacher, salary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={editingTeacher.joiningDate}
                    onChange={e => setEditingTeacher({ ...editingTeacher, joiningDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COMPUTER MODAL */}
      {editingComputer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-display">Edit Workstation ({editingComputer.pcCode})</h3>
                <p className="text-xs text-slate-400">Configure PC specs, room, hardware condition or maintenance</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingComputer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                updateComputer(editingComputer.id, editingComputer);
                setEditingComputer(null);
                showToast(`कंप्यूटर ${editingComputer.pcCode} अपडेट हो गया!`, 'success');
              }}
              className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PC Code *</label>
                  <input
                    type="text"
                    required
                    value={editingComputer.pcCode}
                    onChange={e => setEditingComputer({ ...editingComputer, pcCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lab Room</label>
                  <input
                    type="text"
                    value={editingComputer.labRoom}
                    onChange={e => setEditingComputer({ ...editingComputer, labRoom: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hardware Specifications</label>
                <input
                  type="text"
                  value={editingComputer.specs}
                  onChange={e => setEditingComputer({ ...editingComputer, specs: e.target.value })}
                  placeholder="e.g. Core i5 12th Gen, 16GB RAM, 512GB SSD"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingComputer.status}
                    onChange={e => setEditingComputer({ ...editingComputer, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="working">Working (Available)</option>
                    <option value="occupied">Occupied (Student Allocated)</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Installed Software</label>
                  <input
                    type="text"
                    value={editingComputer.installedSoftware.join(', ')}
                    onChange={e => setEditingComputer({
                      ...editingComputer,
                      installedSoftware: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {editingComputer.status === 'maintenance' && (
                <div>
                  <label className="block font-bold text-amber-800 mb-1">Issue Reported / Servicing Notes</label>
                  <input
                    type="text"
                    value={editingComputer.issueReported || ''}
                    onChange={e => setEditingComputer({ ...editingComputer, issueReported: e.target.value })}
                    placeholder="e.g. Keyboard cable replaced, OS update needed"
                    className="w-full p-2.5 rounded-xl border border-amber-300 bg-amber-50"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingComputer(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TEACHER MODAL */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-display">Add Faculty Member</h3>
                <p className="text-xs text-slate-400">Register teacher or computer lab mentor</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newTeacherData.name || !newTeacherData.mobile) return;
                addTeacher({
                  name: newTeacherData.name,
                  subject: newTeacherData.subject || 'Faculty Instructor',
                  mobile: newTeacherData.mobile,
                  email: newTeacherData.email || 'faculty@nkinstitute.in',
                  salary: Number(newTeacherData.salary) || 25000,
                  joiningDate: newTeacherData.joiningDate,
                  photoUrl: newTeacherData.photoUrl,
                  assignedBatches: []
                });
                setShowAddTeacherModal(false);
                setNewTeacherData({
                  name: '',
                  subject: '',
                  mobile: '',
                  email: '',
                  salary: 25000,
                  joiningDate: new Date().toISOString().split('T')[0],
                  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                });
              }}
              className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty Name *</label>
                <input
                  type="text"
                  required
                  value={newTeacherData.name}
                  onChange={e => setNewTeacherData({ ...newTeacherData, name: e.target.value })}
                  placeholder="e.g. Er. Neeraj Verma"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teaching Subject / Specialization *</label>
                <input
                  type="text"
                  required
                  value={newTeacherData.subject}
                  onChange={e => setNewTeacherData({ ...newTeacherData, subject: e.target.value })}
                  placeholder="e.g. Python, Full Stack & Web Development"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={newTeacherData.mobile}
                    onChange={e => setNewTeacherData({ ...newTeacherData, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newTeacherData.email}
                    onChange={e => setNewTeacherData({ ...newTeacherData, email: e.target.value })}
                    placeholder="teacher@nkinstitute.in"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={newTeacherData.salary}
                    onChange={e => setNewTeacherData({ ...newTeacherData, salary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={newTeacherData.joiningDate}
                    onChange={e => setNewTeacherData({ ...newTeacherData, joiningDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Add Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Setup Institute & Clear Demo Modal */}
      <SetupInstituteModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        defaultTab={setupModalTab}
      />

      {/* Photo Change Modals for Students and Teachers */}
      {photoTargetStudent && (
        <ChangePhotoModal
          isOpen={!!photoTargetStudent}
          onClose={() => setPhotoTargetStudent(null)}
          currentPhotoUrl={photoTargetStudent.photoUrl}
          name={photoTargetStudent.name}
          roleLabel="Student"
          onSave={(newPhotoUrl) => {
            updateStudent(photoTargetStudent.id, { photoUrl: newPhotoUrl });
            if (editingStudent && editingStudent.id === photoTargetStudent.id) {
              setEditingStudent({ ...editingStudent, photoUrl: newPhotoUrl });
            }
            showToast(`${photoTargetStudent.name} की फ़ोटो सफलतापूर्वक बदल दी गई!`, 'success');
          }}
        />
      )}

      {photoTargetTeacher && (
        <ChangePhotoModal
          isOpen={!!photoTargetTeacher}
          onClose={() => setPhotoTargetTeacher(null)}
          currentPhotoUrl={photoTargetTeacher.photoUrl}
          name={photoTargetTeacher.name}
          roleLabel="Faculty / Teacher"
          onSave={(newPhotoUrl) => {
            updateTeacher(photoTargetTeacher.id, { photoUrl: newPhotoUrl });
            if (editingTeacher && editingTeacher.id === photoTargetTeacher.id) {
              setEditingTeacher({ ...editingTeacher, photoUrl: newPhotoUrl });
            }
            showToast(`शिक्षक ${photoTargetTeacher.name} की फ़ोटो सफलतापूर्वक बदल दी गई!`, 'success');
          }}
        />
      )}
    </div>
  );
};
