import React, { useState } from 'react';
import { Printer, CheckCircle, Share2, Phone, X, Edit3, MessageCircle, AlertCircle, QrCode, ShieldCheck, Send, MessageSquare, Copy, Zap } from 'lucide-react';
import { FeePayment } from '../types';
import { useApp } from '../context/AppContext';
import { sanitizeWhatsAppNumber, getWhatsAppUrl, openWhatsAppDirect, openSMSDirect, copyTextToClipboard, isValidIndianPhone } from '../utils/phoneUtils';

interface Props {
  receipt: FeePayment;
  onClose: () => void;
}

export const FeeReceiptModal: React.FC<Props> = ({ receipt, onClose }) => {
  const { students, updatePayment, updateStudent, instituteProfile, sendDirectMessageToPhone } = useApp();
  const student = students.find(s => s.id === receipt.studentId);

  // Editable recipient mobile number state
  const [recipientMobile, setRecipientMobile] = useState<string>(
    receipt.parentMobile || student?.parentMobile || student?.mobile || ''
  );
  const [sendFeedback, setSendFeedback] = useState<{ type: 'success' | 'error' | 'copied'; message: string } | null>(null);
  const [isSendingDirect, setIsSendingDirect] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const getReceiptMessage = () => {
    const instituteTitle = (instituteProfile?.name || 'NK COACHING & COMPUTER CLASSES').toUpperCase();
    const helpline = instituteProfile?.phone || '+91 98290 11223';
    const address = instituteProfile?.address || 'Civil Lines';
    return `*${instituteTitle}*\n*OFFICIAL FEE PAYMENT RECEIPT*\n\nReceipt No: *${receipt.receiptNo}*\nDate: ${receipt.date}\nStudent: *${receipt.studentName}*\nCourse: *${receipt.courseName}*\nBatch: ${receipt.batchName}\n\nAmount Received: *₹${receipt.amount.toLocaleString('en-IN')}*\nPayment Mode: ${receipt.paymentMethod}\nRemaining Due Balance: *₹${receipt.remainingDue.toLocaleString('en-IN')}*\n\n✅ Thank you for choosing ${instituteProfile?.name || 'NK Institute'}! Your payment has been credited successfully.\nHelpline: ${helpline}\nAddress: ${address}`;
  };

  const saveUpdatedPhone = () => {
    const trimmed = recipientMobile.trim();
    if (trimmed && trimmed !== receipt.parentMobile) {
      updatePayment(receipt.id, { parentMobile: trimmed });
      if (student) {
        updateStudent(student.id, { parentMobile: trimmed });
      }
    }
  };

  // Direct Background Dispatch (No WhatsApp App Needed!)
  const handleDirectSend = async () => {
    const cleanNumber = sanitizeWhatsAppNumber(recipientMobile);
    if (!cleanNumber || cleanNumber.length < 10) {
      setSendFeedback({ type: 'error', message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' });
      return;
    }

    saveUpdatedPhone();
    setIsSendingDirect(true);
    const message = getReceiptMessage();

    try {
      const res = await sendDirectMessageToPhone({
        phone: cleanNumber,
        message,
        studentName: receipt.studentName,
        receiptNo: receipt.receiptNo,
        amount: receipt.amount,
        type: 'receipt'
      });

      if (res.success) {
        setSendFeedback({
          type: 'success',
          message: `✅ रसीद सीधे +${cleanNumber} पर भेज दी गई! (बिना WhatsApp खोले)`
        });
      } else {
        setSendFeedback({
          type: 'error',
          message: res.error || 'डायरेक्ट डिलीवरी में समस्या आई, कृपया नंबर जांचें।'
        });
      }
    } catch {
      setSendFeedback({
        type: 'error',
        message: 'डिलीवरी अनुरोध पूरा नहीं हो सका।'
      });
    } finally {
      setIsSendingDirect(false);
      setTimeout(() => setSendFeedback(null), 6000);
    }
  };

  const handleWhatsAppShare = () => {
    const cleanNumber = sanitizeWhatsAppNumber(recipientMobile);
    if (!cleanNumber || cleanNumber.length < 10) {
      setSendFeedback({ type: 'error', message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' });
      return;
    }

    saveUpdatedPhone();
    const message = getReceiptMessage();
    const success = openWhatsAppDirect(cleanNumber, message);
    if (success) {
      setSendFeedback({ type: 'success', message: `WhatsApp चैट खुल गई (+${cleanNumber}) के लिए!` });
    } else {
      setSendFeedback({ type: 'error', message: 'WhatsApp लिंक खोलने में समस्या आई।' });
    }
    setTimeout(() => setSendFeedback(null), 5000);
  };

  const handleSMSShare = () => {
    const cleanNumber = sanitizeWhatsAppNumber(recipientMobile);
    if (!cleanNumber || cleanNumber.length < 10) {
      setSendFeedback({ type: 'error', message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' });
      return;
    }

    saveUpdatedPhone();
    const message = getReceiptMessage();
    openSMSDirect(cleanNumber, message);
    setSendFeedback({ type: 'success', message: `SMS ऐप खुल गया (+${cleanNumber}) के लिए!` });
    setTimeout(() => setSendFeedback(null), 5000);
  };

  const handleCopyText = async () => {
    const message = getReceiptMessage();
    const copied = await copyTextToClipboard(message);
    if (copied) {
      setSendFeedback({ type: 'copied', message: 'रसीद मैसेज क्लिपबोर्ड में कॉपी हो गया! कहीं भी पेस्ट कर सकते हैं।' });
      setTimeout(() => setSendFeedback(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#0F172A] text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-xs tracking-wider uppercase text-slate-300">FEE PAYMENT RECEIPT • {receipt.receiptNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WhatsApp & SMS Dispatch Direct Bar - Editable Phone */}
        <div className="no-print bg-emerald-50/80 border-b border-emerald-200 p-4 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 flex-1">
              <MessageCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wide">
                  Parent / Student Mobile Number (अभिभावक का मोबाइल नंबर)
                </label>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={recipientMobile}
                      onChange={e => setRecipientMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full pl-10 pr-3 py-1.5 text-xs font-semibold bg-white border border-emerald-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-emerald-800">
                    रसीद सीधे इसी नंबर पर भेजी जाएगी
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleDirectSend}
                disabled={isSendingDirect}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                title="बिना WhatsApp खोले सीधे नंबर पर मैसेज भेजें"
              >
                {isSendingDirect ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    डिलीवर हो रहा है...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    डायरेक्ट भेजें (No WhatsApp Needed)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 active:scale-95 text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                title="WhatsApp ऐप खोलें"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-600" />
                WhatsApp ऐप खोलें
              </button>

              <button
                type="button"
                onClick={handleSMSShare}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 active:scale-95 text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                title="Send receipt via SMS app"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                SMS भेजें
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                title="Copy receipt message to clipboard"
              >
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                कॉपी करें
              </button>
            </div>
          </div>

          {sendFeedback && (
            <div className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
              sendFeedback.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
              sendFeedback.type === 'copied' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
              'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {sendFeedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-700" />
              )}
              <span>{sendFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Printable Official Receipt Area */}
        <div id="printable-receipt" className="p-8 bg-white text-slate-800">
          {/* Institute Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl flex items-center justify-center font-extrabold text-2xl tracking-wider shadow-md border-2 border-indigo-400">
                  NK
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
                    {instituteProfile?.name || 'NK COACHING & COMPUTER CLASSES'}
                  </h1>
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    School & Board Coaching (Nursery-12th) • Computer & Coding Academy
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {instituteProfile?.address || 'Opp. Central Post Office, Station Road, Civil Lines'} • Helpline: {instituteProfile?.phone || '+91 98290 11223'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded">
                  OFFICIAL RECEIPT
                </div>
                <p className="font-mono text-sm font-bold text-slate-900 mt-1">{receipt.receiptNo}</p>
                <p className="text-xs text-slate-500">Date: {receipt.date}</p>
              </div>
            </div>
          </div>

          {/* Student & Course Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
            <div>
              <p className="text-slate-500 font-medium">Student Name</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{receipt.studentName}</p>
              <p className="text-slate-500 mt-2 font-medium">Student Registration ID</p>
              <p className="font-mono font-bold text-indigo-900">{student?.studentId || 'NK-2026-REG'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Course Enrolled</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{receipt.courseName}</p>
              <p className="text-slate-500 mt-2 font-medium">Batch & Timing</p>
              <p className="font-semibold text-slate-800">{receipt.batchName}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Parent / Guardian Contact</p>
              <p className="font-semibold text-slate-800">{recipientMobile || receipt.parentMobile}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Payment Mode / Reference</p>
              <p className="font-semibold text-emerald-700">
                {receipt.paymentMethod} {receipt.remarks ? `(${receipt.remarks})` : ''}
              </p>
            </div>
          </div>

          {/* Fee Breakdown Table */}
          <table className="w-full text-left text-xs mb-6">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-semibold">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Fee Particulars</th>
                <th className="py-2.5 px-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3">
                  <p className="font-bold text-slate-900">Tuition & Practical Lab Fee</p>
                  <p className="text-slate-500 text-[11px]">Comprehensive course fee, syllabus, study material & lab access</p>
                </td>
                <td className="py-3 px-3 text-right font-medium text-slate-600">Total Course Fee</td>
                <td className="py-3 px-3 text-right font-medium text-slate-900">
                  ₹{(student?.totalFee || receipt.amount).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr className="bg-emerald-50/50">
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Current Payment Received
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-medium text-emerald-800">Received via {receipt.paymentMethod}</td>
                <td className="py-3 px-3 text-right font-extrabold text-emerald-700 text-sm">
                  ₹{receipt.amount.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 text-slate-500">Balance Pending Due</td>
                <td className="py-3 px-3 text-right text-slate-500">Remaining Balance</td>
                <td className="py-3 px-3 text-right font-bold text-amber-700">
                  {receipt.remainingDue === 0 ? (
                    <span className="text-emerald-600 font-bold">NIL (Full Paid ✅)</span>
                  ) : (
                    `₹${receipt.remainingDue.toLocaleString('en-IN')}`
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount In Words */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs mb-6">
            <span className="font-semibold text-slate-600">Amount Received in Words: </span>
            <span className="font-bold text-slate-900 uppercase">
              Rupees {numberToWords(receipt.amount)} Only
            </span>
          </div>

          {/* Footer Signatures and Verification */}
          <div className="flex items-end justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 border border-slate-300 rounded-lg p-1 bg-white flex flex-col items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-800" />
                <span className="text-[8px] text-slate-500 font-mono">VERIFIED</span>
              </div>
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p className="flex items-center gap-1 font-medium text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> Computer Generated Verified Receipt
                </p>
                <p>Receipt sent to parent's registered mobile number.</p>
                <p>Fee once paid is non-refundable & non-transferable.</p>
              </div>
            </div>

            <div className="text-right">
              <div className="h-10 flex items-end justify-end">
                <span className="font-serif italic font-semibold text-slate-800 tracking-wider">NK Sharma</span>
              </div>
              <p className="border-t border-slate-400 text-xs font-bold text-slate-800 pt-1 mt-1">
                Authorized Signatory
              </p>
              <p className="text-[10px] text-slate-500">NK Coaching & Computer Classes</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA on screen */}
        <div className="no-print bg-slate-100 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Parent Mobile: <strong>{recipientMobile || receipt.parentMobile}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Done / Close
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Send to WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for Amount in words
function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero';
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertBelowThousand(n: number): string {
    if (n === 0) return '';
    if (n < 20) return units[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + (n % 10 !== 0 ? units[n % 10] + ' ' : '');
    return units[Math.floor(n / 100)] + ' Hundred ' + (n % 100 !== 0 ? convertBelowThousand(n % 100) : '');
  }

  if (amount >= 100000) {
    const lakh = Math.floor(amount / 100000);
    const remainder = amount % 100000;
    return convertBelowThousand(lakh) + 'Lakh ' + (remainder > 0 ? numberToWords(remainder) : '');
  }
  if (amount >= 1000) {
    const thousand = Math.floor(amount / 1000);
    const remainder = amount % 1000;
    return convertBelowThousand(thousand) + 'Thousand ' + (remainder > 0 ? convertBelowThousand(remainder) : '');
  }
  return convertBelowThousand(amount);
}
