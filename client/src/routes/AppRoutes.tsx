// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import HomePage from "../pages/user/HomePage";
import AuthPage from "../pages/auth/AuthPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import VerifyEmail from "../pages/auth/VerifyEmail";

import DashboardPage from "../pages/user/DashboardPage";
import KYCStatusPage from "../pages/user/KYCStatusPage";
import KYCPage from "../pages/user/KYCPage";
import { GuideRegistrationPage } from "../pages/user/GuideRegistrationPage";
import CreateTripPage from "../pages/user/CreateTripPage";
import FindTravelers from "../pages/user/FindTravelers";
import ConnectionRequestsPage from "../pages/user/ConnectionRequestsPage";

import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { UserManagement } from "../pages/admin/UserManagement";
import { GuideManagement } from "../pages/admin/GuideManagement";

import { GuideDashboard } from "../pages/guide/GuideDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* User */}
      <Route element={<ProtectedRoute allowedRoles="user" />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/kyc-status" element={<KYCStatusPage />} />
        <Route path="/kyc-verification" element={<KYCPage />} />
        <Route path="/join-guide" element={<GuideRegistrationPage />} />
        <Route path="/create-trip" element={<CreateTripPage />} />
        <Route path="/find-travelers" element={<FindTravelers />} />
        <Route path="/connection-requests" element={<ConnectionRequestsPage />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/guides" element={<GuideManagement />} />
      </Route>

      {/* Guide */}
      <Route element={<ProtectedRoute allowedRoles="guide" />}>
        <Route path="/guide-dashboard" element={<GuideDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
