import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Camera,
  Link as LinkIcon,
  Sparkles,
  Check,
  User,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl: string;
  name: string;
  roleLabel: string; // e.g. 'Student', 'Teacher', 'Parent', 'Admin'
  onSave: (newPhotoUrl: string) => void;
}

// Curated avatar options that are high quality and professional
const CURATED_AVATARS = [
  {
    label: 'Student Boy 1',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Student Girl 1',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Student Boy 2',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Student Girl 2',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Coder / Teen',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Scholar Girl',
    category: 'Student',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Faculty Sir',
    category: 'Teacher',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: 'Faculty Ma\'am',
    category: 'Teacher',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
  },
  {
    label: '3D Boy Avatar',
    category: 'Avatar',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix'
  },
  {
    label: '3D Girl Avatar',
    category: 'Avatar',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka'
  },
  {
    label: 'Tech Coder Avatar',
    category: 'Avatar',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NKSchool'
  },
  {
    label: 'Minimalist Student',
    category: 'Avatar',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun'
  }
];

export const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({
  isOpen,
  onClose,
  currentPhotoUrl,
  name,
  roleLabel,
  onSave
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentPhotoUrl);
  const [activeTab, setActiveTab] = useState<'upload' | 'avatars' | 'url'>('upload');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process and compress image to avoid storage issues while retaining high quality
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('कृपया केवल इमेज (JPG, PNG, WebP) फ़ाइल चुनें।');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        // Draw to canvas and scale to max 400x400
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedPhoto(compressedDataUrl);
          setIsProcessing(false);
        } else {
          setSelectedPhoto(e.target?.result as string);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setErrorMessage('इमेज प्रोसेस करने में समस्या हुई। कृपया दूसरी इमेज चुनें।');
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMessage('फ़ाइल पढ़ने में त्रुटि हुई।');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!inputUrl.trim()) return;
    setSelectedPhoto(inputUrl.trim());
    setInputUrl('');
  };

  const handleSave = () => {
    onSave(selectedPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0F172A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/80 border border-indigo-400/40 flex items-center justify-center text-white shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display">प्रोफ़ाइल फ़ोटो बदलें (Change Photo)</h3>
              <p className="text-xs text-slate-400">
                {name} • <span className="text-indigo-300 font-semibold">{roleLabel}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-lg ring-2 ring-indigo-500/20 bg-slate-200 flex items-center justify-center">
              {selectedPhoto ? (
                <img
                  src={selectedPhoto}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => {
                    setErrorMessage('इमेज लोड नहीं हो सकी, कृपया दूसरी फ़ोटो चुनें।');
                  }}
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md">
              <Check className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="text-left space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
              Live Preview
            </span>
            <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{name}</h4>
            <p className="text-xs text-slate-500 leading-tight">
              यह फ़ोटो आपके डैशबोर्ड, आईडी कार्ड व उपस्थिति में दिखेगी।
            </p>
          </div>
        </div>

        {/* Tabs for Source Selection */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1.5 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>फ़ाइल / गैलरी से चुनें</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avatars')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'avatars'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>तैयार अवतार</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>वेब लिंक (URL)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD FROM DEVICE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h5 className="font-bold text-sm text-slate-800">
                  फ़ोटो चुनने के लिए यहाँ क्लिक करें या फ़ाइल ड्रैग करें
                </h5>
                <p className="text-xs text-slate-500 mt-1">
                  PNG, JPG, JPEG या WebP (मोबाइल कैमरा या गैलरी से)
                </p>
                <span className="inline-block mt-3 px-3 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-lg shadow-xs">
                  Browse File / गैलरी खोलें
                </span>
              </div>

              {isProcessing && (
                <div className="text-center text-xs text-indigo-600 font-semibold py-2">
                  फ़ोटो प्रोसेस हो रही है...
                </div>
              )}
            </div>
          )}

          {/* TAB 2: READY CURATED AVATARS */}
          {activeTab === 'avatars' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                नीचे दिए गए अवतारों में से जो पसंद हो उस पर क्लिक करें:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1">
                {CURATED_AVATARS.map((av, idx) => {
                  const isSelected = selectedPhoto === av.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(av.url);
                        setErrorMessage(null);
                      }}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all p-0.5 cursor-pointer group ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/40 scale-95 shadow-md'
                          : 'border-slate-200 hover:border-slate-400 hover:scale-105'
                      }`}
                      title={av.label}
                    >
                      <img
                        src={av.url}
                        alt={av.label}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                इंटरनेट से किसी इमेज का डायरेक्ट लिंक (Image URL) डालें:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!inputUrl.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  लागू करें
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Google Drive, Unsplash, Imgur या किसी भी वेबसाइट की डायरेक्ट इमेज लिंक।
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              // Reset to placeholder
              setSelectedPhoto(
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'NK')}`
              );
            }}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            डिफ़ॉल्ट नाम अवतार लगाएं
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>फ़ोटो सेव करें (Save Photo)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
