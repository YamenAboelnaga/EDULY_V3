import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  School, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Shield,
  Bell,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { SessionManager } from "@/utils/session";
import { validateEmail, validateArabicName, validateEgyptianPhone } from "@/utils/security";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    grade: "الثالث الثانوي",
    school: "",
    profileImage: "/api/placeholder/120/120"
  });

  const [editForm, setEditForm] = useState(userInfo);
  const [activeTab, setActiveTab] = useState("profile");

  // Authentication check
  useEffect(() => {
    if (!SessionManager.isAuthenticated()) {
      navigate('/');
      return;
    }

    const session = SessionManager.getCurrentSession();
    if (session) {
      const emailName = session.email.split('@')[0];
      setUserInfo(prev => ({
        ...prev,
        firstName: emailName || 'المستخدم',
        email: session.email
      }));
      setEditForm(prev => ({
        ...prev,
        firstName: emailName || 'المستخدم',
        email: session.email
      }));
    }
  }, [navigate]);

  const handleSaveProfile = () => {
    // Validate inputs
    if (!validateArabicName(editForm.firstName) || !validateArabicName(editForm.lastName)) {
      alert("الاسم يجب أن يكون باللغة العربية ومن 2-50 حرف");
      return;
    }

    if (!validateEmail(editForm.email)) {
      alert("البريد الإلكتروني غير صحيح");
      return;
    }

    if (editForm.phone && !validateEgyptianPhone(editForm.phone)) {
      alert("رقم الهاتف يجب أن يكون بالصيغة المصرية");
      return;
    }

    setUserInfo(editForm);
    setIsEditing(false);
    
    // Here you would typically save to backend
    alert("تم حفظ التغييرات بنجاح");
  };

  const cancelEdit = () => {
    setEditForm(userInfo);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            الملف الشخصي
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            إدارة معلوماتك الشخصية وإعدادات الحساب
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">المعلومات الشخصية</TabsTrigger>
            <TabsTrigger value="security">الأمان والخصوصية</TabsTrigger>
            <TabsTrigger value="preferences">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <div className="relative mx-auto w-32 h-32 mb-4">
                    <img
                      src={userInfo.profileImage}
                      alt="الصورة الشخصية"
                      className="w-full h-full rounded-full object-cover border-4 border-teal-500"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 rounded-full w-10 h-10 p-0 bg-teal-600"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-2xl">
                    {userInfo.firstName} {userInfo.lastName}
                  </CardTitle>
                  <Badge variant="outline" className="mt-2">
                    {SessionManager.isAdmin() ? 'مدير المنصة' : 'طالب ثانوي'}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>
                    <Button
                      variant={isEditing ? "destructive" : "outline"}
                      onClick={isEditing ? cancelEdit : () => setIsEditing(true)}
                    >
                      {isEditing ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          إلغاء
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          تعديل
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">الاسم الأول</Label>
                      <Input
                        id="firstName"
                        value={isEditing ? editForm.firstName : userInfo.firstName}
                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lastName">الاسم الأخير</Label>
                      <Input
                        id="lastName"
                        value={isEditing ? editForm.lastName : userInfo.lastName}
                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? editForm.email : userInfo.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        value={isEditing ? editForm.phone : userInfo.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        disabled={!isEditing}
                        placeholder="01xxxxxxxxx"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="grade">الصف الدراسي</Label>
                      <Input
                        id="grade"
                        value={isEditing ? editForm.grade : userInfo.grade}
                        onChange={(e) => setEditForm({...editForm, grade: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="school">المدرسة</Label>
                      <Input
                        id="school"
                        value={isEditing ? editForm.school : userInfo.school}
                        onChange={(e) => setEditForm({...editForm, school: e.target.value})}
                        disabled={!isEditing}
                        placeholder="اسم المدرسة"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4">
                      <Button onClick={handleSaveProfile} className="bg-teal-600">
                        <Save className="w-4 h-4 mr-2" />
                        حفظ التغييرات
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  الأمان والخصوصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">تغيير كلمة المرور</h3>
                    <p className="text-sm text-gray-600">تحديث كلمة المرور لحسابك</p>
                  </div>
                  <Button variant="outline">
                    <Lock className="w-4 h-4 mr-2" />
                    تغيير كلمة المرور
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">التحقق بخطوتين</h3>
                    <p className="text-sm text-gray-600">تفعيل الحماية الإضافية لحسابك</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">تسجيل الدخول من الأجهزة</h3>
                    <p className="text-sm text-gray-600">إدارة الأجهزة المسجل دخولها</p>
                  </div>
                  <Button variant="outline">
                    عرض الأجهزة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  الإعدادات والتفضيلات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">إشعارات البريد الإلكتروني</h3>
                    <p className="text-sm text-gray-600">تلقي الإشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">الإشعارات الفورية</h3>
                    <p className="text-sm text-gray-600">تلقي الإشعارات الفورية في المتصفح</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">الوضع المظلم</h3>
                    <p className="text-sm text-gray-600">استخدام الوضع المظلم للواجهة</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">اللغة</h3>
                    <p className="text-sm text-gray-600">اختيار لغة الواجهة</p>
                  </div>
                  <Button variant="outline">
                    <Globe className="w-4 h-4 mr-2" />
                    العربية
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <motion.div 
          className="flex justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="ml-4"
          >
            العودة
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
