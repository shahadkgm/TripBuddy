// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import KYCStatusPage from './pages/user/KYCStatusPage';
import DashboardPage from "./pages/user/DashboardPage";
// import CreateTripPage from "./pages/user/CreateTripPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { GuideRegistrationPage } from "./pages/user/GuideRegistrationPage";
import { Toaster } from 'react-hot-toast';
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import HomePage from "./pages/user/HomePage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import KYCPage from "./pages/user/KYCPage";
import { GuideDashboard } from "./pages/guide/GuideDashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { useEffect } from "react";
import { GuideManagement } from "./pages/admin/GuideManagement";



function App() {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // If user logs out or switches accounts in another tab, 
      // sync the current tab immediately.
      if (e.key === 'user' || e.key === 'token') {
        window.location.reload(); 
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  return (
    <> 
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<HomePage />} />
        
        {/* Auth Routes */}
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
         <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        {/* --- Protected Routes --- */}
        <Route element={<ProtectedRoute allowedRoles={'user'} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/kyc-status" element={<KYCStatusPage />} />
          <Route path="/kyc-verification" element={<KYCPage />} /> 
         <Route path="/join-guide" element={<GuideRegistrationPage/>}/>
        </Route>
        {/* //admin only */}
        <Route element={<ProtectedRoute allowedRoles={'admin'} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} /> 
          <Route path="/admin/guides" element={<GuideManagement />} /> 
        </Route>
        {/* //guide only  */}
         <Route element={<ProtectedRoute allowedRoles={'guide'} />}>
<Route path="/guide-dashboard" element={<GuideDashboard />} />        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;