import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Star, 
  Users, 
  BookOpen,
  TrendingUp,
  GraduationCap,
  Target,
  Lightbulb,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ScrollExpandMedia from "@/components/blocks/ScrollExpandMedia";

interface EnhancedHeroProps {
  onStartJourney: () => void;
  onLogin: () => void;
  onWatchDemo: () => void;
}

const benefits = [
  {
    icon: GraduationCap,
    title: "شروحات احترافية لا مثيل لها",
    description: "من نخبة أفضل المدر��ين المتخصصين في مصر مع خبرة تزيد عن 15 عاماً في تدريس الثانوية العامة",
    color: "text-teal-600"
  },
  {
    icon: Target,
    title: "دروس تفاعلية ممتعة وجذابة",
    description: "محتوى تفاعلي مبتكر بتقنية 4K مع أمثلة تطبيقية وتجارب عملية تجعل التعلم متعة حقيقية",
    color: "text-blue-600"
  },
  {
    icon: Lightbulb,
    title: "تدريبات وامتحانات ذكية",
    description: "بنك أسئلة ضخم مع نظام تصحيح فوري ومتابعة تقدم الطالب بالذكاء الاصطناعي المتطور",
    color: "text-purple-600"
  }
];

const stats = [
  { icon: Users, value: "15,000+", label: "طالب ثانوي متفوق", color: "text-teal-600" },
  { icon: BookOpen, value: "45+", label: "مادة دراسية شاملة", color: "text-blue-600" },
  { icon: Star, value: "4.9/5", label: "تقييم المنصة", color: "text-yellow-600" },
  { icon: TrendingUp, value: "95%", label: "معدل النجاح المضمون", color: "text-green-600" }
];

const mediaContent = {
  src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1920&auto=format&fit=crop',
  background: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1920&auto=format&fit=crop',
  title: 'مستقبلك التعليمي يبدأ هنا',
  date: 'منصة EDULY الرقمية',
  scrollToExpand: 'اسكرول لتكتشف المزيد'
};

const HeroContent = ({ onStartJourney, onLogin, onWatchDemo }: EnhancedHeroProps) => {
  return (
    <div className='max-w-7xl mx-auto px-6 py-20'>
      {/* Main Hero Content */}
      <motion.div 
        className="text-center mb-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-6 font-medium text-lg px-8 py-3">
          🎓 المنصة التعليمية الأولى في مصر والشرق الأوسط
        </Badge>
        
        <motion.h1 
          className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.3 }}
        >
          <span className="block">مستقبلك يبدأ هنا.</span>
          <span className="block bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mt-4">
            إتقان دراستك الثانوية
          </span>
          <span className="block text-4xl lg:text-5xl mt-2 text-gray-700 dark:text-gray-300">
            بثقة لا تتزعزع
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5 }}
        >
          <strong className="text-teal-600">EDULY:</strong> منصة تعليمية متكاملة، مصممة بدقة لطلاب الثانوية العامة في مصر. 
          دروس تفاعلية مبتكرة، شروحات احترافية من نخبة المعلمين، ومسار تعليمي مخصص يضمن تفوقك ونجاحك الباهر.
        </motion.p>

        {/* Enhanced CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="h-16 px-12 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xl font-bold shadow-xl"
              onClick={onStartJourney}
            >
              <Sparkles className="w-6 h-6 ml-3" />
              ابدأ رحلتك نحو التفوق الآن
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="h-16 px-12 border-teal-500 text-teal-600 hover:bg-teal-50 text-xl font-medium"
              onClick={onWatchDemo}
            >
              شاهد العرض التوضيحي
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          className="flex flex-wrap gap-6 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">منصة معتمدة رسمياً</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">أفضل تقييم (4.9/5)</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700">
            <TrendingUp className="w-5 h-5 text-teal-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">نتائج مضمونة 100%</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Stats Section */}
      <motion.div 
        className="mb-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
            أرقام تتحدث عن التميز
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            إنجازات حقيقية وثقة طلابية متنامية
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              className="text-center group"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 + index * 0.2 }}
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
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <div className="text-center mb-20">
          <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-6 font-medium text-lg px-8 py-3">
            💎 مميزات لا تُضاهى
          </Badge>
          <h2 className="text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">لماذا EDULY هو خيارك الأفضل؟</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            تجربة تعليمية متكاملة ومتطورة تجمع بين أحدث التقنيات التعليمية والخبرة الأكاديمية العميقة
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.7 + index * 0.15 }}
              whileHover={{ scale: 1.03, y: -5 }}
            >
              <Card className="h-full border-2 hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800">
                <CardContent className="p-8 text-center">
                  <motion.div 
                    className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${
                      benefit.color === 'text-teal-600' ? 'from-teal-500 to-teal-600' :
                      benefit.color === 'text-blue-600' ? 'from-blue-500 to-blue-600' :
                      'from-purple-500 to-purple-600'
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
      </motion.div>
    </div>
  );
};

export default function EnhancedHero({ onStartJourney, onLogin, onWatchDemo }: EnhancedHeroProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <ScrollExpandMedia
      mediaType="image"
      mediaSrc={mediaContent.src}
      bgImageSrc={mediaContent.background}
      title={mediaContent.title}
      date={mediaContent.date}
      scrollToExpand={mediaContent.scrollToExpand}
      textBlend
    >
      <HeroContent 
        onStartJourney={onStartJourney}
        onLogin={onLogin}
        onWatchDemo={onWatchDemo}
      />
    </ScrollExpandMedia>
  );
}
