import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (!error) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error resending email:', error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
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
                <Mail className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              تحقق من بريدك الإلكتروني
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 text-center">
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 mb-4">
                  تم إرسال رسالة تفعيل إلى:
                </p>
                <p className="font-medium text-gray-900 bg-gray-100 p-3 rounded-lg">
                  {email}
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>يرجى التحقق من:</p>
                <ul className="list-disc list-inside space-y-1 text-right">
                  <li>صندوق الوارد</li>
                  <li>صندوق الرسائل غير المرغوب فيها (Spam)</li>
                  <li>مجلد الترقيات (Promotions)</li>
                </ul>
              </div>

              {resendSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  تم إعادة إرسال البريد بنجاح
                </motion.div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                  disabled={isResending || !email}
                >
                  {isResending ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      جاري الإرسال...
                    </div>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      إعادة إرسال البريد
                    </>
                  )}
                </Button>

                <Link to="/auth/login">
                  <Button variant="ghost" className="w-full">
                    العودة لتسجيل الدخول
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}