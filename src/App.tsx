import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTheme from "./pages/admin/AdminTheme";
import AdminSections from "./pages/admin/AdminSections";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminServices from "./pages/admin/AdminServices";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminClients from "./pages/admin/AdminClients";
import AdminPolicies from "./pages/admin/AdminPolicies";
import AdminCareers from "./pages/admin/AdminCareers";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminJourney from "./pages/admin/AdminJourney";
import AdminAwards from "./pages/admin/AdminAwards";
import AdminVisibility from "./pages/admin/AdminVisibility";
import Careers from "./pages/Careers";
import BlogDetail from "./pages/BlogDetail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/theme" element={<ProtectedRoute><AdminTheme /></ProtectedRoute>} />
            <Route path="/admin/sections" element={<ProtectedRoute><AdminSections /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/testimonials" element={<ProtectedRoute><AdminTestimonials /></ProtectedRoute>} />
            <Route path="/admin/blogs" element={<ProtectedRoute><AdminBlogs /></ProtectedRoute>} />
            <Route path="/admin/clients" element={<ProtectedRoute><AdminClients /></ProtectedRoute>} />
            <Route path="/admin/policies" element={<ProtectedRoute><AdminPolicies /></ProtectedRoute>} />
            <Route path="/admin/careers" element={<ProtectedRoute><AdminCareers /></ProtectedRoute>} />
            <Route path="/admin/applications" element={<ProtectedRoute><AdminApplications /></ProtectedRoute>} />
            <Route path="/admin/journey" element={<ProtectedRoute><AdminJourney /></ProtectedRoute>} />
            <Route path="/admin/awards" element={<ProtectedRoute><AdminAwards /></ProtectedRoute>} />
            <Route path="/admin/visibility" element={<ProtectedRoute><AdminVisibility /></ProtectedRoute>} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
