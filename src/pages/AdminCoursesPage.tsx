import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SessionManager } from "@/utils/session";
import { Plus, Edit, Trash2, Upload, Users, Star, Clock, Globe, Eye, Save, X, AlertCircle, CheckCircle, FileText, Video, Image, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: number;
  title: string;
  instructor: string;
  image: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  category: string;
  level: string;
  grade: string;
  description: string;
  features: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  lastModified: string;
  groupLink?: string;
  groupType?: 'whatsapp' | 'telegram';
  teacherImage?: string;
}

const initialCourses: Course[] = [
  {
    id: 1,
    title: "الرياضيات المتقدمة - الصف الثالث الثانوي",
    instructor: "د. أحمد محمود",
    image: "https://cdn.builder.io/api/v1/image/assets%2F7f85819f98524b38bb15d3c4deba50ff%2F90c4134e7e774f5d918566be9faa5805?format=webp&width=800",
    duration: "120 ساعة",
    students: 2450,
    rating: 4.9,
    price: 299,
    category: "علوم",
    level: "متقدم",
    grade: "الثالث الثانوي",
    description: "كورس شامل لمنهج الرياضيات للصف الثالث الثانوي يشمل الجبر والهندسة والتفاضل والتكامل",
    features: ["شرح مبسط", "أمثلة تطبيقية", "امتحانات تجريبية", "متابعة مستمرة"],
    status: 'published',
    createdAt: "2024-01-15",
    lastModified: "2024-01-20",
    groupLink: "https://chat.whatsapp.com/invite/example123",
    groupType: 'whatsapp',
    teacherImage: "/api/placeholder/100/100"
  },
  {
    id: 2,
    title: "الفيزياء التطبيقية - الصف الثاني الثانوي",
    instructor: "أ. فاطمة علي",
    image: "/api/placeholder/400/250",
    duration: "90 ساعة",
    students: 1890,
    rating: 4.8,
    price: 249,
    category: "علوم",
    level: "متوسط",
    grade: "الثاني الثانوي",
    description: "دراسة شاملة للفيزياء التطبيقية تشمل الميكانيكا والكهرباء والمغناطيسية والضوء",
    features: ["تجارب عملية", "محاكاة ثلاثية الأبعاد", "حل المسائل", "مراجعات دورية"],
    status: 'published',
    createdAt: "2024-01-10",
    lastModified: "2024-01-18",
    groupLink: "https://t.me/physics_course",
    groupType: 'telegram',
    teacherImage: "/api/placeholder/100/100"
  }
];

const categories = [
  { value: "علوم", label: "العلوم" },
  { value: "لغات", label: "اللغات" },
  { value: "أدبي", label: "الشعبة الأدبية" },
  { value: "رياضيات", label: "الرياضيات" }
];

const grades = [
  { value: "الأول الثانوي", label: "الصف الأول الثانوي" },
  { value: "الثاني الثانوي", label: "الصف الثاني الثانوي" },
  { value: "الثالث الثانوي", label: "الصف الثالث الثانوي" }
];

const levels = [
  { value: "مبتدئ", label: "مبتدئ" },
  { value: "متوسط", label: "متوسط" },
  { value: "متقدم", label: "متقدم" }
];

