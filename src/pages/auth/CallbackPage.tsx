import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('error');
          setMessage('حدث خطأ في تأكيد الحساب');
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage('تم تأكيد حسابك بنجاح');
          
          // Redirect after success
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('لم يتم العثور على جلسة صالحة');
        }
      } catch (error) {
        setStatus('error');
        setMessage('حدث خطأ غير متوقع');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
                <h3 className="text-lg font-medium mb-2">جاري التحقق من الحساب</h3>
                <p className="text-gray-600">يرجى الانتظار...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-8 h-8 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium mb-2 text-green-800">تم التأكيد بنجاح</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500">جاري التوجيه للوحة التحكم...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-medium mb-2 text-red-800">فشل في التأكيد</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate('/auth/login')}
                    className="w-full bg-teal-600"
                  >
                    تسجيل الدخول
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="w-full"
                  >
                    العودة للرئيسية
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}