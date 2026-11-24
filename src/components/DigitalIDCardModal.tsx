import React, { useState } from 'react';
import { X, Printer, QrCode, Shield, CheckCircle, Camera } from 'lucide-react';
import { Student } from '../types';
import { useApp } from '../context/AppContext';
import { ChangePhotoModal } from './ChangePhotoModal';

interface Props {
  student: Student;
  onClose: () => void;
}

export const DigitalIDCardModal: React.FC<Props> = ({ student, onClose }) => {
  const { courses, batches, updateStudent } = useApp();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const course = courses.find(c => c.id === student.courseId);
  const batch = batches.find(b => b.id === student.batchId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Top Bar */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#0F172A] text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-wider uppercase text-slate-300">Official Student ID Card</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPhotoModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700 cursor-pointer shadow-xs"
              title="ID कार्ड फ़ोटो बदलें"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Change Photo</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Card
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable ID Card */}
        <div id="printable-id-card" className="p-6 bg-slate-100 flex justify-center">
          <div className="w-[340px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 relative text-slate-900">
            {/* Top Navy Ribbon with Logo */}
            <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-4 text-center relative border-b-2 border-indigo-400">
              <div className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center font-black text-xl mx-auto shadow-md border border-indigo-200">
                NK
              </div>
              <h2 className="font-black text-base tracking-wide font-display mt-1">
                NK COACHING & COMPUTER CLASSES
              </h2>
              <p className="text-[10px] text-indigo-300 font-medium tracking-wider uppercase">
                Academic & Vocational Institute
              </p>
            </div>

            {/* Student Photo & Identity */}
            <div className="p-5 text-center">
              <div
                onClick={() => setShowPhotoModal(true)}
                className="relative inline-block mx-auto mb-3 cursor-pointer group"
                title="फ़ोटो बदलने के लिए क्लिक करें"
              >
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-24 h-24 rounded-2xl object-cover mx-auto border-4 border-white shadow-lg ring-2 ring-indigo-500/20 group-hover:brightness-75 transition-all"
                />
                <span className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 bg-slate-900/50 transition-opacity">
                  <Camera className="w-6 h-6 drop-shadow" />
                  <span className="text-[9px] font-bold mt-0.5">बदलें</span>
                </span>
                <span className="absolute bottom-1 right-1 bg-indigo-600 text-white p-1 rounded-full shadow border border-white">
                  <Camera className="w-3 h-3" />
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 font-display">{student.name}</h3>
              <div className="inline-block px-3 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full font-mono text-xs font-bold text-indigo-900 mt-1">
                ID: {student.studentId}
              </div>

              {/* Data Rows */}
              <div className="mt-4 text-left text-xs space-y-2 border-t border-b border-slate-100 py-3 bg-slate-50/50 rounded-xl px-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Course:</span>
                  <span className="font-bold text-slate-900 text-right">{course?.name || 'Class 10 / Computer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Batch:</span>
                  <span className="font-semibold text-slate-800">{batch?.name || 'Morning'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Father's Name:</span>
                  <span className="font-semibold text-slate-800">{student.fatherName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Phone:</span>
                  <span className="font-semibold text-slate-800">{student.mobile}</span>
                </div>
                {student.allottedComputerId && (
                  <div className="flex justify-between bg-indigo-100/50 p-1 rounded">
                    <span className="text-indigo-800 font-medium">Lab Allotment:</span>
                    <span className="font-bold text-indigo-900">{student.allottedComputerId}</span>
                  </div>
                )}
              </div>

              {/* QR and Barcode */}
              <div className="mt-4 flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2">
                  <QrCode className="w-12 h-12 text-slate-800 border p-1 rounded-lg bg-white" />
                  <div className="text-left text-[9px] text-slate-500 leading-tight">
                    <p className="font-bold text-slate-800">Scan for Attendance</p>
                    <p>Valid Session: 2026-27</p>
                    <p>Station Rd, Civil Lines</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-serif italic text-slate-700 font-bold">NK Sharma</div>
                  <div className="text-[9px] font-bold text-slate-800 border-t border-slate-400 pt-0.5">
                    Authorized Sign
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Color Bar */}
            <div className="h-2 bg-gradient-to-r from-indigo-600 via-emerald-500 to-indigo-700"></div>
          </div>
        </div>

        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Change Photo Modal for ID Card */}
      {showPhotoModal && (
        <ChangePhotoModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          currentPhotoUrl={student.photoUrl}
          name={student.name}
          roleLabel={`Student ID: ${student.studentId}`}
          onSave={(newUrl) => {
            updateStudent(student.id, { photoUrl: newUrl });
            student.photoUrl = newUrl;
          }}
        />
      )}
    </div>
  );
};
