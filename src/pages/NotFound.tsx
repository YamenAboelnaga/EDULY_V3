import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-2 shadow-2xl">
        <CardContent className="p-12 text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-primary/20 mb-4 font-display">404</div>
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-bounce">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold mb-4 font-arabic">الصفحة غير موجودة</h1>
          <p className="text-xl text-muted-foreground font-arabic mb-8 leading-relaxed">
            عذراً، لا يمكننا العثور على الصفحة التي تبحث عنها. 
            ربما تم نقلها أو حذفها، أو أن الرابط غير صحيح.
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Button 
              onClick={() => navigate("/")}
              className="btn-primary font-arabic"
            >
              <Home className="w-4 h-4 ml-2" />
              الصفحة الرئيسية
            </Button>
            <Button 
              onClick={() => navigate("/courses")}
              variant="outline"
              className="font-arabic"
            >
              <BookOpen className="w-4 h-4 ml-2" />
              تصفح المواد
            </Button>
            <Button 
              onClick={() => navigate("/login")}
              variant="outline"
              className="font-arabic"
            >
              <Search className="w-4 h-4 ml-2" />
              تسجيل الدخول
            </Button>
          </div>

          {/* Suggestions */}
          <div className="text-center">
            <h3 className="font-bold mb-3 font-arabic">اقتراحات مفيدة:</h3>
            <ul className="text-sm text-muted-foreground space-y-2 font-arabic">
              <li>تأكد من كتابة الرابط بشكل صحيح</li>
              <li>استخدم قائمة التنقل للوصول للصفحات</li>
              <li>ابحث عن المحتوى الذي تريده من صفحة المواد</li>
              <li>تواصل معنا إذا كنت تواجه مشكلة تقنية</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
