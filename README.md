# NK Coaching & Computer Center Management System

A production-ready Coaching and Computer Institute Management Portal built with **React 18, Vite, Express, TypeScript, and Tailwind CSS**.

---

## 📁 प्रोजेक्ट फ़ोल्डर संरचना (Folder Structure)

```text
nk-coaching-portal/
├── public/                 # Static Assets, PWA Icons, Manifest, App Icons
│   ├── assets/             # Course & institute imagery
│   ├── manifest.json       # Progressive Web App (PWA) config
│   ├── sw.js               # Service Worker for offline support
│   └── icon.svg            # Institute logo icon
│
├── src/                    # Frontend React Source Code
│   ├── components/         # All Portal Components & Modals
│   │   ├── admin/          # Admin Dashboard, Fee Analytics, Database Manager, Gateway
│   │   ├── teacher/        # Teacher Portal & Attendance Recording
│   │   ├── student/        # Student Portal, Homework, Courses, Results
│   │   ├── parent/         # Parent Portal, Fee Receipts, Direct Reminders
│   │   ├── public/         # Public Institute Website, Courses, Admission Inquiry
│   │   ├── auth/           # Login & Role Switching
│   │   ├── FeeReceiptModal.tsx          # Direct Print & WhatsApp Receipt
│   │   ├── CertificateModal.tsx       # Course Completion Certificate Generator
│   │   ├── DigitalIDCardModal.tsx     # Student ID Card with QR
│   │   ├── QRAttendanceModal.tsx      # QR Code Attendance Scanner
│   │   └── TakeTestModal.tsx          # Online MCQ Examination Engine
│   │
│   ├── context/
│   │   └── AppContext.tsx  # Central State & Business Logic
│   │
│   ├── data/
│   │   └── initialData.ts  # Demo Students, Courses, Batches, Teachers, Labs
│   │
│   ├── services/
│   │   ├── db.ts           # IndexedDB + LocalStorage Sync Database Engine
│   │   └── dispatchService.ts # WhatsApp & SMS Dispatch Engine (UltraMsg, Meta, Fast2SMS)
│   │
│   ├── types.ts            # TypeScript interfaces & domain types
│   ├── main.tsx            # React application entry
│   └── App.tsx             # Main routing & application layout
│
├── server.ts               # Express Backend Server (Port 3000)
│   ├── /api/dispatch/send  # Direct Background WhatsApp & SMS API
│   ├── /api/dispatch/test  # Gateway Test Bench
│   └── /api/download-source-zip # Source Code Export Endpoint
│
├── package.json            # NPM Dependencies & Scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build & bundler configuration
└── .env.example            # Environment variables template
```

---

## 🚀 अपने कंप्यूटर पर इसे कैसे चलाएं (How to Run Locally)

### 1. सिस्टम आवश्यकताएं (Requirements)
* **Node.js**: Version 18 या उससे अधिक (Recommended: Node.js 20+)
* **NPM**: Node.js के साथ स्वतः इंस्टॉल होता है

### 2. इंस्टॉलेशन स्टेप्स (Installation Steps)

```bash
# 1. फ़ोल्डर खोलें
cd nk-coaching-portal

# 2. सभी पैकेजेस इंस्टॉल करें
npm install

# 3. डेवलपमेंट सर्वर शुरू करें
npm run dev
```

### 3. ब्राउज़र में खोलें
सर्वर चालू होते ही अपने ब्राउज़र में खोलें:
👉 **`http://localhost:3000`**

---

## ✨ मुख्य सुविधाएं (Key Features)

1. **डायरेक्ट WhatsApp / SMS रसीद प्रेषण (Direct Cloud Dispatch)**:
   - बिना WhatsApp ऐप खोले सीधे छात्र या अभिभावक के नंबर पर रसीद व नोटिस भेजना।
   - Meta WhatsApp Cloud API, UltraMsg, Green-API और Fast2SMS का पूर्ण सपोर्ट।
2. **डेटाबेस बैकअप एवं रिपेयर (Database Manager)**:
   - IndexedDB + LocalStorage सिंक इंजन।
   - 1-क्लिक बैलेंस रिपेयर टूल एवं JSON/Excel बैकअप।
3. **5 विशेष पोर्टल्स (Role-Based Portals)**:
   - **Admin Portal**: छात्र प्रवेश, फ़ीस प्रबंधन, कंप्यूटर लैब सीटिंग, स्टैफ़ वेतन।
   - **Teacher Portal**: अटेंडेंस मार्किंग, असाइनमेंट, टेस्ट क्रिएशन।
   - **Student Portal**: ऑनलाइन टेस्ट, नोट्स, लाइब्रेरी, लाइव क्लासेस।
   - **Parent Portal**: फ़ीस रसीद, प्रगति रिपोर्ट, उपस्थिति ट्रैक।
   - **Public Website**: नया प्रवेश फॉर्म, कोर्स लिस्ट, संस्था परिचय।
4. **डिजिटल टूल्स (Digital Tools)**:
   - QR कोड युक्त डिजिटल आईडी कार्ड (Printable ID Cards)।
   - कोर्स समाप्ति सर्टिफिकेट जनरेटर (Official Certificates)।
   - ऑनलाइन MCQ परीक्षा प्रणाली (Instant Result Calculation)।
   - PWA (मोबाइल और कंप्यूटर पर बिना इंटरनेट काम करने योग्य)।

---
*Developed for NK Coaching & Computer Education Center*
