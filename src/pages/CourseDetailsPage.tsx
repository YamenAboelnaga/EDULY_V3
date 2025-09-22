import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Play, 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  Award, 
  CheckCircle, 
  Lock, 
  Download, 
  FileText, 
  Video,
  ArrowRight,
  ArrowLeft,
  Target,
  Trophy,
  Calendar,
  MessageSquare,
  Share2,
  Heart,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data - in real app, this would come from API
const courseData = {
  id: 1,
  title: "الرياضيات المتقدمة - الصف الثالث الثانوي",
  instructor: {
    name: "د. أحمد محمود",
    avatar: "/api/placeholder/60/60",
    title: "دكتور في الرياضيات التطبيقية",
    experience: "15 سنة خبرة",
    rating: 4.9,
    students: 5000
  },
  image: "/api/placeholder/800/400",
  duration: "120 ساعة",
  students: 2450,
  rating: 4.9,
  reviews: 890,
  price: 299,
  originalPrice: 399,
  category: "علوم",
  level: "متقدم",
  grade: "الثالث الثانوي",
  description: "كورس شامل لمنهج الرياضيات للصف الثالث الثانوي يشمل الجبر والهندسة والتفاضل والتكامل مع شرح مبسط وأمثلة تطبيقية وحل تمارين متنوعة",
  whatYouWillLearn: [
    "فهم عميق لمفاهيم الجبر المتقدم",
    "حل مسائل الهندسة التحليلية والفراغية",
    "إ��قان التفاضل والتكامل",
    "تطبيق المفاهيم الرياضية في حل المشكلات",
    "الاستعداد الكامل لامتحان الثانوية العامة",
    "تطوير مهارات التفكير الرياضي المنطقي"
  ],
  requirements: [
    "أساسيات ا��رياضيات للصف الثاني الثانوي",
    "جهاز كمبيوتر أو هاتف ذكي مع إنترنت",
    "دفتر وقلم لحل التمارين",
    "الرغبة في التعلم والممارسة"
  ],
  features: [
    "120 ساعة محتوى تعليمي",
    "امتحانات تجريبية أسبوعية",
    "واجبات تفاعلية",
    "شهادة إتمام معتمدة",
    "دعم فني 24/7",
    "مراجعات نهائية مكثفة"
  ]
};

