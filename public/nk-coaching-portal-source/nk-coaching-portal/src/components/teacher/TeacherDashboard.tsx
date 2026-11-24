import React, { useState } from 'react';
import {
  UserCheck,
  QrCode,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  PlusCircle,
  FileText,
  Users,
  BookOpen,
  Award,
  Camera,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRAttendanceModal } from '../QRAttendanceModal';
import { ChangePhotoModal } from '../ChangePhotoModal';
import { Batch } from '../../types';

export const TeacherDashboard: React.FC = () => {
  const {
    teachers,
    selectedTeacherId,
    setSelectedTeacherId,
    batches,
    students,
    markAttendance,
    addHomework,
    addNotice,
    updateTeacher
  } = useApp();

  const teacher = teachers.find(t => t.id === selectedTeacherId) || teachers[1]; // Er. Rahul Verma by default
  const teacherBatches = batches.filter(b => teacher?.assignedBatches.includes(b.id));

  const [selectedBatchId, setSelectedBatchId] = useState<string>(teacherBatches[0]?.id || batches[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'attendance' | 'homework' | 'batches'>('attendance');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showChangePhotoModal, setShowChangePhotoModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual attendance state
  const currentBatch = batches.find(b => b.id === selectedBatchId) || batches[0];
  const batchStudents = students.filter(s => s.batchId === currentBatch?.id);
  const [attendanceState, setAttendanceState] = useState<{ [studentId: string]: 'present' | 'absent' | 'late' }>({});

  // Homework form
  const [newHw, setNewHw] = useState({
    title: '',
    subject: teacher?.subject || 'Computer & Coaching',
    dueDate: '2026-09-12',
    instructions: ''
  });

  const handleToggleAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    const records = batchStudents.map(st => ({
      studentId: st.id,
      batchId: currentBatch.id,
      status: attendanceState[st.id] || 'present'
    }));
    markAttendance(records);
    alert(`Attendance marked for ${records.length} students in ${currentBatch.name}!`);
  };

  const handleCreateHw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHw.title || !newHw.instructions) return;

    addHomework({
      title: newHw.title,
      subject: newHw.subject,
      batchId: currentBatch.id,
      dueDate: newHw.dueDate,
      teacherName: teacher?.name || 'Faculty',
      instructions: newHw.instructions
    });

    alert('Homework assigned successfully to batch students!');
    setNewHw({ title: '', subject: teacher?.subject || '', dueDate: '2026-09-12', instructions: '' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Teacher Header */}
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
                  src={teacher?.photoUrl}
                  alt={teacher?.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/80 shadow-md group-hover:brightness-75 transition-all"
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
                    FACULTY ID: {teacher?.id.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">Teacher Portal</span>
                </div>
                <h1 className="text-2xl font-bold font-display tracking-tight text-white mt-1">{teacher?.name}</h1>
                <p className="text-xs text-slate-400">{teacher?.subject} • NK Institute</p>
              </div>
            </div>

            {/* Quick Actions & Faculty switcher */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
              <button
                onClick={() => setShowChangePhotoModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-200 rounded-xl text-xs font-semibold transition-all border border-indigo-500/40 cursor-pointer shadow-xs"
                title="अपनी फ़ैकल्टी फ़ोटो बदलें"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Change Photo / फ़ोटो बदलें</span>
              </button>

              <div className="flex items-center gap-2">
                <span>Switch Faculty:</span>
                <select
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs rounded-xl p-2 border border-slate-700 font-medium"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 mt-6 pt-3 border-t border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold cursor-pointer transition-all ${
                activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Batch Attendance & QR
            </button>
            <button
              onClick={() => setActiveTab('homework')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold cursor-pointer transition-all ${
                activeTab === 'homework' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <FileText className="w-4 h-4" /> Assign Homework
            </button>
            <button
              onClick={() => setActiveTab('batches')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                activeTab === 'batches' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> My Batches
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Batch Selector & QR Launch */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Batch for Attendance:
                </label>
                <select
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} • {b.timing} ({b.room})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  Launch Projector QR Attendance
                </button>
              </div>
            </div>

            {/* Attendance Marking Table */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-900">
                    Roll Call: {currentBatch?.name}
                  </h3>
                  <p className="text-xs text-slate-500">{batchStudents.length} Students enrolled in this batch</p>
                </div>
                <button
                  onClick={handleSaveAttendance}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
                >
                  Save Attendance
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {batchStudents.map(st => {
                  const currentStatus = attendanceState[st.id] || 'present';
                  return (
                    <div key={st.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.photoUrl}
                          alt={st.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{st.name}</p>
                          <p className="font-mono text-[11px] text-slate-500">{st.studentId} • Parent: {st.parentMobile}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAttendance(st.id, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(st.id, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'absent'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleToggleAttendance(st.id, 'late')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOMEWORK ASSIGNMENT */}
        {activeTab === 'homework' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
            <h2 className="text-xl font-bold font-display text-slate-900 pb-4 border-b border-slate-100 mb-6">
              Create New Homework Assignment
            </h2>
            <form onSubmit={handleCreateHw} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={newHw.title}
                  onChange={e => setNewHw({ ...newHw, title: e.target.value })}
                  placeholder="e.g. Python Practical: Student Database CLI"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={newHw.subject}
                  onChange={e => setNewHw({ ...newHw, subject: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Submission Deadline *</label>
                <input
                  type="date"
                  required
                  value={newHw.dueDate}
                  onChange={e => setNewHw({ ...newHw, dueDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions & Problem Statement *</label>
                <textarea
                  rows={4}
                  required
                  value={newHw.instructions}
                  onChange={e => setNewHw({ ...newHw, instructions: e.target.value })}
                  placeholder="Detail the questions and expected file formats..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow cursor-pointer transition-colors"
              >
                Publish Assignment to Students
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: BATCHES */}
        {activeTab === 'batches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {teacherBatches.map(b => (
              <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>
                <p className="text-xs text-indigo-700 font-semibold">{b.room} • {b.timing}</p>
                <p className="text-xs text-slate-500">Days: {b.days}</p>
                <p className="text-xs text-slate-500">Enrolled: {b.enrolledStudentIds.length} Students</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* QR Modal */}
      {showQRModal && (
        <QRAttendanceModal
          batch={currentBatch}
          mode="teacher_generate"
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* Change Faculty Profile Photo Modal */}
      {showChangePhotoModal && teacher && (
        <ChangePhotoModal
          isOpen={showChangePhotoModal}
          onClose={() => setShowChangePhotoModal(false)}
          currentPhotoUrl={teacher.photoUrl}
          name={teacher.name}
          roleLabel={`Faculty (${teacher.subject})`}
          onSave={(newUrl) => {
            updateTeacher(teacher.id, { photoUrl: newUrl });
            setToastMessage('फ़ैकल्टी प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई! (Faculty Photo Updated)');
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
