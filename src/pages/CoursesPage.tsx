import { useState, useEffect } from "react";
import { Search, Filter, Star, Users, Clock, BookOpen, Play, Award, TrendingUp, Grid, List, Eye } from "lucide-react";
import { SessionManager } from "@/utils/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { CourseCard } from "@/components/CourseCard";
import { useNavigate } from "react-router-dom";

const courses = [
  {
    id: 1,
    title: "الرياضيات المتقدمة - الصف الثالث الثانوي",
    instructor: "د. أحمد محمود",
    image: "/api/placeholder/400/250",
    duration: "120 ساعة",
    students: 2450,
    rating: 4.9,
    price: 299,
    category: "علوم",
    level: "متقدم",
    grade: "الثالث الثانوي",
    progress: 0,
    description: "كورس شامل لمنهج الرياضيات للصف الثالث الثانوي يشمل الجبر والهندسة والتفاضل والتكامل",
    features: ["شرح مبسط", "أمثلة تطبيقية", "امتحانات تجريبية", "مت��بعة مستمرة"],
    groupLink: "https://chat.whatsapp.com/invite/math_group",
    groupType: "whatsapp" as const,
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
    progress: 0,
    description: "دراسة شاملة للفيزياء التطبيقية تشمل الميكانيكا والكهرباء والمغناطيسية والضوء",
    features: ["تجارب عملية", "محاكاة ثلاثية الأبعاد", "حل المسائل", "مراجعات دورية"],
    groupLink: "https://t.me/physics_course",
    groupType: "telegram" as const,
    teacherImage: "/api/placeholder/100/100"
  },
  {
    id: 3,
    title: "اللغة العربية والأ��ب - الصف الأول الثانوي",
    instructor: "أ. محمد سالم",
    image: "/api/placeholder/400/250",
    duration: "80 ساعة",
    students: 3200,
    rating: 4.9,
    price: 199,
    category: "لغات",
    level: "��بتدئ",
    grade: "الأول الثانوي",
    progress: 0,
    description: "منهج شامل للغة العربية يشمل النحو والصرف والأدب والنصوص والقراءة والكتابة",
    features: ["تحليل نصوص", "قواعد مبسطة", "تطبيقات عملية", "إثراء المفردات"],
    groupLink: "https://chat.whatsapp.com/invite/arabic_literature",
    groupType: "whatsapp" as const,
    teacherImage: "/api/placeholder/100/100"
  },
  {
    id: 4,
    title: "الكيمياء العضوية - الصف الثالث الثانوي",
    instructor: "د. نور الهدى",
    image: "/api/placeholder/400/250",
    duration: "100 ساعة",
    students: 1650,
    rating: 4.7,
    price: 279,
    category: "علوم",
    level: "متقدم",
    grade: "الثالث الثانوي",
    progress: 0,
    description: "دراسة متعمقة للكيمياء العضوية والمركبات الكربونية والتفاعلات الكيميائية",
    features: ["نماذج ثلاثية ال��بعاد", "تجارب محاكاة", "أسئلة تفاعلية", "م��خصات مرئية"]
  },
  {
    id: 5,
    title: "التاريخ الحديث - الصف الثاني الثانوي",
    instructor: "أ. سارة أحمد",
    image: "/api/placeholder/400/250",
    duration: "70 ساعة",
    students: 2100,
    rating: 4.6,
    price: 189,
    category: "أدبي",
    level: "متوسط",
    grade: "الثاني الثانوي",
    progress: 0,
    description: "رحلة عبر التاريخ الحديث والمعاصر مع التركيز على تاريخ مصر والعالم العربي",
    features: ["خرائط تفاعلية", "جداول زمنية", "وثائق تاريخية", "تحليل أحداث"]
  },
  {
    id: 6,
    title: "الجغرافيا الطبيعية - الصف الأول الثانوي",
    instructor: "أ. محمود فتحي",
    image: "/api/placeholder/400/250",
    duration: "60 ساعة",
    students: 1800,
    rating: 4.5,
    price: 169,
    category: "أدبي",
    level: "مبتدئ",
    grade: "الأول الثانوي",
    progress: 0,
    description: "دراسة شاملة للجغرافيا الطبيعية تشمل المناخ والتضاريس والموارد الطبيعية",
    features: ["صور فضائية", "خرائط تفصيلية", "رحلات افتراضية", "تطبيقات عملية"]
  }
];

const categories = [
  { value: "الكل", label: "جميع الفئات" },
  { value: "علوم", label: "العلوم" },
  { value: "لغات", label: "اللغات" },
  { value: "أدبي", label: "الشعبة الأدبية" },
  { value: "رياضيات", label: "الرياضيات" }
];

