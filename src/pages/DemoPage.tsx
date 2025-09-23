import { motion } from "framer-motion";
import {
  Play,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  BookOpen,
  Trophy,
  GraduationCap,
  Target,
  Clock,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function DemoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Professional Header */}
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
              <button 
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-teal-600 transition-colors font-medium"
              >
                الرئيسية
              </button>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="border-teal-500 text-teal-600 hover:bg-teal-50"
              >
                تسجيل الدخول
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                ابدأ مجاناً
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-teal-100 text-teal-700 border-teal-200 mb-6 font-medium text-lg px-8 py-3">
              🎬 عرض توضيحي تفاعلي
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900 dark:text-white">
              اكتشف قوة منصة EDULY
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              شاهد كيف تعمل أفضل منصة تعليمية في مصر والشرق الأوسط، واكتشف كيف ستغير طريقة تعلمك للأفضل
            </p>
          </motion.div>

          {/* Main Demo Video */}
          <motion.div
            className="relative rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
                whileHover={{ scale: 1.02 }}
              >
                <motion.button
                  className="w-24 h-24 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Here you would typically open a video modal or start the demo
                    alert("سيتم تشغيل العرض التوضيحي قريباً");
                  }}
                >
                  <Play className="w-12 h-12 text-teal-600 ml-2" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Demo Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: BookOpen,
                title: "تصفح المحتوى التعليمي",
                description: "شاهد كيف يمكنك الوصول إلى آلاف الدروس التفاعلية",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Target,
                title: "نظام التقييم الذكي",
                description: "اكتشف كيف يتابع النظام تقدمك ويقترح التحسينات",
                color: "from-green-500 to-green-600"
              },
              {
                icon: Users,
                title: "التفاعل مع المدرسين",
                description: "تعلم كيفية التواصل المباشر مع أفضل المدرسين",
                color: "from-purple-500 to-purple-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="h-full border-2 hover:border-teal-200 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Interactive Demo Steps */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              جرب المنصة بنفسك - خطوة بخطوة
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "1", title: "إنشاء حساب", icon: Users, description: "سجل مجاناً في أقل من دقيقة" },
                { step: "2", title: "اختر موادك", icon: BookOpen, description: "حدد المواد التي تريد دراستها" },
                { step: "3", title: "ابدأ التعلم", icon: Play, description: "شاهد أول درس تفاعلي مجاناً" },
                { step: "4", title: "تابع تقدمك", icon: Trophy, description: "راقب إنجازاتك ودرجاتك" }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.step}
                  </div>
                  <step.icon className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Users, value: "15,000+", label: "طالب نشط", color: "text-teal-600" },
              { icon: BookOpen, value: "45+", label: "مادة دراسية", color: "text-blue-600" },
              { icon: Play, value: "12,000+", label: "ساعة محتوى", color: "text-purple-600" },
              { icon: Trophy, value: "95%", label: "نسبة النجاح", color: "text-yellow-600" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${stat.color} bg-current/10`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-blue-700">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              مستعد لبدء رحلتك التعليمية؟
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              انضم إلى آلاف الطلاب الذين حققوا أحلامهم مع منصة EDULY
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="h-16 px-12 bg-white text-teal-600 hover:bg-gray-100 text-xl font-bold"
                  onClick={() => navigate("/signup")}
                >
                  <ArrowRight className="w-6 h-6 ml-3" />
                  ابدأ مجاناً الآن
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 px-12 border-white/40 text-white hover:bg-white/15 text-xl font-medium"
                  onClick={() => navigate("/")}
                >
                  العودة للرئيسية
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}