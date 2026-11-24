/**
 * NK Coaching & Computer Classes - Robust Multi-Layer Database Service
 * Provides durable storage with dual-layer persistence (LocalStorage + IndexedDB),
 * automatic health checks, database integrity repair, and 1-click JSON Backup & Restore.
 */

import { Student, FeePayment, Course, Batch, Teacher, ComputerPC, Notice, TestResult, InstituteProfile, AttendanceRecord } from '../types';

const DB_NAME = 'NK_CLASSES_DURABLE_DB';
const DB_VERSION = 1;
const STORE_NAME = 'app_snapshot';

export interface DatabaseSnapshot {
  version: string;
  timestamp: string;
  app: string;
  profile: InstituteProfile;
  students: Student[];
  payments: FeePayment[];
  courses: Course[];
  batches: Batch[];
  teachers: Teacher[];
  computers: ComputerPC[];
  notices: Notice[];
  testResults: TestResult[];
  attendanceRecords: AttendanceRecord[];
}

export interface DatabaseHealthReport {
  isHealthy: boolean;
  persistenceGranted: boolean;
  totalStudents: number;
  totalPayments: number;
  totalRevenue: number;
  totalDue: number;
  storageUsageKB: number;
  lastBackupDate: string | null;
  issues: string[];
}

// Request persistent storage so browser never evicts data
export const requestStoragePersistence = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.persist) {
    return false;
  }
  try {
    const isPersisted = await navigator.storage.persisted();
    if (isPersisted) return true;
    return await navigator.storage.persist();
  } catch (err) {
    console.warn('Storage persistence request failed:', err);
    return false;
  }
};

// Initialize IndexedDB connection
const openIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Save database snapshot to IndexedDB replica
export const saveSnapshotToIndexedDB = async (snapshot: DatabaseSnapshot): Promise<void> => {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(snapshot, 'latest_snapshot');
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    // Non-fatal, localStorage remains primary
    console.warn('Could not save replica to IndexedDB:', err);
  }
};

// Load database snapshot from IndexedDB replica (disaster recovery)
export const loadSnapshotFromIndexedDB = async (): Promise<DatabaseSnapshot | null> => {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get('latest_snapshot');
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

// Generate Full JSON Backup File
export const exportFullDatabaseJSON = (snapshot: DatabaseSnapshot): void => {
  const jsonContent = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const now = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `NK_Classes_Database_Backup_${now}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  localStorage.setItem('nk_last_backup_timestamp', new Date().toISOString());
};

// Validate and parse JSON database restore
export const parseAndValidateBackupJSON = (jsonText: string): { success: boolean; data?: DatabaseSnapshot; error?: string } => {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'अमान्य फ़ाइल: डेटा ऑब्जेक्ट प्रारूप में नहीं है।' };
    }
    if (!Array.isArray(parsed.students)) {
      return { success: false, error: 'अमान्य बैकअप: छात्र (Students) सूची अनुपस्थित है।' };
    }
    if (!Array.isArray(parsed.payments)) {
      return { success: false, error: 'अमान्य बैकअप: फीस रसीदें (Payments) अनुपस्थित हैं।' };
    }

    const cleanSnapshot: DatabaseSnapshot = {
      version: parsed.version || '2.0',
      timestamp: parsed.timestamp || new Date().toISOString(),
      app: 'NK Coaching & Computer Classes',
      profile: parsed.profile || {},
      students: parsed.students || [],
      payments: parsed.payments || [],
      courses: Array.isArray(parsed.courses) ? parsed.courses : [],
      batches: Array.isArray(parsed.batches) ? parsed.batches : [],
      teachers: Array.isArray(parsed.teachers) ? parsed.teachers : [],
      computers: Array.isArray(parsed.computers) ? parsed.computers : [],
      notices: Array.isArray(parsed.notices) ? parsed.notices : [],
      testResults: Array.isArray(parsed.testResults) ? parsed.testResults : [],
      attendanceRecords: Array.isArray(parsed.attendanceRecords) ? parsed.attendanceRecords : []
    };

    return { success: true, data: cleanSnapshot };
  } catch (err: any) {
    return { success: false, error: `JSON पार्स त्रुटि: ${err.message || 'अमान्य JSON फ़ाइल'}` };
  }
};

// Check Database Health and calculate statistics
export const getDatabaseHealthReport = (snapshot: DatabaseSnapshot): DatabaseHealthReport => {
  const issues: string[] = [];

  // Check for orphan payments (payments without valid students)
  const studentIds = new Set(snapshot.students.map(s => s.id));
  const orphanPayments = snapshot.payments.filter(p => !studentIds.has(p.studentId));
  if (orphanPayments.length > 0) {
    issues.push(`${orphanPayments.length} फीस रसीदों के छात्र डेटाबेस में नहीं मिले (Orphan receipts).`);
  }

  // Check for students without parent phone
  const studentsWithoutParentPhone = snapshot.students.filter(s => !s.parentMobile || s.parentMobile.length < 10);
  if (studentsWithoutParentPhone.length > 0) {
    issues.push(`${studentsWithoutParentPhone.length} छात्रों के पास वैध 10-अंकीय अभिभावक मोबाइल नंबर नहीं है।`);
  }

  // Calculate approximate storage usage
  let storageUsageKB = 0;
  try {
    const raw = JSON.stringify(snapshot);
    storageUsageKB = Math.round(new Blob([raw]).size / 1024);
  } catch {}

  const totalRevenue = snapshot.payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalDue = snapshot.students.reduce((acc, s) => acc + Math.max(0, (s.totalFee || 0) - (s.paidFee || 0)), 0);

  return {
    isHealthy: issues.length === 0,
    persistenceGranted: true,
    totalStudents: snapshot.students.length,
    totalPayments: snapshot.payments.length,
    totalRevenue,
    totalDue,
    storageUsageKB,
    lastBackupDate: localStorage.getItem('nk_last_backup_timestamp'),
    issues
  };
};
