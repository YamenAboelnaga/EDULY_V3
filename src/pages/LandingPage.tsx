import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Star,
  Users,
  BookOpen,
  TrendingUp,
  ChevronRight,
  Award,
  CheckCircle,
  Clock,
  Globe,
  Zap,
  Shield,
  Heart,
  GraduationCap,
  Target,
  Lightbulb,
  MousePointer,
  ArrowRight,
  Sparkles,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import EnhancedHero from "@/components/EnhancedHero";

// EDULY Color Palette
const colorPalette = {
  primary: "#009688", // EDULY Teal
  secondary: "#FFD700", // EDULY Gold
  background: "#FFFFFF",
  backgroundDark: "#1A202C",
  text: "#212529",
  textLight: "#E2E8F0"
};

const stats = [
  { icon: Users, value: "15,000+", label: "طالب ثانوي متفوق", color: "text-teal-600" },
  { icon: BookOpen, value: "45+", label: "مادة دراسية شاملة", color: "text-blue-600" },
  { icon: Play, value: "12,000+", label: "ساعة محتوى تعليمي", color: "text-purple-600" },
  { icon: Trophy, value: "95%", label: "معدل النجاح المضمون", color: "text-yellow-600" }
];

const benefits = [
  {
    icon: GraduationCap,
    title: "شروحات احترافية ل�� مثيل لها",
    description: "من نخبة أفضل المدرسين المتخصصين في مصر مع خبرة تزيد عن 15 عاماً في تدريس ال��انوية العامة",
    color: "text-teal-600"
  },
  {
    icon: Target,
    title: "دروس تفاعلية ممتعة وجذابة",
    description: "محتوى تفاعلي مبتكر بتقنية 4K مع ��مثلة تطبيقية وتجارب عملية تجعل التعلم متعة حقيقية",
    color: "text-blue-600"
  },
  {
    icon: Lightbulb,
    title: "تدريبات ��امتحانات ذكية",
    description: "بنك أسئلة ��خم مع نظام ��صحيح فوري ومتابعة تقدم الطالب بالذكاء الاصطناعي المتطور",
    color: "text-purple-600"
  },
  {
    icon: Users,
    title: "مدرسون خبراء ومتخصصون",
    description: "فريق متميز من أفضل المدرسين في مصر والشرق الأوسط مع سجل ��افل في تحقيق أعلى النتائج",
    color: "text-green-600"
  },
  {
    icon: Clock,
    title: "مرونة في الوقت والمكان",
    description: "تعلم في أي وقت ومن أي مكان مع إمكانية تحميل المحتوى للمشاهدة بدون إنترنت",
    color: "text-orange-600"
  },
  {
    icon: Shield,
    title: "منصة آمنة ومراقبة من الأهل",
    description: "بيئة تعليمية آمنة مع تقارير دور��ة لأولياء الأمور ونظام حماية متقدم",
    color: "text-red-600"
  }
];

const testimonials = [
  {
    name: "سارة أحمد محمد",
    grade: "الثالث الثانوي",
    subject: "الرياضيات", 
    comment: "EDULY غيرت حياتي تماماً! تحسنت درجاتي من 60% إلى 95% في الر��اضيات خلال شهرين فقط. المدرس��ن رائعين والشرح واضح جداً",
    rating: 5,
    avatar: "/api/placeholder/60/60",
    achievement: "تحسن 35% في الدرجات"
  },
  {
    name: "محمد علي حسن",
    grade: "الثاني الثانوي",
    subject: "الفيزياء",
    comment: "أفضل منصة تعليمية في مصر! الشرح واضح والتجارب التفاعلية خلتني أفهم الفيزياء بطريقة ممتعة ومبسطة. أنصح كل طالب يجربها",
    rating: 5,
    avatar: "/api/placeholder/60/60", 
    achievement: "إتقان المفاهيم الصعبة"
  },
  {
    name: "نور محمود فتحي",
    grade: "الأول الثانوي",
    subject: "الكيمياء",
    comment: "منصة EDULY محترفة جداً! المحتوى منظم بشكل مثالي والمدرسين يجاوبوا على كل الأسئلة. حققت المركز الأول على الصف",
    rating: 5,
    avatar: "/api/placeholder/60/60",
    achievement: "الطالبة الأولى على الصف"
  }
];

const partnerLogos = [
  { name: "وزارة التربية والتعليم", logo: "/api/placeholder/120/60" },
  { name: "جامعة القاهرة", logo: "/api/placeholder/120/60" },
  { name: "جامعة الأزهر", logo: "/api/placeholder/120/60" },
  { name: "Microsoft Education", logo: "/api/placeholder/120/60" },
  { name: "Google for Education", logo: "/api/placeholder/120/60" }
];

