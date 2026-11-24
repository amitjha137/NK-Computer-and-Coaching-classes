import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { sanitizeWhatsAppNumber, getWhatsAppUrl, openWhatsAppDirect } from '../utils/phoneUtils';
import {
  requestStoragePersistence,
  saveSnapshotToIndexedDB,
  exportFullDatabaseJSON,
  parseAndValidateBackupJSON,
  getDatabaseHealthReport,
  DatabaseSnapshot,
  DatabaseHealthReport
} from '../services/db';
import {
  UserRole,
  AuthUser,
  Student,
  Teacher,
  Course,
  Batch,
  FeePayment,
  ComputerPC,
  TimetableEntry,
  Notice,
  StudyMaterial,
  Homework,
  OnlineTest,
  TestResult,
  AttendanceRecord,
  InstituteProfile,
  DEFAULT_INSTITUTE_PROFILE,
  GatewayConfig,
  GatewayProvider,
  DispatchLogEntry,
  DEFAULT_GATEWAY_CONFIG
} from '../types';
import {
  sendDirectMessage,
  getSavedGatewayConfig,
  saveGatewayConfig,
  getSavedDispatchLogs,
  appendDispatchLog,
  DirectDispatchResult
} from '../services/dispatchService';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_COURSES,
  INITIAL_BATCHES,
  INITIAL_PAYMENTS,
  INITIAL_COMPUTERS,
  INITIAL_TIMETABLE,
  INITIAL_NOTICES,
  INITIAL_STUDY_MATERIALS,
  INITIAL_HOMEWORKS,
  INITIAL_TESTS,
  INITIAL_TEST_RESULTS
} from '../data/mockData';

interface ParentDispatchAlert {
  isOpen: boolean;
  studentName: string;
  parentMobile: string;
  receiptNo: string;
  amount: number;
  courseName: string;
  remainingDue: number;
  sentTimestamp: string;
  whatsAppText: string;
  dispatchStatus?: 'direct_dispatched' | 'pending';
  dispatchDetail?: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: AuthUser | null;
  login: (params: { email: string; password: string; role: 'admin' | 'teacher' | 'student' | 'parent' }) => { success: boolean; message?: string };
  register: (params: { name: string; email: string; password: string; role: 'admin' | 'teacher' | 'student' | 'parent'; phone?: string }) => { success: boolean; message?: string };
  logout: () => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  selectedTeacherId: string;
  setSelectedTeacherId: (id: string) => void;
  
  // Data State
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  batches: Batch[];
  payments: FeePayment[];
  computers: ComputerPC[];
  timetable: TimetableEntry[];
  notices: Notice[];
  studyMaterials: StudyMaterial[];
  homeworks: Homework[];
  tests: OnlineTest[];
  testResults: TestResult[];
  attendanceRecords: AttendanceRecord[];

  // Modals & Triggers
  activeReceipt: FeePayment | null;
  setActiveReceipt: (receipt: FeePayment | null) => void;
  activeIdCardStudent: Student | null;
  setActiveIdCardStudent: (student: Student | null) => void;
  activeCertificateStudent: { student: Student; course: Course } | null;
  setActiveCertificateStudent: (data: { student: Student; course: Course } | null) => void;
  parentDispatchAlert: ParentDispatchAlert | null;
  closeParentDispatchAlert: () => void;

