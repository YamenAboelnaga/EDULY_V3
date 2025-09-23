import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  BarChart3,
  Calendar,
  MessageSquare,
  Shield,
  LogOut,
  GraduationCap,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { SessionManager } from "@/utils/session";
import { useCourses } from "@/contexts/CoursesContext";

// Sample data - في التطبيق الحقيقي ستأتي من قاعدة البيانات
const adminStats = {
  totalStudents: 4120,
  totalCourses: 6,
  totalRevenue: 930180,
  activeNow: 6
};

const recentCourses = [
  {
    id: 1,
    title: "اللغة العربية والأدب - الصف الثالث الثانوي",
    instructor: "أ. محمد سالم",
    students: 245,
    status: "نشط",
    image: "/api/placeholder/60/60"
  },
  {
    id: 2,
    title: "الرياضيات المتقدمة - الصف الثالث الثانوي",
    instructor: "د. أحمد محمود",
    students: 189,
    status: "نشط",
    image: "/api/placeholder/60/60"
  },
  {
    id: 3,
    title: "الفيزياء التطبيقية - الصف الثاني الثانوي",
    instructor: "أ. فاطمة علي",
    students: 156,
    status: "متقدم",
    image: "/api/placeholder/60/60"
  }
];

const recentStudents = [
  { id: 1, name: "أحمد محمد", email: "ahmed@example.com", grade: "الثالث الثانوي", status: "نشط", joinDate: "2024-01-15" },
  { id: 2, name: "فاطمة أحمد", email: "fatma@example.com", grade: "الثاني الثانوي", status: "نشط", joinDate: "2024-01-14" },
  { id: 3, name: "محمد علي", email: "mohamed@example.com", grade: "الأول ��لثانوي", status: "متوقف", joinDate: "2024-01-13" }
];

interface CourseFormData {
  title: string;
  description: string;
  instructor: string;
  price: number;
  category: string;
  level: string;
  duration: string;
  image: string;
  status: "active" | "draft" | "archived";
}

