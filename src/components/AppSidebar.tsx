import { useState, useEffect } from "react";
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Search,
  Trophy,
  Calendar,
  MessageSquare,
  Target,
  TrendingUp,
  ChevronRight,
  Bell,
  User,
  PlayCircle,
  FileText,
  Monitor,
  Clock,
  Star
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// تحديد المسارات بناء على دور المستخدم
const getNavigationItems = (userRole: string | null) => {
  const commonItems = [
    { 
      title: "الرئيسية", 
      url: "/", 
      icon: Home, 
      category: "main",
      badge: null,
      description: "صفحة البداية"
    },
    { 
      title: "المواد الدراسية", 
      url: "/courses", 
      icon: BookOpen, 
      category: "main",
      badge: "45+",
      description: "جميع المواد المتاحة"
    },
  ];

  const adminItems = [
    { 
      title: "لوحة التحكم", 
      url: "/dashboard", 
      icon: BarChart3, 
      category: "management",
      badge: null,
      description: "إحصائيات المنصة"
    },
    { 
      title: "إدارة الطلاب", 
      url: "/students", 
      icon: Users, 
      category: "management",
      badge: "15K+",
      description: "متابعة الطلاب"
    },
    { 
      title: "التقارير والتحليلات", 
      url: "/reports", 
      icon: TrendingUp, 
      category: "management",
      badge: null,
      description: "تحليلات متقدمة"
    },
    {
      title: "إدارة الكورسات",
      url: "/admin/courses",
      icon: FileText,
      category: "management",
      badge: "جديد",
      description: "إنشاء وتعديل الكورسات"
    },
    {
      title: "إدارة المحتوى",
      url: "/content",
      icon: FileText,
      category: "management",
      badge: null,
      description: "رفع وتنظيم المحتوى"
    },
  ];

  const studentItems = [
    { 
      title: "مسيرتي التعليمية", 
      url: "/my-progress", 
      icon: Target, 
      category: "learning",
      badge: "75%",
      description: "تتبع تقدمك الدراسي"
    },
    { 
      title: "الجدول الدراسي", 
      url: "/schedule", 
      icon: Calendar, 
      category: "learning",
      badge: null,
      description: "مواعيد الدروس والامتحانات"
    },
    { 
      title: "الدرجات والنتائج", 
      url: "/grades", 
      icon: Trophy, 
      category: "learning",
      badge: "3",
      description: "نتائج الامتحانات والواجبات"
    },
    { 
      title: "المحادثات", 
      url: "/messages", 
      icon: MessageSquare, 
      category: "learning",
      badge: "5",
      description: "تواصل مع المدرسين"
    },
  ];

  if (userRole === 'admin') {
    return [...commonItems, ...adminItems];
  } else {
    return [...commonItems, ...studentItems];
  }
};

