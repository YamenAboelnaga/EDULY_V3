import { Bell, Search, User, Settings, LogOut, GraduationCap, LogIn, Star, MessageSquare, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { SessionManager } from "@/utils/session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar();
  const isHomePage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  
  // User state from SessionManager
  const [isLoggedIn, setIsLoggedIn] = useState(SessionManager.isAuthenticated());
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is logged in based on SessionManager
  useEffect(() => {
    const session = SessionManager.getCurrentSession();
    if (session) {
      setIsLoggedIn(true);
      setUserRole(session.role);
      setUserEmail(session.email);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
      setUserEmail(null);
    }
  }, [location]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    SessionManager.clearSession();
    setIsLoggedIn(false);
    setUserRole(null);
    setUserEmail(null);
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };


  const notifications = [
    {
      id: 1,
      type: "lesson",
      title: "درس جديد متاح",
      message: "تم إضافة درس جديد في مادة الرياضيات - التفاضل والتكامل",
      time: "منذ ساعة",
      unread: true
    },
    {
      id: 2,
      type: "assignment",
      title: "واجب جديد",
      message: "يرجى حل واجب الفيزياء - الكهرباء والمغناطيسية قبل نهاية الأسبوع",
      time: "��نذ 3 ساعات",
      unread: true
    },
    {
      id: 3,
      type: "grade",
      title: "نتيجة الامتحان",
      message: "حصلت على 92% في امتحان الكيمياء العضوية - ممتاز!",
      time: "منذ يوم",
      unread: false
    },
    {
      id: 4,
      type: "achievement",
      title: "إنجاز متميز",
      message: "تهانينا! أكملت 10 دروس متتالية بتقدير ممتاز",
      time: "منذ يومين",
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Side - Logo */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
            onClick={() => navigate("/")}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 group-hover:rotate-3">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-display group-hover:from-secondary group-hover:to-primary transition-all duration-300">
                EDULY
              </span>
              <p className="text-xs text-muted-foreground font-arabic">منصة التعلم الرقمي المتطورة</p>
            </div>
          </div>
        </div>

        {/* Center - Search Bar */}
        {!isHomePage && !isLoginPage && isLoggedIn && (
          <div className={`hidden lg:flex transition-all duration-300 ${
            sidebarOpen ? 'max-w-sm' : 'max-w-lg'
          } flex-1 mx-8`}>
            <form onSubmit={handleSearch} className="w-full relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors duration-200" />
                <Input
                  placeholder="ابحث عن المواد، الدروس، المدرسين..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 pl-4 h-11 text-right font-arabic bg-muted/50 border-border/60 focus:bg-background focus:border-primary/60 focus:shadow-lg focus:shadow-primary/10 transition-all duration-300 rounded-xl"
                />
              </div>
            </form>
          </div>
        )}

        {/* Right Side - User Actions */}
        <div className="flex items-center gap-3">
          {/* Guest Navigation */}
          {!isLoggedIn && (
            <div className="flex items-center gap-3">
              {isHomePage ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate("/courses")}
                    className="font-arabic hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-200">استكشف المواد</span>
                  </Button>
                  <div className="h-6 w-px bg-border/60 hidden sm:block"></div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogin}
                    className="shadow-md hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 font-arabic border-primary/20 hover:border-primary/40 group"
                  >
                    <LogIn className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="group-hover:scale-105 transition-transform duration-200">تسجيل الدخول</span>
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleLogin}
                    className="btn-primary shadow-md hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-arabic group"
                  >
                    <User className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="group-hover:scale-105 transition-transform duration-200">إنشاء حساب</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate("/")}
                    className="font-arabic hover:bg-primary/10 hover:text-primary transition-all duration-300"
                  >
                    الرئيسية
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate("/courses")}
                    className="font-arabic hover:bg-primary/10 hover:text-primary transition-all duration-300"
                  >
                    المواد
                  </Button>
                  <div className="h-6 w-px bg-border/60 hidden sm:block"></div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogin}
                    className="shadow-md hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 font-arabic border-primary/20 hover:border-primary/40"
                  >
                    <LogIn className="w-4 h-4 ml-2" />
                    تسجيل الدخول
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Authenticated User Navigation */}
          {isLoggedIn && (
            <>
              {/* Quick Actions for Logged Users */}
              {!isHomePage && (
                <div className="hidden xl:flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate("/")}
                    className="font-arabic hover:bg-primary/10 hover:text-primary transition-all duration-300"
                  >
                    الرئيسية
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate("/courses")}
                    className="font-arabic hover:bg-primary/10 hover:text-primary transition-all duration-300"
                  >
                    المواد
                  </Button>
                  {userRole === 'admin' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate("/dashboard")}
                      className="font-arabic hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                      لوحة التحكم
                    </Button>
                  )}
                  <div className="h-6 w-px bg-border/60"></div>
                </div>
              )}

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative p-2 hover:bg-muted/80 rounded-xl transition-all duration-300 group"
                  >
                    <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs animate-pulse"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 border-border/60 bg-background/95 backdrop-blur-xl">
                  <div className="p-4 border-b border-border/30 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold font-arabic text-lg">الإشعارات</h3>
                        <p className="text-sm text-muted-foreground font-arabic">
                          لديك {unreadCount} إشعار جديد
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="font-arabic text-xs">
                        تحديد الكل كمقروء
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b border-border/20 last:border-0 hover:bg-muted/30 transition-all duration-200 cursor-pointer group ${
                          notification.unread ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                            notification.type === 'lesson' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                            notification.type === 'assignment' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                            notification.type === 'grade' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                            'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                          }`}>
                            {notification.type === 'lesson' ? <Bell className="w-5 h-5" /> :
                             notification.type === 'assignment' ? <MessageSquare className="w-5 h-5" /> :
                             notification.type === 'grade' ? <Star className="w-5 h-5" /> :
                             <Star className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium font-arabic group-hover:text-primary transition-colors duration-200">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground font-arabic mt-1 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground font-arabic mt-2 flex items-center gap-2">
                              <span>{notification.time}</span>
                              {notification.unread && (
                                <span className="text-primary font-medium">جديد</span>
                              )}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border/30 bg-muted/20">
                    <Button variant="ghost" className="w-full font-arabic text-sm hover:bg-primary/10 hover:text-primary transition-all duration-300">
                      عرض جميع الإشعارات
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-3 p-2 hover:bg-muted/80 rounded-xl transition-all duration-300 group"
                  >
                    <Avatar className="w-9 h-9 group-hover:scale-105 transition-transform duration-200">
                      <AvatarImage src="/api/placeholder/36/36" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold">
                        {userRole === 'admin' ? 'ي' : 'ط'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-right">
                      <p className="text-sm font-medium font-arabic group-hover:text-primary transition-colors duration-200">
                        {userEmail ? userEmail.split('@')[0] : 'المستخدم'}
                      </p>
                      <p className="text-xs text-muted-foreground font-arabic">
                        {userRole === 'admin' ? 'مدير المنصة' : 'طالب ثانوي'}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 border-border/60 bg-background/95 backdrop-blur-xl">
                  <div className="p-4 border-b border-border/30 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="/api/placeholder/48/48" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                          {userRole === 'admin' ? 'ي' : 'ط'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium font-arabic">
                          {userEmail ? userEmail.split('@')[0] : 'المستخدم'}
                        </p>
                        <p className="text-xs text-muted-foreground font-arabic leading-relaxed">
                          {userEmail || 'user@eduly.com'}
                        </p>
                        <Badge variant="outline" className="mt-1 text-xs font-arabic">
                          {userRole === 'admin' ? 'مدير المنصة' : 'طالب ثانوي'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <DropdownMenuItem 
                      className="font-arabic cursor-pointer hover:bg-primary/10 transition-colors duration-200"
                      onClick={() => navigate('/profile')}
                    >
                      <User className="w-4 h-4 ml-2" />
                      الملف الشخصي
                    </DropdownMenuItem>
                    
                    {userRole === 'student' && (
                      <>
                        <DropdownMenuItem 
                          className="font-arabic cursor-pointer hover:bg-primary/10 transition-colors duration-200"
                          onClick={() => navigate('/courses')}
                        >
                          <Star className="w-4 h-4 ml-2" />
                          موادي الدراسية
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {userRole === 'admin' && (
                      <DropdownMenuItem 
                        className="font-arabic cursor-pointer hover:bg-primary/10 transition-colors duration-200"
                        onClick={() => navigate('/dashboard')}
                      >
                        <Settings className="w-4 h-4 ml-2" />
                        لوحة التحكم
                      </DropdownMenuItem>
                    )}
                    
                  </div>
                  
                  <DropdownMenuSeparator className="bg-border/30" />
                  
                  <div className="py-2">
                    <DropdownMenuItem 
                      className="font-arabic text-destructive cursor-pointer hover:bg-destructive/10 transition-colors duration-200"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 ml-2" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Sidebar Toggle Button */}
          {!isHomePage && !isLoginPage && (
            <div className="flex items-center gap-3 mr-4">
              <div className="h-6 w-px bg-border/60 hidden sm:block"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="hover:bg-muted/80 transition-all duration-200 p-2 rounded-lg group relative"
              >
                <div className="relative w-5 h-5">
                  {sidebarOpen ? (
                    <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  ) : (
                    <Menu className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  )}
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