const initialFormData: CourseFormData = {
  title: "",
  description: "",
  instructor: "",
  price: 0,
  category: "",
  level: "",
  duration: "",
  image: "/api/placeholder/300/200",
  status: "active"
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  
  const { courses, addCourse, updateCourse, deleteCourse } = useCourses();

  // Check admin authentication
  useEffect(() => {
    if (!SessionManager.isAuthenticated() || !SessionManager.isAdmin()) {
      navigate('/admin');
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    SessionManager.clearSession();
    navigate('/admin');
  };

  const handleAddCourse = () => {
    setFormData(initialFormData);
    setIsAddCourseOpen(true);
  };

  const handleEditCourse = (course: any) => {
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      price: course.price,
      category: course.category,
      level: course.level,
      duration: course.duration,
      image: course.image,
      status: course.status
    });
    setEditingCourseId(course.id);
    setIsEditCourseOpen(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    setDeletingCourseId(courseId);
    setIsDeleteCourseOpen(true);
  };

  const submitAddCourse = () => {
    if (!formData.title.trim() || !formData.instructor.trim()) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    addCourse(formData);
    setIsAddCourseOpen(false);
    setFormData(initialFormData);
  };

  const submitEditCourse = () => {
    if (!formData.title.trim() || !formData.instructor.trim() || !editingCourseId) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    updateCourse(editingCourseId, formData);
    setIsEditCourseOpen(false);
    setFormData(initialFormData);
    setEditingCourseId(null);
  };

  const confirmDeleteCourse = () => {
    if (deletingCourseId) {
      deleteCourse(deletingCourseId);
      setIsDeleteCourseOpen(false);
      setDeletingCourseId(null);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatCard = ({ icon: Icon, title, value, change, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-2 hover:border-primary/30 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground font-arabic">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {change && (
                <p className={`text-xs ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'} font-arabic`}>
                  {change} من الشهر الماضي
                </p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const CourseFormDialog = ({ isOpen, onClose, onSubmit, title }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title: string;
  }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-arabic">{title}</DialogTitle>
          <DialogDescription className="font-arabic">
            املأ جميع المعلومات المطلوبة لإنشاء كورس جديد
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="font-arabic">عنوان الكورس *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: الرياضيات المتقدمة - الصف الثالث الثانوي"
              className="font-arabic"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description" className="font-arabic">وصف الكورس *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف شامل للكورس ومحتواه التعليمي..."
              className="font-arabic min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="instructor" className="font-arabic">اسم المدرس *</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                placeholder="مثال: ��حمد محمود"
                className="font-arabic"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="price" className="font-arabic">السعر (ج.م) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="199"
                className="font-arabic"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category" className="font-arabic">المادة *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="font-arabic">
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الرياضيات">الرياضيات</SelectItem>
                  <SelectItem value="الفيزياء">الفيزياء</SelectItem>
                  <SelectItem value="الكيمياء">الكيمياء</SelectItem>
                  <SelectItem value="الأحياء">الأحياء</SelectItem>
                  <SelectItem value="اللغة العربية">اللغة العربية</SelectItem>
                  <SelectItem value="اللغة الإنجليزية">اللغة الإنجليزية</SelectItem>
                  <SelectItem value="التاريخ">التاريخ</SelectItem>
                  <SelectItem value="الجغرافيا">الجغرافيا</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="level" className="font-arabic">المستوى *</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger className="font-arabic">
                  <SelectValue placeholder="اختر المستوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                  <SelectItem value="متوسط">متوسط</SelectItem>
                  <SelectItem value="متقدم">متقدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="duration" className="font-arabic">مدة الكورس *</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="مثال 80 ساعة"
                className="font-arabic"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status" className="font-arabic">حالة الكورس *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                <SelectTrigger className="font-arabic">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="image" className="font-arabic">رابط صورة الكورس</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="font-arabic"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-arabic">
            إلغاء
          </Button>
          <Button onClick={onSubmit} className="font-arabic">
            <Save className="w-4 h-4 ml-2" />
            حفظ الكورس
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">لوحة تحكم الإدارة</h1>
                <p className="text-sm text-gray-500 font-arabic">منصة EDULY</p>
              </div>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث في النظام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 w-64 font-arabic"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                3
              </Badge>
            </Button>

            {/* Admin Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">أد</AvatarFallback>
                  </Avatar>
                  <span className="font-arabic">المدير</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="font-arabic">
                  <Settings className="w-4 h-4 ml-2" />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="font-arabic text-red-600">
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="font-arabic">نظرة عامة</TabsTrigger>
            <TabsTrigger value="courses" className="font-arabic">إدارة الكورسات</TabsTrigger>
            <TabsTrigger value="students" className="font-arabic">إدارة الطلاب</TabsTrigger>
            <TabsTrigger value="analytics" className="font-arabic">التحليلات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                title="إجمالي الطلاب"
                value={adminStats.totalStudents.toLocaleString()}
                change="+12.5%"
                color="bg-blue-500"
              />
              <StatCard
                icon={BookOpen}
                title="الكورسات النشطة"
                value={courses.filter(c => c.status === 'active').length}
                change="+2"
                color="bg-green-500"
              />
              <StatCard
                icon={DollarSign}
                title="إجمالي الإيرادات"
                value={`${adminStats.totalRevenue.toLocaleString()} ج.م`}
                change="+8.2%"
                color="bg-yellow-500"
              />
              <StatCard
                icon={TrendingUp}
                title="متصل الآن"
                value={adminStats.activeNow}
                color="bg-purple-500"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Courses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-arabic">أحدث الكورسات</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("courses")}>
                    عرض الكل
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCourses.map((course) => (
                      <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium font-arabic text-sm">{course.title}</h4>
                          <p className="text-sm text-gray-500 font-arabic">{course.instructor}</p>
                          <p className="text-xs text-gray-400">{course.students} طالب</p>
                        </div>
                        <Badge variant={course.status === "نشط" ? "default" : "secondary"} className="font-arabic">
                          {course.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Students */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-arabic">أحدث الطلاب</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("students")}>
                    عرض الكل
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentStudents.map((student) => (
                      <div key={student.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium font-arabic text-sm">{student.name}</h4>
                          <p className="text-sm text-gray-500 font-arabic">{student.grade}</p>
                          <p className="text-xs text-gray-400">{student.joinDate}</p>
                        </div>
                        <Badge variant={student.status === "نشط" ? "default" : "secondary"} className="font-arabic">
                          {student.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-arabic">إ��راءات سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col gap-2" onClick={handleAddCourse}>
                    <Plus className="w-6 h-6" />
                    <span className="font-arabic text-sm">إضافة كورس</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("students")}>
                    <Users className="w-6 h-6" />
                    <span className="font-arabic text-sm">إدارة الطلاب</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Download className="w-6 h-6" />
                    <span className="font-arabic text-sm">تقرير شامل</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Settings className="w-6 h-6" />
                    <span className="font-arabic text-sm">إعدادات النظام</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {/* Course Management Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-arabic">إدارة الكورسات</h2>
                <p className="text-gray-500 font-arabic">إدارة شاملة لجميع الكورسات والمحتوى التعليمي</p>
              </div>
              <Button onClick={handleAddCourse} className="font-arabic">
                <Plus className="w-4 h-4 ml-2" />
                إضافة كورس جديد
              </Button>
            </div>

            {/* Courses List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-arabic">جميع الكورسات ({courses.length})</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="بحث في الكورسات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10 w-64 font-arabic"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {filteredCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 font-arabic">لا توجد كورسات</h3>
                      <p className="text-gray-500 font-arabic">ابدأ بإضافة كورس جديد</p>
                      <Button onClick={handleAddCourse} className="mt-4 font-arabic">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة كورس جديد
                      </Button>
                    </div>
                  ) : (
                    filteredCourses.map((course) => (
                      <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <img 
                          src={course.image} 
                          alt={course.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium font-arabic text-lg">{course.title}</h4>
                          <p className="text-sm text-gray-500 font-arabic mb-1">{course.instructor}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{course.students} طالب</span>
                            <span>{course.price} ج.م</span>
                            <span>{course.duration}</span>
                            <Badge variant={course.status === "active" ? "default" : "secondary"} className="font-arabic">
                              {course.status === "active" ? "نشط" : course.status === "draft" ? "مسودة" : "مؤرشف"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/course/${course.id}/content`)}
                            className="font-arabic"
                          >
                            <BookOpen className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-arabic">إدارة الطلاب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 font-arabic">إدارة الطلاب</h3>
                  <p className="text-gray-500 font-arabic">ستتم إضافة إدارة شاملة للطلاب قريباً</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-arabic">التحليلات والتقارير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 font-arabic">التحليلات والتقارير</h3>
                  <p className="text-gray-500 font-arabic">ستتم إضافة تحليلات متقدمة وتقارير مفصلة قريباً</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Course Dialog */}
      <CourseFormDialog
        isOpen={isAddCourseOpen}
        onClose={() => setIsAddCourseOpen(false)}
        onSubmit={submitAddCourse}
        title="إضافة كورس جديد"
      />

      {/* Edit Course Dialog */}
      <CourseFormDialog
        isOpen={isEditCourseOpen}
        onClose={() => {
          setIsEditCourseOpen(false);
          setEditingCourseId(null);
          setFormData(initialFormData);
        }}
        onSubmit={submitEditCourse}
        title="تعديل الكورس"
      />

      {/* Delete Course Dialog */}
      <AlertDialog open={isDeleteCourseOpen} onOpenChange={setIsDeleteCourseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-arabic">حذف الكورس</AlertDialogTitle>
            <AlertDialogDescription className="font-arabic">
              هل أنت متأكد من حذف هذا الكورس؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCourse} className="bg-red-600 hover:bg-red-700 font-arabic">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}