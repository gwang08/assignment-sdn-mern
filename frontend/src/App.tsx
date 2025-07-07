import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import AppLayout from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/admin/Dashboard";
import AuthPage from "./pages/AuthPage";
import BlogPage from "./pages/BlogPage";
import HomePage from "./pages/HomePage";
import CampaignsPage from "./pages/nurse/Campaigns";
import NurseDashboard from "./pages/nurse/Dashboard";
import HealthProfilesPage from "./pages/nurse/HealthProfiles";
import MedicalEventsPage from "./pages/nurse/MedicalEvents";
import MedicineRequestsPage from "./pages/nurse/MedicineRequests";
import VaccinationManagement from "./pages/nurse/VaccinationManagement";
import ParentCampaigns from "./pages/parent/Campaigns";
import ParentConsultations from "./pages/parent/Consultations";
import ParentDashboard from "./pages/parent/Dashboard";
import ParentHealthProfiles from "./pages/parent/HealthProfiles";
import ParentMedicineRequests from "./pages/parent/MedicineRequests";
import StudentLinkRequests from "./pages/parent/StudentLinkRequests";
import ParentStudents from "./pages/parent/Students";
import StudentCampaigns from "./pages/student/Campaigns";
import StudentDashboard from "./pages/student/Dashboard";
import StudentHealthProfile from "./pages/student/HealthProfile";
import StudentMedicalHistory from "./pages/student/MedicalHistory";

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// App Content Component
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Console log để debug thông tin user và token
  React.useEffect(() => {
    console.log("🔍 Current User Info:", {
      user: user,
      role: user?.role,
      isAuthenticated: isAuthenticated,
      token: localStorage.getItem("token"),
      userId: user?._id,
      username: user?.username,
      email: user?.email,
    });
  }, [user, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Auto-redirect to appropriate dashboard based on role
  const getDashboardPath = () => {
    if (!user) return "/home";

    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "medicalStaff":
        return "/nurse/dashboard";
      case "parent":
        return "/parent/dashboard";
      case "student":
        return "/student/dashboard";
      default:
        return "/home";
    }
  };

  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={getDashboardPath()} replace />}
        />

        {/* Public Home Page */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Nurse/Medical Staff Routes */}
        <Route
          path="/nurse/dashboard"
          element={
            <ProtectedRoute allowedRoles={["medicalStaff"]}>
              <NurseDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/medical-events"
          element={
            <ProtectedRoute allowedRoles={["medicalStaff"]}>
              <MedicalEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/health-profiles"
          element={
            <ProtectedRoute allowedRoles={["medicalStaff"]}>
              <HealthProfilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/campaigns"
          element={
            <ProtectedRoute allowedRoles={["medicalStaff"]}>
              <CampaignsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/medicine-requests"
          element={
            <ProtectedRoute allowedRoles={["medicalStaff"]}>
              <MedicineRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/vaccination"
          element={
            <ProtectedRoute allowedRoles={["medicalStaff"]}>
              <VaccinationManagement />
            </ProtectedRoute>
          }
        />

        {/* Parent Routes */}
        <Route
          path="/parent/dashboard"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/students"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/health-profiles"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentHealthProfiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/medicine-requests"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentMedicineRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/campaigns"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentCampaigns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/consultations"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentConsultations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/student-link-requests"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <StudentLinkRequests />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/health-profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentHealthProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/medical-history"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentMedicalHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/campaigns"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentCampaigns />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={viVN}>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
