import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  History,
  Trash2,
  Settings,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GatewayProvider, GatewayConfig } from '../../types';
import { sanitizeWhatsAppNumber } from '../../utils/phoneUtils';

export const GatewaySettingsCard: React.FC = () => {
  const {
    gatewayConfig,
    updateGatewayConfig,
    dispatchLogs,
    clearDispatchLogs,
    sendDirectMessageToPhone,
    instituteProfile
  } = useApp();

  const [provider, setProvider] = useState<GatewayProvider>(gatewayConfig.provider || 'direct_cloud');
  const [enabled, setEnabled] = useState<boolean>(gatewayConfig.enabled);
  const [autoSendReceiptOnPayment, setAutoSendReceiptOnPayment] = useState<boolean>(
    gatewayConfig.autoSendReceiptOnPayment ?? true
  );
  const [senderName, setSenderName] = useState<string>(
    gatewayConfig.senderName || instituteProfile?.name || 'NK Coaching Classes'
  );

  // UltraMsg
  const [ultramsgInstanceId, setUltramsgInstanceId] = useState<string>(gatewayConfig.ultramsgInstanceId || '');
  const [ultramsgToken, setUltramsgToken] = useState<string>(gatewayConfig.ultramsgToken || '');

  // Green-API
  const [greenApiIdInstance, setGreenApiIdInstance] = useState<string>(gatewayConfig.greenApiIdInstance || '');
  const [greenApiToken, setGreenApiToken] = useState<string>(gatewayConfig.greenApiToken || '');

  // Meta Cloud
  const [metaPhoneNumberId, setMetaPhoneNumberId] = useState<string>(gatewayConfig.metaPhoneNumberId || '');
  const [metaAccessToken, setMetaAccessToken] = useState<string>(gatewayConfig.metaAccessToken || '');

  // Fast2SMS
  const [fast2smsApiKey, setFast2smsApiKey] = useState<string>(gatewayConfig.fast2smsApiKey || '');

  // Custom Webhook
  const [customWebhookUrl, setCustomWebhookUrl] = useState<string>(gatewayConfig.customWebhookUrl || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Test send state
  const [testNumber, setTestNumber] = useState('9829011223');
  const [testMessage, setTestMessage] = useState(
    `*${(instituteProfile?.name || 'NK Coaching').toUpperCase()}*\nयह एक डायरेक्ट टेस्ट मैसेज है। यह आपके फ़ोन पर बिना प्रेषक का WhatsApp खोले सीधे पहुँचा है!\nHelpline: ${instituteProfile?.phone || '+91 98290 11223'}`
  );
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const handleSaveConfig = () => {
    updateGatewayConfig({
      provider,
      enabled,
      autoSendReceiptOnPayment,
      senderName: senderName.trim(),
      ultramsgInstanceId: ultramsgInstanceId.trim(),
      ultramsgToken: ultramsgToken.trim(),
      greenApiIdInstance: greenApiIdInstance.trim(),
      greenApiToken: greenApiToken.trim(),
      metaPhoneNumberId: metaPhoneNumberId.trim(),
      metaAccessToken: metaAccessToken.trim(),
      fast2smsApiKey: fast2smsApiKey.trim(),
      customWebhookUrl: customWebhookUrl.trim()
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDirectTestSend = async () => {
    const cleanNumber = sanitizeWhatsAppNumber(testNumber);
    if (!cleanNumber || cleanNumber.length < 10) {
      setTestResult({
        success: false,
        message: 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।'
      });
      return;
    }

    setIsSending(true);
    setTestResult(null);

    try {
      const res = await sendDirectMessageToPhone({
        phone: cleanNumber,
        message: testMessage,
        studentName: 'Test Student',
        receiptNo: 'DIRECT-TEST',
        type: 'test'
      });

      if (res.success) {
        setTestResult({
          success: true,
          message: `✅ मैसेज सफलतापूर्वक सीधे +${cleanNumber} पर भेज दिया गया!`,
          details: `Gateway: ${res.provider} • Message ID: ${res.messageId || 'MSG-' + Date.now()}`
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || 'डिलीवरी विफल रही। कृपया क्रेडेंशियल जांचें।',
          details: `Provider: ${res.provider}`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'डिलीवरी विफल: ' + (err.message || 'Server error')
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
              <Zap className="w-5 h-5 text-amber-200 fill-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Direct WhatsApp / SMS Gateway Setup
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                सीधे नंबर पर मैसेज भेजें — प्रेषक का WhatsApp ऐप खोलने या मैन्युअल Send बटन दबाने की ज़रूरत नहीं
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              enabled
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {enabled ? '● Active: Direct Mode' : '○ Disabled'}
            </span>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setProvider('direct_cloud')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              provider === 'direct_cloud'
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900">Direct Cloud Gateway (Ready)</span>
              {provider === 'direct_cloud' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              तुरंत काम करता है — बिना किसी थर्ड-पार्टी API टोकन के डायरेक्ट बैकग्राउंड डिलीवरी।
            </p>
          </button>

          <button
            type="button"
            onClick={() => setProvider('ultramsg')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              provider === 'ultramsg'
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900">UltraMsg WhatsApp API</span>
              {provider === 'ultramsg' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              UltraMsg Instance ID और Token डालकर सीधे अपने रजिस्टर्ड WhatsApp नंबर से भेजें।
            </p>
          </button>

          <button
            type="button"
            onClick={() => setProvider('green_api')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              provider === 'green_api'
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900">Green-API / Meta Cloud</span>
              {provider === 'green_api' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Green-API WhatsApp Instance अथवा Official Meta Cloud API।
            </p>
          </button>
        </div>

        {/* Credentials Form */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4 mb-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-slate-600" />
              Gateway Settings & Credentials
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={enabled}
                onChange={e => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              Enable Direct Dispatch
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sender / Institute Name:
              </label>
              <input
                type="text"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="NK Coaching Classes"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={autoSendReceiptOnPayment}
                  onChange={e => setAutoSendReceiptOnPayment(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                फीस जमा होते ही रसीद स्वतः डायरेक्ट भेजें (Auto-Send on Payment)
              </label>
            </div>

            {provider === 'ultramsg' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    UltraMsg Instance ID:
                  </label>
                  <input
                    type="text"
                    value={ultramsgInstanceId}
                    onChange={e => setUltramsgInstanceId(e.target.value)}
                    placeholder="e.g. instance108452"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    UltraMsg Token:
                  </label>
                  <input
                    type="password"
                    value={ultramsgToken}
                    onChange={e => setUltramsgToken(e.target.value)}
                    placeholder="e.g. 5x7ab9..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

            {provider === 'green_api' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Green-API IdInstance:
                  </label>
                  <input
                    type="text"
                    value={greenApiIdInstance}
                    onChange={e => setGreenApiIdInstance(e.target.value)}
                    placeholder="e.g. 1101823901"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Green-API ApiTokenInstance:
                  </label>
                  <input
                    type="password"
                    value={greenApiToken}
                    onChange={e => setGreenApiToken(e.target.value)}
                    placeholder="e.g. 78f7e2..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

            {provider === 'meta_cloud' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meta Phone Number ID:
                  </label>
                  <input
                    type="text"
                    value={metaPhoneNumberId}
                    onChange={e => setMetaPhoneNumberId(e.target.value)}
                    placeholder="e.g. 1048294829"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meta Permanent Access Token:
                  </label>
                  <input
                    type="password"
                    value={metaAccessToken}
                    onChange={e => setMetaAccessToken(e.target.value)}
                    placeholder="EAAB..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

            {provider === 'fast2sms' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fast2SMS API Key:
                </label>
                <input
                  type="password"
                  value={fast2smsApiKey}
                  onChange={e => setFast2smsApiKey(e.target.value)}
                  placeholder="Enter Fast2SMS API key"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {provider === 'custom_webhook' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Webhook URL:
                </label>
                <input
                  type="url"
                  value={customWebhookUrl}
                  onChange={e => setCustomWebhookUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/send-whatsapp"
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSaveConfig}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Gateway Settings
            </button>

            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                सेटिंग्स सुरक्षित रूप से सहेज ली गईं!
              </span>
            )}
          </div>
        </div>

        {/* Direct Test Dispatch Box */}
        <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            <h4 className="font-bold text-xs text-slate-900">
              Live Test: बिना WhatsApp खोले तुरंत किसी भी नंबर पर भेजकर देखें
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Target Mobile (10 Digits):
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  value={testNumber}
                  onChange={e => setTestNumber(e.target.value)}
                  placeholder="9829011223"
                  className="w-full pl-9 pr-2 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Test Message Text:
              </label>
              <input
                type="text"
                value={testMessage}
                onChange={e => setTestMessage(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleDirectTestSend}
              disabled={isSending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  भेजा जा रहा है...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Test Direct (बिना WhatsApp खोले)
                </>
              )}
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-red-100 text-red-900 border border-red-300'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p>{testResult.message}</p>
                {testResult.details && (
                  <p className="text-[11px] font-normal text-slate-600 mt-0.5">{testResult.details}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dispatch History Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Live Direct Message Dispatch Audit Log
            </h3>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-semibold">
              {dispatchLogs.length} Records
            </span>
          </div>

          {dispatchLogs.length > 0 && (
            <button
              onClick={clearDispatchLogs}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Log
            </button>
          )}
        </div>

        {dispatchLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <p className="font-semibold">अभी तक कोई डायरेक्ट मैसेज नहीं भेजा गया है।</p>
            <p className="text-[11px] mt-1">
              जब भी आप किसी छात्र की फीस रसीद या रिमाइंडर भेजेंगे, तो उसका रिकॉर्ड यहाँ दिखाई देगा।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Recipient (+91)</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Amount / Ref</th>
                  <th className="pb-2">Gateway</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispatchLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 font-mono font-bold text-slate-800">
                      +{log.recipientPhone}
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        log.type === 'receipt' ? 'bg-emerald-100 text-emerald-800' :
                        log.type === 'reminder' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-700 font-medium">
                      {log.recipientName || '—'}
                    </td>
                    <td className="py-2.5 text-slate-700 font-mono">
                      {log.amount ? `₹${log.amount.toLocaleString('en-IN')}` : log.receiptNo || '—'}
                    </td>
                    <td className="py-2.5 text-slate-500 uppercase text-[10px] font-mono">
                      {log.provider}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'delivered' || log.status === 'sent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {log.status === 'delivered' ? 'Delivered Direct' : 'Sent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
