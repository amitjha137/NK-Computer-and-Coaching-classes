import React from 'react';
import { X, Printer, Award, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { Student, Course } from '../types';

interface Props {
  student: Student;
  course: Course;
  onClose: () => void;
}

export const CertificateModal: React.FC<Props> = ({ student, course, onClose }) => {
  const certId = `NK-CERT-${student.studentId.replace('NK-', '')}-2026`;
  const issueDate = '03 September 2026';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-6">
        {/* Top Control Bar */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#0F172A] text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-xs tracking-wider uppercase text-slate-300">Certificate of Course Completion</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Certificate
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Area */}
        <div id="printable-certificate" className="p-8 bg-amber-50/40">
          <div className="border-8 border-double border-amber-800/40 p-8 rounded-2xl bg-white text-center relative shadow-md">
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-4">
              <span className="text-9xl font-black text-slate-900">NK</span>
            </div>

            {/* Certificate Header */}
            <div className="space-y-1">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-600 to-indigo-950 text-white rounded-2xl flex items-center justify-center font-black text-2xl mx-auto shadow-md border-2 border-amber-300 mb-2">
                NK
              </div>
              <h1 className="text-3xl font-black text-slate-900 font-display tracking-tight uppercase">
                NK COACHING & COMPUTER CLASSES
              </h1>
              <p className="text-xs font-semibold text-indigo-900 uppercase tracking-widest">
                An ISO 9001:2015 Certified Premier Educational Institute
              </p>
              <div className="h-0.5 w-36 bg-amber-600 mx-auto my-3"></div>
            </div>

            {/* Certificate Title */}
            <div className="my-6">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">This is to certify that</span>
              <h2 className="text-3xl font-extrabold text-indigo-950 font-serif my-2 underline decoration-amber-400 underline-offset-8">
                {student.name}
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                Son / Daughter of <strong className="text-slate-800">{student.fatherName}</strong> (Reg. ID: {student.studentId})
              </p>
            </div>

            {/* Body text */}
            <p className="max-w-xl mx-auto text-sm text-slate-700 leading-relaxed font-sans">
              has successfully completed the comprehensive training curriculum in{' '}
              <strong className="text-slate-950 font-bold font-display text-base block my-1">
                "{course.name}"
              </strong>{' '}
              with practical training and laboratory projects over a duration of <strong>{course.duration}</strong>,
              securing Grade <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold rounded">A+ (Exemplary)</span>.
            </p>

            {/* Highlights & Modules */}
            <div className="max-w-lg mx-auto my-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Core Disciplines Covered: </span>
              {course.subjects.join(' • ')}
            </div>

            {/* Signatures & Seal */}
            <div className="flex items-end justify-between pt-6 mt-6 border-t border-slate-200 px-6">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <QrCode className="w-12 h-12 text-slate-800 border p-1 rounded bg-white" />
                  <div className="text-[10px] text-slate-500">
                    <p className="font-mono font-bold text-slate-800">{certId}</p>
                    <p>Issue Date: {issueDate}</p>
                    <p className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Online Verified
                    </p>
                  </div>
                </div>
              </div>

              {/* Gold Institute Seal */}
              <div className="w-20 h-20 rounded-full border-4 border-amber-600/60 bg-amber-50 flex flex-col items-center justify-center text-amber-800 font-bold text-[9px] shadow-sm uppercase text-center p-1">
                <span>★ NK ★</span>
                <span className="text-[8px] font-extrabold text-amber-900">VERIFIED</span>
                <span>SEAL</span>
              </div>

              <div className="text-right">
                <p className="font-serif italic text-base font-bold text-slate-900">NK Sharma</p>
                <p className="border-t border-slate-400 text-xs font-bold text-slate-800 pt-1 mt-1">
                  Director & Academic Head
                </p>
                <p className="text-[10px] text-slate-500">NK Coaching & Computer Classes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