interface LandingPageProps {
  initialAuthModal?: "login" | "signup";
}

export default function LandingPage({ initialAuthModal }: LandingPageProps) {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!!initialAuthModal);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">(initialAuthModal || "login");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle initial auth modal changes
  useEffect(() => {
    if (initialAuthModal) {
      setAuthModalTab(initialAuthModal);
      setIsAuthModalOpen(true);
    } else {
      setIsAuthModalOpen(false);
    }
  }, [initialAuthModal]);

  // Reset tab when modal closes
  useEffect(() => {
    if (!isAuthModalOpen) {
      // Reset to default when modal is closed
      setAuthModalTab("login");
    }
  }, [isAuthModalOpen]);

  const handleStartJourney = () => {
    // Always navigate to signup route
    navigate("/signup");
  };

  const handleLogin = () => {
    // Always navigate to login route
    navigate("/login");
  };

  const handleWatchDemo = () => {
    // Navigate to demo or open modal
    navigate("/demo");
  };

  const handleTabChange = (tab: "login" | "signup") => {
    setAuthModalTab(tab);
    // Update URL to reflect the current tab
    if (tab === "login") {
      navigate("/login", { replace: true });
    } else {
      navigate("/signup", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Professional Header for Landing */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/")}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">EDULY</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">منصة التعلم الرقمي المتطورة</p>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">المميزات</a>
              <a href="#testimonials" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">آراء الطلاب</a>
              <a href="#demo" className="text-gray-600 hover:text-teal-600 transition-colors font-medium">عرض توضيحي</a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleLogin}
                className="border-teal-500 text-teal-600 hover:bg-teal-50"
              >
                تسجيل الدخول
              </Button>
              <Button
                onClick={handleStartJourney}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                ابدأ مجاناً
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section with Scroll Expansion */}
      <EnhancedHero
        onStartJourney={handleStartJourney}
        onLogin={handleLogin}
        onWatchDemo={handleWatchDemo}
      />

      {/* Enhanced Stats Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
              أرقام تتحدث عن التميز
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              إنجازات حقيقية وثقة طلابية متنامية
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center ${stat.color} bg-current/10 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <stat.icon className={`w-12 h-12 ${stat.color}`} />
                </div>
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-4 group-hover:scale-105 transition-transform">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-300 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-6 font-medium text-lg px-8 py-3">
              💎 مميزات لا تُضاهى
            </Badge>
            <h2 className="text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">لماذا EDULY ���� خ��ار�� الأ��ضل��</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              تجربة تعليمية متكاملة ومتطورة تجمع بين أحدث التقنيات التعليمية والخبرة الأكاديمية العميقة
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.15 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <Card className="h-full border-2 hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800">
                  <CardContent className="p-8 text-center">
                    <motion.div 
                      className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${
                        benefit.color === 'text-teal-600' ? 'from-teal-500 to-teal-600' :
                        benefit.color === 'text-blue-600' ? 'from-blue-500 to-blue-600' :
                        benefit.color === 'text-purple-600' ? 'from-purple-500 to-purple-600' :
                        benefit.color === 'text-green-600' ? 'from-green-500 to-green-600' :
                        benefit.color === 'text-orange-600' ? 'from-orange-500 to-orange-600' :
                        'from-red-500 to-red-600'
                      } flex items-center justify-center mx-auto mb-6 shadow-xl`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <benefit.icon className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">شهادات طلابنا ��لمتفوقين</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              قصص نجاح حقيقية من طلاب حققوا أحلامهم مع منصة EDULY
            </p>
          </motion.div>
          
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="border-2 p-8 bg-white dark:bg-gray-700 shadow-2xl">
              <CardContent className="p-0 text-center">
                {/* Rating Stars */}
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 500 }}
                    >
                      <Star className="w-8 h-8 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>
                
                {/* Testimonial Content */}
                <motion.blockquote 
                  key={currentTestimonial}
                  className="text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  "{testimonials[currentTestimonial].comment}"
                </motion.blockquote>
                
                {/* Student Info */}
                <motion.div 
                  className="flex items-center justify-center gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <img 
                    src={testimonials[currentTestimonial].avatar} 
                    alt={testimonials[currentTestimonial].name}
                    className="w-20 h-20 rounded-full shadow-lg"
                  />
                  <div className="text-right">
                    <div className="font-bold text-2xl text-gray-900 dark:text-white">{testimonials[currentTestimonial].name}</div>
                    <div className="text-gray-600 dark:text-gray-300 text-lg">
                      {testimonials[currentTestimonial].grade} - {testimonials[currentTestimonial].subject}
                    </div>
                    <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                      {testimonials[currentTestimonial].achievement}
                    </Badge>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
            
            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-teal-600 scale-125' : 'bg-gray-300 hover:bg-teal-400'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners/Logos Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-8">شركاء النجاح</h3>
          </motion.div>
          
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-12 opacity-60 hover:opacity-80 transition-opacity duration-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            {partnerLogos.map((partner, index) => (
              <motion.div
                key={index}
                className="grayscale hover:grayscale-0 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 w-auto"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">
              شاهد EDULY في العمل - مستقبل تعليمك بين يديك
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              اكتشف كيف تعمل منصة EDULY وكيف ستغير طريقة تعلمك للأفضل
            </p>
          </motion.div>

          <motion.div
            className="relative rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gray-700"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="aspect-video bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center relative">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F7f85819f98524b38bb15d3c4deba50ff%2F90c4134e7e774f5d918566be9faa5805?format=webp&width=800"
                alt="عرض توضيحي لمنصة EDULY"
                className="w-full h-full object-cover"
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/20"
                whileHover={{ scale: 1.05 }}
              >
                <motion.button
                  className="w-24 h-24 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWatchDemo}
                >
                  <Play className="w-12 h-12 text-teal-600 ml-2" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ultimate CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full animate-float blur-sm"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full animate-float delay-1000 blur-sm"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/5 rounded-full animate-float delay-500 blur-sm"></div>
        </div>
        
        <div className="relative container mx-auto px-6 text-center z-10 max-w-5xl">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-white/20 text-white border-white/30 font-medium text-lg px-8 py-3">
              🚀 ابدأ رحلتك الآن - مجاناً تماماً
            </Badge>
            
            <h2 className="text-6xl font-extrabold text-white leading-tight">
              <span className="block">مستعد لتحقيق أحلامك الأكاديمية</span>
              <span className="block bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
                وصناعة مستقبلك؟
              </span>
            </h2>
            
            <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              انضم إلى مجتمع EDULY اليوم وابدأ رحلتك التحويلية ��حو التفوق ال��كاديمي وال��جاح ��لباهر ال��ي تستحقه.
            </p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center mt-12"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="h-16 px-12 bg-white text-teal-600 hover:bg-gray-100 text-xl font-bold shadow-2xl"
                  onClick={handleStartJourney}
                >
                  <Sparkles className="w-6 h-6 ml-3" />
                  سجل الآن واحصل على 7 أيام مجاناً
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-16 px-12 border-white/40 text-white hover:bg-white/15 text-xl font-medium backdrop-blur-sm"
                  onClick={handleWatchDemo}
                >
                  <Play className="w-6 h-6 ml-3" />
                  شاهد عرض توضيحي
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Metrics */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {[
                { value: "99%", label: "رضا الطلاب" },
                { value: "95%", label: "نسبة النجاح" },
                { value: "24/7", label: "دعم فني" },
                { value: "100%", label: "ضمان الجودة" }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                  <div className="text-white/80">{metric.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">EDULY</span>
                  <p className="text-sm">منصة التعلم الرقمي</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                منصة تعليمية متطورة مصممة لمساعدة طلاب الث��نوية العامة على تحقيق أحلامهم الأكاديمية.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-white font-bold mb-4">التنقل</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400 transition-colors">الرئيسية</a></li>
                <li><a href="#features" className="hover:text-teal-400 transition-colors">المميزات</a></li>
                <li><a href="#testimonials" className="hover:text-teal-400 transition-colors">آرا�� الطلاب</a></li>
                <li><a href="#demo" className="hover:text-teal-400 transition-colors">عرض توضيحي</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-bold mb-4">الدعم</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400 transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">ا��صل بنا</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">سياسة الخصوصية</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-4">تواصل معنا</h4>
              <div className="space-y-4">
                <p>البريد الإلكتروني: support@eduly.com</p>
                <p>الهاتف: +20 123 456 7890</p>
                <div className="flex gap-4 mt-6">
                  {/* Social Media Icons */}
                  <motion.a
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-sm">FB</span>
                  </motion.a>
                  <motion.a
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-sm">TW</span>
                  </motion.a>
                  <motion.a
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-sm">IG</span>
                  </motion.a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2024 EDULY. ج��يع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        isFromRoute={!!initialAuthModal}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
