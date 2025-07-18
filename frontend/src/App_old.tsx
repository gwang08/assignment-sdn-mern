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
import HomePage from "./pages/HomePage";
import CampaignsPage from "./pages/nurse/Campaigns";
import NurseDashboard from "./pages/nurse/Dashboard";
import HealthProfilesPage from "./pages/nurse/HealthProfiles";
import MedicalEventsPage from "./pages/nurse/MedicalEvents";
import MedicineRequestsPage from "./pages/nurse/MedicineRequests";
import ParentDashboard from "./pages/parent/Dashboard";

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
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Nurse/Medical Staff Routes */}
        <Route
          path="/nurse/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["nurse", "doctor", "healthcare_assistant"]}
            >
              <NurseDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/medical-events"
          element={
            <ProtectedRoute
              allowedRoles={["nurse", "doctor", "healthcare_assistant"]}
            >
              <MedicalEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/health-profiles"
          element={
            <ProtectedRoute
              allowedRoles={["nurse", "doctor", "healthcare_assistant"]}
            >
              <HealthProfilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/campaigns"
          element={
            <ProtectedRoute
              allowedRoles={["nurse", "doctor", "healthcare_assistant"]}
            >
              <CampaignsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse/medicine-requests"
          element={
            <ProtectedRoute
              allowedRoles={["nurse", "doctor", "healthcare_assistant"]}
            >
              <MedicineRequestsPage />
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

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["super_admin", "student_manager"]}>
              <AdminDashboard />
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