const months = [
  {
    id: 1,
    title: "الشهر الأول - أساسيات الجبر",
    progress: 100,
    isUnlocked: true,
    lessons: [
      { 
        id: 1, 
        title: "مقدمة في الجبر المتقدم", 
        duration: "45 دقيقة", 
        type: "video", 
        isCompleted: true, 
        isUnlocked: true,
        hasAssignment: true,
        assignmentCompleted: true
      },
      { 
        id: 2, 
        title: "المعادلات من الدرجة الثانية", 
        duration: "60 دقيقة", 
        type: "video", 
        isCompleted: true, 
        isUnlocked: true,
        hasAssignment: true,
        assignmentCompleted: true
      },
      { 
        id: 3, 
        title: "حل المعاد��ات بطرق مختلفة", 
        duration: "50 دقيقة", 
        type: "video", 
        isCompleted: true, 
        isUnlocked: true,
        hasAssignment: true,
        assignmentCompleted: false
      },
      { 
        id: 4, 
        title: "مراجعة الشهر الأول", 
        duration: "30 دقيقة", 
        type: "video", 
        isCompleted: false, 
        isUnlocked: true,
        hasAssignment: false,
        assignmentCompleted: false
      }
    ],
    exam: {
      id: 1,
      title: "امتحان الشهر الأول",
      duration: "90 دقيقة",
      questions: 20,
      isUnlocked: true,
      isCompleted: true,
      score: 85,
      hasSolution: true,
      solutionUnlocked: true
    }
  },
  {
    id: 2,
    title: "الشهر الثاني - الهندسة التحليلية",
    progress: 75,
    isUnlocked: true,
    lessons: [
      { 
        id: 5, 
        title: "نظام الإحداثيات الديكارتية", 
        duration: "40 دقيقة", 
        type: "video", 
        isCompleted: true, 
        isUnlocked: true,
        hasAssignment: true,
        assignmentCompleted: true
      },
      { 
        id: 6, 
        title: "معادلة الخط المستقيم", 
        duration: "55 دقيقة", 
        type: "video", 
        isCompleted: true, 
        isUnlocked: true,
        hasAssignment: true,
        assignmentCompleted: true
      },
      { 
        id: 7, 
        title: "الدائرة والقطوع المخروطية", 
        duration: "65 دقيقة", 
        type: "video", 
        isCompleted: true, 
        isUnlocked: true,
        hasAssignment: true,
        assignmentCompleted: false
      },
      { 
        id: 8, 
        title: "تطبيقات على الهندسة التحليلية", 
        duration: "45 دقيقة", 
        type: "video", 
        isCompleted: false, 
        isUnlocked: true,
        hasAssignment: true,
        assignmentCompleted: false
      }
    ],
    exam: {
      id: 2,
      title: "امتحان الشهر الثاني",
      duration: "90 دقيقة",
      questions: 25,
      isUnlocked: true,
      isCompleted: false,
      score: null,
      hasSolution: true,
      solutionUnlocked: false
    }
  },
  {
    id: 3,
    title: "الشهر الثالث - التفاضل",
    progress: 25,
    isUnlocked: true,
    lessons: [
      { 
        id: 9, 
        title: "مقدمة في التفاضل", 
        duration: "50 دقيقة", 
        type: "video", 
        isCompleted: true, 
        isUnlocked: true,
        hasAssignment: true,
        assignmentCompleted: false
      },
      { 
        id: 10, 
        title: "قواعد التفاضل الأساسية", 
        duration: "60 دقيقة", 
        type: "video", 
        isCompleted: false, 
        isUnlocked: true,
        hasAssignment: true,
        assignmentCompleted: false
      },
      { 
        id: 11, 
        title: "تطبيقات التفاضل", 
        duration: "55 دقيقة", 
        type: "video", 
        isCompleted: false, 
        isUnlocked: false,
        hasAssignment: true,
        assignmentCompleted: false
      },
      { 
        id: 12, 
        title: "الرسم البياني للدوال", 
        duration: "45 دقيقة", 
        type: "video", 
        isCompleted: false, 
        isUnlocked: false,
        hasAssignment: true,
        assignmentCompleted: false
      }
    ],
    exam: {
      id: 3,
      title: "امتحان الشهر الثالث",
      duration: "90 دقيقة",
      questions: 22,
      isUnlocked: false,
      isCompleted: false,
      score: null,
      hasSolution: true,
      solutionUnlocked: false
    }
  },
  {
    id: 4,
    title: "الشهر الراب�� - التكامل",
    progress: 0,
    isUnlocked: false,
    lessons: [
      { 
        id: 13, 
        title: "مقدمة في التكامل", 
        duration: "50 دقيقة", 
        type: "video", 
        isCompleted: false, 
        isUnlocked: false,
        hasAssignment: true,
        assignmentCompleted: false
      },
      { 
        id: 14, 
        title: "قواعد التكامل", 
        duration: "65 دقيقة", 
        type: "video", 
        isCompleted: false, 
        isUnlocked: false,
        hasAssignment: true,
        assignmentCompleted: false
      },
      { 
        id: 15, 
        title: "التكامل المحدود", 
        duration: "55 دقيقة", 
        type: "video", 
        isCompleted: false, 
        isUnlocked: false,
        hasAssignment: true,
        assignmentCompleted: false
      },
      { 
        id: 16, 
        title: "تطبيقات التكامل", 
        duration: "60 دقيقة", 
        type: "video", 
        isCompleted: false, 
        isUnlocked: false,
        hasAssignment: true,
        assignmentCompleted: false
      }
    ],
    exam: {
      id: 4,
      title: "امتحان الشهر الرابع",
      duration: "90 دقيقة",
      questions: 25,
      isUnlocked: false,
      isCompleted: false,
      score: null,
      hasSolution: true,
      solutionUnlocked: false
    }
  }
];

const reviews = [
  {
    id: 1,
    student: "سارة أحمد",
    avatar: "/api/placeholder/40/40",
    rating: 5,
    date: "منذ أسبوع",
    comment: "كورس ممتاز جداً، الشرح واضح والأمثلة مفيدة. ساعدني كثيراً في فهم الرياضيات بطريقة أفضل."
  },
  {
    id: 2,
    student: "محمد علي", 
    avatar: "/api/placeholder/40/40",
    rating: 5,
    date: "منذ أسبوعين",
    comment: "الدكتور أحمد يشرح بطريقة مبسطة وسهلة الفهم. الواجبات مفيدة والامتحانات محضرة بشكل جيد."
  },
  {
    id: 3,
    student: "نور محمود",
    avatar: "/api/placeholder/40/40", 
    rating: 4,
    date: "منذ شهر",
    comment: "كورس جيد ومفيد، لكن أتمنى لو كان هناك المزيد من الأمثلة التطبيقية."
  }
];

