import React, { useState, useEffect } from 'react';
import { X, QrCode, RefreshCw, CheckCircle2, ShieldAlert, Users, Clock } from 'lucide-react';
import { Batch, Student } from '../types';
import { useApp } from '../context/AppContext';

interface Props {
  batch?: Batch;
  onClose: () => void;
  mode?: 'teacher_generate' | 'student_scan';
}

export const QRAttendanceModal: React.FC<Props> = ({ batch, onClose, mode = 'teacher_generate' }) => {
  const { batches, students, markAttendance, selectedStudentId } = useApp();
  const targetBatch = batch || batches[0];
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [scannedSuccess, setScannedSuccess] = useState(false);
  const [batchStudents, setBatchStudents] = useState<Student[]>([]);

  useEffect(() => {
    const list = students.filter(s => s.batchId === targetBatch.id);
    setBatchStudents(list);
  }, [students, targetBatch]);

  // Countdown timer simulation for anti-fraud dynamic QR code
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 1 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStudentScanSimulation = () => {
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    markAttendance([
      {
        studentId: student.id,
        batchId: targetBatch.id,
        status: 'present'
      }
    ]);

    setScannedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display">Smart QR Attendance</h3>
              <p className="text-xs text-slate-400">{targetBatch.name} • {targetBatch.room}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          {mode === 'teacher_generate' ? (
            <div className="space-y-4">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl inline-block text-xs font-semibold text-indigo-900">
                Show this dynamic QR on Classroom Projector / Lab Screen
              </div>

              {/* Dynamic QR Code Canvas Simulation */}
              <div className="relative w-64 h-64 mx-auto p-4 bg-white rounded-2xl border-4 border-indigo-600 shadow-xl flex flex-col items-center justify-center">
                <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-3 relative overflow-hidden">
                  <QrCode className="w-36 h-36 text-slate-800 animate-pulse" />
                  <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
                  <div className="mt-2 text-center">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded shadow-xs border">
                      BATCH-{targetBatch.id.toUpperCase()}-SEC-{secondsRemaining}
                    </span>
                  </div>
                </div>

                {/* Rotating Timer Badge */}
                <div className="absolute -bottom-3 bg-slate-900 text-white text-[11px] px-3 py-1 rounded-full font-mono flex items-center gap-1.5 shadow-md border border-slate-700">
                  <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
                  <span>Refreshes in {secondsRemaining}s (Anti-Fraud)</span>
                </div>
              </div>

              <div className="pt-4 text-xs text-slate-500 max-w-sm mx-auto">
                Students can open their NK Student app and tap <strong>"Scan Attendance"</strong> to mark themselves present automatically.
              </div>

              {/* Quick Batch Students Present Status */}
              <div className="border-t border-slate-100 pt-4 text-left">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-600" /> Batch Students ({batchStudents.length})
                  </span>
                  <span className="text-emerald-600">Auto-Synching...</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {batchStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                      <span className="font-medium text-slate-800">{student.name} ({student.studentId})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Marked
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Student Scanning Experience */
            <div className="space-y-4">
              {scannedSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-950 font-display">
                    Attendance Marked Successfully!
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Verified for <strong>{targetBatch.name}</strong> • Today at{' '}
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-48 h-48 mx-auto border-2 border-dashed border-indigo-500 rounded-2xl flex flex-col items-center justify-center bg-indigo-50/50 p-4">
                    <QrCode className="w-20 h-20 text-indigo-600 mb-2" />
                    <span className="text-xs font-bold text-indigo-900">Point Camera at Teacher's Screen</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Simulate scanning the live QR code in the classroom to register attendance.
                  </p>
                  <button
                    onClick={handleStudentScanSimulation}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200 cursor-pointer"
                  >
                    Simulate Successful QR Scan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
