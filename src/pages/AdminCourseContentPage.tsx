import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Save,
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  FileText,
  ClipboardList,
  Users,
  Eye,
  Settings,
  Upload,
  Play,
  Download,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
}

interface ContentItem {
  id: string;
  type: 'video' | 'file' | 'assignment' | 'exam';
  title: string;
  url?: string;
  order: number;
  data?: Assignment | Exam;
}

interface Lecture {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  contentItems: ContentItem[];
  assignment?: Assignment;
  exam?: Exam;
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  questions: MCQQuestion[];
  timeLimit: number;
  totalMarks: number;
  passingMarks: number;
  solutionVideoUrl?: string;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  questions: MCQQuestion[];
  timeLimit: number;
  totalMarks: number;
  passingMarks: number;
  solutionVideoUrl?: string;
  examType: 'quiz' | 'midterm' | 'final';
}

interface MCQQuestion {
  id: string;
  question: string;
  questionType: 'text' | 'image';
  questionImageUrl?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
}

const initialMonth: Omit<Month, 'id' | 'lectures'> = {
  title: "",
  description: "",
  order: 1,
  startDate: "",
  endDate: ""
};

const initialLecture: Omit<Lecture, 'id' | 'createdAt'> = {
  title: "",
  description: "",
  videoUrl: "",
  pdfUrl: "",
  duration: 0,
  order: 1
};

const initialAssignment: Omit<Assignment, 'id'> = {
  title: "",
  description: "",
  questions: [],
  timeLimit: 60,
  totalMarks: 100,
  passingMarks: 50,
  solutionVideoUrl: ""
};

const initialExam: Omit<Exam, 'id'> = {
  title: "",
  description: "",
  questions: [],
  timeLimit: 90,
  totalMarks: 100,
  passingMarks: 60,
  solutionVideoUrl: "",
  examType: 'quiz'
};