export default function CourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [enrollmentStep, setEnrollmentStep] = useState(0); // 0: not enrolled, 1: enrolled

  // Calculate overall progress
  const completedLessons = months.reduce((total, month) => 
    total + month.lessons.filter(lesson => lesson.isCompleted).length, 0);
  const totalLessons = months.reduce((total, month) => total + month.lessons.length, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  const handleEnrollment = () => {
    setEnrollmentStep(1);
    // Here you would typically handle payment processing
  };

  const handleLessonClick = (lesson: any, monthId: number) => {
    if (!lesson.isUnlocked) return;
    
    // Navigate to lesson player (would be implemented)
    console.log(`Playing lesson ${lesson.id} from month ${monthId}`);
  };

  const handleAssignmentClick = (lesson: any) => {
    if (!lesson.hasAssignment || !lesson.isUnlocked) return;
    
    // Navigate to assignment page (would be implemented)
    console.log(`Opening assignment for lesson ${lesson.id}`);
  };

  const handleExamClick = (exam: any) => {
    if (!exam.isUnlocked) return;
    
    // Navigate to exam page (would be implemented)
    console.log(`Opening exam ${exam.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-foreground font-arabic">الرئيسية</button>
          <ArrowLeft className="w-4 h-4" />
          <button onClick={() => navigate("/courses")} className="hover:text-foreground font-arabic">المواد</button>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-foreground font-arabic">تفاصيل المادة</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <Card className="mb-8 border-2">
              <CardContent className="p-0">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={courseData.image} 
                    alt={courseData.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/api/placeholder/800/400";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 right-6">
                    <Button size="lg" className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30">
                      <Play className="w-6 h-6 ml-2" />
                      معاينة الكورس
                    </Button>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-4 font-arabic">{courseData.title}</h1>
                      <p className="text-lg text-muted-foreground font-arabic leading-relaxed mb-4">
                        {courseData.description}
                      </p>
                      
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-5 h-5 ${i < Math.floor(courseData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="font-bold">{courseData.rating}</span>
                          <span className="text-muted-foreground font-arabic">({courseData.reviews} تقييم)</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-5 h-5" />
                          <span className="font-arabic">{courseData.students.toLocaleString()} طالب</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-5 h-5" />
                          <span className="font-arabic">{courseData.duration}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Badge className="font-arabic">{courseData.category}</Badge>
                        <Badge variant="outline" className="font-arabic">{courseData.level}</Badge>
                        <Badge variant="secondary" className="font-arabic">{courseData.grade}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Instructor Info */}
                  <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-xl">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={courseData.instructor.avatar} />
                      <AvatarFallback>د.أ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg font-arabic">{courseData.instructor.name}</h3>
                      <p className="text-muted-foreground font-arabic">{courseData.instructor.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-arabic">{courseData.instructor.experience}</span>
                        <span className="font-arabic">{courseData.instructor.students.toLocaleString()} طالب</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{courseData.instructor.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="font-arabic">
                      <MessageSquare className="w-4 h-4 ml-2" />
                      تواصل مع المدرس
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview" className="font-arabic">نظرة عامة</TabsTrigger>
                <TabsTrigger value="curriculum" className="font-arabic">المنهج</TabsTrigger>
                <TabsTrigger value="assignments" className="font-arabic">الواجبات</TabsTrigger>
                <TabsTrigger value="reviews" className="font-arabic">التقييمات</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-8">
                  {/* What You'll Learn */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="font-arabic text-2xl">ماذا ستتعلم</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courseData.whatYouWillLearn.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                            <span className="font-arabic">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Requirements */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="font-arabic text-2xl">المتطلبات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {courseData.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="font-arabic">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Features */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="font-arabic text-2xl">مميزات الكورس</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courseData.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-primary" />
                            <span className="font-arabic">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="curriculum">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="font-arabic text-2xl">محتوى المنهج</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-arabic">{months.length} شهور</span>
                      <span className="font-arabic">{totalLessons} درس</span>
                      <span className="font-arabic">{courseData.duration} إجمالي</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="space-y-4">
                      {months.map((month) => (
                        <AccordionItem key={month.id} value={`month-${month.id}`} className="border border-border rounded-lg">
                          <AccordionTrigger className="px-6 hover:no-underline">
                            <div className="flex items-center justify-between w-full text-right">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  month.isUnlocked ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                }`}>
                                  {month.isUnlocked ? month.id : <Lock className="w-4 h-4" />}
                                </div>
                                <div className="text-right">
                                  <h3 className="font-bold font-arabic">{month.title}</h3>
                                  <p className="text-sm text-muted-foreground font-arabic">
                                    {month.lessons.length} دروس • {month.isUnlocked ? `${month.progress}% مكتمل` : 'مقفل'}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-4">
                                <Progress value={month.progress} className="w-24" />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <div className="space-y-3 mt-4">
                              {month.lessons.map((lesson) => (
                                <div 
                                  key={lesson.id} 
                                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                                    lesson.isUnlocked ? 'hover:bg-muted/50 cursor-pointer' : 'bg-muted/20'
                                  }`}
                                  onClick={() => handleLessonClick(lesson, month.id)}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      lesson.isCompleted ? 'bg-success text-white' : 
                                      lesson.isUnlocked ? 'bg-primary text-white' : 
                                      'bg-muted text-muted-foreground'
                                    }`}>
                                      {lesson.isCompleted ? <CheckCircle className="w-4 h-4" /> : 
                                       lesson.isUnlocked ? <Play className="w-4 h-4" /> : 
                                       <Lock className="w-4 h-4" />}
                                    </div>
                                    <div>
                                      <h4 className="font-medium font-arabic">{lesson.title}</h4>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Video className="w-4 h-4" />
                                          <span className="font-arabic">{lesson.duration}</span>
                                        </span>
                                        {lesson.hasAssignment && (
                                          <span className={`flex items-center gap-1 ${
                                            lesson.assignmentCompleted ? 'text-success' : 'text-warning'
                                          }`}>
                                            <Target className="w-4 h-4" />
                                            <span className="font-arabic">
                                              {lesson.assignmentCompleted ? 'واجب مكتمل' : 'واجب'}
                                            </span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {lesson.hasAssignment && lesson.isUnlocked && (
                                      <Button 
                                        size="sm" 
                                        variant={lesson.assignmentCompleted ? "default" : "outline"}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAssignmentClick(lesson);
                                        }}
                                      >
                                        <Target className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button size="sm" variant="outline">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Month Exam */}
                              <Separator className="my-4" />
                              <div 
                                className={`flex items-center justify-between p-4 rounded-lg border-2 border-dashed transition-colors ${
                                  month.exam.isUnlocked ? 'border-primary hover:bg-primary/5 cursor-pointer' : 'border-muted'
                                }`}
                                onClick={() => handleExamClick(month.exam)}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    month.exam.isCompleted ? 'bg-success text-white' : 
                                    month.exam.isUnlocked ? 'bg-primary text-white' : 
                                    'bg-muted text-muted-foreground'
                                  }`}>
                                    {month.exam.isCompleted ? <Trophy className="w-5 h-5" /> : 
                                     month.exam.isUnlocked ? <Award className="w-5 h-5" /> : 
                                     <Lock className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <h4 className="font-bold font-arabic text-lg">{month.exam.title}</h4>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span className="font-arabic">{month.exam.questions} سؤال</span>
                                      <span className="font-arabic">{month.exam.duration}</span>
                                      {month.exam.isCompleted && (
                                        <span className="text-success font-bold font-arabic">
                                          النتيجة: {month.exam.score}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {month.exam.solutionUnlocked && (
                                    <Button size="sm" variant="outline" className="font-arabic">
                                      <Video className="w-4 h-4 ml-2" />
                                      حل الامتحان
                                    </Button>
                                  )}
                                  <Badge variant={month.exam.isCompleted ? "default" : "secondary"} className="font-arabic">
                                    {month.exam.isCompleted ? "مكتمل" : month.exam.isUnlocked ? "متاح" : "مقفل"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assignments">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="font-arabic text-2xl">الواجبات والتكاليف</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {months.map((month) => (
                        <div key={month.id}>
                          <h3 className="font-bold text-lg font-arabic mb-4">{month.title}</h3>
                          <div className="grid gap-4">
                            {month.lessons.filter(lesson => lesson.hasAssignment).map((lesson) => (
                              <div 
                                key={lesson.id}
                                className={`p-4 rounded-lg border transition-colors ${
                                  lesson.isUnlocked ? 'hover:bg-muted/50 cursor-pointer' : 'bg-muted/20'
                                }`}
                                onClick={() => handleAssignmentClick(lesson)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      lesson.assignmentCompleted ? 'bg-success text-white' : 
                                      lesson.isUnlocked ? 'bg-primary text-white' : 
                                      'bg-muted text-muted-foreground'
                                    }`}>
                                      {lesson.assignmentCompleted ? <CheckCircle className="w-5 h-5" /> : 
                                       lesson.isUnlocked ? <Target className="w-5 h-5" /> : 
                                       <Lock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                      <h4 className="font-medium font-arabic">واجب: {lesson.title}</h4>
                                      <p className="text-sm text-muted-foreground font-arabic">
                                        {lesson.assignmentCompleted ? 'تم الحل والتصحيح' : 
                                         lesson.isUnlocked ? 'متاح للحل' : 'غير متاح'}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge 
                                    variant={lesson.assignmentCompleted ? "default" : lesson.isUnlocked ? "secondary" : "outline"}
                                    className="font-arabic"
                                  >
                                    {lesson.assignmentCompleted ? "مكتمل" : lesson.isUnlocked ? "متاح" : "مقفل"}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="font-arabic text-2xl">تقييمات الطلاب</CardTitle>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="text-4xl font-bold">{courseData.rating}</div>
                        <div>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-5 h-5 ${i < Math.floor(courseData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground font-arabic">{courseData.reviews} تقييم</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.avatar} />
                              <AvatarFallback>{review.student[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium font-arabic">{review.student}</h4>
                                <span className="text-sm text-muted-foreground font-arabic">{review.date}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-muted-foreground font-arabic leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="border-2 sticky top-6">
              <CardContent className="p-6">
                {enrollmentStep === 0 ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-3xl font-bold text-primary">{courseData.price}</span>
                        <span className="text-lg text-muted-foreground">ج.م</span>
                        {courseData.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through mr-2">{courseData.originalPrice}</span>
                        )}
                      </div>
                      {courseData.originalPrice && (
                        <Badge variant="destructive" className="font-arabic">
                          خصم {Math.round((1 - courseData.price / courseData.originalPrice) * 100)}%
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full btn-primary font-arabic text-lg py-6 mb-4"
                      onClick={handleEnrollment}
                    >
                      <BookOpen className="w-5 h-5 ml-2" />
                      اشترك في المادة
                    </Button>
                    
                    <div className="text-center text-sm text-muted-foreground font-arabic mb-4">
                      ضمان استرداد الأموال خلال 30 يوم
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 font-arabic">
                        <Heart className="w-4 h-4 ml-2" />
                        إضافة للمفضلة
                      </Button>
                      <Button variant="outline" className="flex-1 font-arabic">
                        <Share2 className="w-4 h-4 ml-2" />
                        مشاركة
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                      <h3 className="font-bold text-xl font-arabic mb-2">مرحباً بك في المادة!</h3>
                      <p className="text-muted-foreground font-arabic">
                        يمكنك الآن الوصول لجميع الدروس والمحتوى
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-arabic">تقدمك</span>
                        <span className="font-arabic">{overallProgress}%</span>
                      </div>
                      <Progress value={overallProgress} />
                    </div>
                    
                    <Button
                      className="w-full btn-primary font-arabic text-lg py-6 mb-4"
                      onClick={() => navigate(`/course/${id}/content`)}
                    >
                      <Play className="w-5 h-5 ml-2" />
                      متابعة التعلم
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold">{completedLessons}</div>
                        <div className="text-xs text-muted-foreground font-arabic">دروس مكتملة</div>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold">{months.filter(m => m.exam.isCompleted).length}</div>
                        <div className="text-xs text-muted-foreground font-arabic">امتحانات مك��ملة</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Course Features */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-arabic">هذا الكورس يشمل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Video, text: "120 ساعة فيديو تعليمي" },
                  { icon: FileText, text: "مذكرات PDF قابلة للتحميل" },
                  { icon: Target, text: "واجبات تفاعلية" },
                  { icon: Award, text: "امتحانات شهرية" },
                  { icon: Trophy, text: "شهادة إتمام معتمدة" },
                  { icon: Clock, text: "وصول مدى الحياة" },
                  { icon: MessageSquare, text: "دعم فني 24/7" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-primary" />
                    <span className="font-arabic">{feature.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Related Courses */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-arabic">مواد ذات صلة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "الفيزياء - الثالث الثانوي",
                    instructor: "د. فاطمة علي",
                    price: 279,
                    rating: 4.8,
                    image: "/api/placeholder/60/60"
                  },
                  {
                    title: "الكيمياء - الثالث الثانوي",
                    instructor: "د. محمد سالم",
                    price: 249,
                    rating: 4.7,
                    image: "/api/placeholder/60/60"
                  }
                ].map((course, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm font-arabic">{course.title}</h4>
                      <p className="text-xs text-muted-foreground font-arabic">{course.instructor}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs">{course.rating}</span>
                        </div>
                        <span className="font-bold text-sm text-primary">{course.price} ج.م</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
