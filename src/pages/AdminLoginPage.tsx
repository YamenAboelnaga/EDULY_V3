import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { validateAdminCredentials, RateLimiter } from "@/utils/security";
import { SessionManager } from "@/utils/session";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Rate limiting
  const rateLimiter = new RateLimiter(3, 10 * 60 * 1000); // 3 attempts per 10 minutes

  // Check if already logged in as admin
  useEffect(() => {
    if (SessionManager.isAuthenticated() && SessionManager.isAdmin()) {
      navigate("/admin/dashboard");
      return;
    }
    
    // If logged in as student, show warning
    if (SessionManager.isAuthenticated() && !SessionManager.isAdmin()) {
      setError("يجب تسجيل الخروج من حساب الطالب أولاً للدخول كأدمين");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Rate limiting check
    if (!rateLimiter.isAllowed(formData.email)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(formData.email) / (60 * 1000));
      setError(`تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى بعد ${remainingTime} دقيقة`);
      return;
    }

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("جميع الحقول مطلوبة");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate loading delay for security
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Validate admin credentials
      if (!validateAdminCredentials(formData.email, formData.password)) {
        setError("بيانات الأدمين غير صحيحة");
        setIsLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      
      // Clear any existing session first
      SessionManager.clearSession();
      
      // Create admin session
      SessionManager.createSession(formData.email, 'admin');

      // Short delay to show success message
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to admin dashboard
      navigate("/admin/dashboard");

    } catch (error) {
      setError("حدث خطأ في تسجيل الدخول");
      setIsLoading(false);
    }
  };

  const handleLogoutFirst = () => {
    SessionManager.clearSession();
    setError("");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <motion.div 
              className="mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              لوحة تحكم الإدارة
            </CardTitle>
            <p className="text-gray-600 text-sm">
              منصة EDULY - نظام إدارة التعلم الرقمي
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 font-arabic">
                  {error}
                  {error.includes("حساب الطالب") && (
                    <Button 
                      variant="link" 
                      onClick={handleLogoutFirst}
                      className="text-red-600 underline p-0 h-auto font-arabic mr-2"
                    >
                      تسجيل الخروج الآن
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 font-arabic">
                  تم تسجيل الدخول بنجاح! جاري التوجيه...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-right font-arabic font-medium">
                  البريد الإلكتروني للأدمين
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 pr-4 h-12 text-left border-2 focus:border-blue-500 transition-colors"
                    disabled={isLoading}
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-right font-arabic font-medium">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 h-12 border-2 focus:border-blue-500 transition-colors"
                    disabled={isLoading}
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-arabic text-lg shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      جاري تسجيل الدخول...
                    </div>
                  ) : success ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      تم بنجاح
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      دخول لوحة التحكم
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500 font-arabic">
                نظام آمن محمي ومراقب
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">متصل بشكل آمن</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Main Site */}
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-white/80 hover:text-white hover:bg-white/10 font-arabic"
          >
            <GraduationCap className="w-4 h-4 ml-2" />
            العودة للموقع الرئيسي
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
