export type UserRole = 'teacher' | 'parent';

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export interface Student {
  id: string;
  code: string; // Mã học sinh, e.g. "HS001"
  name: string;
  dob: string; // YYYY-MM-DD
  gender: 'Nam' | 'Nữ';
  avatar: string;
  parentName: string;
  parentPhone: string;
  password: string; // Mật khẩu đăng nhập của phụ huynh
  points: number;
  stars: number;
  gameParticipationCount: number;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface PointHistory {
  id: string;
  studentId: string;
  studentName: string;
  delta: number;
  reason: string;
  date: string;
  timestamp: number;
}

export interface RewardItem {
  id: string;
  name: string;
  pointsCost: number;
  icon: string;
  stock: number;
  description: string;
}

export interface RewardRedemption {
  id: string;
  studentId: string;
  studentName: string;
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  date: string;
  status: 'pending' | 'delivered';
}

export type SubjectEvaluationLevel = 'T' | 'H' | 'C'; // Hoàn thành tốt, Hoàn thành, Chưa hoàn thành
export type QualityEvaluationLevel = 'T' | 'Đ' | 'C'; // Tốt, Đạt, Cần cố gắng

export interface DailyComment {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  category: 'mon_hoc' | 'nang_luc' | 'pham_chat' | 'tong_hop';
  subject?: string;
  level?: SubjectEvaluationLevel | QualityEvaluationLevel;
  content: string;
  encouragement: string; // Biện pháp giúp đỡ / Khen ngợi
  isPrivateToTeacher?: boolean;
}

export interface SemesterResult {
  id: string;
  studentId: string;
  schoolYear: string;
  semester: 'Học kỳ 1' | 'Học kỳ 2' | 'Cả năm';
  
  // Môn học & Điểm kiểm tra định kỳ (Theo TT 27)
  mathScore?: number;
  mathLevel: SubjectEvaluationLevel;
  vietnameseScore?: number;
  vietnameseLevel: SubjectEvaluationLevel;
  englishScore?: number;
  englishLevel: SubjectEvaluationLevel;
  scienceLevel: SubjectEvaluationLevel;
  historyGeoLevel: SubjectEvaluationLevel;
  ethicsLevel: SubjectEvaluationLevel;
  musicLevel: SubjectEvaluationLevel;
  artLevel: SubjectEvaluationLevel;
  peLevel: SubjectEvaluationLevel;

  // Năng lực cốt lõi
  selfAutonomy: SubjectEvaluationLevel; // Tự chủ và tự học
  communication: SubjectEvaluationLevel; // Giao tiếp và hợp tác
  problemSolving: SubjectEvaluationLevel; // Giải quyết vấn đề và sáng tạo

  // Phẩm chất chủ yếu
  patriotism: QualityEvaluationLevel; // Yêu nước
  compassion: QualityEvaluationLevel; // Nhân ái
  diligence: QualityEvaluationLevel; // Chăm chỉ
  honesty: QualityEvaluationLevel; // Trung thực
  responsibility: QualityEvaluationLevel; // Trách nhiệm

  // Khen thưởng & Nhận xét chung
  awardTitle: 'Học sinh Xuất sắc' | 'Học sinh Tiêu biểu hoàn thành tốt' | 'Hoàn thành chương trình lớp học' | 'Chưa hoàn thành';
  overallComment: string;
}

export interface InteractiveGameItem {
  id: string;
  title: string;
  category: 'english_vocab' | 'math_blitz' | 'trivia' | 'external';
  description: string;
  externalUrl?: string; // Link Kahoot, Quizizz, Wordwall, Blooket...
  coverImage?: string;
  icon: string;
  playCount: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  englishWord?: string;
  pronunciation?: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  image?: string;
}

export interface MusicItem {
  id: string;
  title: string;
  url: string;
  category: 'warmup' | 'english' | 'relax' | 'fun';
  description?: string;
  thumbnail?: string;
  icon?: string;
  playCount: number;
}

export interface ParentMessage {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  content: string;
  date: string;
  reply?: string;
  replyDate?: string;
  isRead: boolean;
}

export interface ParentLoginLog {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  loginTime: string;
  deviceInfo: string;
}

export interface AppSettings {
  schoolName: string;
  className: string;
  schoolYear: string;
  teacherName: string;
  teacherPhone: string;
  teacherEmail: string;
  appTitle: string;
  appLogo: string;
  soundEffectsEnabled: boolean;
  speechEnabled: boolean;
  speechVoice: 'vi' | 'en';
  speechRate: number;
  speechPitch?: number;
  preferredVoiceURI?: string;
  classCode?: string; // Mã lớp (read-only, from the teacher account), part of the parent link /phu-huynh?lop=<classCode>
}
