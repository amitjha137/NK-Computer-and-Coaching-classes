import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { PublicShowcase } from './components/public/PublicShowcase';
import { FeeReceiptModal } from './components/FeeReceiptModal';
import { ParentDispatchAlertModal } from './components/ParentDispatchAlertModal';
import { DigitalIDCardModal } from './components/DigitalIDCardModal';
import { CertificateModal } from './components/CertificateModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileInstallBanner } from './components/MobileInstallBanner';
import { InstallMobileAppModal } from './components/InstallMobileAppModal';
import { AuthPortal } from './components/auth/AuthPortal';

const MainLayout: React.FC = () => {
  const [showInstallModal, setShowInstallModal] = React.useState(false);
  const {
    currentUser,
    role,
    activeReceipt,
    setActiveReceipt,
    parentDispatchAlert,
    closeParentDispatchAlert,
    activeIdCardStudent,
    setActiveIdCardStudent,
    activeCertificateStudent,
    setActiveCertificateStudent
  } = useApp();

  // If user is not logged in, show AuthPortal at starting as requested!
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-indigo-600 selection:text-white">
        <AuthPortal onOpenInstallModal={() => setShowInstallModal(true)} />
        {/* Persistent Mobile Install Prompt Banner so user can install the app right from the login screen */}
        <MobileInstallBanner onOpenInstallModal={() => setShowInstallModal(true)} />
        <InstallMobileAppModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
        />
        <OfflineIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Role Based Views */}
      <div className="flex-1">
        {role === 'admin' && <AdminDashboard />}
        {role === 'student' && <StudentDashboard />}
        {role === 'teacher' && <TeacherDashboard />}
        {role === 'parent' && <ParentDashboard />}
        {role === 'public' && <PublicShowcase />}
      </div>

      {/* Global Modals */}

      {/* 1. Official Fee Receipt Modal (View & Print) */}
      {activeReceipt && (
        <FeeReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* 2. Automated Parent Dispatch Alert (Triggered when fee is entered) */}
      {parentDispatchAlert && <ParentDispatchAlertModal />}

      {/* 3. Printable Student ID Card Modal */}
      {activeIdCardStudent && (
        <DigitalIDCardModal
          student={activeIdCardStudent}
          onClose={() => setActiveIdCardStudent(null)}
        />
      )}

      {/* 4. Course Completion Certificate Modal */}
      {activeCertificateStudent && (
        <CertificateModal
          student={activeCertificateStudent.student}
          course={activeCertificateStudent.course}
          onClose={() => setActiveCertificateStudent(null)}
        />
      )}

      {/* Network Offline / Reconnection Toast */}
      <OfflineIndicator />

      {/* Persistent Mobile Install Prompt Banner */}
      <MobileInstallBanner onOpenInstallModal={() => setShowInstallModal(true)} />

      {/* Dedicated In-App Mobile Install Guide & Modal */}
      <InstallMobileAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