export default function AdminCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  // Admin authentication check
  useEffect(() => {
    if (!SessionManager.isAuthenticated() || !SessionManager.isAdmin()) {
      navigate('/');
      return;
    }
  }, [navigate]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedTeacherImage, setSelectedTeacherImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const teacherImageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    image: "",
    duration: "",
    price: 0,
    category: "",
    level: "",
    grade: "",
    description: "",
    features: "",
    groupLink: "",
    groupType: "whatsapp" as 'whatsapp' | 'telegram',
    teacherImage: ""
  });

  const resetForm = () => {
    setFormData({
      title: "",
      instructor: "",
      image: "",
      duration: "",
      price: 0,
      category: "",
      level: "",
      grade: "",
      description: "",
      features: "",
      groupLink: "",
      groupType: "whatsapp",
      teacherImage: ""
    });
    setSelectedImage("");
    setSelectedTeacherImage("");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'course' | 'teacher') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'course') {
          setSelectedImage(result);
          setFormData(prev => ({ ...prev, image: result }));
        } else {
          setSelectedTeacherImage(result);
          setFormData(prev => ({ ...prev, teacherImage: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCourse = () => {
    if (!formData.title || !formData.instructor || !formData.category) {
      alert("يرجى ملء الحقول المطلوبة");
      return;
    }

    const newCourse: Course = {
      id: courses.length + 1,
      ...formData,
      students: 0,
      rating: 0,
      features: formData.features.split('\n').filter(f => f.trim()),
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };

    setCourses([...courses, newCourse]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      instructor: course.instructor,
      image: course.image,
      duration: course.duration,
      price: course.price,
      category: course.category,
      level: course.level,
      grade: course.grade,
      description: course.description,
      features: course.features.join('\n'),
      groupLink: course.groupLink || "",
      groupType: course.groupType || "whatsapp",
      teacherImage: course.teacherImage || ""
    });
    setSelectedImage(course.image);
    setSelectedTeacherImage(course.teacherImage || "");
  };

  const handleUpdateCourse = () => {
    if (!editingCourse) return;

    const updatedCourses = courses.map(course => 
      course.id === editingCourse.id 
        ? {
            ...course,
            ...formData,
            features: formData.features.split('\n').filter(f => f.trim()),
            lastModified: new Date().toISOString().split('T')[0]
          }
        : course
    );

    setCourses(updatedCourses);
    setEditingCourse(null);
    resetForm();
  };

  const handleDeleteCourse = (courseId: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الكورس؟")) {
      setCourses(courses.filter(course => course.id !== courseId));
    }
  };

  const toggleCourseStatus = (courseId: number, newStatus: Course['status']) => {
    const updatedCourses = courses.map(course => 
      course.id === courseId 
        ? { ...course, status: newStatus, lastModified: new Date().toISOString().split('T')[0] }
        : course
    );
    setCourses(updatedCourses);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Course['status']) => {
    switch (status) {
      case 'published': return 'منشور';
      case 'draft': return 'مسودة';
      case 'archived': return 'مؤرشف';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              إدارة الكورسات
            </h1>
            <p className="text-xl text-muted-foreground font-arabic mt-2">
              إنشاء وتعديل وإدارة جميع الكورسات التعليمية
            </p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="font-arabic shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-5 h-5 ml-2" />
                إنشاء كورس جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-arabic">إنشاء كورس جديد</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic" className="font-arabic">معلومات أساسية</TabsTrigger>
                  <TabsTrigger value="content" className="font-arabic">المحتوى والتفاصيل</TabsTrigger>
                  <TabsTrigger value="social" className="font-arabic">التواصل والمجموعات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">عنوان الكورس *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="أدخل عنوان الكورس"
                        className="text-right font-arabic h-12"
                      />
                    </div>
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">اسم المدرس *</Label>
                      <Input
                        value={formData.instructor}
                        onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                        placeholder="أدخل اسم المدرس"
                        className="text-right font-arabic h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">الفئة *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger className="text-right h-12">
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} className="font-arabic">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">الصف الدراسي</Label>
                      <Select value={formData.grade} onValueChange={(value) => setFormData({...formData, grade: value})}>
                        <SelectTrigger className="text-right h-12">
                          <SelectValue placeholder="اختر الصف" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value} className="font-arabic">
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">المستوى</Label>
                      <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                        <SelectTrigger className="text-right h-12">
                          <SelectValue placeholder="اختر المستوى" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level.value} value={level.value} className="font-arabic">
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">مدة الكورس</Label>
                      <Input
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        placeholder="مثال: 120 ساعة"
                        className="text-right font-arabic h-12"
                      />
                    </div>
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">السعر (ج.م)</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                        placeholder="0"
                        className="text-right font-arabic h-12"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-6">
                  <div>
                    <Label className="font-arabic text-lg mb-2 block">وصف الكورس</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="أدخل وصف شامل للكورس..."
                      className="text-right font-arabic min-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label className="font-arabic text-lg mb-2 block">مميزات الكورس (كل مميزة في سطر منفصل)</Label>
                    <Textarea
                      value={formData.features}
                      onChange={(e) => setFormData({...formData, features: e.target.value})}
                      placeholder="شرح مبسط&#10;أمثلة تطبيقية&#10;امتحانات تجريبية"
                      className="text-right font-arabic min-h-[120px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="font-arabic text-lg mb-4 block">صورة الكورس</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        {selectedImage ? (
                          <div className="space-y-4">
                            <img src={selectedImage} alt="معاينة" className="w-full h-40 object-cover rounded-lg mx-auto" />
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="font-arabic">
                              <Upload className="w-4 h-4 ml-2" />
                              تغيير الصورة
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="font-arabic">
                                <Upload className="w-4 h-4 ml-2" />
                                رفع صورة الكورس
                              </Button>
                              <p className="text-sm text-muted-foreground font-arabic mt-2">
                                يفضل استخدام صور بحجم 800x400 بكسل
                              </p>
                            </div>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'course')}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="font-arabic text-lg mb-4 block">صورة المدرس</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        {selectedTeacherImage ? (
                          <div className="space-y-4">
                            <img src={selectedTeacherImage} alt="صورة المدرس" className="w-32 h-32 object-cover rounded-full mx-auto" />
                            <Button variant="outline" onClick={() => teacherImageInputRef.current?.click()} className="font-arabic">
                              <Upload className="w-4 h-4 ml-2" />
                              تغيير الصورة
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <Button variant="outline" onClick={() => teacherImageInputRef.current?.click()} className="font-arabic">
                                <Upload className="w-4 h-4 ml-2" />
                                رفع صورة المدرس
                              </Button>
                              <p className="text-sm text-muted-foreground font-arabic mt-2">
                                يفضل استخدام صور مربعة بحجم 300x300 بكسل
                              </p>
                            </div>
                          </div>
                        )}
                        <input
                          ref={teacherImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'teacher')}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-6 mt-6">
                  <Alert>
                    <MessageCircle className="h-4 w-4" />
                    <AlertDescription className="font-arabic">
                      يمكن للطلاب الانضمام لمجموعة المدرس للحصول على الدعم والإجابة على الأسئلة
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label className="font-arabic text-lg mb-2 block">نوع المجموعة</Label>
                    <Select value={formData.groupType} onValueChange={(value: 'whatsapp' | 'telegram') => setFormData({...formData, groupType: value})}>
                      <SelectTrigger className="text-right h-12">
                        <SelectValue placeholder="اختر نوع المجموعة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp" className="font-arabic">واتساب</SelectItem>
                        <SelectItem value="telegram" className="font-arabic">تليجرام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="font-arabic text-lg mb-2 block">رابط المجموعة</Label>
                    <Input
                      value={formData.groupLink}
                      onChange={(e) => setFormData({...formData, groupLink: e.target.value})}
                      placeholder={formData.groupType === 'whatsapp' ? 'https://chat.whatsapp.com/invite/example' : 'https://t.me/example'}
                      className="text-right font-arabic h-12"
                    />
                    <p className="text-sm text-muted-foreground font-arabic mt-2">
                      {formData.groupType === 'whatsapp' 
                        ? 'أدخل رابط دعوة مجموعة الواتساب'
                        : 'أدخل رابط قناة أو مجموعة التليجرام'
                      }
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 mt-8">
                <Button onClick={handleCreateCourse} size="lg" className="font-arabic flex-1">
                  <Save className="w-5 h-5 ml-2" />
                  إنشاء الكورس
                </Button>
                <Button variant="outline" onClick={() => {setIsCreateModalOpen(false); resetForm();}} size="lg" className="font-arabic">
                  <X className="w-5 h-5 ml-2" />
                  إلغاء
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{courses.filter(c => c.status === 'published').length}</div>
                  <div className="text-sm text-muted-foreground font-arabic">كورس منشور</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{courses.filter(c => c.status === 'draft').length}</div>
                  <div className="text-sm text-muted-foreground font-arabic">مسودة</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{courses.reduce((sum, c) => sum + c.students, 0)}</div>
                  <div className="text-sm text-muted-foreground font-arabic">إجمالي الطلاب</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {(courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground font-arabic">متوسط التقييم</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-2">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="ابحث عن كورس أو مدرس..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-right font-arabic h-12"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 text-right h-12">
                  <SelectValue placeholder="فلترة حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-arabic">جميع الكورسات</SelectItem>
                  <SelectItem value="published" className="font-arabic">المنشورة</SelectItem>
                  <SelectItem value="draft" className="font-arabic">المسودات</SelectItem>
                  <SelectItem value="archived" className="font-arabic">المؤرشفة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Courses List */}
        <div className="space-y-6">
          {filteredCourses.length === 0 ? (
            <Card className="p-12 text-center border-2">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 font-arabic">لا توجد كورسات</h3>
              <p className="text-muted-foreground font-arabic">
                لا توجد كورسات مطابقة للبحث أو المرشحات المحددة
              </p>
            </Card>
          ) : (
            filteredCourses.map((course) => (
              <Card key={course.id} className="border-2 hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={course.image} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/api/placeholder/400/250";
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold font-arabic">{course.title}</h3>
                            <Badge className={`font-arabic ${getStatusColor(course.status)}`}>
                              {getStatusText(course.status)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground font-arabic mb-2">المدرس: {course.instructor}</p>
                          <p className="text-sm text-muted-foreground font-arabic line-clamp-2">{course.description}</p>
                        </div>
                        <div className="text-left">
                          <div className="text-2xl font-bold text-primary">{course.price}</div>
                          <div className="text-sm text-muted-foreground font-arabic">ج.م</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-arabic">{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span className="font-arabic">{course.students} طالب</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{course.rating}</span>
                        </div>
                        {course.groupLink && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-arabic">
                              {course.groupType === 'whatsapp' ? 'واتساب' : 'تليجرام'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge className="font-arabic">{course.category}</Badge>
                          <Badge variant="outline" className="font-arabic">{course.level}</Badge>
                          <Badge variant="secondary" className="font-arabic">{course.grade}</Badge>
                        </div>
                        
                        <div className="flex gap-3">
                          {course.status === 'draft' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleCourseStatus(course.id, 'published')}
                              className="font-arabic"
                            >
                              نشر
                            </Button>
                          )}
                          {course.status === 'published' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleCourseStatus(course.id, 'draft')}
                              className="font-arabic"
                            >
                              إخفاء
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCourse(course)}
                            className="font-arabic"
                          >
                            <Edit className="w-4 h-4 ml-2" />
                            تعديل
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id)}
                            className="font-arabic text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {editingCourse && (
          <Dialog open={!!editingCourse} onOpenChange={() => {setEditingCourse(null); resetForm();}}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-arabic">تعديل الكورس</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic" className="font-arabic">معلومات أساسية</TabsTrigger>
                  <TabsTrigger value="content" className="font-arabic">المحتوى والتفاصيل</TabsTrigger>
                  <TabsTrigger value="social" className="font-arabic">التواصل والمجموعات</TabsTrigger>
                </TabsList>
                
                {/* Same form content as create modal but with update handler */}
                <TabsContent value="basic" className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">عنوان الكورس *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="أدخل عنوان الكورس"
                        className="text-right font-arabic h-12"
                      />
                    </div>
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">اسم المدرس *</Label>
                      <Input
                        value={formData.instructor}
                        onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                        placeholder="أدخل اسم المدرس"
                        className="text-right font-arabic h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">الفئة *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger className="text-right h-12">
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} className="font-arabic">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">الصف الدراسي</Label>
                      <Select value={formData.grade} onValueChange={(value) => setFormData({...formData, grade: value})}>
                        <SelectTrigger className="text-right h-12">
                          <SelectValue placeholder="اختر الصف" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value} className="font-arabic">
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">المستوى</Label>
                      <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                        <SelectTrigger className="text-right h-12">
                          <SelectValue placeholder="اختر المستوى" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level.value} value={level.value} className="font-arabic">
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">مدة الكورس</Label>
                      <Input
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        placeholder="مثال: 120 ساعة"
                        className="text-right font-arabic h-12"
                      />
                    </div>
                    <div>
                      <Label className="font-arabic text-lg mb-2 block">السعر (ج.م)</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                        placeholder="0"
                        className="text-right font-arabic h-12"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-6">
                  <div>
                    <Label className="font-arabic text-lg mb-2 block">وصف الكورس</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="أدخل وصف شامل للكورس..."
                      className="text-right font-arabic min-h-[120px]"
                    />
                  </div>

                  <div>
                    <Label className="font-arabic text-lg mb-2 block">مميزات الكورس (كل مميزة في سطر منفصل)</Label>
                    <Textarea
                      value={formData.features}
                      onChange={(e) => setFormData({...formData, features: e.target.value})}
                      placeholder="شرح مبسط&#10;أمثلة تطبيقية&#10;امتحانات تجريبية"
                      className="text-right font-arabic min-h-[120px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="font-arabic text-lg mb-4 block">صورة الكورس</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        {selectedImage ? (
                          <div className="space-y-4">
                            <img src={selectedImage} alt="معاينة" className="w-full h-40 object-cover rounded-lg mx-auto" />
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="font-arabic">
                              <Upload className="w-4 h-4 ml-2" />
                              تغيير الصورة
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="font-arabic">
                                <Upload className="w-4 h-4 ml-2" />
                                رفع صورة الكورس
                              </Button>
                              <p className="text-sm text-muted-foreground font-arabic mt-2">
                                يفضل استخدام صور بحجم 800x400 بكسل
                              </p>
                            </div>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'course')}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="font-arabic text-lg mb-4 block">صورة المدرس</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        {selectedTeacherImage ? (
                          <div className="space-y-4">
                            <img src={selectedTeacherImage} alt="صورة المدرس" className="w-32 h-32 object-cover rounded-full mx-auto" />
                            <Button variant="outline" onClick={() => teacherImageInputRef.current?.click()} className="font-arabic">
                              <Upload className="w-4 h-4 ml-2" />
                              تغيير الصورة
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                            <div>
                              <Button variant="outline" onClick={() => teacherImageInputRef.current?.click()} className="font-arabic">
                                <Upload className="w-4 h-4 ml-2" />
                                رفع صورة المدرس
                              </Button>
                              <p className="text-sm text-muted-foreground font-arabic mt-2">
                                يفضل استخدام صور مربعة بحجم 300x300 بكسل
                              </p>
                            </div>
                          </div>
                        )}
                        <input
                          ref={teacherImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'teacher')}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-6 mt-6">
                  <Alert>
                    <MessageCircle className="h-4 w-4" />
                    <AlertDescription className="font-arabic">
                      يمكن للطلاب الانضمام لمجموعة المدرس للحصول على الدعم والإجابة على الأسئلة
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label className="font-arabic text-lg mb-2 block">نوع المجموعة</Label>
                    <Select value={formData.groupType} onValueChange={(value: 'whatsapp' | 'telegram') => setFormData({...formData, groupType: value})}>
                      <SelectTrigger className="text-right h-12">
                        <SelectValue placeholder="اختر نوع المجموعة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp" className="font-arabic">واتساب</SelectItem>
                        <SelectItem value="telegram" className="font-arabic">تليجرام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="font-arabic text-lg mb-2 block">رابط المجموعة</Label>
                    <Input
                      value={formData.groupLink}
                      onChange={(e) => setFormData({...formData, groupLink: e.target.value})}
                      placeholder={formData.groupType === 'whatsapp' ? 'https://chat.whatsapp.com/invite/example' : 'https://t.me/example'}
                      className="text-right font-arabic h-12"
                    />
                    <p className="text-sm text-muted-foreground font-arabic mt-2">
                      {formData.groupType === 'whatsapp' 
                        ? 'أدخل رابط دعوة مجموعة الواتساب'
                        : 'أدخل رابط قناة أو مجموعة التليجرام'
                      }
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 mt-8">
                <Button onClick={handleUpdateCourse} size="lg" className="font-arabic flex-1">
                  <Save className="w-5 h-5 ml-2" />
                  حفظ التغييرات
                </Button>
                <Button variant="outline" onClick={() => {setEditingCourse(null); resetForm();}} size="lg" className="font-arabic">
                  <X className="w-5 h-5 ml-2" />
                  إلغاء
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}