const settingsItems = [
  { 
    title: "الإعدادات", 
    url: "/settings", 
    icon: Settings, 
    description: "إعدادات الحساب"
  },
  { 
    title: "المساعدة والدعم", 
    url: "/help", 
    icon: HelpCircle, 
    description: "المساعدة الفنية"
  },
];

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();
  const currentPath = location.pathname;

  // Get user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  // Close sidebar on mobile after navigation
  useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  }, [location, setOpen]);

  const isActive = (path: string) => currentPath === path || 
    (path !== "/" && currentPath.startsWith(path));

  const getNavCls = (isActive: boolean) =>
    `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      isActive 
        ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25 transform scale-[1.02]" 
        : "hover:bg-gradient-to-r hover:from-muted hover:to-muted/70 text-foreground hover:text-primary hover:shadow-md hover:transform hover:scale-[1.01]"
    }`;

  const navigationItems = getNavigationItems(userRole);
  
  const filteredNavigationItems = navigationItems.filter(item => 
    searchQuery === "" || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mainItems = filteredNavigationItems.filter(item => item.category === "main");
  const managementItems = filteredNavigationItems.filter(item => item.category === "management");
  const learningItems = filteredNavigationItems.filter(item => item.category === "learning");

  return (
    <Sidebar
      className="border-r-0 bg-gradient-to-b from-card via-card to-muted/30 shadow-xl backdrop-blur-xl"
      collapsible="icon"
    >
      <div className="flex flex-col h-full relative">
        {/* Header with Logo */}
        <div className="p-6 border-b border-border/10 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white animate-pulse"></div>
            </div>
            {open && (
              <div className="animate-fadeInRight">
                <h2 className="font-bold text-xl font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  EDULY
                </h2>
                <p className="text-xs text-muted-foreground font-arabic mt-1">
                  منصة التعلم الرقمي المتطورة
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats - when opened */}
        {open && (
          <div className="p-4 animate-fadeInUp">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-lg p-3 text-center border border-success/20">
                <div className="text-lg font-bold text-success">
                  {userRole === 'admin' ? '15K+' : '85%'}
                </div>
                <div className="text-xs text-muted-foreground font-arabic">
                  {userRole === 'admin' ? 'طالب' : 'إكمال'}
                </div>
              </div>
              <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-lg p-3 text-center border border-warning/20">
                <div className="text-lg font-bold text-warning">
                  {userRole === 'admin' ? '45+' : '12'}
                </div>
                <div className="text-xs text-muted-foreground font-arabic">
                  {userRole === 'admin' ? 'مادة' : 'مادة'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search - when opened */}
        {open && (
          <div className="p-4 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="ابحث في المنصة"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right font-arabic h-10 bg-muted/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-300"
              />
            </div>
          </div>
        )}

        <SidebarContent className="flex-1 py-4 space-y-6">
          {/* التنقل الرئيسي */}
          <SidebarGroup>
            {open && (
              <SidebarGroupLabel className="text-muted-foreground font-arabic font-semibold text-xs uppercase tracking-wider px-4 mb-3">
                التنقل الرئيسي
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent className="space-y-2 px-4">
              <SidebarMenu>
                {mainItems.map((item, index) => (
                  <SidebarMenuItem key={item.title} className="animate-slideInRight" style={{ animationDelay: `${index * 0.1}s` }}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/"} 
                        className={getNavCls(isActive(item.url))}
                      >
                        <div className="relative">
                          <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                          {isActive(item.url) && (
                            <div className="absolute inset-0 w-5 h-5 bg-white/20 rounded-lg animate-pulse"></div>
                          )}
                        </div>
                        {open && (
                          <>
                            <div className="flex-1">
                              <span className="font-arabic font-medium">{item.title}</span>
                              <p className="text-xs opacity-75 font-arabic">{item.description}</p>
                            </div>
                            {item.badge && (
                              <Badge variant={isActive(item.url) ? "secondary" : "default"} className="text-xs font-arabic">
                                {item.badge}
                              </Badge>
                            )}
                            {isActive(item.url) && (
                              <ChevronRight className="w-4 h-4 opacity-75" />
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* إدارة التدريس - للأدمن فقط */}
          {userRole === 'admin' && managementItems.length > 0 && (
            <SidebarGroup>
              {open && (
                <SidebarGroupLabel className="text-muted-foreground font-arabic font-semibold text-xs uppercase tracking-wider px-4 mb-3">
                  إدارة المنصة
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent className="space-y-2 px-4">
                <SidebarMenu>
                  {managementItems.map((item, index) => (
                    <SidebarMenuItem key={item.title} className="animate-slideInRight" style={{ animationDelay: `${(index + 2) * 0.1}s` }}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={getNavCls(isActive(item.url))}
                        >
                          <div className="relative">
                            <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                            {isActive(item.url) && (
                              <div className="absolute inset-0 w-5 h-5 bg-white/20 rounded-lg animate-pulse"></div>
                            )}
                          </div>
                          {open && (
                            <>
                              <div className="flex-1">
                                <span className="font-arabic font-medium">{item.title}</span>
                                <p className="text-xs opacity-75 font-arabic">{item.description}</p>
                              </div>
                              {item.badge && (
                                <Badge variant={isActive(item.url) ? "secondary" : "default"} className="text-xs font-arabic">
                                  {item.badge}
                                </Badge>
                              )}
                              {isActive(item.url) && (
                                <ChevronRight className="w-4 h-4 opacity-75" />
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* رحلة التعلم - للطلاب فقط */}
          {userRole === 'student' && learningItems.length > 0 && (
            <SidebarGroup>
              {open && (
                <SidebarGroupLabel className="text-muted-foreground font-arabic font-semibold text-xs uppercase tracking-wider px-4 mb-3">
                  رحلة التعلم
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent className="space-y-2 px-4">
                <SidebarMenu>
                  {learningItems.map((item, index) => (
                    <SidebarMenuItem key={item.title} className="animate-slideInRight" style={{ animationDelay: `${(index + 5) * 0.1}s` }}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={getNavCls(isActive(item.url))}
                        >
                          <div className="relative">
                            <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                            {isActive(item.url) && (
                              <div className="absolute inset-0 w-5 h-5 bg-white/20 rounded-lg animate-pulse"></div>
                            )}
                          </div>
                          {open && (
                            <>
                              <div className="flex-1">
                                <span className="font-arabic font-medium">{item.title}</span>
                                <p className="text-xs opacity-75 font-arabic">{item.description}</p>
                              </div>
                              {item.badge && (
                                <Badge variant={isActive(item.url) ? "secondary" : "default"} className="text-xs font-arabic">
                                  {item.badge}
                                </Badge>
                              )}
                              {isActive(item.url) && (
                                <ChevronRight className="w-4 h-4 opacity-75" />
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* Quick Action Button - when collapsed */}
        {!open && (
          <div className="p-4 border-t border-border/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(true)}
              className="w-full p-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
            >
              <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        )}

        {/* Settings at bottom */}
        <div className="border-t border-border/10 p-4 bg-gradient-to-r from-muted/20 to-transparent">
          <SidebarMenu>
            {settingsItems.map((item, index) => (
              <SidebarMenuItem key={item.title} className="mb-2">
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={item.url} 
                    className={getNavCls(isActive(item.url))}
                  >
                    <div className="relative">
                      <item.icon className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                      {isActive(item.url) && (
                        <div className="absolute inset-0 w-4 h-4 bg-white/20 rounded-lg animate-pulse"></div>
                      )}
                    </div>
                    {open && (
                      <>
                        <div className="flex-1">
                          <span className="font-arabic text-sm font-medium">{item.title}</span>
                          <p className="text-xs opacity-75 font-arabic">{item.description}</p>
                        </div>
                        {isActive(item.url) && (
                          <ChevronRight className="w-4 h-4 opacity-75" />
                        )}
                      </>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </div>
    </Sidebar>
  );
}
