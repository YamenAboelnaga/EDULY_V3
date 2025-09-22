import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { CoursesProvider } from "@/contexts/CoursesContext";
import LandingPage from "./pages/LandingPage";
import DashboardPageNew from "./pages/DashboardPageNew";
import DemoPage from "./pages/DemoPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCoursesPage from "./pages/AdminCoursesPage";
import AdminCourseContentPage from "./pages/AdminCourseContentPage";
import StudentCourseContentPage from "./pages/StudentCourseContentPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailsPage from "./pages/CourseDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CoursesProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page - No Layout */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes - Landing Page with Modal */}
          <Route path="/login" element={<LandingPage initialAuthModal="login" />} />
          <Route path="/signup" element={<LandingPage initialAuthModal="signup" />} />

          {/* Demo Page - No Layout */}
          <Route path="/demo" element={<DemoPage />} />

          {/* Admin Routes - No Layout */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
          <Route path="/admin/course/:courseId/content" element={<AdminCourseContentPage />} />

          {/* Student Dashboard - No Layout (has its own sidebar) */}
          <Route path="/dashboard" element={<DashboardPageNew />} />
          <Route path="/dashboard/*" element={<DashboardPageNew />} />

          {/* Protected routes with Layout */}
          <Route path="/courses" element={
            <Layout>
              <CoursesPage />
            </Layout>
          } />
          <Route path="/course/:id" element={
            <Layout>
              <CourseDetailsPage />
            </Layout>
          } />
          <Route path="/course/:courseId/content" element={<StudentCourseContentPage />} />
          <Route path="/profile" element={
            <Layout>
              <ProfilePage />
            </Layout>
          } />

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </CoursesProvider>
  </QueryClientProvider>
);

export default App;
