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
import TripDetails from "../pages/user/TripDetails";
import ConnectionRequestsPage from "../pages/user/ConnectionRequestsPage";
import ExpenseSplitPage from "../pages/user/ExpenseSplitPage";
import WeatherPage from "../pages/user/WeatherPage";

import ProfilePage from "../pages/user/ProfilePage";
import GalleryPage from "../pages/user/GalleryPage";
import TripManagementPage from '../pages/user/TripManagementPage';
import AIAssistantPage from "../pages/user/AIAssistantPage";
import GroupChatPage from "../pages/user/GroupChatPage";
import NearByPlacesPage from "../pages/user/NearByPlacesPage";
import FindGuidesPage from "../pages/user/FindGuidesPage";
import MyPaymentsPage from "../pages/user/MyPaymentsPage";

import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { UserManagement } from "../pages/admin/UserManagement";
import { GuideManagement } from "../pages/admin/GuideManagement";
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminTripManagementPage } from '../pages/admin/AdminTripManagementPage';

import { GuideDashboard } from "../pages/guide/GuideDashboard";
import { GuideProfilePage } from "../pages/guide/GuideProfilePage";
import { GuideBookingsPage } from "../pages/guide/GuideBookingsPage";
import { GuideEarningsPage } from "../pages/guide/GuideEarningsPage";
import { GuideReviewsPage } from "../pages/guide/GuideReviewsPage";

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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/kyc-status" element={<KYCStatusPage />} />
        <Route path="/kyc-verification" element={<KYCPage />} />
        <Route path="/join-guide" element={<GuideRegistrationPage />} />
        <Route path="/create-trip" element={<CreateTripPage />} />
        <Route path="/edit-trip/:id" element={<CreateTripPage />} />
        <Route path="/find-travelers" element={<FindTravelers />} />
        <Route path="/trip-details/:id" element={<TripDetails />} />
        <Route path="/connection-requests" element={<ConnectionRequestsPage />} />
        <Route path="/expenses" element={<ExpenseSplitPage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:userId" element={<GalleryPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/group-chat/:id" element={<GroupChatPage />} />
        <Route path="/manage-trip/:id" element={<TripManagementPage />} />
        <Route path="/nearby" element={<NearByPlacesPage />} />
        <Route path="/find-guides" element={<FindGuidesPage />} />
        <Route path="/my-payments" element={<MyPaymentsPage />} />
      </Route>



      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/guides" element={<GuideManagement />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="/admin/trips" element={<AdminTripManagementPage />} />
      </Route>

      {/* Guide */}
      <Route element={<ProtectedRoute allowedRoles="guide" />}>
        <Route path="/guide-dashboard" element={<GuideDashboard />} />
        <Route path="/guide/profile" element={<GuideProfilePage />} />
        <Route path="/guide/bookings" element={<GuideBookingsPage />} />
        <Route path="/guide/earnings" element={<GuideEarningsPage />} />
        <Route path="/guide/reviews" element={<GuideReviewsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
