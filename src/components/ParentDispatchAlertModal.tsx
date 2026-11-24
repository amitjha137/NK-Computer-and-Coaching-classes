import React, { useState } from 'react';
import { CheckCircle2, MessageSquare, Smartphone, X, ExternalLink, FileText, Send, AlertCircle, Copy, Check, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sanitizeWhatsAppNumber, openWhatsAppDirect, openSMSDirect, copyTextToClipboard, isValidIndianPhone } from '../utils/phoneUtils';

export const ParentDispatchAlertModal: React.FC = () => {
  const { parentDispatchAlert, closeParentDispatchAlert, setActiveReceipt, payments, updatePayment, instituteProfile, sendDirectMessageToPhone } = useApp();

  const [editablePhone, setEditablePhone] = useState<string>(parentDispatchAlert?.parentMobile || '');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'copied'; message: string } | null>(null);
  const [isSendingDirect, setIsSendingDirect] = useState(false);

  if (!parentDispatchAlert) return null;

  const currentPhone = editablePhone || parentDispatchAlert.parentMobile || '';

  const handleOpenReceipt = () => {
    const payment = payments.find(p => p.receiptNo === parentDispatchAlert.receiptNo);
    if (payment) {
      setActiveReceipt(payment);
    }
    closeParentDispatchAlert();
  };

  const handleDirectSend = async () => {
    const cleanNumber = sanitizeWhatsAppNumber(currentPhone);
    if (!cleanNumber || cleanNumber.length < 10) {
      setFeedback({ type: 'error', message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' });
      return;
    }

    const payment = payments.find(p => p.receiptNo === parentDispatchAlert.receiptNo);
    if (payment && currentPhone !== payment.parentMobile) {
      updatePayment(payment.id, { parentMobile: currentPhone });
    }

    setIsSendingDirect(true);
    try {
      const res = await sendDirectMessageToPhone({
        phone: cleanNumber,
        message: parentDispatchAlert.whatsAppText,
        studentName: parentDispatchAlert.studentName,
        receiptNo: parentDispatchAlert.receiptNo,
        amount: parentDispatchAlert.amount,
        type: parentDispatchAlert.receiptNo === 'REMINDER' ? 'reminder' : 'receipt'
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `✅ मैसेज सीधे +${cleanNumber} पर भेज दिया गया! (बिना WhatsApp खोले)`
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'डायरेक्ट डिलीवरी में समस्या आई, कृपया नंबर जांचें।'
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'मैसेज भेजने में समस्या आई'
      });
    } finally {
      setIsSendingDirect(false);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const handleOpenWhatsApp = () => {
    const cleanNumber = sanitizeWhatsAppNumber(currentPhone);
    if (!cleanNumber || cleanNumber.length < 10) {
      setFeedback({ type: 'error', message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' });
      return;
    }

    // Update payment record with this phone if it matches
    const payment = payments.find(p => p.receiptNo === parentDispatchAlert.receiptNo);
    if (payment && currentPhone !== payment.parentMobile) {
      updatePayment(payment.id, { parentMobile: currentPhone });
    }

    const success = openWhatsAppDirect(cleanNumber, parentDispatchAlert.whatsAppText);
    if (success) {
      setFeedback({ type: 'success', message: `WhatsApp चैट खुल गई (+${cleanNumber}) के लिए!` });
    } else {
      setFeedback({ type: 'error', message: 'WhatsApp लिंक खोलने में समस्या आई' });
    }
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleOpenSMS = () => {
    const cleanNumber = sanitizeWhatsAppNumber(currentPhone);
    if (!cleanNumber || cleanNumber.length < 10) {
      setFeedback({ type: 'error', message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' });
      return;
    }

    openSMSDirect(cleanNumber, parentDispatchAlert.whatsAppText);
    setFeedback({ type: 'success', message: `SMS ऐप खुल गया (+${cleanNumber}) के लिए!` });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleCopyText = async () => {
    const copied = await copyTextToClipboard(parentDispatchAlert.whatsAppText);
    if (copied) {
      setFeedback({ type: 'copied', message: 'मैसेज क्लिपबोर्ड में कॉपी हो गया!' });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const isReminder = parentDispatchAlert.receiptNo === 'REMINDER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header with badge */}
        <div className={`p-6 text-white text-center relative ${
          isReminder ? 'bg-gradient-to-br from-amber-600 to-orange-700' : 'bg-gradient-to-br from-emerald-600 to-teal-700'
        }`}>
          <button
            onClick={closeParentDispatchAlert}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30 shadow-inner">
            {isReminder ? (
              <MessageSquare className="w-8 h-8 text-white" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-xl font-extrabold font-display tracking-tight">
            {isReminder ? 'Fee Reminder Dispatched!' : 'Fee Receipt Dispatched!'}
          </h2>
          <p className="text-white/95 text-xs mt-1 font-medium">
            ⚡ Direct Delivery: मैसेज सीधे नंबर पर बिना WhatsApp खोले भेज दिया गया है
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Dispatch Info summary */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Student</span>
              <p className="font-bold text-slate-800 text-sm">{parentDispatchAlert.studentName}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium">{isReminder ? 'Pending Due' : 'Amount Received'}</span>
              <p className={`font-bold text-sm ${isReminder ? 'text-amber-600' : 'text-emerald-600'}`}>
                ₹{parentDispatchAlert.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium">Reference</span>
              <p className="font-mono font-bold text-indigo-900">{parentDispatchAlert.receiptNo}</p>
            </div>
          </div>

          {/* Smartphone WhatsApp Message Simulator */}
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-md border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-2 border-b border-slate-800 text-xs gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-semibold text-slate-300">Target Phone (+91):</span>
              </div>
              <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                <input
                  type="tel"
                  value={editablePhone}
                  onChange={e => setEditablePhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full px-2.5 py-1 text-xs font-mono bg-slate-800 text-emerald-300 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {feedback && (
              <p className={`text-[11px] font-semibold mb-2 flex items-center gap-1 p-2 rounded-lg ${
                feedback.type === 'error' ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
              }`}>
                {feedback.type === 'error' ? <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                {feedback.message}
              </p>
            )}

            {/* WhatsApp Message Preview */}
            <div className="bg-emerald-950/80 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-100 space-y-1.5 font-sans leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {parentDispatchAlert.whatsAppText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleDirectSend}
              disabled={isSendingDirect}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSendingDirect ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  मैसेज भेजा जा रहा है...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  डायरेक्ट भेजें (बिना WhatsApp खोले)
                </>
              )}
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleOpenWhatsApp}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="WhatsApp ऐप खोलें"
              >
                <Send className="w-3 h-3 text-emerald-600" />
                WhatsApp App
              </button>
              <button
                onClick={handleOpenSMS}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <MessageSquare className="w-3 h-3 text-blue-600" />
                SMS App
              </button>
              <button
                onClick={handleCopyText}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <Copy className="w-3 h-3 text-slate-600" />
                Copy Text
              </button>
            </div>
          </div>

          {!isReminder && (
            <div className="pt-1">
              <button
                onClick={handleOpenReceipt}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                View & Print Official Receipt
              </button>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={closeParentDispatchAlert}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
