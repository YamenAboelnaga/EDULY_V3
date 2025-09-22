import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, Trophy, RotateCcw, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface QuizSystemProps {
  questions: Question[];
  title: string;
  timeLimit: number; // in minutes
  type: 'assignment' | 'exam';
  passingScore: number;
  onComplete: (results: QuizResults) => void;
  onExit?: () => void;
}

interface QuizResults {
  score: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  passed: boolean;
  answers: { questionId: number; selectedAnswer: number; isCorrect: boolean }[];
}

// Shuffle function for randomization
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Randomize question order and option order
const randomizeQuestions = (questions: Question[]): Question[] => {
  const shuffledQuestions = shuffleArray(questions);
  
  return shuffledQuestions.map(question => ({
    ...question,
    options: shuffleArray(question.options.map((option, index) => ({ option, originalIndex: index })))
      .map(item => item.option),
    // Update correct answer index based on shuffled options
    correctAnswer: shuffleArray(question.options.map((option, index) => ({ option, originalIndex: index })))
      .findIndex(item => item.originalIndex === question.correctAnswer)
  }));
};

export function QuizSystem({ 
  questions, 
  title, 
  timeLimit, 
  type, 
  passingScore, 
  onComplete, 
  onExit 
}: QuizSystemProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Initialize randomized questions on component mount
  useEffect(() => {
    if (questions.length > 0) {
      // Randomize questions but limit the number (e.g., select 20 random questions for exams)
      const questionLimit = type === 'exam' ? Math.min(20, questions.length) : questions.length;
      const selectedQuestions = shuffleArray(questions).slice(0, questionLimit);
      setRandomizedQuestions(randomizeQuestions(selectedQuestions));
    }
  }, [questions, type]);

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, quizCompleted, timeRemaining]);

  // Detect tab switching / focus loss for anti-cheating
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && quizStarted && !quizCompleted) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            toast({
              title: "تحذير أمني",
              description: "تم اكتشاف محاولات غش متعددة. سيتم إنهاء الامتحان.",
              variant: "destructive"
            });
            handleTimeUp();
          } else {
            toast({
              title: "تحذير",
              description: `لا تغادر صفحة الامتحان. التحذير ${newCount}/3`,
              variant: "destructive"
            });
          }
          return newCount;
        });
      }
    };

    const handleRightClick = (e: MouseEvent) => {
      if (quizStarted && !quizCompleted) {
        e.preventDefault();
        setWarningCount(prev => prev + 1);
        toast({
          title: "غير مسموح",
          description: "النقر بالزر الأيمن غير مسموح أثناء الامتحان",
          variant: "destructive"
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizStarted && !quizCompleted) {
        // Prevent F12, Ctrl+Shift+I, Ctrl+U, etc.
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C')
        ) {
          e.preventDefault();
          setWarningCount(prev => prev + 1);
          toast({
            title: "غير مسموح",
            description: "اختصارات لوحة المفاتيح غير مسموحة أثناء الامتحان",
            variant: "destructive"
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleRightClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleRightClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [quizStarted, quizCompleted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startQuiz = () => {
    setQuizStarted(true);
    toast({
      title: "بدء الامتحان",
      description: `لديك ${timeLimit} دقيقة لإكمال ${randomizedQuestions.length} سؤال`,
    });
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < randomizedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleTimeUp = () => {
    toast({
      title: "انتهى الوقت",
      description: "تم إنهاء الامتحان تلقائياً",
      variant: "destructive"
    });
    completeQuiz();
  };

  const completeQuiz = () => {
    setQuizCompleted(true);
    
    const answers = randomizedQuestions.map(question => {
      const selectedAnswer = selectedAnswers[question.id];
      const isCorrect = selectedAnswer === question.correctAnswer;
      return {
        questionId: question.id,
        selectedAnswer: selectedAnswer ?? -1,
        isCorrect
      };
    });

    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    const percentage = Math.round((correctAnswers / randomizedQuestions.length) * 100);
    const timeSpent = (timeLimit * 60) - timeRemaining;
    const passed = percentage >= passingScore;

    const quizResults: QuizResults = {
      score: correctAnswers,
      percentage,
      correctAnswers,
      totalQuestions: randomizedQuestions.length,
      timeSpent,
      passed,
      answers
    };

    setResults(quizResults);
    setShowResults(true);

    toast({
      title: passed ? "تهانينا! 🎉" : "يحتاج للمراجعة",
      description: `حصلت على ${percentage}% (${correctAnswers}/${randomizedQuestions.length})`,
      variant: passed ? "default" : "destructive"
    });

    onComplete(quizResults);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeRemaining(timeLimit * 60);
    setQuizStarted(false);
    setQuizCompleted(false);
    setShowResults(false);
    setResults(null);
    setShowExplanations(false);
    setWarningCount(0);
    setTabSwitchCount(0);
    // Re-randomize questions
    const questionLimit = type === 'exam' ? Math.min(20, questions.length) : questions.length;
    const selectedQuestions = shuffleArray(questions).slice(0, questionLimit);
    setRandomizedQuestions(randomizeQuestions(selectedQuestions));
  };

  if (randomizedQuestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 font-arabic">لا توجد أسئلة متاحة</h3>
          <p className="text-muted-foreground font-arabic">يرجى المحاولة مرة أخرى لاحقاً</p>
        </CardContent>
      </Card>
    );
  }

  // Quiz Start Screen
  if (!quizStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-arabic">{title}</CardTitle>
          <div className="flex justify-center gap-6 mt-4">
            <Badge variant="outline" className="font-arabic text-lg px-4 py-2">
              {type === 'exam' ? 'امتحان' : 'واجب'}
            </Badge>
            <Badge variant="secondary" className="font-arabic text-lg px-4 py-2">
              {randomizedQuestions.length} سؤال
            </Badge>
            <Badge variant="secondary" className="font-arabic text-lg px-4 py-2">
              {timeLimit} دقيقة
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="font-bold mb-4 font-arabic text-lg">تعليمات هامة:</h3>
            <ul className="space-y-2 text-sm font-arabic">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                لديك {timeLimit} دقيقة لإكمال {randomizedQuestions.length} سؤال
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                الدرجة المطلوبة للنجاح: {passingScore}%
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                الأسئلة معروضة بترتيب عشوائي لمنع الغش
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                لا تغادر صفحة الامتحان أو تفتح نوافذ أخرى
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                سيتم إنهاء الامتحان تلقائياً عند انتهاء الوقت
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                النقر بالزر الأيمن أو استخدام اختصارات لوحة المفاتيح غير مسموح
              </li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Button 
              onClick={startQuiz}
              className="btn-primary font-arabic text-lg px-8 py-4"
            >
              <Trophy className="w-5 h-5 ml-2" />
              بدء {type === 'exam' ? 'الامتحان' : 'الواجب'}
            </Button>
            {onExit && (
              <Button 
                variant="outline" 
                onClick={onExit}
                className="font-arabic text-lg px-8 py-4"
              >
                إلغاء
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz Results Screen
  if (showResults && results) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Summary */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              results.passed ? 'bg-success' : 'bg-destructive'
            }`}>
              {results.passed ? (
                <Trophy className="w-10 h-10 text-white" />
              ) : (
                <XCircle className="w-10 h-10 text-white" />
              )}
            </div>
            <CardTitle className="text-3xl font-bold font-arabic">
              {results.passed ? 'تهانينا! نجحت في الامتحان' : 'للأسف، لم تحقق الدرجة المطلوبة'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-primary">{results.percentage}%</div>
                <div className="text-sm text-muted-foreground font-arabic">النتيجة النهائية</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-success">{results.correctAnswers}</div>
                <div className="text-sm text-muted-foreground font-arabic">إجابات صحيحة</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-destructive">{results.totalQuestions - results.correctAnswers}</div>
                <div className="text-sm text-muted-foreground font-arabic">إجابات خاطئة</div>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-primary">{formatTime(results.timeSpent)}</div>
                <div className="text-sm text-muted-foreground font-arabic">الوقت المستغرق</div>
              </div>
            </div>

            <div className="mt-6 flex gap-4 justify-center">
              <Button 
                onClick={() => setShowExplanations(!showExplanations)}
                variant="outline"
                className="font-arabic"
              >
                {showExplanations ? <EyeOff className="w-4 h-4 ml-2" /> : <Eye className="w-4 h-4 ml-2" />}
                {showExplanations ? 'إخفاء' : 'عرض'} الشرح والإجابات
              </Button>
              <Button 
                onClick={restartQuiz}
                variant="outline"
                className="font-arabic"
              >
                <RotateCcw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </Button>
              {onExit && (
                <Button 
                  onClick={onExit}
                  className="btn-primary font-arabic"
                >
                  العودة للكورس
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Review */}
        {showExplanations && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="font-arabic text-2xl">مراجعة تفصيلية للأسئلة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {randomizedQuestions.map((question, index) => {
                const userAnswer = results.answers.find(a => a.questionId === question.id);
                const isCorrect = userAnswer?.isCorrect ?? false;
                
                return (
                  <div key={question.id} className="border rounded-lg p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        isCorrect ? 'bg-success' : 'bg-destructive'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg font-arabic mb-4">{question.question}</h3>
                        
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => {
                            const isUserAnswer = userAnswer?.selectedAnswer === optionIndex;
                            const isCorrectAnswer = optionIndex === question.correctAnswer;
                            
                            return (
                              <div 
                                key={optionIndex}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrectAnswer 
                                    ? 'border-success bg-success/10' 
                                    : isUserAnswer 
                                    ? 'border-destructive bg-destructive/10'
                                    : 'border-border'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                                    isCorrectAnswer 
                                      ? 'bg-success' 
                                      : isUserAnswer 
                                      ? 'bg-destructive' 
                                      : 'bg-muted-foreground'
                                  }`}>
                                    {String.fromCharCode(65 + optionIndex)}
                                  </div>
                                  <span className="font-arabic">{option}</span>
                                  {isCorrectAnswer && (
                                    <CheckCircle className="w-5 h-5 text-success mr-auto" />
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <XCircle className="w-5 h-5 text-destructive mr-auto" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {question.explanation && (
                          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                            <h4 className="font-bold font-arabic mb-2">الشرح:</h4>
                            <p className="font-arabic text-muted-foreground">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Quiz Interface
  const currentQuestion = randomizedQuestions[currentQuestionIndex];
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const progress = ((currentQuestionIndex + 1) / randomizedQuestions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Timer and Progress */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 text-lg font-bold ${
                timeRemaining < 300 ? 'text-destructive' : 'text-foreground'
              }`}>
                <Clock className="w-5 h-5" />
                {formatTime(timeRemaining)}
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="text-sm text-muted-foreground font-arabic">
                السؤال {currentQuestionIndex + 1} من {randomizedQuestions.length}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground font-arabic">
                تم الإجابة على {answeredQuestions} أسئلة
              </div>
              <Progress value={progress} className="w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-arabic">
              السؤال {currentQuestionIndex + 1}
            </CardTitle>
            <Badge variant="outline" className="font-arabic">
              {currentQuestion.difficulty === 'easy' ? 'سهل' : 
               currentQuestion.difficulty === 'medium' ? 'متوسط' : 'صعب'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <h2 className="text-xl font-bold font-arabic leading-relaxed">
            {currentQuestion.question}
          </h2>

          <RadioGroup
            value={selectedAnswers[currentQuestion.id]?.toString() || ""}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 space-x-reverse p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 font-arabic text-lg cursor-pointer"
                >
                  <span className="font-bold ml-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="font-arabic"
        >
          السؤال السابق
        </Button>

        <div className="flex gap-2">
          {randomizedQuestions.map((_, index) => (
            <Button
              key={index}
              variant={index === currentQuestionIndex ? "default" : "outline"}
              size="sm"
              onClick={() => goToQuestion(index)}
              className={`w-10 h-10 ${
                selectedAnswers[randomizedQuestions[index].id] !== undefined
                  ? 'bg-success hover:bg-success/90 text-white' 
                  : ''
              }`}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        <div className="flex gap-3">
          {currentQuestionIndex === randomizedQuestions.length - 1 ? (
            <Button
              onClick={completeQuiz}
              className="btn-primary font-arabic"
              disabled={answeredQuestions < randomizedQuestions.length}
            >
              <Trophy className="w-4 h-4 ml-2" />
              إنهاء {type === 'exam' ? 'الامتحان' : 'الواجب'}
            </Button>
          ) : (
            <Button
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === randomizedQuestions.length - 1}
              className="font-arabic"
            >
              السؤال التالي
            </Button>
          )}
        </div>
      </div>

      {/* Security Warnings */}
      {(warningCount > 0 || tabSwitchCount > 0) && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span className="font-arabic font-bold">تحذيرات أمنية:</span>
              {warningCount > 0 && <span className="font-arabic">النقر الأيمن: {warningCount}</span>}
              {tabSwitchCount > 0 && <span className="font-arabic">تغيير التبويب: {tabSwitchCount}/3</span>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
