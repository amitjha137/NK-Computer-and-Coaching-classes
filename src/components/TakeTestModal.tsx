import React, { useState } from 'react';
import { X, CheckCircle, Clock, Award, AlertCircle } from 'lucide-react';
import { OnlineTest } from '../types';
import { useApp } from '../context/AppContext';

interface Props {
  test: OnlineTest;
  studentId: string;
  onClose: () => void;
}

export const TakeTestModal: React.FC<Props> = ({ test, studentId, onClose }) => {
  const { submitTestScore } = useApp();
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    let earned = 0;
    const pointsPerQuestion = test.totalMarks / test.questions.length;

    test.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        earned += pointsPerQuestion;
      }
    });

    const finalScore = Math.round(earned);
    setScore(finalScore);
    setSubmitted(true);
    submitTestScore(test.id, studentId, finalScore, test.totalMarks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              {test.subject} • Live Online MCQ Test
            </span>
            <h3 className="text-xl font-bold font-display mt-0.5">{test.title}</h3>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {test.durationMinutes} Minutes
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Total Marks: {test.totalMarks}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {submitted ? (
            /* Result Summary Banner */
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-2xl border border-indigo-100 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 font-display">Test Submitted!</h4>
              <p className="text-sm text-slate-600">
                You scored <strong className="text-emerald-700 text-xl">{score} / {test.totalMarks}</strong> ({Math.round((score / test.totalMarks) * 100)}%)
              </p>
              <p className="text-xs text-slate-500">
                Performance recorded on your student leaderboard and visible to your teacher.
              </p>
            </div>
          ) : null}

          {/* Question List */}
          <div className="space-y-6">
            {test.questions.map((q, qIndex) => {
              const selected = selectedAnswers[q.id];
              const isCorrect = selected === q.correctOptionIndex;

              return (
                <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {qIndex + 1}
                    </span>
                    <p className="font-semibold text-slate-900 text-sm">{q.question}</p>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((option, optIdx) => {
                      const isOptionSelected = selected === optIdx;
                      let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300';

                      if (submitted) {
                        if (optIdx === q.correctOptionIndex) {
                          btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                        } else if (isOptionSelected && !isCorrect) {
                          btnStyle = 'bg-red-50 border-red-300 text-red-900 line-through';
                        }
                      } else if (isOptionSelected) {
                        btnStyle = 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold shadow-xs';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelect(q.id, optIdx)}
                          disabled={submitted}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[11px] font-bold ${
                            isOptionSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation if submitted */}
                  {submitted && q.explanation && (
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Concept Explanation:</strong> {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {Object.keys(selectedAnswers).length} of {test.questions.length} answered
          </span>
          {submitted ? (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Close Test
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length === 0}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              Submit & Calculate Score
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