const grades = [
  { value: "الكل", label: "جميع الصفوف" },
  { value: "الأول الثانوي", label: "الصف الأول الثانوي" },
  { value: "الثاني الثانوي", label: "الصف الثاني الثانوي" },
  { value: "الثالث الثانوي", label: "الصف الثالث الثانوي" }
];

const levels = [
  { value: "الكل", label: "جميع المستويات" },
  { value: "مبتدئ", label: "مبتدئ" },
  { value: "متوسط", label: "متوسط" },
  { value: "متقدم", label: "متقدم" }
];

export default function CoursesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedGrade, setSelectedGrade] = useState("ال��ل");
  const [selectedLevel, setSelectedLevel] = useState("الكل");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("popularity"); // popularity, price-low, price-high, rating
  const [showFilters, setShowFilters] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!SessionManager.isAuthenticated()) {
      navigate('/');
      return;
    }
  }, [navigate]);

  // Filter courses based on criteria
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "الكل" || course.category === selectedCategory;
    const matchesGrade = selectedGrade === "الكل" || course.grade === selectedGrade;
    const matchesLevel = selectedLevel === "الكل" || course.level === selectedLevel;
    const matchesPrice = course.price >= priceRange[0] && course.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesGrade && matchesLevel && matchesPrice;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "popularity":
      default:
        return b.students - a.students;
    }
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("الكل");
    setSelectedGrade("الكل");
    setSelectedLevel("الكل");
    setPriceRange([0, 500]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            المواد الدراسية
          </h1>
          <p className="text-xl text-muted-foreground font-arabic">
            اكتشف جميع المواد الدراسية المتاحة للمرحلة الثانوية
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-8 border-2">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="ابحث عن مادة أو مدرس..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-12 text-right font-arabic h-12 text-lg"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-3 items-center">
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-48 text-right">
                    <SelectValue placeholder="الصف الدراسي" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value} className="font-arabic">
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 text-right">
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value} className="font-arabic">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="font-arabic h-12"
                >
                  <Filter className="w-4 h-4 ml-2" />
                  فلاتر متقدمة
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium font-arabic mb-3 block">المستوى</label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="text-right">
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

                <div>
                  <label className="text-sm font-medium font-arabic mb-3 block">
                    نطاق السعر: {priceRange[0]} - {priceRange[1]} ج.م
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={500}
                    min={0}
                    step={10}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="font-arabic">
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground font-arabic">
              عرض {sortedCourses.length} من {courses.length} مادة
            </p>
            {(searchTerm || selectedCategory !== "الكل" || selectedGrade !== "الكل") && (
              <Badge variant="secondary" className="font-arabic">
                فلاتر مطبقة
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 text-right">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity" className="font-arabic">الأكثر شعبية</SelectItem>
                <SelectItem value="rating" className="font-arabic">الأعلى تقييماً</SelectItem>
                <SelectItem value="price-low" className="font-arabic">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value="price-high" className="font-arabic">السعر: من الأ��لى للأقل</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Courses Grid/List */}
        {sortedCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 font-arabic">لا توجد مواد مطابقة</h3>
            <p className="text-muted-foreground font-arabic mb-4">
              جرب تغيير معايير البحث أو الفلاتر
            </p>
            <Button onClick={clearFilters} className="font-arabic">
              مسح جميع الفلاتر
            </Button>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="courses-grid">
            {sortedCourses.map((course, index) => (
              <CourseCard key={course.id || index} {...course} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCourses.map((course, index) => (
              <Card key={index} className="course-card border-2 hover:border-primary/30">
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
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-2 font-arabic">{course.title}</h3>
                          <p className="text-muted-foreground font-arabic mb-2">{course.instructor}</p>
                          <p className="text-sm text-muted-foreground font-arabic">{course.description}</p>
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
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge className="font-arabic">{course.category}</Badge>
                          <Badge variant="outline" className="font-arabic">{course.level}</Badge>
                          <Badge variant="secondary" className="font-arabic">{course.grade}</Badge>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button variant="outline" className="font-arabic">
                            <Eye className="w-4 h-4 ml-2" />
                            معاينة
                          </Button>
                          <Button
                            className="btn-primary font-arabic"
                            onClick={() => navigate(`/course/${course.id || index + 1}`)}
                          >
                            <Play className="w-4 h-4 ml-2" />
                            ابدأ التعلم
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Featured Categories */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 font-display text-center">تصفح حسب الفئة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(1).map((category, index) => (
              <Card 
                key={category.value} 
                className="course-card cursor-pointer text-center p-6 border-2 hover:border-primary/30"
                onClick={() => setSelectedCategory(category.value)}
              >
                <CardContent className="p-0">
                  <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-purple-500' : 
                    index === 2 ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold mb-2 font-arabic">{category.label}</h3>
                  <p className="text-sm text-muted-foreground font-arabic">
                    {courses.filter(c => c.category === category.value).length} مادة
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
