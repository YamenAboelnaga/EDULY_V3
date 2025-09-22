// Types for the course structure

export interface MCQQuestion {
  id: string;
  question: string; // النص أو مسار الصورة
  questionType: 'text' | 'image';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string; // شرح الإجابة الصحيحة
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  questions: MCQQuestion[];
  timeLimit: number; // بالدقائق
  totalMarks: number;
  passingMarks: number;
  createdAt: string;
  isActive: boolean;
}

export interface Exam extends Assignment {
  examType: 'midterm' | 'final' | 'quiz';
  scheduledDate?: string;
  duration: number; // بالدقائق
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  videoUrl?: string; // رابط الفيديو
  pdfUrl?: string; // رابط ملف PDF
  duration: number; // مدة الفيديو بالدقائق
  order: number; // ترتيب المحاضرة في الشهر
  assignment?: Assignment;
  exam?: Exam;
  isCompleted?: boolean; // للطالب
  watchedDuration?: number; // كم دقيقة شاهد الطالب
  createdAt: string;
  updatedAt: string;
}

export interface Month {
  id: string;
  title: string; // مثل "الشهر الأول - مقدمة في الرياضيات"
  description: string;
  order: number; // ترتيب الشهر في الكورس
  lectures: Lecture[];
  isUnlocked?: boolean; // للطالب - هل الشهر متاح
  completionPercentage?: number; // نسبة إكمال الطالب للشهر
  startDate: string;
  endDate: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorImage?: string;
  image: string;
  subject: string; // مثل "رياضيات", "فيزياء", "عربي"
  grade: 'الأول الثانوي' | 'الثاني الثانوي' | 'الثالث الثانوي';
  level: 'مبتدئ' | 'متوسط' | 'متقدم';
  price: number;
  discountPrice?: number;
  currency: string; // "ج.م"
  duration: string; // مثل "120 ساعة"
  totalStudents: number;
  rating: number;
  totalRatings: number;
  
  // WhatsApp/Telegram group
  groupLink?: string;
  groupType?: 'whatsapp' | 'telegram';
  
  // Course structure
  months: Month[];
  
  // Course settings
  isActive: boolean;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  courseStartDate: string;
  courseEndDate: string;
  
  // For students
  isEnrolled?: boolean;
  enrollmentDate?: string;
  overallProgress?: number; // النسبة الإجمالية للإكمال
  currentMonth?: number; // الشهر الحالي للطالب
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string; // admin ID
}

export interface StudentProgress {
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  overallProgress: number;
  currentMonth: number;
  completedLectures: string[]; // معرفات المحاضرات المكتملة
  assignmentScores: { [assignmentId: string]: number };
  examScores: { [examId: string]: number };
  totalTimeSpent: number; // بالدقائق
  lastAccessDate: string;
  certificateEarned?: boolean;
  certificateDate?: string;
}

export interface StudentAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpent: number; // بالثواني
  answeredAt: string;
}

export interface StudentAssignmentAttempt {
  id: string;
  studentId: string;
  assignmentId: string;
  courseId: string;
  answers: StudentAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // بالدقائق
  startedAt: string;
  submittedAt: string;
  isCompleted: boolean;
  attempts: number; // عدد المحاولات
}

// Utility types for quiz randomization
export interface RandomizedQuestion extends MCQQuestion {
  displayOrder: number; // الترتيب العشوائي للسؤال
  optionsOrder: number[]; // الترتيب العشوائي للخيارات
}

export interface QuizSession {
  id: string;
  studentId: string;
  assignmentId: string;
  randomizedQuestions: RandomizedQuestion[];
  startTime: string;
  endTime?: string;
  timeRemaining: number; // بالثواني
  currentQuestionIndex: number;
  answers: { [questionId: string]: string }; // questionId -> selectedOptionId
  isSubmitted: boolean;
}
