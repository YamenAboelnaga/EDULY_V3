import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, GraduationCap, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword, validateArabicName, validateEgyptianPhone } from '@/utils/security';

const grades = [
  { value: 'الأول الثانوي', label: 'الصف الأول الثانوي' },
  { value: 'الثاني الثانوي', label: 'الصف الثاني الثانوي' },
  { value: 'الثالث الثانوي', label: 'الصف الثالث الثانوي' }
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    grade: '',
    school: '',
    agreeTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{isValid: boolean, errors: string[]}>({
    isValid: false,
    errors: []
  });

  // Real-time password validation
  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordStrength(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Comprehensive validation
    if (!validateArabicName(formData.firstName) || !validateArabicName(formData.lastName)) {
      setError('الاسم يجب أن يكون باللغة العربية ومن 2-50 حرف');
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('البريد الإلكتروني غير صحيح');
      setIsSubmitting(false);
      return;
    }

    if (formData.phone && !validateEgyptianPhone(formData.phone)) {
      setError('رقم الهاتف يجب أن يكون بالصيغة المصرية (01xxxxxxxxx)');
      setIsSubmitting(false);
      return;
    }

    if (!passwordStrength.isValid) {
      setError(passwordStrength.errors[0]);
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setIsSubmitting(false);
      return;
    }

    if (!formData.agreeTerms) {
      setError('يجب الموافقة على شروط الاستخدام');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: signUpError } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        grade: formData.grade,
        school: formData.school
      });
      
      if (signUpError) {
        setError(signUpError.message === 'User already registered' 
          ? 'هذا البريد الإلكتروني مسجل مسبقاً' 
          : signUpError.message);
      } else {
        // Show success message and redirect
        navigate('/auth/verify-email', { 
          state: { email: formData.email } 
        });
      }
    } catch (error) {
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <motion.div 
              className="mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              إنشاء حساب جديد
            </CardTitle>
            <p className="text-gray-600">
              انضم إلى منصة EDULY وابدأ رحلتك التعليمية
            </p>
          </CardHeader>

          <CardContent className="pt-6">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول *</Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      placeholder="الاسم الأول"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-10 pr-4"
                      required
                      disabled={isSubmitting}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير *</Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      placeholder="الاسم الأخير"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="pl-10 pr-4"
                      required
                      disabled={isSubmitting}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 pr-4"
                    required
                    disabled={isSubmitting}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 pr-4"
                    disabled={isSubmitting}
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">الصف الدراسي</Label>
                  <Select 
                    value={formData.grade} 
                    onValueChange={(value) => setFormData({ ...formData, grade: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">المدرسة</Label>
                  <Input
                    id="school"
                    placeholder="اسم المدرسة"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة مرور قوية"
                    value={formData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isSubmitting}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="text-xs space-y-1">
                    {passwordStrength.errors.map((error, index) => (
                      <p key={index} className="text-red-600">{error}</p>
                    ))}
                    {passwordStrength.isValid && (
                      <p className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        كلمة مرور قوية
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="أعد إدخال كلمة المرور"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10"
                    required
                    disabled={isSubmitting}
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                  disabled={isSubmitting}
                  className="mt-1"
                />
                <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                  أوافق على{' '}
                  <Link to="/terms" className="text-teal-600 hover:text-teal-700">
                    شروط الاستخدام
                  </Link>
                  {' '}و{' '}
                  <Link to="/privacy" className="text-teal-600 hover:text-teal-700">
                    سياسة الخصوصية
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={isSubmitting || loading || !formData.agreeTerms || !passwordStrength.isValid}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  'إنشاء حساب جديد'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                لديك حساب بالفعل؟{' '}
                <Link to="/auth/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            العودة للصفحة الرئيسية
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}