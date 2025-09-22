import { MCQQuestion, RandomizedQuestion, QuizSession, Assignment } from '@/types/course';

/**
 * خلط الأسئلة والخيارات بشكل عشوائي لكل طالب
 */
export const randomizeQuestions = (questions: MCQQuestion[], studentId: string): RandomizedQuestion[] => {
  // استخدام ID الطالب كـ seed للحصول على نفس العشوائية لنفس الطالب
  const seed = hashString(studentId);
  const rng = createSeededRandom(seed);
  
  // خلط ترتيب الأسئلة
  const shuffledQuestions = [...questions];
  shuffleArray(shuffledQuestions, rng);
  
  return shuffledQuestions.map((question, index) => {
    // خلط ترتيب الخيارات لكل سؤال
    const optionsOrder = Array.from({ length: question.options.length }, (_, i) => i);
    shuffleArray(optionsOrder, rng);
    
    return {
      ...question,
      displayOrder: index + 1,
      optionsOrder
    };
  });
};

/**
 * إنشاء جلسة كويز جديدة للطالب
 */
export const createQuizSession = (
  studentId: string,
  assignment: Assignment
): QuizSession => {
  const randomizedQuestions = randomizeQuestions(assignment.questions, studentId);
  
  return {
    id: generateUniqueId(),
    studentId,
    assignmentId: assignment.id,
    randomizedQuestions,
    startTime: new Date().toISOString(),
    timeRemaining: assignment.timeLimit * 60, // تحويل من دقائق إلى ثواني
    currentQuestionIndex: 0,
    answers: {},
    isSubmitted: false
  };
};

/**
 * تحديث إجابة في جلسة الكويز
 */
export const updateQuizAnswer = (
  session: QuizSession,
  questionId: string,
  selectedOptionId: string
): QuizSession => {
  return {
    ...session,
    answers: {
      ...session.answers,
      [questionId]: selectedOptionId
    }
  };
};

/**
 * التحقق من إجابات الطالب وحساب النتيجة
 */
export const calculateQuizResults = (session: QuizSession) => {
  const results = {
    totalQuestions: session.randomizedQuestions.length,
    correctAnswers: 0,
    incorrectAnswers: 0,
    unansweredQuestions: 0,
    score: 0,
    percentage: 0,
    questionResults: [] as {
      questionId: string;
      isCorrect: boolean;
      correctOptionId: string;
      selectedOptionId?: string;
      status: 'correct' | 'incorrect' | 'unanswered';
    }[]
  };

  session.randomizedQuestions.forEach(question => {
    const selectedOptionId = session.answers[question.id];
    const correctOption = question.options.find(opt => opt.isCorrect);
    const isCorrect = selectedOptionId === correctOption?.id;
    
    let status: 'correct' | 'incorrect' | 'unanswered' = 'unanswered';
    
    if (selectedOptionId) {
      if (isCorrect) {
        results.correctAnswers++;
        status = 'correct';
      } else {
        results.incorrectAnswers++;
        status = 'incorrect';
      }
    } else {
      results.unansweredQuestions++;
    }

    results.questionResults.push({
      questionId: question.id,
      isCorrect,
      correctOptionId: correctOption?.id || '',
      selectedOptionId,
      status
    });
  });

  results.score = results.correctAnswers;
  results.percentage = (results.correctAnswers / results.totalQuestions) * 100;

  return results;
};

/**
 * التحقق من حالة الأسئلة (محلولة، غير محلولة، إلخ)
 */
export const getQuestionStatuses = (session: QuizSession) => {
  return session.randomizedQuestions.map(question => ({
    questionId: question.id,
    displayOrder: question.displayOrder,
    isAnswered: !!session.answers[question.id],
    isCurrentQuestion: session.randomizedQuestions[session.currentQuestionIndex]?.id === question.id
  }));
};

/**
 * تحديث الوقت المتبقي
 */
export const updateTimeRemaining = (session: QuizSession): QuizSession => {
  const now = new Date().getTime();
  const startTime = new Date(session.startTime).getTime();
  const elapsedSeconds = Math.floor((now - startTime) / 1000);
  const timeRemaining = Math.max(0, (session.timeRemaining || 0) - elapsedSeconds);
  
  return {
    ...session,
    timeRemaining
  };
};

/**
 * تنسيق الوقت للعرض
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Helper functions

/**
 * تحويل نص إلى hash number
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * إنشاء مولد أرقام عشوائية مع seed
 */
const createSeededRandom = (seed: number) => {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
};

/**
 * خلط مصفوفة باستخدام مولد عشوائي
 */
const shuffleArray = <T>(array: T[], rng: () => number): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

/**
 * إنشاء معرف فريد
 */
const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * حفظ جلسة كويز في localStorage
 */
export const saveQuizSession = (session: QuizSession): void => {
  try {
    localStorage.setItem(`quiz_session_${session.id}`, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save quiz session:', error);
  }
};

/**
 * استرجاع جلسة كويز من localStorage
 */
export const loadQuizSession = (sessionId: string): QuizSession | null => {
  try {
    const saved = localStorage.getItem(`quiz_session_${sessionId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load quiz session:', error);
    return null;
  }
};

/**
 * حذف جلسة كويز من localStorage
 */
export const clearQuizSession = (sessionId: string): void => {
  try {
    localStorage.removeItem(`quiz_session_${sessionId}`);
  } catch (error) {
    console.error('Failed to clear quiz session:', error);
  }
};

/**
 * التحقق من انتهاء وقت الكويز وتسليم تلقائي
 */
export const checkAutoSubmit = (session: QuizSession): boolean => {
  const updatedSession = updateTimeRemaining(session);
  return updatedSession.timeRemaining <= 0;
};