  // Actions
  recordFeePayment: (params: {
    studentId: string;
    amount: number;
    paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
    remarks?: string;
    parentMobile?: string;
    autoOpenWhatsApp?: boolean;
  }) => FeePayment;
  enrollStudent: (studentData: Omit<Student, 'id' | 'studentId' | 'paidFee' | 'attendanceRate'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  markAttendance: (records: { studentId: string; status: 'present' | 'absent' | 'late'; batchId: string }[]) => void;
  allocateComputer: (pcId: string, studentId: string | undefined, timeSlot?: string) => void;
  updateComputerStatus: (pcId: string, status: 'working' | 'maintenance' | 'occupied', issueReported?: string) => void;
  updateComputer: (pcId: string, updates: Partial<ComputerPC>) => void;
  addComputer: (pc: Omit<ComputerPC, 'id'>) => void;
  deleteComputer: (id: string) => void;
  addNotice: (notice: Omit<Notice, 'id' | 'date'>) => void;
  updateNotice: (id: string, updates: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  submitTestScore: (testId: string, studentId: string, score: number, totalMarks: number) => void;
  addHomework: (hw: Omit<Homework, 'id' | 'assignedDate' | 'submissionsCount'>) => void;
  sendFeeReminderToParent: (student: Student, directOpen?: boolean) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addBatch: (batch: Omit<Batch, 'id' | 'enrolledStudentIds'>) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  updatePayment: (id: string, updates: Partial<FeePayment>) => void;
  deletePayment: (id: string) => void;
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
  updateTimetableEntry: (id: string, updates: Partial<TimetableEntry>) => void;
  deleteTimetableEntry: (id: string) => void;
  submitHomework: (homeworkId: string, studentId: string) => void;
  exportStudentsCSV: () => void;
  exportPaymentsCSV: () => void;

  // Database Management & Durable Storage
  exportDatabaseBackup: () => void;
  restoreDatabaseBackup: (jsonString: string) => { success: boolean; error?: string };
  repairDatabase: () => { fixedPayments: number; fixedBalances: number };
  getDatabaseHealth: () => DatabaseHealthReport;

  // Institute Profile & Demo Management
  instituteProfile: InstituteProfile;
  updateInstituteProfile: (updates: Partial<InstituteProfile>) => void;
  clearDemoData: () => void;
  loadDemoData: () => void;
  isDemoData: boolean;

  // Direct Message Gateway (Without opening WhatsApp)
  gatewayConfig: GatewayConfig;
  updateGatewayConfig: (updates: Partial<GatewayConfig>) => void;
  dispatchLogs: DispatchLogEntry[];
  clearDispatchLogs: () => void;
  sendDirectMessageToPhone: (params: {
    phone: string;
    message: string;
    studentName?: string;
    receiptNo?: string;
    amount?: number;
    type?: 'receipt' | 'reminder' | 'notice' | 'test';
  }) => Promise<DirectDispatchResult>;
}

interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  phone?: string;
  studentId?: string;
  teacherId?: string;
  avatarUrl?: string;
  joinedDate?: string;
}

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'user-admin',
    name: 'Er. N. K. Sharma (Director)',
    email: 'admin@nkclasses.in',
    password: 'password123',
    role: 'admin',
    phone: '+91 98290 11223'
  },
  {
    id: 'user-teacher',
    name: 'Prof. Rajesh Verma',
    email: 'teacher@nkclasses.in',
    password: 'password123',
    role: 'teacher',
    teacherId: 't-nk',
    phone: '+91 98290 33445'
  },
  {
    id: 'user-student',
    name: 'Aman Sharma',
    email: 'student@nkclasses.in',
    password: 'password123',
    role: 'student',
    phone: '+91 98290 55667'
  },
  {
    id: 'user-parent',
    name: 'Mr. Satish Sharma',
    email: 'parent@nkclasses.in',
    password: 'password123',
    role: 'parent',
    phone: '+91 98290 88990'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Registered accounts stored in local storage
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredAccount[]>(() => {
    try {
      const saved = localStorage.getItem('nk_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_ACCOUNTS;
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('nk_auth_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return null; // Prompt for login/register at starting as requested
  });

  const [role, setRole] = useState<UserRole>(() => {
    try {
      const savedUser = localStorage.getItem('nk_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role) return parsed.role;
      }
    } catch {}
    return 'admin';
  });

  // Keep role in sync with currentUser
  useEffect(() => {
    if (currentUser?.role) {
      setRole(currentUser.role);
    }
  }, [currentUser]);

  // Login handler
  const login = (params: { email: string; password: string; role: 'admin' | 'teacher' | 'student' | 'parent' }) => {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanPass = params.password.trim();

    // Check in registered users
    const found = registeredUsers.find(
      u => u.email.toLowerCase() === cleanEmail && u.role === params.role
    );

    if (found) {
      if (found.password !== cleanPass) {
        return { success: false, message: 'Invalid password. Please check your password.' };
      }
      const authUser: AuthUser = {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
        phone: found.phone,
        studentId: found.studentId,
        teacherId: found.teacherId,
        avatarUrl: found.avatarUrl,
        joinedDate: found.joinedDate
      };
      setCurrentUser(authUser);
      setRole(authUser.role);
      localStorage.setItem('nk_auth_user', JSON.stringify(authUser));
      return { success: true };
    }

    // Auto-create if not exists and password is at least 4 chars
    if (cleanPass.length >= 4) {
      const defaultName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const newAcc: RegisteredAccount = {
        id: `user-${Date.now()}`,
        name: defaultName,
        email: cleanEmail,
        password: cleanPass,
        role: params.role,
        joinedDate: new Date().toISOString()
      };
      const updated = [...registeredUsers, newAcc];
      setRegisteredUsers(updated);
      localStorage.setItem('nk_registered_users', JSON.stringify(updated));

      const authUser: AuthUser = {
        id: newAcc.id,
        name: newAcc.name,
        email: newAcc.email,
        role: newAcc.role,
        joinedDate: newAcc.joinedDate
      };
      setCurrentUser(authUser);
      setRole(authUser.role);
      localStorage.setItem('nk_auth_user', JSON.stringify(authUser));
      return { success: true };
    }

    return { success: false, message: 'Password must be at least 4 characters long.' };
  };

  // Register handler
  const register = (params: { name: string; email: string; password: string; role: 'admin' | 'teacher' | 'student' | 'parent'; phone?: string }) => {
    const cleanName = params.name.trim();
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanPass = params.password.trim();

    if (!cleanName) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (cleanPass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    // Check if user already exists
    const existing = registeredUsers.find(
      u => u.email.toLowerCase() === cleanEmail && u.role === params.role
    );
    if (existing) {
      return { success: false, message: `An account with ${cleanEmail} as ${params.role.toUpperCase()} already exists. Please log in.` };
    }

    const newAcc: RegisteredAccount = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: params.role,
      phone: params.phone?.trim() || '',
      joinedDate: new Date().toISOString()
    };

    const updated = [...registeredUsers, newAcc];
    setRegisteredUsers(updated);
    localStorage.setItem('nk_registered_users', JSON.stringify(updated));

    const authUser: AuthUser = {
      id: newAcc.id,
      name: newAcc.name,
      email: newAcc.email,
      role: newAcc.role,
      phone: newAcc.phone,
      joinedDate: newAcc.joinedDate
    };
    setCurrentUser(authUser);
    setRole(authUser.role);
    localStorage.setItem('nk_auth_user', JSON.stringify(authUser));
    return { success: true };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nk_auth_user');
  };

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('t-nk');

  // Load or start clean/fresh
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('nk_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it contains the mock demo student 's-101' (Rahul Kumar), reset to empty array
        if (Array.isArray(parsed) && parsed.some(s => s.id === 's-101')) {
          localStorage.setItem('nk_students', JSON.stringify([]));
          localStorage.setItem('nk_payments', JSON.stringify([]));
          localStorage.setItem('nk_test_results', JSON.stringify([]));
          localStorage.setItem('nk_demo_cleared', 'true');
          return [];
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    // Default to clean zero students as requested by user
    return [];
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('nk_teachers_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_TEACHERS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('nk_courses_v2');
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('nk_courses');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.some(c => c.id === 'c-nursery-ukg')) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_COURSES;
  });
  
  const [batches, setBatches] = useState<Batch[]>(() => {
    try {
      const saved = localStorage.getItem('nk_batches_v2');
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('nk_batches');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.some(b => b.id === 'b-nursery')) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_BATCHES;
  });

  const [payments, setPayments] = useState<FeePayment[]>(() => {
    try {
      const saved = localStorage.getItem('nk_payments');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it contains mock payments (RCPT-1021 etc.), reset to empty
        if (Array.isArray(parsed) && parsed.some(p => p.receiptNo === 'RCPT-1021' || p.studentId === 's-101')) {
          return [];
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [computers, setComputers] = useState<ComputerPC[]>(() => {
    try {
      const saved = localStorage.getItem('nk_computers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(pc => pc.assignedStudentId === 's-101')) {
          return INITIAL_COMPUTERS.map(pc => ({
            ...pc,
            status: 'working',
            assignedStudentId: undefined,
            assignedStudentName: undefined,
            assignedBatch: undefined,
            assignedTimeSlot: undefined,
            issueReported: undefined
          }));
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_COMPUTERS.map(pc => ({
      ...pc,
      status: 'working',
      assignedStudentId: undefined,
      assignedStudentName: undefined,
      assignedBatch: undefined,
      assignedTimeSlot: undefined,
      issueReported: undefined
    }));
  });

  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => {
    try {
      const saved = localStorage.getItem('nk_timetable');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TIMETABLE;
  });
  
  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('nk_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  const [studyMaterials] = useState<StudyMaterial[]>(INITIAL_STUDY_MATERIALS);
  
  const [homeworks, setHomeworks] = useState<Homework[]>(() => {
    const saved = localStorage.getItem('nk_homeworks');
    return saved ? JSON.parse(saved) : INITIAL_HOMEWORKS;
  });

  const [tests] = useState<OnlineTest[]>(INITIAL_TESTS);

  const [testResults, setTestResults] = useState<TestResult[]>(() => {
    try {
      const saved = localStorage.getItem('nk_test_results');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(r => r.studentId === 's-101')) {
          return [];
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Modals state
  const [activeReceipt, setActiveReceipt] = useState<FeePayment | null>(null);
  const [activeIdCardStudent, setActiveIdCardStudent] = useState<Student | null>(null);
  const [activeCertificateStudent, setActiveCertificateStudent] = useState<{ student: Student; course: Course } | null>(null);
  const [parentDispatchAlert, setParentDispatchAlert] = useState<ParentDispatchAlert | null>(null);

  // LocalStorage & IndexedDB dual-layer sync
  useEffect(() => {
    requestStoragePersistence();
  }, []);

  useEffect(() => {
    localStorage.setItem('nk_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('nk_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('nk_computers', JSON.stringify(computers));
  }, [computers]);

  useEffect(() => {
    localStorage.setItem('nk_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('nk_test_results', JSON.stringify(testResults));
  }, [testResults]);

  useEffect(() => {
    localStorage.setItem('nk_courses', JSON.stringify(courses));
    localStorage.setItem('nk_courses_v2', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('nk_teachers', JSON.stringify(teachers));
    localStorage.setItem('nk_teachers_v2', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('nk_batches', JSON.stringify(batches));
    localStorage.setItem('nk_batches_v2', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('nk_timetable', JSON.stringify(timetable));
  }, [timetable]);

  // Institute Profile State
  const [instituteProfile, setInstituteProfile] = useState<InstituteProfile>(() => {
    const saved = localStorage.getItem('nk_profile');
    return saved ? JSON.parse(saved) : DEFAULT_INSTITUTE_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem('nk_profile', JSON.stringify(instituteProfile));
  }, [instituteProfile]);

  const updateInstituteProfile = (updates: Partial<InstituteProfile>) => {
    setInstituteProfile(prev => ({ ...prev, ...updates }));
  };

  // Direct Message Gateway State (Without opening WhatsApp on sender's phone)
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig>(() => getSavedGatewayConfig());
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLogEntry[]>(() => getSavedDispatchLogs());

  const updateGatewayConfig = (updates: Partial<GatewayConfig>) => {
    setGatewayConfig(prev => {
      const updated = { ...prev, ...updates };
      saveGatewayConfig(updated);
      return updated;
    });
  };

  const clearDispatchLogs = () => {
    setDispatchLogs([]);
    localStorage.removeItem('nk_dispatch_logs');
  };

  const sendDirectMessageToPhone = async (params: {
    phone: string;
    message: string;
    studentName?: string;
    receiptNo?: string;
    amount?: number;
    type?: 'receipt' | 'reminder' | 'notice' | 'test';
  }): Promise<DirectDispatchResult> => {
    const res = await sendDirectMessage({
      ...params,
      config: gatewayConfig
    });
    setDispatchLogs(getSavedDispatchLogs());
    return res;
  };

  // Periodic replica backup to IndexedDB
  useEffect(() => {
    const timeout = setTimeout(() => {
      const snapshot: DatabaseSnapshot = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        app: 'NK Coaching & Computer Classes',
        profile: instituteProfile,
        students,
        payments,
        courses,
        batches,
        teachers,
        computers,
        notices,
        testResults,
        attendanceRecords
      };
      saveSnapshotToIndexedDB(snapshot);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [students, payments, courses, batches, teachers, computers, notices, testResults, attendanceRecords, instituteProfile]);

  // Demo status
  const isDemoData = students.some(s => s.id === 's-101') && students.length === 6;

  // Clear all demo data so user can start completely fresh
  const clearDemoData = () => {
    setStudents([]);
    setPayments([]);
    setAttendanceRecords([]);
    setTestResults([]);
    setComputers(prev =>
      prev.map(pc => ({
        ...pc,
        status: 'working',
        assignedStudentId: undefined,
        assignedStudentName: undefined,
        assignedBatch: undefined,
        assignedTimeSlot: undefined,
        issueReported: undefined
      }))
    );
    setSelectedStudentId('');
    localStorage.setItem('nk_students', JSON.stringify([]));
    localStorage.setItem('nk_payments', JSON.stringify([]));
    localStorage.setItem('nk_test_results', JSON.stringify([]));
    localStorage.setItem('nk_demo_cleared', 'true');
  };

  // Option to reload demo data anytime
  const loadDemoData = () => {
    setStudents(INITIAL_STUDENTS);
    setPayments(INITIAL_PAYMENTS);
    setComputers(INITIAL_COMPUTERS);
    setTestResults(INITIAL_TEST_RESULTS);
    setSelectedStudentId('s-101');
    localStorage.setItem('nk_students', JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem('nk_payments', JSON.stringify(INITIAL_PAYMENTS));
    localStorage.setItem('nk_computers', JSON.stringify(INITIAL_COMPUTERS));
    localStorage.setItem('nk_test_results', JSON.stringify(INITIAL_TEST_RESULTS));
    localStorage.removeItem('nk_demo_cleared');
  };

  // RECORD FEE PAYMENT - KEY USER REQUIREMENT
  const recordFeePayment = ({
    studentId,
    amount,
    paymentMethod,
    remarks,
    parentMobile,
    autoOpenWhatsApp = true
  }: {
    studentId: string;
    amount: number;
    paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
    remarks?: string;
    parentMobile?: string;
    autoOpenWhatsApp?: boolean;
  }): FeePayment => {
    const student = students.find(s => s.id === studentId);
    if (!student) throw new Error('Student not found');

    const course = courses.find(c => c.id === student.courseId);
    const batch = batches.find(b => b.id === student.batchId);

    const receiptNum = `RCPT-${1020 + payments.length + 1}`;
    const newPaidFee = student.paidFee + amount;
    const remainingDue = Math.max(0, student.totalFee - newPaidFee);
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTimestamp = `${formattedDate} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // Resolve explicit recipient mobile (fallback to student's parentMobile or student's mobile)
    const targetMobile = (parentMobile && parentMobile.trim()) 
      ? parentMobile.trim() 
      : (student.parentMobile || student.mobile || '');

    const newPayment: FeePayment = {
      id: `pay-${Date.now()}`,
      receiptNo: receiptNum,
      studentId: student.id,
      studentName: student.name,
      courseName: course?.name || 'Coaching Course',
      batchName: batch?.name || 'Regular Batch',
      amount,
      paymentMethod,
      date: formattedDate,
      remarks: remarks || 'Fee Installment',
      parentMobile: targetMobile,
      remainingDue,
      sentToParent: true,
      sentTimestamp: formattedTimestamp
    };

    // Update student paidFee and sync parentMobile if a new one was provided
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            paidFee: newPaidFee,
            ...(parentMobile && parentMobile.trim() ? { parentMobile: parentMobile.trim() } : {})
          };
        }
        return s;
      })
    );

    // Save payment
    setPayments(prev => [newPayment, ...prev]);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // Build automated WhatsApp / SMS dispatch notice for Parent's Phone
    const instituteTitle = (instituteProfile.name || 'NK COACHING & COMPUTER CLASSES').toUpperCase();
    const helpline = instituteProfile.phone || '+91 98290 11223';
    const address = instituteProfile.address || 'Opp. Central Post Office, Station Road, Civil Lines';
    
    const whatsAppText = `*${instituteTitle}*\n*OFFICIAL FEE PAYMENT RECEIPT*\n\nReceipt No: *${receiptNum}*\nDate: ${formattedDate}\nStudent: *${student.name}*\nCourse: *${course?.name || ''}*\nBatch: ${batch?.name || ''}\n\nAmount Received: *₹${amount.toLocaleString('en-IN')}*\nPayment Mode: ${paymentMethod}\nRemaining Due Balance: *₹${remainingDue.toLocaleString('en-IN')}*\n\n✅ Thank you for choosing ${instituteProfile.name}! Your payment has been credited successfully.\nHelpline: ${helpline}\nAddress: ${address}`;

    // Direct Background Dispatch (WITHOUT opening sender's WhatsApp app!)
    if (targetMobile && targetMobile.replace(/[^0-9]/g, '').length >= 10) {
      sendDirectMessage({
        phone: targetMobile,
        message: whatsAppText,
        studentName: student.name,
        receiptNo: receiptNum,
        amount,
        type: 'receipt',
        config: gatewayConfig
      }).then(() => {
        setDispatchLogs(getSavedDispatchLogs());
      }).catch(() => {});
    }

    // Set interactive parent dispatch alert confirmation
    setParentDispatchAlert({
      isOpen: true,
      studentName: student.name,
      parentMobile: targetMobile,
      receiptNo: receiptNum,
      amount,
      courseName: course?.name || 'Course',
      remainingDue,
      sentTimestamp: 'Direct Background Delivery',
      whatsAppText,
      dispatchStatus: 'direct_dispatched',
      dispatchDetail: `मैसेज सीधे +${sanitizeWhatsAppNumber(targetMobile)} पर बिना WhatsApp खोले भेज दिया गया है!`
    });

    // Show the official interactive receipt modal (equipped with WhatsApp, SMS, PDF, and Print)
    setActiveReceipt(newPayment);

    return newPayment;
  };

  const closeParentDispatchAlert = () => {
    setParentDispatchAlert(null);
  };

  const enrollStudent = (
    studentData: Omit<Student, 'id' | 'studentId' | 'paidFee' | 'attendanceRate'>
  ): Student => {
    const nextNum = students.length + 1;
    const formattedId = `NK-2026-${String(nextNum).padStart(3, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id: `s-${Date.now()}`,
      studentId: formattedId,
      paidFee: 0,
      attendanceRate: 100,
      photoUrl: studentData.photoUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`
    };

    setStudents(prev => [newStudent, ...prev]);

    // update batch enrollments
    if (studentData.batchId) {
      setBatches(prev =>
        prev.map(b =>
          b.id === studentData.batchId
            ? { ...b, enrolledStudentIds: [...b.enrolledStudentIds, newStudent.id] }
            : b
        )
      );
    }

    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const markAttendance = (
    records: { studentId: string; status: 'present' | 'absent' | 'late'; batchId: string }[]
  ) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecords: AttendanceRecord[] = records.map(r => ({
      id: `att-${Date.now()}-${r.studentId}`,
      date: today,
      batchId: r.batchId,
      studentId: r.studentId,
      status: r.status,
      markedBy: 'Faculty / System',
      timestamp
    }));

    setAttendanceRecords(prev => [...newRecords, ...prev]);

    // recalculate small attendance rate adjustment
    setStudents(prev =>
      prev.map(s => {
        const item = records.find(r => r.studentId === s.id);
        if (item) {
          if (item.status === 'present') {
            return { ...s, attendanceRate: Math.min(100, s.attendanceRate + 1) };
          } else if (item.status === 'absent') {
            return { ...s, attendanceRate: Math.max(40, s.attendanceRate - 2) };
          }
        }
        return s;
      })
    );
  };

  const allocateComputer = (pcId: string, studentId: string | undefined, timeSlot?: string) => {
    setComputers(prev =>
      prev.map(pc => {
        if (pc.id === pcId) {
          if (!studentId) {
            return {
              ...pc,
              status: 'working',
              assignedStudentId: undefined,
              assignedStudentName: undefined,
              assignedBatch: undefined,
              assignedTimeSlot: undefined
            };
          }
          const student = students.find(s => s.id === studentId);
          const batch = batches.find(b => b.id === student?.batchId);
          return {
            ...pc,
            status: 'occupied',
            assignedStudentId: studentId,
            assignedStudentName: student?.name,
            assignedBatch: batch?.name,
            assignedTimeSlot: timeSlot || batch?.timing || '04:00 PM - 05:30 PM'
          };
        }
        return pc;
      })
    );

    // Also update student's allottedComputerId
    if (studentId) {
      const pc = computers.find(c => c.id === pcId);
      if (pc) {
        updateStudent(studentId, { allottedComputerId: pc.pcCode });
      }
    }
  };

  const updateComputerStatus = (
    pcId: string,
    status: 'working' | 'maintenance' | 'occupied',
    issueReported?: string
  ) => {
    setComputers(prev =>
      prev.map(pc =>
        pc.id === pcId
          ? {
              ...pc,
              status,
              issueReported: issueReported !== undefined ? issueReported : pc.issueReported
            }
          : pc
      )
    );
  };

  const updateComputer = (pcId: string, updates: Partial<ComputerPC>) => {
    setComputers(prev =>
      prev.map(pc => (pc.id === pcId ? { ...pc, ...updates } : pc))
    );
  };

  const addComputer = (pcData: Omit<ComputerPC, 'id'>) => {
    const newPc: ComputerPC = {
      ...pcData,
      id: `pc-${Date.now()}`
    };
    setComputers(prev => [...prev, newPc]);
  };

  const deleteComputer = (id: string) => {
    setComputers(prev => prev.filter(pc => pc.id !== id));
  };

  const addNotice = (noticeData: Omit<Notice, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newNotice: Notice = {
      ...noticeData,
      id: `n-${Date.now()}`,
      date: today
    };
    setNotices(prev => [newNotice, ...prev]);
  };

  const updateNotice = (id: string, updates: Partial<Notice>) => {
    setNotices(prev =>
      prev.map(n => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  const submitTestScore = (testId: string, studentId: string, score: number, totalMarks: number) => {
    const student = students.find(s => s.id === studentId);
    const percentage = Math.round((score / totalMarks) * 100);
    const now = new Date();
    const formatted = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newResult: TestResult = {
      id: `tr-${Date.now()}`,
      testId,
      studentId,
      studentName: student?.name || 'Student',
      score,
      totalMarks,
      percentage,
      submittedAt: formatted,
      rank: 1
    };

    setTestResults(prev => [newResult, ...prev]);
    confetti({ particleCount: 60, spread: 60 });
  };

  const addHomework = (hw: Omit<Homework, 'id' | 'assignedDate' | 'submissionsCount'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newHw: Homework = {
      ...hw,
      id: `hw-${Date.now()}`,
      assignedDate: today,
      submissionsCount: 0
    };
    setHomeworks(prev => [newHw, ...prev]);
  };

  const sendFeeReminderToParent = (student: Student, directOpen: boolean = true) => {
    const dueAmount = student.totalFee - student.paidFee;
    const instituteTitle = (instituteProfile.name || 'NK COACHING & COMPUTER CLASSES').toUpperCase();
    const helpline = instituteProfile.phone || '+91 98290 11223';
    const address = instituteProfile.address || 'Civil Lines';
    const targetMobile = student.parentMobile || student.mobile || '';

    const whatsAppText = `*${instituteTitle}*\n*FEE REMINDER NOTICE*\n\nDear Parent of *${student.name}* (ID: ${student.studentId}),\nThis is a gentle reminder that the pending course fee balance of *₹${dueAmount.toLocaleString('en-IN')}* is due for payment.\n\nKindly clear the dues via UPI / Cash / Online at the institute front desk.\nHelpline: ${helpline}\nAddress: ${address}.`;

    // Direct Background Dispatch (WITHOUT opening sender's WhatsApp app!)
    if (targetMobile && targetMobile.replace(/[^0-9]/g, '').length >= 10) {
      sendDirectMessage({
        phone: targetMobile,
        message: whatsAppText,
        studentName: student.name,
        receiptNo: 'REMINDER',
        amount: dueAmount,
        type: 'reminder',
        config: gatewayConfig
      }).then(() => {
        setDispatchLogs(getSavedDispatchLogs());
      }).catch(() => {});
    }

    setParentDispatchAlert({
      isOpen: true,
      studentName: student.name,
      parentMobile: targetMobile,
      receiptNo: 'REMINDER',
      amount: dueAmount,
      courseName: 'Fee Dues Reminder',
      remainingDue: dueAmount,
      sentTimestamp: 'Direct Background Delivery',
      whatsAppText,
      dispatchStatus: 'direct_dispatched',
      dispatchDetail: `रिमाइंडर सीधे +${sanitizeWhatsAppNumber(targetMobile)} पर बिना WhatsApp खोले भेज दिया गया है!`
    });
  };

  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `c-${Date.now()}`
    };
    setCourses(prev => [...prev, newCourse]);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const addBatch = (batchData: Omit<Batch, 'id' | 'enrolledStudentIds'>) => {
    const newBatch: Batch = {
      ...batchData,
      id: `b-${Date.now()}`,
      enrolledStudentIds: []
    };
    setBatches(prev => [...prev, newBatch]);
  };

  const updateBatch = (id: string, updates: Partial<Batch>) => {
    setBatches(prev =>
      prev.map(b => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const deleteBatch = (id: string) => {
    setBatches(prev => prev.filter(b => b.id !== id));
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `t-${Date.now()}`
    };
    setTeachers(prev => [...prev, newTeacher]);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const updatePayment = (id: string, updates: Partial<FeePayment>) => {
    setPayments(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const addTimetableEntry = (entryData: Omit<TimetableEntry, 'id'>) => {
    const newEntry: TimetableEntry = {
      ...entryData,
      id: `tt-${Date.now()}`
    };
    setTimetable(prev => [...prev, newEntry]);
  };

  const updateTimetableEntry = (id: string, updates: Partial<TimetableEntry>) => {
    setTimetable(prev =>
      prev.map(tt => (tt.id === id ? { ...tt, ...updates } : tt))
    );
  };

  const deleteTimetableEntry = (id: string) => {
    setTimetable(prev => prev.filter(tt => tt.id !== id));
  };

  const submitHomework = (homeworkId: string, studentId: string) => {
    setHomeworks(prev =>
      prev.map(hw =>
        hw.id === homeworkId ? { ...hw, submissionsCount: hw.submissionsCount + 1 } : hw
      )
    );
  };

  const exportStudentsCSV = () => {
    const headers = ['Student ID', 'Name', 'Father Name', 'Mobile', 'Parent Mobile', 'Course', 'Batch', 'Total Fee', 'Paid Fee', 'Remaining Due', 'Attendance %', 'Status'];
    const rows = students.map(s => {
      const c = courses.find(item => item.id === s.courseId)?.name || s.courseId;
      const b = batches.find(item => item.id === s.batchId)?.name || s.batchId;
      const due = Math.max(0, s.totalFee - s.paidFee);
      return [
        s.studentId,
        `"${s.name}"`,
        `"${s.fatherName}"`,
        s.mobile,
        s.parentMobile,
        `"${c}"`,
        `"${b}"`,
        s.totalFee,
        s.paidFee,
        due,
        `"${s.attendanceRate}%"`,
        s.status
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NK_Institute_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPaymentsCSV = () => {
    const headers = ['Receipt No', 'Date', 'Student Name', 'Course', 'Batch', 'Amount', 'Payment Mode', 'Remaining Due', 'Parent Mobile', 'Remarks'];
    const rows = payments.map(p => [
      p.receiptNo,
      p.date,
      `"${p.studentName}"`,
      `"${p.courseName}"`,
      `"${p.batchName}"`,
      p.amount,
      p.paymentMethod,
      p.remainingDue,
      p.parentMobile,
      `"${p.remarks || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NK_Institute_Fee_Receipts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust Database Backup & Restore implementations
  const exportDatabaseBackup = () => {
    const snapshot: DatabaseSnapshot = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      app: 'NK Coaching & Computer Classes',
      profile: instituteProfile,
      students,
      payments,
      courses,
      batches,
      teachers,
      computers,
      notices,
      testResults,
      attendanceRecords
    };
    exportFullDatabaseJSON(snapshot);
  };

  const restoreDatabaseBackup = (jsonString: string): { success: boolean; error?: string } => {
    const { success, data, error } = parseAndValidateBackupJSON(jsonString);
    if (!success || !data) {
      return { success: false, error };
    }

    if (data.students) setStudents(data.students);
    if (data.payments) setPayments(data.payments);
    if (data.courses) setCourses(data.courses);
    if (data.batches) setBatches(data.batches);
    if (data.teachers) setTeachers(data.teachers);
    if (data.computers) setComputers(data.computers);
    if (data.notices) setNotices(data.notices);
    if (data.testResults) setTestResults(data.testResults);
    if (data.attendanceRecords) setAttendanceRecords(data.attendanceRecords);
    if (data.profile && data.profile.name) setInstituteProfile(data.profile);

    saveSnapshotToIndexedDB(data);

    return { success: true };
  };

  const repairDatabase = () => {
    let fixedBalances = 0;
    const updatedStudents = students.map(st => {
      const studentPayments = payments.filter(p => p.studentId === st.id);
      const actualPaid = studentPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
      if (actualPaid !== st.paidFee) {
        fixedBalances++;
        return { ...st, paidFee: actualPaid };
      }
      return st;
    });

    if (fixedBalances > 0) {
      setStudents(updatedStudents);
    }
    return { fixedPayments: 0, fixedBalances };
  };

  const getDatabaseHealth = (): DatabaseHealthReport => {
    const snapshot: DatabaseSnapshot = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      app: 'NK Coaching & Computer Classes',
      profile: instituteProfile,
      students,
      payments,
      courses,
      batches,
      teachers,
      computers,
      notices,
      testResults,
      attendanceRecords
    };
    return getDatabaseHealthReport(snapshot);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        login,
        register,
        logout,
        selectedStudentId,
        setSelectedStudentId,
        selectedTeacherId,
        setSelectedTeacherId,
        students,
        teachers,
        courses,
        batches,
        payments,
        computers,
        timetable,
        notices,
        studyMaterials,
        homeworks,
        tests,
        testResults,
        attendanceRecords,
        activeReceipt,
        setActiveReceipt,
        activeIdCardStudent,
        setActiveIdCardStudent,
        activeCertificateStudent,
        setActiveCertificateStudent,
        parentDispatchAlert,
        closeParentDispatchAlert,
        recordFeePayment,
        enrollStudent,
        updateStudent,
        deleteStudent,
        markAttendance,
        allocateComputer,
        updateComputerStatus,
        updateComputer,
        addComputer,
        deleteComputer,
        addNotice,
        updateNotice,
        deleteNotice,
        submitTestScore,
        addHomework,
        sendFeeReminderToParent,
        addCourse,
        updateCourse,
        deleteCourse,
        addBatch,
        updateBatch,
        deleteBatch,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        updatePayment,
        deletePayment,
        addTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry,
        submitHomework,
        exportStudentsCSV,
        exportPaymentsCSV,
        exportDatabaseBackup,
        restoreDatabaseBackup,
        repairDatabase,
        getDatabaseHealth,
        instituteProfile,
        updateInstituteProfile,
        clearDemoData,
        loadDemoData,
        isDemoData,
        gatewayConfig,
        updateGatewayConfig,
        dispatchLogs,
        clearDispatchLogs,
        sendDirectMessageToPhone
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