export default function AdminCourseContentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, updateCourse } = useCourses();
  
  const [course, setCourse] = useState<any>(null);
  const [months, setMonths] = useState<Month[]>([]);
  const [isAddMonthOpen, setIsAddMonthOpen] = useState(false);
  const [isEditMonthOpen, setIsEditMonthOpen] = useState(false);
  const [isDeleteMonthOpen, setIsDeleteMonthOpen] = useState(false);
  const [isAddLectureOpen, setIsAddLectureOpen] = useState(false);
  const [isEditLectureOpen, setIsEditLectureOpen] = useState(false);
  const [isDeleteLectureOpen, setIsDeleteLectureOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  
  const [monthForm, setMonthForm] = useState(initialMonth);
  const [lectureForm, setLectureForm] = useState(initialLecture);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignment);
  const [examForm, setExamForm] = useState(initialExam);
  const [editingMonthId, setEditingMonthId] = useState<string | null>(null);
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const [deletingMonthId, setDeletingMonthId] = useState<string | null>(null);
  const [deletingLectureId, setDeletingLectureId] = useState<string | null>(null);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [currentQuestionForm, setCurrentQuestionForm] = useState<MCQQuestion>({
    id: "",
    question: "",
    questionType: 'text',
    questionImageUrl: "",
    options: [
      { id: "1", text: "", isCorrect: false },
      { id: "2", text: "", isCorrect: false },
      { id: "3", text: "", isCorrect: false },
      { id: "4", text: "", isCorrect: false }
    ],
    explanation: ""
  });
  const [isManagingAssignment, setIsManagingAssignment] = useState(false);
  const [isManagingExam, setIsManagingExam] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [questionType, setQuestionType] = useState<'assignment' | 'exam'>('assignment');
  const [lectureVideos, setLectureVideos] = useState<Array<{id: string, title: string, url: string, duration: number}>>([]);
  const [lectureFiles, setLectureFiles] = useState<Array<{id: string, title: string, url: string}>>([]);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({title: '', url: '', duration: 0});
  const [currentFile, setCurrentFile] = useState({title: '', url: ''});

  // Check admin authentication
  useEffect(() => {
    if (!SessionManager.isAuthenticated() || !SessionManager.isAdmin()) {
      navigate('/admin');
      return;
    }
  }, [navigate]);

  // Load course data
  useEffect(() => {
    if (courseId) {
      const foundCourse = courses.find(c => c.id === courseId);
      if (foundCourse) {
        setCourse(foundCourse);
        // Load months from localStorage or initialize empty
        const savedMonths = localStorage.getItem(`course_${courseId}_months`);
        if (savedMonths) {
          setMonths(JSON.parse(savedMonths));
        } else {
          setMonths([]);
        }
      } else {
        navigate('/admin/dashboard');
      }
    }
  }, [courseId, courses, navigate]);

  const saveMonthsToStorage = (updatedMonths: Month[]) => {
    if (courseId) {
      localStorage.setItem(`course_${courseId}_months`, JSON.stringify(updatedMonths));
      setMonths(updatedMonths);
    }
  };

  const handleAddMonth = () => {
    const newMonth: Month = {
      ...monthForm,
      id: Date.now().toString(),
      lectures: [],
      order: months.length + 1
    };
    const updatedMonths = [...months, newMonth];
    saveMonthsToStorage(updatedMonths);
    setIsAddMonthOpen(false);
    setMonthForm(initialMonth);
  };

  const handleEditMonth = (month: Month) => {
    setMonthForm({
      title: month.title,
      description: month.description,
      order: month.order,
      startDate: month.startDate,
      endDate: month.endDate
    });
    setEditingMonthId(month.id);
    setIsEditMonthOpen(true);
  };

  const handleUpdateMonth = () => {
    if (editingMonthId) {
      const updatedMonths = months.map(month =>
        month.id === editingMonthId
          ? { ...month, ...monthForm }
          : month
      );
      saveMonthsToStorage(updatedMonths);
      setIsEditMonthOpen(false);
      setEditingMonthId(null);
      setMonthForm(initialMonth);
    }
  };

  const handleDeleteMonth = (monthId: string) => {
    setDeletingMonthId(monthId);
    setIsDeleteMonthOpen(true);
  };

  const confirmDeleteMonth = () => {
    if (deletingMonthId) {
      const updatedMonths = months.filter(month => month.id !== deletingMonthId);
      saveMonthsToStorage(updatedMonths);
      setIsDeleteMonthOpen(false);
      setDeletingMonthId(null);
    }
  };

  const handleAddLecture = (monthId: string) => {
    setSelectedMonthId(monthId);
    const monthLectures = months.find(m => m.id === monthId)?.lectures || [];
    setLectureForm({
      ...initialLecture,
      order: monthLectures.length + 1
    });
    setIsAddLectureOpen(true);
  };

  const handleSaveLecture = () => {
    handleSaveLectureWithContent();
  };

  const handleEditLecture = (lecture: Lecture, monthId: string) => {
    setLectureForm({
      title: lecture.title,
      description: lecture.description,
      videoUrl: lecture.videoUrl || "",
      pdfUrl: lecture.pdfUrl || "",
      duration: lecture.duration,
      order: lecture.order
    });

    // Load existing assignment data
    if (lecture.assignment) {
      setAssignmentForm({
        title: lecture.assignment.title,
        description: lecture.assignment.description,
        questions: lecture.assignment.questions,
        timeLimit: lecture.assignment.timeLimit,
        totalMarks: lecture.assignment.totalMarks,
        passingMarks: lecture.assignment.passingMarks,
        solutionVideoUrl: lecture.assignment.solutionVideoUrl || ""
      });
      setIsManagingAssignment(true);
    }

    // Load existing exam data
    if (lecture.exam) {
      setExamForm({
        title: lecture.exam.title,
        description: lecture.exam.description,
        questions: lecture.exam.questions,
        timeLimit: lecture.exam.timeLimit,
        totalMarks: lecture.exam.totalMarks,
        passingMarks: lecture.exam.passingMarks,
        solutionVideoUrl: lecture.exam.solutionVideoUrl || "",
        examType: lecture.exam.examType
      });
      setIsManagingExam(true);
    }

    setEditingLectureId(lecture.id);
    setSelectedMonthId(monthId);
    setIsEditLectureOpen(true);
  };

  const handleUpdateLecture = () => {
    handleSaveLectureWithContent();
  };

  const handleDeleteLecture = (lectureId: string, monthId: string) => {
    setDeletingLectureId(lectureId);
    setSelectedMonthId(monthId);
    setIsDeleteLectureOpen(true);
  };

  const confirmDeleteLecture = () => {
    if (deletingLectureId && selectedMonthId) {
      const updatedMonths = months.map(month =>
        month.id === selectedMonthId
          ? {
              ...month,
              lectures: month.lectures.filter(lecture => lecture.id !== deletingLectureId)
            }
          : month
      );

      saveMonthsToStorage(updatedMonths);
      setIsDeleteLectureOpen(false);
      setDeletingLectureId(null);
      setSelectedMonthId(null);
    }
  };

  const addVideo = () => {
    if (!currentVideo.title.trim() || !currentVideo.url.trim() || currentVideo.duration <= 0) {
      alert("يرجى ملء جميع بيانات الفيديو");
      return;
    }

    const newVideo = {
      id: Date.now().toString(),
      title: currentVideo.title,
      url: currentVideo.url,
      duration: currentVideo.duration
    };

    setLectureVideos([...lectureVideos, newVideo]);
    setCurrentVideo({title: '', url: '', duration: 0});
    setIsAddingVideo(false);

    // Update total lecture duration
    const totalDuration = [...lectureVideos, newVideo].reduce((sum, video) => sum + video.duration, 0);
    setLectureForm({ ...lectureForm, duration: totalDuration });
  };

  const removeVideo = (videoId: string) => {
    const updatedVideos = lectureVideos.filter(v => v.id !== videoId);
    setLectureVideos(updatedVideos);

    // Update total lecture duration
    const totalDuration = updatedVideos.reduce((sum, video) => sum + video.duration, 0);
    setLectureForm({ ...lectureForm, duration: totalDuration });
  };

  const addFile = () => {
    if (!currentFile.title.trim() || !currentFile.url.trim()) {
      alert("يرجى ملء جميع بيانات الملف");
      return;
    }

    const newFile = {
      id: Date.now().toString(),
      title: currentFile.title,
      url: currentFile.url
    };

    setLectureFiles([...lectureFiles, newFile]);
    setCurrentFile({title: '', url: ''});
    setIsAddingFile(false);
  };

  const removeFile = (fileId: string) => {
    setLectureFiles(lectureFiles.filter(f => f.id !== fileId));
  };

  const handleAddQuestion = () => {
    setCurrentQuestionForm({
      id: Date.now().toString(),
      question: "",
      questionType: 'text',
      questionImageUrl: "",
      options: [
        { id: "1", text: "", isCorrect: false },
        { id: "2", text: "", isCorrect: false },
        { id: "3", text: "", isCorrect: false },
        { id: "4", text: "", isCorrect: false }
      ],
      explanation: ""
    });
    setEditingQuestionIndex(null);
    setIsAddingQuestion(true);
  };

  const handleSaveQuestion = () => {
    if (!currentQuestionForm.question.trim()) {
      alert("يرجى كتابة السؤال");
      return;
    }

    const hasCorrectAnswer = currentQuestionForm.options.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      alert("يرجى اختيار الإجابة الصحيحة");
      return;
    }

    if (questionType === 'assignment') {
      const updatedQuestions = editingQuestionIndex !== null
        ? assignmentForm.questions.map((q, index) =>
            index === editingQuestionIndex ? currentQuestionForm : q
          )
        : [...assignmentForm.questions, currentQuestionForm];

      setAssignmentForm({ ...assignmentForm, questions: updatedQuestions });
    } else {
      const updatedQuestions = editingQuestionIndex !== null
        ? examForm.questions.map((q, index) =>
            index === editingQuestionIndex ? currentQuestionForm : q
          )
        : [...examForm.questions, currentQuestionForm];

      setExamForm({ ...examForm, questions: updatedQuestions });
    }

    setIsAddingQuestion(false);
    setEditingQuestionIndex(null);
  };

  const handleEditQuestion = (questionIndex: number, type: 'assignment' | 'exam') => {
    const question = type === 'assignment'
      ? assignmentForm.questions[questionIndex]
      : examForm.questions[questionIndex];

    setCurrentQuestionForm(question);
    setEditingQuestionIndex(questionIndex);
    setQuestionType(type);
    setIsAddingQuestion(true);
  };

  const handleDeleteQuestion = (questionIndex: number, type: 'assignment' | 'exam') => {
    if (type === 'assignment') {
      const updatedQuestions = assignmentForm.questions.filter((_, index) => index !== questionIndex);
      setAssignmentForm({ ...assignmentForm, questions: updatedQuestions });
    } else {
      const updatedQuestions = examForm.questions.filter((_, index) => index !== questionIndex);
      setExamForm({ ...examForm, questions: updatedQuestions });
    }
  };

  const handleSaveLectureWithContent = () => {
    if (!lectureForm.title.trim()) {
      alert("يرجى كتابة ع��وان المحاضرة");
      return;
    }

    const newLecture: Lecture = {
      ...lectureForm,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      assignment: isManagingAssignment && assignmentForm.title.trim()
        ? { ...assignmentForm, id: Date.now().toString() + "_assignment" }
        : undefined,
      exam: isManagingExam && examForm.title.trim()
        ? { ...examForm, id: Date.now().toString() + "_exam" }
        : undefined
    };

    if (selectedMonthId) {
      const updatedMonths = editingLectureId
        ? months.map(month =>
            month.id === selectedMonthId
              ? {
                  ...month,
                  lectures: month.lectures.map(lecture =>
                    lecture.id === editingLectureId ? newLecture : lecture
                  )
                }
              : month
          )
        : months.map(month =>
            month.id === selectedMonthId
              ? { ...month, lectures: [...month.lectures, newLecture] }
              : month
          );

      saveMonthsToStorage(updatedMonths);
      setIsAddLectureOpen(false);
      setIsEditLectureOpen(false);
      setLectureForm(initialLecture);
      setAssignmentForm(initialAssignment);
      setExamForm(initialExam);
      setSelectedMonthId(null);
      setEditingLectureId(null);
      setIsManagingAssignment(false);
      setIsManagingExam(false);
      setLectureVideos([]);
      setLectureFiles([]);
    }
  };

  const getTotalLectures = () => {
    return months.reduce((total, month) => total + month.lectures.length, 0);
  };

  const getTotalDuration = () => {
    return months.reduce((total, month) =>
      total + month.lectures.reduce((monthTotal, lecture) => monthTotal + lecture.duration, 0), 0
    );
  };

  const createSampleData = () => {
    const sampleMonth: Month = {
      id: "sample_month_1",
      title: "الشهر الأول - مقدمة في الجبر",
      description: "في هذا الشهر سنتعلم أساسيات الجبر والمعادلات البسيطة",
      order: 1,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      lectures: [
        {
          id: "lecture_1",
          title: "مقدمة في الجبر وال��تغيرات",
          description: "تعلم أساسيات الجبر والتعامل مع المتغيرات",
          videoUrl: "https://youtube.com/watch?v=example1",
          pdfUrl: "https://example.com/algebra-intro.pdf",
          duration: 45,
          order: 1,
          assignment: {
            id: "assignment_1",
            title: "واجب على المتغيرات",
            description: "حل التمارين التالية على المتغيرات والثوابت",
            timeLimit: 30,
            totalMarks: 20,
            passingMarks: 12,
            questions: [
              {
                id: "q1",
                question: "ما هو قيمة x في المعادلة: 2x + 5 = 15؟",
                questionType: 'text' as const,
                options: [
                  { id: "a", text: "5", isCorrect: true },
                  { id: "b", text: "10", isCorrect: false },
                  { id: "c", text: "7", isCorrect: false },
                  { id: "d", text: "3", isCorrect: false }
                ],
                explanation: "2x + 5 = 15، إذن 2x = 10، إذن x = 5"
              },
              {
                id: "q2",
                question: "إذا كان y = 3x + 2 و x = 4، فما ق��مة y؟",
                questionType: 'text' as const,
                options: [
                  { id: "a", text: "12", isCorrect: false },
                  { id: "b", text: "14", isCorrect: true },
                  { id: "c", text: "10", isCorrect: false },
                  { id: "d", text: "16", isCorrect: false }
                ],
                explanation: "y = 3(4) + 2 = 12 + 2 = 14"
              }
            ]
          },
          exam: {
            id: "exam_1",
            title: "امت��ان الأسبوع الأول",
            description: "امتحان شامل على ما تم شرحه في الأسبوع الأول",
            timeLimit: 60,
            totalMarks: 50,
            passingMarks: 30,
            examType: 'quiz' as const,
            questions: [
              {
                id: "eq1",
                question: "حل المعادلة: 3x - 7 = 8",
                questionType: 'text' as const,
                options: [
                  { id: "a", text: "x = 5", isCorrect: true },
                  { id: "b", text: "x = 3", isCorrect: false },
                  { id: "c", text: "x = 7", isCorrect: false },
                  { id: "d", text: "x = 1", isCorrect: false }
                ],
                explanation: "3x - 7 = 8، إذن 3x = 15، إذن x = 5"
              },
              {
                id: "eq2",
                question: "إذا كان 2y + 3 = 11، فما قيمة y؟",
                questionType: 'text' as const,
                options: [
                  { id: "a", text: "4", isCorrect: true },
                  { id: "b", text: "7", isCorrect: false },
                  { id: "c", text: "2", isCorrect: false },
                  { id: "d", text: "5", isCorrect: false }
                ],
                explanation: "2y + 3 = 11، إذن 2y = 8، إذن y = 4"
              },
              {
                id: "eq3",
                question: "ما هو ناتج تبسيط: 5x + 3x - 2x؟",
                questionType: 'text' as const,
                options: [
                  { id: "a", text: "6x", isCorrect: true },
                  { id: "b", text: "10x", isCorrect: false },
                  { id: "c", text: "3x", isCorrect: false },
                  { id: "d", text: "8x", isCorrect: false }
                ],
                explanation: "5x + 3x - 2x = (5 + 3 - 2)x = 6x"
              }
            ]
          },
          createdAt: new Date().toISOString()
        },
        {
          id: "lecture_2",
          title: "حل المعادلات الخطية",
          description: "طرق مختلفة لحل المعادلات الخطية البسيطة",
          videoUrl: "https://youtube.com/watch?v=example2",
          pdfUrl: "https://example.com/linear-equations.pdf",
          duration: 50,
          order: 2,
          assignment: {
            id: "assignment_2",
            title: "واجب على المعادلات الخط��ة",
            description: "حل مجموعة من المعادلات الخطية",
            timeLimit: 45,
            totalMarks: 25,
            passingMarks: 15,
            questions: [
              {
                id: "q3",
                question: "حل المعادلة: 4x - 12 = 0",
                questionType: 'text' as const,
                options: [
                  { id: "a", text: "x = 3", isCorrect: true },
                  { id: "b", text: "x = 4", isCorrect: false },
                  { id: "c", text: "x = 12", isCorrect: false },
                  { id: "d", text: "x = 0", isCorrect: false }
                ],
                explanation: "4x - 12 = 0، إذن 4x = 12، إذن x = 3"
              }
            ]
          },
          createdAt: new Date().toISOString()
        }
      ]
    };

    const updatedMonths = [...months, sampleMonth];
    saveMonthsToStorage(updatedMonths);
    alert("تم إنشاء بيانات تجريبية بنجاح!");
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
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-arabic">إدارة محتوى الكورس</h1>
              <p className="text-sm text-gray-500 font-arabic">{course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="font-arabic">
              {months.length} شهر
            </Badge>
            <Badge variant="outline" className="font-arabic">
              {getTotalLectures()} محاضرة
            </Badge>
            <Badge variant="outline" className="font-arabic">
              {Math.floor(getTotalDuration() / 60)} ساعة
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Course Overview */}
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
                    <CardTitle className="font-arabic">{course.title}</CardTitle>
                    <p className="text-gray-500 font-arabic">{course.instructor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={createSampleData} className="font-arabic">
                    <BookOpen className="w-4 h-4 ml-2" />
                    إنشاء بيانات تجريبية
                  </Button>
                  <Button onClick={() => setIsAddMonthOpen(true)} className="font-arabic">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة شهر جديد
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Months Management */}
          <div className="space-y-4">
            {months.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 font-arabic mb-2">لا توجد شهور</h3>
                  <p className="text-gray-500 font-arabic mb-4">ابدأ بإضافة الشهو�� والمحاضرات لهذا الكورس</p>
                  <Button onClick={() => setIsAddMonthOpen(true)} className="font-arabic">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة الشهر الأو��
                  </Button>
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
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div className="text-right">
                              <h3 className="font-medium font-arabic">{month.title}</h3>
                              <p className="text-sm text-gray-500 font-arabic">{month.lectures.length} محاضرة</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-arabic">
                              {month.lectures.reduce((total, lecture) => total + lecture.duration, 0)} دقيقة
                            </Badge>
                            <div
                              className="flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMonth(month)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMonth(month.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="px-6 pb-4">
                          <div className="mb-4">
                            <p className="text-gray-600 font-arabic">{month.description}</p>
                          </div>
                          
                          {/* Lectures */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium font-arabic">المحاضرات</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddLecture(month.id);
                                }}
                                className="font-arabic"
                              >
                                <Plus className="w-4 h-4 ml-2" />
                                إضافة محاضرة
                              </Button>
                            </div>
                            
                            {month.lectures.length === 0 ? (
                              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 font-arabic">لا توجد محاضرات</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddLecture(month.id);
                                  }}
                                  className="mt-2 font-arabic"
                                >
                                  إضافة محاضرة
                                </Button>
                              </div>
                            ) : (
                              <div className="grid gap-3">
                                {month.lectures.map((lecture, lectureIndex) => (
                                  <div key={lecture.id} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                                    <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                                      {lectureIndex + 1}
                                    </div>
                                    <div className="flex-1">
                                      <h5 className="font-medium font-arabic">{lecture.title}</h5>
                                      <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          {lecture.duration} دقيقة
                                        </span>
                                        {lecture.videoUrl && (
                                          <span className="flex items-center gap-1">
                                            <Video className="w-4 h-4" />
                                            فيديو
                                          </span>
                                        )}
                                        {lecture.pdfUrl && (
                                          <span className="flex items-center gap-1">
                                            <FileText className="w-4 h-4" />
                                            PDF
                                          </span>
                                        )}
                                        {lecture.assignment && (
                                          <span className="flex items-center gap-1">
                                            <ClipboardList className="w-4 h-4" />
                                            واجب ({lecture.assignment.questions.length} أسئلة)
                                          </span>
                                        )}
                                        {lecture.exam && (
                                          <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            امتحان ({lecture.exam.questions.length} أسئلة)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div
                                      className="flex items-center gap-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditLecture(lecture, month.id)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteLecture(lecture.id, month.id)}
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
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

      {/* Add Month Dialog */}
      <Dialog open={isAddMonthOpen} onOpenChange={setIsAddMonthOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-arabic">إضافة شهر جديد</DialogTitle>
            <DialogDescription className="font-arabic">
              املأ بيانات الشهر الجديد
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="month-title" className="font-arabic">عنوان الشهر *</Label>
              <Input
                id="month-title"
                value={monthForm.title}
                onChange={(e) => setMonthForm({ ...monthForm, title: e.target.value })}
                placeholder="مثال: الشهر الأول - مقدمة في الرياضيات"
                className="font-arabic"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="month-description" className="font-arabic">وصف الش��ر</Label>
              <Textarea
                id="month-description"
                value={monthForm.description}
                onChange={(e) => setMonthForm({ ...monthForm, description: e.target.value })}
                placeholder="وصف مختصر لمحتوى هذا الشهر..."
                className="font-arabic"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date" className="font-arabic">تاريخ البداية</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={monthForm.startDate}
                  onChange={(e) => setMonthForm({ ...monthForm, startDate: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="end-date" className="font-arabic">تاريخ النهاية</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={monthForm.endDate}
                  onChange={(e) => setMonthForm({ ...monthForm, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMonthOpen(false)} className="font-arabic">
              إلغاء
            </Button>
            <Button onClick={handleAddMonth} className="font-arabic">
              <Save className="w-4 h-4 ml-2" />
              حفظ الشهر
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Month Dialog */}
      <Dialog open={isEditMonthOpen} onOpenChange={setIsEditMonthOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-arabic">تعديل الشهر</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-month-title" className="font-arabic">عنوان الشهر *</Label>
              <Input
                id="edit-month-title"
                value={monthForm.title}
                onChange={(e) => setMonthForm({ ...monthForm, title: e.target.value })}
                className="font-arabic"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-month-description" className="font-arabic">وصف الشهر</Label>
              <Textarea
                id="edit-month-description"
                value={monthForm.description}
                onChange={(e) => setMonthForm({ ...monthForm, description: e.target.value })}
                className="font-arabic"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-start-date" className="font-arabic">تاريخ البداية</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={monthForm.startDate}
                  onChange={(e) => setMonthForm({ ...monthForm, startDate: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-end-date" className="font-arabic">تاريخ النهاية</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={monthForm.endDate}
                  onChange={(e) => setMonthForm({ ...monthForm, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMonthOpen(false)} className="font-arabic">
              إ��غاء
            </Button>
            <Button onClick={handleUpdateMonth} className="font-arabic">
              <Save className="w-4 h-4 ml-2" />
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lecture Dialog */}
      <Dialog open={isAddLectureOpen} onOpenChange={setIsAddLectureOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-arabic">إضافة محاضرة جديدة</DialogTitle>
            <DialogDescription className="font-arabic">
              املأ بيانات المحاضرة والمحتوى التعليمي الم��فق
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="py-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="font-arabic">البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="assignment" className="font-arabic">الواجب</TabsTrigger>
              <TabsTrigger value="exam" className="font-arabic">الامتحان</TabsTrigger>
              <TabsTrigger value="preview" className="font-arabic">معاينة</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lecture-title" className="font-arabic">عنوان المحاضرة *</Label>
                  <Input
                    id="lecture-title"
                    value={lectureForm.title}
                    onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                    placeholder="مثال: مقدمة في الجبر"
                    className="font-arabic"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lecture-description" className="font-arabic">وصف المحاضرة</Label>
                  <Textarea
                    id="lecture-description"
                    value={lectureForm.description}
                    onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                    placeholder="وصف مختص�� لمحتوى المحاضرة..."
                    className="font-arabic"
                  />
                </div>

                {/* Videos Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold font-arabic">فيديوهات المحاضرة</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingVideo(true)}
                      className="font-arabic"
                    >
                      <Video className="w-4 h-4 ml-2" />
                      إضافة فيديو
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {lectureVideos.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                        <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 font-arabic">لا توجد فيديوهات مضافة</p>
                      </div>
                    ) : (
                      lectureVideos.map((video, index) => (
                        <div key={video.id} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium font-arabic">{video.title}</h4>
                            <p className="text-sm text-gray-500">{video.duration} دقيقة</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVideo(video.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Files Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold font-arabic">ملفات المحاضرة</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingFile(true)}
                      className="font-arabic"
                    >
                      <FileText className="w-4 h-4 ml-2" />
                      إضافة ملف
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {lectureFiles.length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 font-arabic">لا توجد ملفات مضافة</p>
                      </div>
                    ) : (
                      lectureFiles.map((file, index) => (
                        <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium font-arabic">{file.title}</h4>
                            <p className="text-sm text-gray-500">ملف PDF أو مستند</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="duration" className="font-arabic">مدة المحاضرة (محسوبة تلقائياً)</Label>
                  <Input
                    id="duration"
                    type="text"
                    value={lectureForm.duration ? `${lectureForm.duration} دقيقة (${Math.floor(lectureForm.duration / 60)} ساعة و ${lectureForm.duration % 60} دقيقة)` : "أضف فيديوهات لحساب المدة"}
                    readOnly
                    className="font-arabic bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 font-arabic">يتم حساب المدة تلقائياً من مجموع مدد الفيديوهات المضافة</p>
                </div>

                <div className="text-center text-gray-500 font-arabic py-2">
                  <h4 className="font-semibold font-arabic text-blue-800 mb-2">نظام إدارة المحتوى المرن</h4>
                  <div className="text-sm text-blue-700 font-arabic space-y-1">
                    <p>• يمكنك إضافة عدة فيديوهات بالترتيب الذي تريده (شرح، حل ��اجب، حل امتحان)</p>
                    <p>• يمكنك إضافة عدة ملفات PDF أو ملفات ��خرى</p>
                    <p>• الترتيب الذي تضيف به المحتوى هو نفس الترتيب الذي سيظهر للطالب</p>
                    <p>• الواجب والامتحان منفصلان عن الفيديوهات ويتم إدارتهما من التبويبات المخصصة</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assignment" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold font-arabic">إدارة الواجب</h3>
                <Button
                  variant={isManagingAssignment ? "destructive" : "outline"}
                  onClick={() => setIsManagingAssignment(!isManagingAssignment)}
                  className="font-arabic"
                >
                  {isManagingAssignment ? "إلغاء الواجب" : "إضافة واجب"}
                </Button>
              </div>

              {isManagingAssignment && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="grid gap-2">
                    <Label className="font-arabic">عنوان الواجب *</Label>
                    <Input
                      value={assignmentForm.title}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                      placeholder="مثال: واجب على درس الجبر"
                      className="font-arabic"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="font-arabic">وصف الواجب</Label>
                    <Textarea
                      value={assignmentForm.description}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                      placeholder="تعليمات وإرشادات الواجب..."
                      className="font-arabic"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label className="font-arabic">المدة (دقيقة)</Label>
                      <Input
                        type="number"
                        value={assignmentForm.timeLimit}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, timeLimit: Number(e.target.value) })}
                        min="5"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-arabic">الدرجة الكلية</Label>
                      <Input
                        type="number"
                        value={assignmentForm.totalMarks}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, totalMarks: Number(e.target.value) })}
                        min="1"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-arabic">درجة النجاح</Label>
                      <Input
                        type="number"
                        value={assignmentForm.passingMarks}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, passingMarks: Number(e.target.value) })}
                        min="1"
                      />
                    </div>
                  </div>


                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold font-arabic">أسئلة الواجب ({assignmentForm.questions.length})</h4>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuestionType('assignment');
                          handleAddQuestion();
                        }}
                        className="font-arabic"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة سؤال
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {assignmentForm.questions.length === 0 ? (
                        <p className="text-gray-500 text-center py-4 font-arabic">لا توجد أسئلة</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {assignmentForm.questions.map((question, index) => (
                            <div
                              key={question.id}
                              className="border rounded-lg p-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleEditQuestion(index, 'assignment')}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm font-arabic">
                                    {question.questionType === 'image' ? 'صورة' : 'نص'}
                                  </span>
                                </div>
                                <div
                                  className="flex gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleEditQuestion(index, 'assignment')}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleDeleteQuestion(index, 'assignment')}
                                  >
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-gray-600 font-arabic truncate">
                                {question.questionType === 'text'
                                  ? question.question.substring(0, 30) + (question.question.length > 30 ? '...' : '')
                                  : 'سؤال بالصورة'
                                }
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={option.id}
                                    className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                                      option.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIndex)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="exam" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold font-arabic">إدارة الامتحان</h3>
                <Button
                  variant={isManagingExam ? "destructive" : "outline"}
                  onClick={() => setIsManagingExam(!isManagingExam)}
                  className="font-arabic"
                >
                  {isManagingExam ? "إلغاء الامتحان" : "إضافة امتحان"}
                </Button>
              </div>

              {isManagingExam && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="grid gap-2">
                    <Label className="font-arabic">عنوان الامتحان *</Label>
                    <Input
                      value={examForm.title}
                      onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                      placeholder="مثال: امتحان شهري على الجبر"
                      className="font-arabic"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="font-arabic">وصف الامتحان</Label>
                    <Textarea
                      value={examForm.description}
                      onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                      placeholder="تعليمات وإرشادات الامتحان..."
                      className="font-arabic"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="grid gap-2">
                      <Label className="font-arabic">نوع الامتحان</Label>
                      <Select value={examForm.examType} onValueChange={(value) => setExamForm({ ...examForm, examType: value as any })}>
                        <SelectTrigger className="font-arabic">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quiz">اختبار قصير</SelectItem>
                          <SelectItem value="midterm">امتحان نصف الشهر</SelectItem>
                          <SelectItem value="final">امتحان نهائي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-arabic">المدة (دقيقة)</Label>
                      <Input
                        type="number"
                        value={examForm.timeLimit}
                        onChange={(e) => setExamForm({ ...examForm, timeLimit: Number(e.target.value) })}
                        min="10"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-arabic">الدرجة الكلية</Label>
                      <Input
                        type="number"
                        value={examForm.totalMarks}
                        onChange={(e) => setExamForm({ ...examForm, totalMarks: Number(e.target.value) })}
                        min="1"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-arabic">درجة النجاح</Label>
                      <Input
                        type="number"
                        value={examForm.passingMarks}
                        onChange={(e) => setExamForm({ ...examForm, passingMarks: Number(e.target.value) })}
                        min="1"
                      />
                    </div>
                  </div>


                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold font-arabic">أسئلة الامتحان ({examForm.questions.length})</h4>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuestionType('exam');
                          handleAddQuestion();
                        }}
                        className="font-arabic"
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة سؤال
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {examForm.questions.length === 0 ? (
                        <p className="text-gray-500 text-center py-4 font-arabic">لا توجد أسئلة</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {examForm.questions.map((question, index) => (
                            <div
                              key={question.id}
                              className="border rounded-lg p-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleEditQuestion(index, 'exam')}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm font-arabic">
                                    {question.questionType === 'image' ? 'صورة' : 'نص'}
                                  </span>
                                </div>
                                <div
                                  className="flex gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleEditQuestion(index, 'exam')}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleDeleteQuestion(index, 'exam')}
                                  >
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-gray-600 font-arabic truncate">
                                {question.questionType === 'text'
                                  ? question.question.substring(0, 30) + (question.question.length > 30 ? '...' : '')
                                  : 'سؤال بالصورة'
                                }
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={option.id}
                                    className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                                      option.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIndex)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold font-arabic mb-4">معاينة المحاضرة</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium font-arabic">العنوان:</h4>
                    <p className="text-gray-600">{lectureForm.title || "لم يتم إدخال العنوان"}</p>
                  </div>

                  <div>
                    <h4 className="font-medium font-arabic">الوصف:</h4>
                    <p className="text-gray-600">{lectureForm.description || "لم يتم إدخال ال��صف"}</p>
                  </div>

                  <div>
                    <h4 className="font-medium font-arabic">المدة:</h4>
                    <p className="text-gray-600">{lectureForm.duration} دقيقة</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium font-arabic">المحتوى:</h4>
                      <div className="space-y-2 text-sm">
                        {lectureForm.videoUrl && (
                          <div className="flex items-center gap-2 text-green-600">
                            <Video className="w-4 h-4" />
                            <span>فيديو الشرح</span>
                          </div>
                        )}
                        {lectureForm.pdfUrl && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <FileText className="w-4 h-4" />
                            <span>ملف PDF</span>
                          </div>
                        )}
                        {isManagingAssignment && assignmentForm.title && (
                          <div className="flex items-center gap-2 text-orange-600">
                            <ClipboardList className="w-4 h-4" />
                            <span>واجب ({assignmentForm.questions.length} أسئلة)</span>
                          </div>
                        )}
                        {isManagingExam && examForm.title && (
                          <div className="flex items-center gap-2 text-red-600">
                            <Calendar className="w-4 h-4" />
                            <span>امتحان ({examForm.questions.length} أسئلة)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLectureOpen(false)} className="font-arabic">
              إلغاء
            </Button>
            <Button onClick={handleSaveLecture} className="font-arabic">
              <Save className="w-4 h-4 ml-2" />
              حفظ المحاضرة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lecture Dialog */}
      <Dialog open={isEditLectureOpen} onOpenChange={setIsEditLectureOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-arabic">تعديل المحاضرة</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-lecture-title" className="font-arabic">عنوان المحاضرة *</Label>
              <Input
                id="edit-lecture-title"
                value={lectureForm.title}
                onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                className="font-arabic"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-lecture-description" className="font-arabic">وصف المحاضرة</Label>
              <Textarea
                id="edit-lecture-description"
                value={lectureForm.description}
                onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                className="font-arabic"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-video-url" className="font-arabic">رابط الفيديو</Label>
              <Input
                id="edit-video-url"
                type="url"
                value={lectureForm.videoUrl}
                onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })}
                className="font-arabic"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-pdf-url" className="font-arabic">رابط ��لف PDF</Label>
              <Input
                id="edit-pdf-url"
                type="url"
                value={lectureForm.pdfUrl}
                onChange={(e) => setLectureForm({ ...lectureForm, pdfUrl: e.target.value })}
                className="font-arabic"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-duration" className="font-arabic">مدة المحاضرة (بالدقائ��) *</Label>
              <Input
                id="edit-duration"
                type="number"
                value={lectureForm.duration || ""}
                onChange={(e) => setLectureForm({ ...lectureForm, duration: Number(e.target.value) })}
                min="1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLectureOpen(false)} className="font-arabic">
              إلغاء
            </Button>
            <Button onClick={handleUpdateLecture} className="font-arabic">
              <Save className="w-4 h-4 ml-2" />
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Month Dialog */}
      <AlertDialog open={isDeleteMonthOpen} onOpenChange={setIsDeleteMonthOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-arabic">حذف الشهر</AlertDialogTitle>
            <AlertDialogDescription className="font-arabic">
              هل أنت متأكد من ح��ف هذا الشهر؟ سيتم حذف جميع المحاضرات وا��تكليفات الموجودة به.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMonth} className="bg-red-600 hover:bg-red-700 font-arabic">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lecture Dialog */}
      <AlertDialog open={isDeleteLectureOpen} onOpenChange={setIsDeleteLectureOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-arabic">حذف المحاضرة</AlertDialogTitle>
            <AlertDialogDescription className="font-arabic">
              هل أنت متأكد من حذف هذه المحاضرة؟ لا يمكن ��لتراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLecture} className="bg-red-600 hover:bg-red-700 font-arabic">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Video Dialog */}
      <Dialog open={isAddingVideo} onOpenChange={setIsAddingVideo}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-arabic">إضافة فيديو جديد</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="font-arabic">عنوان الفيديو *</Label>
              <Input
                value={currentVideo.title}
                onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                placeholder="مثال: شرح قواعد الجملة الاسمية"
                className="font-arabic"
              />
            </div>

            <div className="grid gap-2">
              <Label className="font-arabic">راب�� الفيديو *</Label>
              <Input
                type="url"
                value={currentVideo.url}
                onChange={(e) => setCurrentVideo({ ...currentVideo, url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="font-arabic"
              />
            </div>

            <div className="grid gap-2">
              <Label className="font-arabic">مدة الفيديو (بالد��ائق) *</Label>
              <Input
                type="number"
                value={currentVideo.duration || ""}
                onChange={(e) => setCurrentVideo({ ...currentVideo, duration: Number(e.target.value) })}
                placeholder="45"
                min="1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingVideo(false)} className="font-arabic">
              إلغاء
            </Button>
            <Button onClick={addVideo} className="font-arabic">
              <Save className="w-4 h-4 ml-2" />
              إضافة الفيديو
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add File Dialog */}
      <Dialog open={isAddingFile} onOpenChange={setIsAddingFile}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-arabic">إضافة ملف جديد</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="font-arabic">عنوان الملف *</Label>
              <Input
                value={currentFile.title}
                onChange={(e) => setCurrentFile({ ...currentFile, title: e.target.value })}
                placeholder="مثال: ملف شرح قواعد الجملة الاسمية"
                className="font-arabic"
              />
            </div>

            <div className="grid gap-2">
              <Label className="font-arabic">رابط الملف *</Label>
              <Input
                type="url"
                value={currentFile.url}
                onChange={(e) => setCurrentFile({ ...currentFile, url: e.target.value })}
                placeholder="https://drive.google.com/... أو https://example.com/file.pdf"
                className="font-arabic"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingFile(false)} className="font-arabic">
              إلغاء
            </Button>
            <Button onClick={addFile} className="font-arabic">
              <Save className="w-4 h-4 ml-2" />
              إضافة الملف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Management Dialog */}
      <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-arabic">
              {editingQuestionIndex !== null ? "تعديل السؤال" : "إضافة سؤال جديد"}
            </DialogTitle>
            <DialogDescription className="font-arabic">
              {questionType === 'assignment' ? "إضافة سؤال للواجب" : "إضافة سؤال للامتحان"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="font-arabic">نوع السؤال</Label>
              <Select
                value={currentQuestionForm.questionType}
                onValueChange={(value) => setCurrentQuestionForm({
                  ...currentQuestionForm,
                  questionType: value as any,
                  question: value === 'image' ? 'سؤال بالصورة' : currentQuestionForm.question,
                  questionImageUrl: value === 'text' ? '' : currentQuestionForm.questionImageUrl
                })}
              >
                <SelectTrigger className="font-arabic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">نص</SelectItem>
                  <SelectItem value="image">صورة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentQuestionForm.questionType === 'text' ? (
              <div className="grid gap-2">
                <Label className="font-arabic">نص السؤال *</Label>
                <Textarea
                  value={currentQuestionForm.question}
                  onChange={(e) => setCurrentQuestionForm({ ...currentQuestionForm, question: e.target.value })}
                  placeholder="اكتب السؤال هنا..."
                  className="font-arabic min-h-[80px]"
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label className="font-arabic">رابط صورة السؤال *</Label>
                <Input
                  type="url"
                  value={currentQuestionForm.questionImageUrl || ""}
                  onChange={(e) => setCurrentQuestionForm({ ...currentQuestionForm, questionImageUrl: e.target.value })}
                  placeholder="https://example.com/question-image.jpg"
                  className="font-arabic"
                />
                {currentQuestionForm.questionImageUrl && (
                  <div className="mt-2">
                    <img
                      src={currentQuestionForm.questionImageUrl}
                      alt="معاينة السؤال"
                      className="max-w-full h-auto max-h-40 rounded-lg border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <Label className="font-arabic">الخيارات *</Label>
              {currentQuestionForm.options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-answer"
                      checked={option.isCorrect}
                      onChange={() => {
                        const updatedOptions = currentQuestionForm.options.map((opt, optIndex) => ({
                          ...opt,
                          isCorrect: optIndex === index
                        }));
                        setCurrentQuestionForm({ ...currentQuestionForm, options: updatedOptions });
                      }}
                    />
                    <Label className="font-arabic text-sm">صحيح</Label>
                  </div>
                  <span className="font-bold text-lg">{String.fromCharCode(65 + index)})</span>
                  <Input
                    value={option.text}
                    onChange={(e) => {
                      const updatedOptions = currentQuestionForm.options.map((opt, optIndex) =>
                        optIndex === index ? { ...opt, text: e.target.value } : opt
                      );
                      setCurrentQuestionForm({ ...currentQuestionForm, options: updatedOptions });
                    }}
                    placeholder={`الخيار ${String.fromCharCode(65 + index)}`}
                    className="flex-1 font-arabic"
                  />
                  {option.isCorrect && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              ))}
            </div>

            <div className="grid gap-2">
              <Label className="font-arabic">شرح الإجابة (اختيا��ي)</Label>
              <Textarea
                value={currentQuestionForm.explanation || ""}
                onChange={(e) => setCurrentQuestionForm({ ...currentQuestionForm, explanation: e.target.value })}
                placeholder="شرح الإجابة الصحيحة..."
                className="font-arabic"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingQuestion(false)} className="font-arabic">
              إلغاء
            </Button>
            <Button onClick={handleSaveQuestion} className="font-arabic">
              <Save className="w-4 h-4 ml-2" />
              {editingQuestionIndex !== null ? "حفظ التعديلات" : "إضافة السؤال"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
