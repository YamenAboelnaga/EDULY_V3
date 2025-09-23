import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SessionManager } from "@/utils/session";
import { 
  Menu,
  X,
  Home,
  BookOpen,
  TrendingUp,
  FileText,
  Users,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  GraduationCap,
  Target,
  Trophy,
  Calendar,
  Star,
  Play,
  Clock,
  ChevronRight,
  User,
  Award,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

// Navigation Items for students
const getNavigationItems = () => {
  const commonItems = [
    {
      title: "الرئيسية",
      url: "/dashboard",
      icon: Home,
      category: "main",
      description: "نظرة عامة على تقدمك"
    },
    {
      title: "كورساتي",
      url: "/dashboard/courses", 
      icon: BookOpen, 
      category: "main",
      description: "جميع الكورسات المسجل بها"
    }
  ];

  const studentItems = [
    { 
      title: "تقدمي", 
      url: "/dashboard/progress", 
      icon: TrendingUp, 
      category: "learning",
      description: "تتبع تقدمك الدراسي"
    },
    { 
      title: "الاختبارات", 
      url: "/dashboard/quizzes", 
      icon: FileText, 
      category: "learning",
      description: "امتحانات وتقييمات"
    },
    { 
      title: "مكتبتي", 
      url: "/dashboard/library", 
      icon: Award, 
      category: "learning",
      description: "مواردك التعليمية"
    },
    { 
      title: "تواصل مع المعلمين", 
      url: "/dashboard/messages", 
      icon: MessageSquare, 
      category: "learning",
      description: "رسائل المدرسين"
    },
    { 
      title: "المجتمع", 
      url: "/dashboard/community", 
      icon: Users, 
      category: "social",
      description: "تفاعل مع الطلاب"
    }
  ];

  const settingsItems = [
    {
      title: "الإعدادات",
      url: "/dashboard/settings",
      icon: Settings,
      description: "إعدادات الحساب"
    },
    {
      title: "المساعدة والدعم",
      url: "/dashboard/help",
      icon: HelpCircle,
      description: "المساعدة الفنية"
    }
  ];

  return { main: commonItems, learning: studentItems, settings: settingsItems };
};

// Sample data for dashboard
const mockCourses = [
  {
    id: 1,
    title: "الرياضيات المتقدمة",
    progress: 85,
    nextLesson: "التفاضل والتكامل",
    instructor: "د. أحمد محمود",
    dueDate: "2024-02-15",
    image: "/api/placeholder/300/200"
  },
  {
    id: 2,
    title: "الفيزياء التطبيقية",
    progress: 72,
    nextLesson: "الكهرباء والمغناطيسية",
    instructor: "أ. فاطمة علي",
    dueDate: "2024-02-18",
    image: "/api/placeholder/300/200"
  },
  {
    id: 3,
    title: "اللغة العربية",
    progress: 90,
    nextLesson: "النصوص الأدبية",
    instructor: "أ. محمد سالم",
    dueDate: "2024-02-20",
    image: "/api/placeholder/300/200"
  }
];

const mockStats = [
  { label: "الكورسات المكتملة", value: "12", icon: Trophy, color: "text-green-600" },
  { label: "ساعات التعلم", value: "156", icon: Clock, color: "text-blue-600" },
  { label: "متوسط الدرجات", value: "92%", icon: Star, color: "text-yellow-600" },
  { label: "الترتيب العام", value: "#3", icon: Award, color: "text-purple-600" }
];

export default function DashboardPageNew() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('أحمد محمد');
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication check - للطلاب فقط
  useEffect(() => {
    if (!SessionManager.isAuthenticated()) {
      navigate('/');
      return;
    }

    // إذا كان أدمين، يجب أن يذهب للوحة تحكم الأدمين
    if (SessionManager.isAdmin()) {
      navigate('/admin/dashboard');
      return;
    }

    const session = SessionManager.getCurrentSession();
    if (session) {
      // Extract name from email or use default
      const emailName = session.email.split('@')[0];
      setUserName(emailName || 'المستخدم');
    }
  }, [navigate]);

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    SessionManager.clearSession();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay for mobile */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.aside
              className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto border-l border-gray-200 dark:border-gray-700"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-gray-700 dark:to-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-xl text-gray-900 dark:text-white">EDULY</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">منصة التعلم الرقمي</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleSidebar}
                      className="p-2"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* User Profile */}
                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="/api/placeholder/48/48" />
                      <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold">
                        {userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{userName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        طالب ثانوي
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                      <div className="text-lg font-bold text-green-700 dark:text-green-400">85%</div>
                      <div className="text-xs text-green-600 dark:text-green-500">متوسط الإكمال</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                      <div className="text-lg font-bold text-blue-700 dark:text-blue-400">12</div>
                      <div className="text-xs text-blue-600 dark:text-blue-500">كورس نشط</div>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="ابحث في ل��حة التحكم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 text-right h-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-4 pb-4 space-y-6">
                  {/* Main Navigation */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                      التنقل الرئيسي
                    </h3>
                    <nav className="space-y-2">
                      {navigationItems.main.map((item, index) => (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <button
                            onClick={() => navigate(item.url)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 group text-right"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center group-hover:from-teal-100 group-hover:to-teal-200 dark:group-hover:from-teal-900/30 dark:group-hover:to-teal-800/30 transition-all duration-200">
                              <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-gray-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300">
                                {item.title}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                          </button>
                        </motion.div>
                      ))}
                    </nav>
                  </div>

                  {/* Learning/Management Section */}
                  {navigationItems.learning && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
                        التعلم والتطوير
                      </h3>
                      <nav className="space-y-2">
                        {navigationItems.learning?.map((item, index) => (
                          <motion.div
                            key={item.title}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (navigationItems.main.length + index) * 0.1 }}
                          >
                            <button
                              onClick={() => navigate(item.url)}
                              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 group text-right"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center group-hover:from-teal-100 group-hover:to-teal-200 dark:group-hover:from-teal-900/30 dark:group-hover:to-teal-800/30 transition-all duration-200">
                                <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                              </div>
                              <div className="flex-1">
                                <span className="font-medium text-gray-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300">
                                  {item.title}
                                </span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                            </button>
                          </motion.div>
                        ))}
                      </nav>
                    </div>
                  )}
                </div>

                {/* Settings & Logout */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <nav className="space-y-2">
                    {navigationItems.settings.map((item, index) => (
                      <button
                        key={item.title}
                        onClick={() => navigate(item.url)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-right"
                      >
                        <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{item.title}</span>
                      </button>
                    ))}
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-right text-red-600 dark:text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="flex-1 text-sm font-medium">تسجيل الخروج</span>
                    </button>
                  </nav>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">EDULY</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dashboard</p>
                </div>
              </div>
            </div>

            {/* Center - Search (hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="ابحث عن الكورسات، الدروس، المدرسين..."
                  className="pr-12 text-right h-11 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>

              {/* User Info */}
              <div className="hidden md:flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white text-sm">
                    {userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    طالب ثانوي
                  </p>
                </div>
              </div>

              {/* Sidebar Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                مرحباً بك {userName} 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                استمر في رحلت�� التعليمية وحقق أهدافك الأكاديمية
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {mockStats.map((stat, index) => (
                  <Card key={index} className="border-2 hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                        stat.color === 'text-green-600' ? 'from-green-500 to-green-600' :
                        stat.color === 'text-blue-600' ? 'from-blue-500 to-blue-600' :
                        stat.color === 'text-yellow-600' ? 'from-yellow-500 to-yellow-600' :
                        'from-purple-500 to-purple-600'
                      } flex items-center justify-center mx-auto mb-4`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
            </motion.div>

            {/* Current Courses */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">كورساتي الحالية</h2>
                  <Button variant="outline" onClick={() => navigate('/dashboard/courses')}>
                    عرض الكل
                    <ChevronRight className="w-4 h-4 mr-2" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    >
                      <Card className="border-2 hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-300 cursor-pointer group">
                        <CardContent className="p-0">
                          <div className="relative">
                            <img
                              src={course.image}
                              alt={course.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{course.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">المدرس: {course.instructor}</p>
                            
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 dark:text-gray-400">التقدم</span>
                                  <span className="font-medium text-gray-900 dark:text-white">{course.progress}%</span>
                                </div>
                                <Progress value={course.progress} className="h-2" />
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">الدرس التالي:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{course.nextLesson}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>موعد التسليم: {course.dueDate}</span>
                              </div>
                            </div>
                            
                            <Button className="w-full mt-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800">
                              متابعة التعلم
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
