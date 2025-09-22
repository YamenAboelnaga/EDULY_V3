import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  validateEmail,
  validatePassword,
  validateArabicName,
  validateEgyptianPhone,
  sanitizeInput,
  RateLimiter
} from "@/utils/security";
import { SessionManager } from "@/utils/session";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
  isFromRoute?: boolean;
  onTabChange?: (tab: "login" | "signup") => void;
}

export default function AuthModal({ isOpen, onClose, initialTab = "login", isFromRoute = false, onTabChange }: AuthModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Handle smart scroll behavior - scroll modal content first, then page
  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if the mouse is over the modal
      const target = e.target as Element;
      const modalElement = document.querySelector('[data-modal-content]') as HTMLElement;
      const modalContainer = document.querySelector('[data-modal-container]') as HTMLElement;

      if (!modalElement || !modalContainer) return;

      // Check if the scroll event is happening over the modal
      const isOverModal = modalContainer.contains(target) || target === modalContainer;

      if (!isOverModal) {
        // If not over modal, allow normal page scroll
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = modalElement;
      const isScrollingDown = e.deltaY > 0;
      const isScrollingUp = e.deltaY < 0;

      // Check if modal has scrollable content
      const hasScrollableContent = scrollHeight > clientHeight;

      if (!hasScrollableContent) {
        // If no scrollable content in modal, allow page scroll
        return;
      }

      // More precise boundary detection
      const scrollBottom = scrollHeight - clientHeight;
      const isAtBottom = Math.abs(scrollTop - scrollBottom) < 2;
      const isAtTop = scrollTop < 2;

      // If we're at the limits and trying to scroll further, allow page scroll
      if ((isScrollingDown && isAtBottom) || (isScrollingUp && isAtTop)) {
        // Allow default scroll behavior for the page
        return;
      }

      // Otherwise, prevent default and handle modal scroll
      e.preventDefault();
      e.stopPropagation();

      // Smooth scroll with proper bounds checking
      const scrollStep = e.deltaY;
      const newScrollTop = Math.max(0, Math.min(scrollTop + scrollStep, scrollBottom));
      modalElement.scrollTop = newScrollTop;
    };

    // Add wheel event listener to the document to catch all scroll events
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



  const handleClose = () => {
    if (isFromRoute) {
      // If modal was opened from a route (/login or /signup), navigate to home
      navigate("/");
    } else {
      // If modal was opened from a button, just close
      onClose();
    }
  };

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    grade: "",
    agreeTerms: false
  });

  // Rate limiting for login attempts
  const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const sanitizedEmail = sanitizeInput(loginForm.email);
    const sanitizedPassword = sanitizeInput(loginForm.password);

    // Rate limiting check
    if (!loginRateLimiter.isAllowed(sanitizedEmail)) {
      const remainingTime = Math.ceil(loginRateLimiter.getRemainingTime(sanitizedEmail) / (60 * 1000));
      alert(`تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى بعد ${remainingTime} دقيقة`);
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      alert("البريد الإلكتروني غير صحيح");
      return;
    }

    const passwordValidation = validatePassword(sanitizedPassword);
    if (!passwordValidation.isValid) {
      alert(passwordValidation.errors[0]);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate secure API call with timeout protection
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          setIsLoading(false);

          // Create student session (in real app this would validate against database)
          SessionManager.createSession(sanitizedEmail, 'student');
          onClose();
          window.location.href = "/dashboard";

          resolve(true);
        }, 1500);

        // Cleanup timer to prevent memory leaks
        return () => clearTimeout(timer);
      });
    } catch (error) {
      setIsLoading(false);
      alert("حدث خطأ في تسجيل الدخول");
    }
  };



  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all inputs
    const sanitizedFirstName = sanitizeInput(signupForm.firstName);
    const sanitizedLastName = sanitizeInput(signupForm.lastName);
    const sanitizedEmail = sanitizeInput(signupForm.email);
    const sanitizedPhone = sanitizeInput(signupForm.phone);
    const sanitizedPassword = sanitizeInput(signupForm.password);
    const sanitizedConfirmPassword = sanitizeInput(signupForm.confirmPassword);

    if (!validateArabicName(sanitizedFirstName) || !validateArabicName(sanitizedLastName)) {
      alert("الاسم يجب أن يكون باللغة العربية ومن 2-50 حرف");
      return;
    }

    if (!validateEmail(sanitizedEmail)) {
      alert("البريد الإلكتروني غير صحيح");
      return;
    }

    if (!validateEgyptianPhone(sanitizedPhone)) {
      alert("رقم الهاتف يجب أن يكون بالصيغة المصرية (01xxxxxxxxx)");
      return;
    }

    const passwordValidation = validatePassword(sanitizedPassword);
    if (!passwordValidation.isValid) {
      alert(passwordValidation.errors[0]);
      return;
    }

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      alert("كلمات المرور غير متطابقة");
      return;
    }

    if (!signupForm.agreeTerms) {
      alert("يجب الموافقة على شروط الاستخدام");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate secure API call
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          setIsLoading(false);

          // Create session for new user (always student)
          SessionManager.createSession(sanitizedEmail, 'student');

          onClose();

          // New users go to student dashboard
          window.location.href = "/dashboard";
          resolve(true);
        }, 2000);

        return () => clearTimeout(timer);
      });
    } catch (error) {
      setIsLoading(false);
      alert("حدث خطأ في إنشاء الحساب");
    }
  };



  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        data-modal-container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          data-modal-content
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 relative">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <Tabs value={activeTab} onValueChange={(value) => {
              const newTab = value as "login" | "signup";
              setActiveTab(newTab);
              if (onTabChange) {
                onTabChange(newTab);
              }
            }}>
              {/* Tab Headers */}
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <TabsTrigger 
                  value="login" 
                  className="rounded-md font-medium data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                >
                  تسجيل الدخول
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-md font-medium data-[state=active]:bg-teal-600 data-[state=active]:text-white"
                >
                  إنشاء حساب جديد
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    أهلاً بك في EDULY
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    أدخل بياناتك للوصول إلى رحلتك التعليمية
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email */}
                  <div>
                    <Label htmlFor="login-email" className="text-right block mb-2 font-medium">
                      البريد الإلكتروني
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="example@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="login-password" className="text-right block mb-2 font-medium">
                      كلمة المرور
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="أدخل كلمة المرور"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pl-10 pr-10 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember-me"
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) => setLoginForm({ ...loginForm, rememberMe: checked as boolean })}
                        className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                      />
                      <Label htmlFor="remember-me" className="text-sm text-gray-600 dark:text-gray-300">
                        تذكرني
                      </Label>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  {/* Login Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg font-medium text-lg"
                    >
                      {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </Button>
                  </motion.div>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                    أنشئ حسابك الجديد
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    انضم إلى آلاف الطلاب المتفوقين في EDULY
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first-name" className="text-right block mb-2 font-medium">
                        الاسم الأول
                      </Label>
                      <div className="relative">
                        <Input
                          id="first-name"
                          type="text"
                          placeholder="الاسم الأول"
                          value={signupForm.firstName}
                          onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                          className="pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                          required
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="last-name" className="text-right block mb-2 font-medium">
                        الاسم الأخير
                      </Label>
                      <div className="relative">
                        <Input
                          id="last-name"
                          type="text"
                          placeholder="الاسم الأخير"
                          value={signupForm.lastName}
                          onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                          className="pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                          required
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="signup-email" className="text-right block mb-2 font-medium">
                      البريد الإلكتروني
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="example@email.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="text-right block mb-2 font-medium">
                      رقم الهات��
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="01xxxxxxxxx"
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                        className="pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                        required
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="signup-password" className="text-right block mb-2 font-medium">
                      كلمة المرور
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="أدخل كلمة مرور قوية"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        className="pl-10 pr-10 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label htmlFor="confirm-password" className="text-right block mb-2 font-medium">
                      تأكيد كلمة المرور
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="أعد إدخال كلمة ��لمرور"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        className="pl-10 pr-10 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agree-terms"
                      checked={signupForm.agreeTerms}
                      onCheckedChange={(checked) => setSignupForm({ ...signupForm, agreeTerms: checked as boolean })}
                      className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 mt-1"
                    />
                    <Label htmlFor="agree-terms" className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      أوافق على{" "}
                      <button type="button" className="text-teal-600 hover:text-teal-700 font-medium">
                        شروط الاستخدام
                      </button>
                      {" "}و{" "}
                      <button type="button" className="text-teal-600 hover:text-teal-700 font-medium">
                        سياسة الخصوصية
                      </button>
                    </Label>
                  </div>

                  {/* Signup Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading || !signupForm.agreeTerms}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg font-medium text-lg disabled:opacity-50"
                    >
                      {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب جديد"}
                    </Button>
                  </motion.div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
