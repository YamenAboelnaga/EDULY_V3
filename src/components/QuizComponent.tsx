import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  Eye,
  EyeOff,
  RotateCcw,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Assignment, QuizSession } from '@/types/course';
import {
  createQuizSession,
  updateQuizAnswer,
  calculateQuizResults,
  getQuestionStatuses,
  updateTimeRemaining,
  formatTime,
  saveQuizSession,
  checkAutoSubmit
} from '@/utils/quiz';
import { sanitizeHtml } from '@/utils/security';

interface QuizComponentProps {
  assignment: Assignment;
  studentId: string;
  onComplete?: (results: any) => void;
  onClose?: () => void;
}

export default function QuizComponent({ assignment, studentId, onComplete, onClose }: QuizComponentProps) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);

  // Initialize quiz session
  useEffect(() => {
    const newSession = createQuizSession(studentId, assignment);
    setSession(newSession);
    saveQuizSession(newSession);
  }, [assignment, studentId]);

  // Timer effect
  useEffect(() => {
    if (!session || session.isSubmitted || showResults) return;

    const timer = setInterval(() => {
      setSession(prevSession => {
        if (!prevSession) return null;
        
        const updatedSession = updateTimeRemaining(prevSession);
        saveQuizSession(updatedSession);

        // Check for time warnings
        if (updatedSession.timeRemaining <= 300 && updatedSession.timeRemaining > 60) { // 5 minutes
          setTimeWarning(true);
        }

        // Auto submit when time runs out
        if (checkAutoSubmit(updatedSession)) {
          handleTimeUp(updatedSession);
          return { ...updatedSession, isSubmitted: true };
        }

        return updatedSession;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.id, showResults]);

  const handleTimeUp = useCallback((currentSession: QuizSession) => {
    const quizResults = calculateQuizResults(currentSession);
    setResults(quizResults);
    setShowResults(true);
    if (onComplete) {
      onComplete(quizResults);
    }
  }, [onComplete]);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (!session || session.isSubmitted) return;

    const updatedSession = updateQuizAnswer(session, questionId, optionId);
    setSession(updatedSession);
    saveQuizSession(updatedSession);
  };

  const navigateToQuestion = (index: number) => {
    if (!session || session.isSubmitted) return;
    
    setSession(prev => prev ? { ...prev, currentQuestionIndex: index } : null);
  };

  const handleSubmit = () => {
    if (!session) return;
    
    const quizResults = calculateQuizResults(session);
    setResults(quizResults);
    setSession(prev => prev ? { ...prev, isSubmitted: true } : null);
    setShowResults(true);
    setShowConfirmSubmit(false);
    
    if (onComplete) {
      onComplete(quizResults);
    }
  };

  const getQuestionStatusColor = (status: 'correct' | 'incorrect' | 'unanswered') => {
    switch (status) {
      case 'correct': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'incorrect': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'unanswered': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      default: return 'bg-gray-300 hover:bg-gray-400';
    }
  };

  const getQuestionStatusIcon = (status: 'correct' | 'incorrect' | 'unanswered') => {
    switch (status) {
      case 'correct': return <CheckCircle className="w-4 h-4" />;
      case 'incorrect': return <XCircle className="w-4 h-4" />;
      case 'unanswered': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-arabic">جاري تحضير الامتحان...</p>
        </div>
      </div>
    );
  }

  const questionStatuses = getQuestionStatuses(session);
  const currentQuestion = session.randomizedQuestions[session.currentQuestionIndex];
  const answeredQuestions = Object.keys(session.answers).length;
  const progressPercentage = (answeredQuestions / session.randomizedQuestions.length) * 100;

  if (showResults && results) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto p-6"
      >
        <Card className="border-2">
          <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-green-50">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-arabic">نتائج الامتحان</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* النتيجة الإجمالية */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-primary mb-2">
                {results.percentage.toFixed(1)}%
              </div>
              <p className="text-xl text-gray-600 font-arabic">
                {results.correctAnswers} من {results.totalQuestions} إجابة صحيحة
              </p>
            </div>

            {/* إحصائيات مفصلة */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600 mb-1">{results.correctAnswers}</div>
                <div className="text-sm text-green-700 font-arabic">إجابات صحيحة</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-600 mb-1">{results.incorrectAnswers}</div>
                <div className="text-sm text-red-700 font-arabic">إجابات خاطئة</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl">
                <div className="text-2xl font-bold text-yellow-600 mb-1">{results.unansweredQuestions}</div>
                <div className="text-sm text-yellow-700 font-arabic">لم يتم الإجابة</div>
              </div>
            </div>

            {/* عرض تفصيلي للأسئلة */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 font-arabic">مراجعة الأسئلة</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {results.questionResults.map((result: any, index: number) => (
                  <div
                    key={result.questionId}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${getQuestionStatusColor(result.status)}`}
                    title={`السؤال ${index + 1}: ${result.status === 'correct' ? 'صحيح' : result.status === 'incorrect' ? 'خاطئ' : 'لم يتم الإجابة'}`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="font-arabic"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للكورس
              </Button>
              <Button
                onClick={() => {
                  // إعادة المحاولة
                  const newSession = createQuizSession(studentId, assignment);
                  setSession(newSession);
                  setShowResults(false);
                  setResults(null);
                }}
                className="font-arabic"
              >
                <RotateCcw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with timer and progress */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold font-arabic">{assignment.title}</h1>
              <p className="text-sm text-gray-600 font-arabic">
                السؤال {session.currentQuestionIndex + 1} من {session.randomizedQuestions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="w-32">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-arabic">التقدم</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Timer */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeWarning ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg font-bold">
                  {formatTime(session.timeRemaining)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Questions Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-arabic">الأسئلة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {questionStatuses.map((status, index) => (
                  <Button
                    key={status.questionId}
                    variant={status.isCurrentQuestion ? "default" : "outline"}
                    size="sm"
                    className={`w-10 h-10 p-0 ${
                      status.isAnswered ? 'bg-green-100 border-green-300 text-green-700' : ''
                    }`}
                    onClick={() => navigateToQuestion(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="font-arabic">مُجاب عليه</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                  <span className="font-arabic">لم يُجاب عليه</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Question */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={session.currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-8">
                  {/* Question */}
                  <div className="mb-8">
                    <Badge className="mb-4 font-arabic">
                      السؤال {session.currentQuestionIndex + 1}
                    </Badge>
                    
                    {currentQuestion.questionType === 'image' ? (
                      <div className="mb-6">
                        <img
                          src={currentQuestion.question}
                          alt={`السؤال ${session.currentQuestionIndex + 1}`}
                          className="max-w-full h-auto rounded-lg border shadow-sm"
                        />
                      </div>
                    ) : (
                      <h2
                        className="text-xl font-medium leading-relaxed font-arabic mb-6"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentQuestion.question) }}
                      />
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-4 mb-8">
                    {currentQuestion.optionsOrder.map((optionIndex, displayIndex) => {
                      const option = currentQuestion.options[optionIndex];
                      const isSelected = session.answers[currentQuestion.id] === option.id;
                      
                      return (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: displayIndex * 0.1 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                              isSelected 
                                ? 'border-2 border-primary bg-primary/5' 
                                : 'border-2 border-transparent hover:border-gray-200'
                            }`}
                            onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                                }`}>
                                  {isSelected && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                </div>
                                <span
                                  className="font-arabic text-lg"
                                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(option.text) }}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => navigateToQuestion(session.currentQuestionIndex - 1)}
                      disabled={session.currentQuestionIndex === 0}
                      className="font-arabic"
                    >
                      <ArrowRight className="w-4 h-4 ml-2" />
                      السؤال السابق
                    </Button>

                    <div className="flex gap-3">
                      {session.currentQuestionIndex === session.randomizedQuestions.length - 1 ? (
                        <Button
                          onClick={() => setShowConfirmSubmit(true)}
                          className="bg-green-600 hover:bg-green-700 font-arabic"
                          disabled={answeredQuestions === 0}
                        >
                          <Send className="w-4 h-4 ml-2" />
                          تسليم الامتحان
                        </Button>
                      ) : (
                        <Button
                          onClick={() => navigateToQuestion(session.currentQuestionIndex + 1)}
                          className="font-arabic"
                        >
                          السؤال التالي
                          <ArrowLeft className="w-4 h-4 mr-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-arabic">تأكيد تسليم الامتحان</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 font-arabic">
              هل أنت متأكد من تسليم الامتحان؟ لن تتمكن من تعديل إجاباتك بعد التسليم.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-arabic mb-2">ملخص الإجابات:</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>تم الإجابة: {answeredQuestions}</div>
                <div>لم يتم الإجابة: {session.randomizedQuestions.length - answeredQuestions}</div>
                <div>المجموع: {session.randomizedQuestions.length}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmSubmit(false)}
              className="font-arabic"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 font-arabic"
            >
              تأكيد التسليم
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Warning Alert */}
      {timeWarning && (
        <Alert className="fixed bottom-4 right-4 w-80 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 font-arabic">
            تحذير: باقي أقل من 5 دقائق على انتهاء الوقت!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
