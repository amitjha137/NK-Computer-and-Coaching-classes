export type UserRole = 'admin' | 'teacher' | 'student' | 'parent' | 'public';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  phone?: string;
  studentId?: string;
  teacherId?: string;
  avatarUrl?: string;
  joinedDate?: string;
}

export interface InstituteProfile {
  name: string;
  tagline: string;
  shortName: string;
  phone: string;
  email: string;
  address: string;
  upiId: string;
  directorName: string;
  sessionYear: string;
}

export const DEFAULT_INSTITUTE_PROFILE: InstituteProfile = {
  name: 'NK Coaching & Computer Classes',
  tagline: 'Coaching & Computer Classes Institute Management',
  shortName: 'NK',
  phone: '+91 98290 11223',
  email: 'info@nkinstitute.in',
  address: 'Station Road, Civil Lines',
  upiId: 'nkinstitute@upi',
  directorName: 'Er. N. K. Sharma',
  sessionYear: '2026-27'
};

export interface Student {
  id: string;
  studentId: string; // e.g. "NK-2026-101"
  name: string;
  photoUrl: string;
  fatherName: string;
  motherName?: string;
  mobile: string;
  parentMobile: string;
  email: string;
  address: string;
  courseId: string;
  batchId: string;
  admissionDate: string;
  totalFee: number;
  paidFee: number;
  emergencyContact: string;
  allottedComputerId?: string; // e.g. "PC-04"
  status: 'active' | 'completed' | 'dropped';
  attendanceRate: number; // e.g. 88
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  mobile: string;
  photoUrl: string;
  subject: string;
  assignedBatches: string[];
  salary: number;
  joiningDate: string;
}

export interface Course {
  id: string;
  name: string;
  type: 'coaching' | 'computer';
  duration: string; // e.g. "6 Months", "1 Year"
  fee: number;
  subjects: string[];
  syllabusOverview: string;
  iconName: string;
  popular?: boolean;
}

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  teacherId: string;
  timing: string; // e.g. "8:00 AM - 9:30 AM"
  days: string; // e.g. "Mon - Sat"
  room: string; // e.g. "Lab 1 (Computer)" or "Room 201"
  capacity: number;
  enrolledStudentIds: string[];
  category?: 'coaching' | 'computer'; // 'coaching' for School (Nursery to 12th), 'computer' for Coding & Computer
  classLevel?: string; // e.g. 'Nursery', 'LKG', 'UKG', 'Class 1st', ..., 'Class 12th', 'Coding'
}

export interface FeePayment {
  id: string;
  receiptNo: string; // e.g. "RCPT-1025"
  studentId: string;
  studentName: string;
  courseName: string;
  batchName: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  date: string;
  remarks?: string;
  parentMobile: string;
  remainingDue: number;
  sentToParent: boolean;
  sentTimestamp: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  batchId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  timestamp: string;
  method?: 'manual' | 'qr';
}

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  subject: string;
  teacherName: string;
  room: string;
  batchName: string;
}

export interface ComputerPC {
  id: string;
  pcCode: string; // e.g. "PC-01"
  labRoom: string; // "Lab 1" or "Lab 2"
  status: 'working' | 'maintenance' | 'occupied';
  assignedStudentId?: string;
  assignedStudentName?: string;
  assignedBatch?: string;
  assignedTimeSlot?: string;
  specs: string; // e.g. "Core i5 12th Gen, 16GB RAM, SSD 512GB"
  installedSoftware: string[];
  issueReported?: string;
  lastServiceDate: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  courseId: string;
  subject: string;
  category: 'Notes' | 'PDF' | 'PPT' | 'Assignments' | 'Previous Papers' | 'Practical Files';
  fileSize: string;
  uploadDate: string;
  authorTeacher: string;
  description: string;
}

export interface Homework {
  id: string;
  title: string;
  subject: string;
  batchId: string;
  dueDate: string;
  assignedDate: string;
  teacherName: string;
  instructions: string;
  attachmentName?: string;
  submissionsCount: number;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  status: 'submitted' | 'checked';
  marks?: number;
  feedback?: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface OnlineTest {
  id: string;
  title: string;
  subject: string;
  courseId: string;
  batchId: string;
  date: string;
  durationMinutes: number;
  totalMarks: number;
  questions: TestQuestion[];
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  studentName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
  rank?: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Batch' | 'Exam' | 'Holiday' | 'Fee' | 'Important';
  targetBatchId?: string;
  date: string;
  author: string;
  isUrgent?: boolean;
}

export interface FeedbackItem {
  id: string;
  studentName: string;
  courseName: string;
  rating: number; // 1 to 5
  feedbackText: string;
  category: 'Teaching' | 'Lab Facilities' | 'Study Material' | 'Overall';
  date: string;
}

export type GatewayProvider = 'direct_cloud' | 'ultramsg' | 'green_api' | 'meta_cloud' | 'fast2sms' | 'custom_webhook';

export interface GatewayConfig {
  provider: GatewayProvider;
  enabled: boolean;
  // UltraMsg configuration
  ultramsgInstanceId?: string;
  ultramsgToken?: string;
  // Green-API configuration
  greenApiIdInstance?: string;
  greenApiToken?: string;
  // Meta Cloud API
  metaPhoneNumberId?: string;
  metaAccessToken?: string;
  // Fast2SMS (Indian SMS)
  fast2smsApiKey?: string;
  // Custom Webhook
  customWebhookUrl?: string;
  customWebhookAuth?: string;
  // Settings
  autoSendReceiptOnPayment: boolean;
  autoSendAttendanceAlert: boolean;
  senderName: string;
}

export const DEFAULT_GATEWAY_CONFIG: GatewayConfig = {
  provider: 'direct_cloud',
  enabled: true,
  autoSendReceiptOnPayment: true,
  autoSendAttendanceAlert: false,
  senderName: 'NK Coaching & Computer Classes'
};

export interface DispatchLogEntry {
  id: string;
  timestamp: string;
  recipientPhone: string;
  recipientName: string;
  type: 'receipt' | 'reminder' | 'notice' | 'test';
  provider: GatewayProvider;
  status: 'delivered' | 'sent' | 'failed';
  messagePreview: string;
  receiptNo?: string;
  amount?: number;
  apiResponse?: string;
}

