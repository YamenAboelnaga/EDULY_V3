import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  redirectTo = '/login'
}) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(redirectTo);
        return;
      }

      if (requireAdmin && profile?.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
    }
  }, [user, profile, loading, navigate, requireAdmin, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
            <h3 className="text-lg font-medium mb-2">جاري التحقق من الهوية</h3>
            <p className="text-gray-600">يرجى الانتظار...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-medium mb-2">غير مصرح بالدخول</h3>
            <p className="text-gray-600">جاري التوجيه لصفحة تسجيل الدخول...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-medium mb-2">صلاحيات غير كافية</h3>
            <p className="text-gray-600">هذه الصفحة مخصصة للمديرين فقط</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};