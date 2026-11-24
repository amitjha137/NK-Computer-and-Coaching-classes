import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Download,
  Award,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Laptop,
  BookOpen,
  Sparkles,
  Play,
  IdCard,
  Send,
  Star,
  Camera,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TakeTestModal } from '../TakeTestModal';
import { QRAttendanceModal } from '../QRAttendanceModal';
import { ChangePhotoModal } from '../ChangePhotoModal';
import { StudentProgressChart } from './StudentProgressChart';
import { OnlineTest } from '../../types';

export const StudentDashboard: React.FC = () => {
  const {
    students,
    selectedStudentId,
    setSelectedStudentId,
    setRole,
    courses,
    batches,
    timetable,
    studyMaterials,
    homeworks,
    tests,
    testResults,
    payments,
    setActiveReceipt,
    setActiveIdCardStudent,
    setActiveCertificateStudent,
    notices,
    updateStudent
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'materials' | 'homework' | 'fees'>('overview');
  const [activeTestToTake, setActiveTestToTake] = useState<OnlineTest | null>(null);
  const [showQRScanModal, setShowQRScanModal] = useState(false);
  const [showChangePhotoModal, setShowChangePhotoModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submittedHW, setSubmittedHW] = useState<{ [id: string]: boolean }>({});
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [rating, setRating] = useState(5);

  const student = students.find(s => s.id === selectedStudentId) || students[0];
  const course = courses.find(c => c.id === student?.courseId);
  const batch = batches.find(b => b.id === student?.batchId);

  const studentPayments = payments.filter(p => p.studentId === student?.id);
  const studentResults = testResults.filter(r => r.studentId === student?.id);
  const dueFee = student ? Math.max(0, student.totalFee - student.paidFee) : 0;

  // Filter timetable for this batch
  const batchTimetable = timetable.filter(t => t.batchName === batch?.name || t.room.includes('Lab 1'));

  if (!student) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900">
            कोई छात्र पंजीकृत नहीं है
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            आपने डेमो डेटा साफ़ कर दिया है। एडमिन पोर्टल में जाकर <strong>New Admission</strong> पर क्लिक करें और अपने पहले छात्र का विवरण भरें।
          </p>
          <button
            onClick={() => setRole('admin')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            एडमिन पोर्टल पर जाएं &amp; नया छात्र जोड़ें
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Student Top Header Banner */}
      <div className="bg-[#0F172A] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                onClick={() => setShowChangePhotoModal(true)}
                className="relative group cursor-pointer"
                title="फ़ोटो बदलने के लिए क्लिक करें (Click to Change Photo)"
              >
                <img
                  src={student?.photoUrl}
                  alt={student?.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/80 shadow-md ring-2 ring-indigo-500/20 group-hover:brightness-75 transition-all"
                />
                <span className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 bg-slate-900/50 transition-opacity">
                  <Camera className="w-5 h-5 drop-shadow" />
                  <span className="text-[9px] font-bold tracking-tight mt-0.5">बदलें</span>
                </span>
                <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow border-2 border-[#0F172A]" title="Change Photo">
                  <Camera className="w-3 h-3" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-indigo-300 bg-indigo-950/90 px-2 py-0.5 rounded border border-indigo-500/40">
                    {student?.studentId}
                  </span>
                  <span className="text-xs text-slate-400">Student Portal</span>
                </div>
                <h1 className="text-2xl font-bold font-display tracking-tight text-white mt-1">
                  Namaste, {student?.name}! 👋
                </h1>
                <p className="text-xs text-slate-400">
                  {course?.name} • Batch: <strong className="text-slate-200">{batch?.name}</strong>
                </p>
              </div>
            </div>

            {/* Quick Actions & Profile Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowChangePhotoModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-200 rounded-xl text-xs font-semibold transition-all border border-indigo-500/40 cursor-pointer shadow-xs"
                title="अपनी प्रोफ़ाइल फ़ोटो बदलें"
              >
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Change Photo / फ़ोटो बदलें</span>
              </button>
              <button
                onClick={() => student && setActiveIdCardStudent(student)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700/80 cursor-pointer shadow-xs"
              >
                <IdCard className="w-4 h-4 text-indigo-400" />
                Digital ID Card
              </button>
              <button
                onClick={() => setShowQRScanModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                Scan Attendance QR
              </button>

              {/* Student Selector Demo Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-2">
                <span className="hidden sm:inline">Switch Student:</span>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs rounded-xl p-2 border border-slate-700 font-medium"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sub Nav Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto mt-6 pt-3 border-t border-slate-800 text-xs no-scrollbar">
            {[
              { id: 'overview', label: 'My Dashboard', icon: Sparkles },
              { id: 'tests', label: 'Online Tests & Exams', icon: Award },
              { id: 'materials', label: 'Study Materials & Notes', icon: BookOpen },
              { id: 'homework', label: 'Homework & Assignments', icon: FileText },
              { id: 'fees', label: 'My Fees & Receipts', icon: CreditCard }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
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

      {/* Main Student Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Attendance */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance %</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900 font-display">{student?.attendanceRate}%</span>
                  <span className="text-xs text-emerald-600 font-semibold ml-2">Consistent</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Total 28 classes recorded</p>
              </div>

              {/* Lab PC Allotted */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Computer Allotted</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black font-mono text-indigo-900">
                    {student?.allottedComputerId || 'Lab 1 (Flexible)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Dedicated Workstation with Python & IDE</p>
              </div>

              {/* Pending Fee */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Fee Dues</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900 font-display">
                    {dueFee === 0 ? (
                      <span className="text-emerald-600 text-lg">Fully Paid ✅</span>
                    ) : (
                      `₹${dueFee.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Paid: ₹{student?.paidFee.toLocaleString('en-IN')}</p>
              </div>

              {/* Upcoming Test */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Test</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-bold text-slate-900 truncate">Python Core Quiz</p>
                  <span className="text-xs text-purple-700 font-medium">Sunday • 15 Mins</span>
                </div>
                <button
                  onClick={() => setActiveTab('tests')}
                  className="text-[11px] text-indigo-600 font-bold hover:underline mt-1 block"
                >
                  Start Practice Test →
                </button>
              </div>
            </div>

            {/* Student Progress Chart (D3 Analytics) */}
            <StudentProgressChart
              results={studentResults}
              tests={tests}
              studentName={student.name}
            />

            {/* Timetable & Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Class Schedule */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold font-display text-slate-900">Today's Class Timetable</h3>
                    <p className="text-xs text-slate-500">Live lecture & computer lab timings</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 text-[11px] font-bold">
                    Lab 1 & Hall
                  </span>
                </div>

                <div className="space-y-3">
                  {batchTimetable.slice(0, 4).map(entry => (
                    <div key={entry.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {entry.day} • {entry.time}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{entry.subject}</h4>
                        <p className="text-xs text-slate-500">Faculty: {entry.teacherName} • {entry.room}</p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                        Class Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Institute Notices */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold font-display text-slate-900">Institute Notice Board</h3>
                    <p className="text-xs text-slate-500">Important alerts from Director & Faculty</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Updates</span>
                </div>

                <div className="space-y-3">
                  {notices.slice(0, 3).map(n => (
                    <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {n.category}
                        </span>
                        <span className="text-[10px] text-slate-400">{n.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Completion Certificate Card */}
            {course && (
              <div className="bg-gradient-to-r from-amber-50 to-indigo-50 rounded-3xl border border-amber-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-display">
                      Course Completion Certificate
                    </h4>
                    <p className="text-xs text-slate-600">
                      Verified credential for <strong>{course.name}</strong> ({course.duration})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => student && setActiveCertificateStudent({ student, course })}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 cursor-pointer transition-all"
                >
                  View & Download Certificate
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ONLINE TESTS */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            <StudentProgressChart
              results={studentResults}
              tests={tests}
              studentName={student.name}
            />

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold font-display text-slate-900">Available Online MCQ Tests</h2>
                <p className="text-xs text-slate-500">Attempt chapter tests, instant mark calculation, and answer key review</p>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tests.map(test => {
                const pastResult = studentResults.find(r => r.testId === test.id);
                return (
                  <div key={test.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                        {test.subject}
                      </span>
                      <span className="text-xs text-slate-500">{test.questions.length} Questions</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{test.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">Duration: {test.durationMinutes} Mins • Total Marks: {test.totalMarks}</p>
                    </div>

                    {pastResult ? (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                        <div>
                          <span className="font-bold">Previously Attempted:</span>
                          <p className="text-emerald-700 font-extrabold text-sm">{pastResult.score} / {pastResult.totalMarks} ({pastResult.percentage}%)</p>
                        </div>
                        <button
                          onClick={() => setActiveTestToTake(test)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                        >
                          Re-Attempt Test
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveTestToTake(test)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" /> Start Test Now
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {/* TAB 3: STUDY MATERIALS */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-display text-slate-900">Study Materials & Notes Library</h2>
              <p className="text-xs text-slate-500">Download syllabus notes, formula books, and practical lab files</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {studyMaterials.map(mat => (
                <div key={mat.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                        {mat.category}
                      </span>
                      <span className="text-xs text-slate-400">{mat.fileSize}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-2">{mat.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mat.description}</p>
                    <p className="text-[11px] text-indigo-700 font-medium mt-2">By: {mat.authorTeacher}</p>
                  </div>

                  <button
                    onClick={() => alert(`Downloading ${mat.title} (${mat.fileSize})...`)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF / File
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: HOMEWORK */}
        {activeTab === 'homework' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-display text-slate-900">Homework & Assignments</h2>
              <p className="text-xs text-slate-500">Submit homework solutions and track grading feedback</p>
            </div>

            <div className="space-y-4">
              {homeworks.map(hw => {
                const isDone = submittedHW[hw.id];
                return (
                  <div key={hw.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-base">{hw.title}</span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                        Due: {hw.dueDate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{hw.instructions}</p>
                    <p className="text-xs text-slate-500">Assigned by: <strong>{hw.teacherName}</strong></p>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                      {isDone ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Solution Uploaded & Submitted
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSubmittedHW(prev => ({ ...prev, [hw.id]: true }));
                            alert('Homework uploaded successfully!');
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          Submit Assignment Answer File
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: MY FEES & RECEIPTS */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">My Course Fee Ledger</h2>
                  <p className="text-xs text-slate-500">Official digital receipts with verified QR code</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">Total Course Fee: ₹{student?.totalFee.toLocaleString('en-IN')}</p>
                  <p className="text-sm font-bold text-emerald-600">Paid: ₹{student?.paidFee.toLocaleString('en-IN')}</p>
                  {dueFee > 0 && <p className="text-xs font-bold text-amber-700">Due Balance: ₹{dueFee.toLocaleString('en-IN')}</p>}
                </div>
              </div>

              {/* Receipts List */}
              <div className="divide-y divide-slate-100 mt-4">
                {studentPayments.length > 0 ? (
                  studentPayments.map(p => (
                    <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-900 text-sm">{p.receiptNo}</span>
                          <span className="text-xs text-slate-400">• {p.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Amount: <strong className="text-emerald-700 text-sm">₹{p.amount.toLocaleString('en-IN')}</strong> via {p.paymentMethod}
                        </p>
                        <p className="text-[11px] text-slate-500">Dispatched to Parent: {p.parentMobile}</p>
                      </div>

                      <button
                        onClick={() => setActiveReceipt(p)}
                        className="self-start sm:self-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> View & Print Official Receipt
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No fee receipts recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Test Modal if triggered */}
      {activeTestToTake && student && (
        <TakeTestModal
          test={activeTestToTake}
          studentId={student.id}
          onClose={() => setActiveTestToTake(null)}
        />
      )}

      {/* QR Attendance Scanner Modal */}
      {showQRScanModal && (
        <QRAttendanceModal
          batch={batch}
          mode="student_scan"
          onClose={() => setShowQRScanModal(false)}
        />
      )}

      {/* Change Profile Photo Modal */}
      {showChangePhotoModal && student && (
        <ChangePhotoModal
          isOpen={showChangePhotoModal}
          onClose={() => setShowChangePhotoModal(false)}
          currentPhotoUrl={student.photoUrl}
          name={student.name}
          roleLabel={`Student (${student.studentId})`}
          onSave={(newUrl) => {
            updateStudent(student.id, { photoUrl: newUrl });
            setToastMessage('प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई! (Photo Updated)');
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
