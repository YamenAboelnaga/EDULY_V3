import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Play,
  Download,
  Clock,
  CheckCircle,
  Lock,
  ArrowLeft,
  FileText,
  ClipboardList,
  Star,
  Users,
  Calendar,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCourses } from "@/contexts/CoursesContext";
import { SessionManager } from "@/utils/session";

interface Month {
  id: string;
  title: string;
  description: string;
  order: number;
  lectures: Lecture[];
  startDate: string;
  endDate: string;
  isUnlocked?: boolean;
  completionPercentage?: number;
}

interface Lecture {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  pdfUrl?: string;
  duration: number;
  order: number;
  assignment?: Assignment;
  createdAt: string;
  isCompleted?: boolean;
  watchedDuration?: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  questions: any[];
  timeLimit: number;
  totalMarks: number;
  passingMarks: number;
}

export default function StudentCourseContentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses } = useCourses();
  
  const [course, setCourse] = useState<any>(null);
  const [months, setMonths] = useState<Month[]>([]);
  const [studentProgress, setStudentProgress] = useState<any>({});
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  // Check student authentication
  useEffect(() => {
    if (!SessionManager.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Redirect admin users to admin content page
    if (SessionManager.isAdmin()) {
      navigate(`/admin/course/${courseId}/content`);
      return;
    }
  }, [navigate, courseId]);

  // Load course data
  useEffect(() => {
    if (courseId) {
      const foundCourse = courses.find(c => c.id === courseId);
      if (foundCourse) {
        setCourse(foundCourse);
        
        // Load months from localStorage (same data as admin)
        const savedMonths = localStorage.getItem(`course_${courseId}_months`);
        if (savedMonths) {
          const parsedMonths = JSON.parse(savedMonths);
          
          // Add student-specific data (progress, unlock status)
          const monthsWithProgress = parsedMonths.map((month: Month, index: number) => ({
            ...month,
            isUnlocked: index === 0 || index <= getUnlockedMonthIndex(),
            completionPercentage: calculateMonthProgress(month),
            lectures: month.lectures.map(lecture => ({
              ...lecture,
              isCompleted: isLectureCompleted(lecture.id),
              watchedDuration: getWatchedDuration(lecture.id)
            }))
          }));
          
          setMonths(monthsWithProgress);
        } else {
          setMonths([]);
        }
        
        // Load student progress
        const progress = localStorage.getItem(`student_progress_${courseId}`);
        if (progress) {
          setStudentProgress(JSON.parse(progress));
        }
      } else {
        navigate('/courses');
      }
    }
  }, [courseId, courses, navigate]);

  const getUnlockedMonthIndex = () => {
    // Logic to determine which months are unlocked based on progress
    return Math.min(2, months.length - 1); // For demo, unlock first 3 months
  };

  const calculateMonthProgress = (month: Month) => {
    if (!month.lectures.length) return 0;
    const completedLectures = month.lectures.filter(lecture => isLectureCompleted(lecture.id)).length;
    return Math.round((completedLectures / month.lectures.length) * 100);
  };

  const isLectureCompleted = (lectureId: string) => {
    return studentProgress.completedLectures?.includes(lectureId) || false;
  };

  const getWatchedDuration = (lectureId: string) => {
    return studentProgress.watchedDurations?.[lectureId] || 0;
  };

  const markLectureAsCompleted = (lectureId: string) => {
    const updatedProgress = {
      ...studentProgress,
      completedLectures: [...(studentProgress.completedLectures || []), lectureId]
    };
    setStudentProgress(updatedProgress);
    localStorage.setItem(`student_progress_${courseId}`, JSON.stringify(updatedProgress));
    
    // Refresh months to update progress
    const refreshedMonths = months.map(month => ({
      ...month,
      completionPercentage: calculateMonthProgress(month),
      lectures: month.lectures.map(lecture => ({
        ...lecture,
        isCompleted: lecture.id === lectureId ? true : isLectureCompleted(lecture.id)
      }))
    }));
    setMonths(refreshedMonths);
  };

  const watchLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    // In a real app, this would open a video player
    alert(`سيتم تشغيل فيديو: ${lecture.title}`);
    
    // For demo, mark as completed after "watching"
    setTimeout(() => {
      markLectureAsCompleted(lecture.id);
    }, 1000);
  };

  const downloadPdf = (lecture: Lecture) => {
    if (lecture.pdfUrl) {
      window.open(lecture.pdfUrl, '_blank');
    }
  };

  const startAssignment = (assignment: Assignment) => {
    // Navigate to assignment page
    alert(`سيتم بدء التكليف: ${assignment.title}`);
  };

  const getOverallProgress = () => {
    if (!months.length) return 0;
    const totalLectures = months.reduce((total, month) => total + month.lectures.length, 0);
    const completedLectures = months.reduce((total, month) => 
      total + month.lectures.filter(lecture => lecture.isCompleted).length, 0
    );
    return totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
  };

  const getTotalDuration = () => {
    return months.reduce((total, month) => 
      total + month.lectures.reduce((monthTotal, lecture) => monthTotal + lecture.duration, 0), 0
    );
  };

  const getCompletedDuration = () => {
    return months.reduce((total, month) => 
      total + month.lectures.filter(lecture => lecture.isCompleted)
        .reduce((monthTotal, lecture) => monthTotal + lecture.duration, 0), 0
    );
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 font-arabic">جاري التحميل...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/courses')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-arabic">{course.title}</h1>
              <p className="text-sm text-gray-500 font-arabic">المدرس: {course.instructor}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="font-arabic">
              {getOverallProgress()}% مكتمل
            </Badge>
            <Badge variant="outline" className="font-arabic">
              {Math.floor(getCompletedDuration() / 60)} / {Math.floor(getTotalDuration() / 60)} ساعة
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Course Progress Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <CardTitle className="font-arabic">تقدمك في الكورس</CardTitle>
                    <p className="text-gray-500 font-arabic">استمر في التعلم لإكمال الكورس</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getOverallProgress()}%</div>
                  <p className="text-sm text-gray-500 font-arabic">مكتمل</p>
                </div>
              </div>
              <Progress value={getOverallProgress()} className="mt-4" />
            </CardHeader>
          </Card>

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{months.length}</div>
                <p className="text-sm text-gray-500 font-arabic">شهر</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{months.reduce((total, month) => total + month.lectures.length, 0)}</div>
                <p className="text-sm text-gray-500 font-arabic">محاضرة</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{Math.floor(getTotalDuration() / 60)}</div>
                <p className="text-sm text-gray-500 font-arabic">ساعة</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{months.reduce((total, month) => total + month.lectures.filter(l => l.isCompleted).length, 0)}</div>
                <p className="text-sm text-gray-500 font-arabic">مكتمل</p>
              </CardContent>
            </Card>
          </div>

          {/* Course Content */}
          <div className="space-y-4">
            {months.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 font-arabic mb-2">المحتوى غير متوفر</h3>
                  <p className="text-gray-500 font-arabic">لم يتم إضافة محتوى لهذا الكورس بعد</p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {months.map((month, index) => (
                  <AccordionItem key={month.id} value={month.id} className="border rounded-lg">
                    <Card>
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 ${month.isUnlocked ? 'bg-blue-600' : 'bg-gray-400'} text-white rounded-lg flex items-center justify-center font-bold`}>
                              {month.isUnlocked ? index + 1 : <Lock className="w-5 h-5" />}
                            </div>
                            <div className="text-right">
                              <h3 className="font-medium font-arabic">{month.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{month.lectures.length} محاضرة</span>
                                <span>{month.completionPercentage}% مكتمل</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!month.isUnlocked && (
                              <Badge variant="secondary" className="font-arabic">
                                مقفل
                              </Badge>
                            )}
                            {month.completionPercentage === 100 && (
                              <Badge variant="default" className="font-arabic bg-green-600">
                                مكتمل
                              </Badge>
                            )}
                            <Progress value={month.completionPercentage || 0} className="w-24" />
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="px-6 pb-4">
                          <div className="mb-4">
                            <p className="text-gray-600 font-arabic">{month.description}</p>
                          </div>
                          
                          {month.isUnlocked ? (
                            <div className="space-y-3">
                              {month.lectures.map((lecture, lectureIndex) => (
                                <motion.div
                                  key={lecture.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: lectureIndex * 0.1 }}
                                  className={`flex items-center gap-4 p-4 border rounded-lg ${lecture.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50'} transition-colors`}
                                >
                                  <div className={`w-8 h-8 ${lecture.isCompleted ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-lg flex items-center justify-center text-sm font-bold`}>
                                    {lecture.isCompleted ? <CheckCircle className="w-5 h-5" /> : lectureIndex + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-medium font-arabic">{lecture.title}</h5>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {lecture.duration} دقيقة
                                      </span>
                                      {lecture.isCompleted && (
                                        <span className="flex items-center gap-1 text-green-600">
                                          <CheckCircle className="w-4 h-4" />
                                          مكتمل
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {lecture.videoUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => watchLecture(lecture)}
                                        className="font-arabic"
                                      >
                                        <Play className="w-4 h-4 ml-1" />
                                        مشاهدة
                                      </Button>
                                    )}
                                    {lecture.pdfUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => downloadPdf(lecture)}
                                        className="font-arabic"
                                      >
                                        <Download className="w-4 h-4 ml-1" />
                                        PDF
                                      </Button>
                                    )}
                                    {lecture.assignment && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startAssignment(lecture.assignment!)}
                                        className="font-arabic"
                                      >
                                        <ClipboardList className="w-4 h-4 ml-1" />
                                        تكليف
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                              <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 font-arabic">يجب إكمال الشهور السابقة أولاً</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
