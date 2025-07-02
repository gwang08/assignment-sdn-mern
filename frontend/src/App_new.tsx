import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/Layout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import NurseDashboard from './pages/nurse/Dashboard';
import MedicalEventsPage from './pages/nurse/MedicalEvents';
import HealthProfilesPage from './pages/nurse/HealthProfiles';
import CampaignsPage from './pages/nurse/Campaigns';
import MedicineRequestsPage from './pages/nurse/MedicineRequests';
import ParentDashboard from './pages/parent/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
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
    if (!user) return '/home';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'medicalStaff':
        return '/nurse/dashboard';
      case 'parent':
        return '/parent/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/home';
    }
  };

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to={getDashboardPath()} replace />} />
        
        {/* Public Home Page */}
        <Route path="/home" element={<HomePage />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'student_manager']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Nurse/Medical Staff Routes */}
        <Route 
          path="/nurse/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Nurse', 'Doctor', 'Healthcare Assistant']}>
              <NurseDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/nurse/medical-events" 
          element={
            <ProtectedRoute allowedRoles={['Nurse', 'Doctor', 'Healthcare Assistant']}>
              <MedicalEventsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/nurse/health-profiles" 
          element={
            <ProtectedRoute allowedRoles={['Nurse', 'Doctor', 'Healthcare Assistant']}>
              <HealthProfilesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/nurse/campaigns" 
          element={
            <ProtectedRoute allowedRoles={['Nurse', 'Doctor', 'Healthcare Assistant']}>
              <CampaignsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/nurse/medicine-requests" 
          element={
            <ProtectedRoute allowedRoles={['Nurse', 'Doctor', 'Healthcare Assistant']}>
              <MedicineRequestsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Parent Routes */}
        <Route 
          path="/parent/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Student Routes */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <div className="p-6">
                <h2>Student Dashboard</h2>
                <p>Chào mừng học sinh! Trang này đang được phát triển...</p>
              </div>
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
