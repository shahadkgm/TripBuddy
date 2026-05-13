// src/routes/AppRoutes.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
const GlobalLoader = lazy(() => import('../components/GlobalLoader').then(m => ({ default: m.GlobalLoader })));
import ProtectedRoute from './ProtectedRoute';

const HomePage = lazy(() => import('../pages/user/HomePage'));
const AuthPage = lazy(() => import('../pages/auth/AuthPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'));

const DashboardPage = lazy(() => import('../pages/user/DashboardPage'));
const KYCStatusPage = lazy(() => import('../pages/user/KYCStatusPage'));
const KYCPage = lazy(() => import('../pages/user/KYCPage'));
const GuideRegistrationPage = lazy(() => import('../pages/user/GuideRegistrationPage').then(m => ({ default: m.GuideRegistrationPage })));
const CreateTripPage = lazy(() => import('../pages/user/CreateTripPage'));
const FindTravelers = lazy(() => import('../pages/user/FindTravelers'));
const TripDetails = lazy(() => import('../pages/user/TripDetails'));
const ConnectionRequestsPage = lazy(() => import('../pages/user/ConnectionRequestsPage'));
const ExpenseSplitPage = lazy(() => import('../pages/user/ExpenseSplitPage'));
const WeatherPage = lazy(() => import('../pages/user/WeatherPage'));

const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));
const GalleryPage = lazy(() => import('../pages/user/GalleryPage'));
const TripManagementPage = lazy(() => import('../pages/user/TripManagementPage'));
const AIAssistantPage = lazy(() => import('../pages/user/AIAssistantPage'));
const GroupChatPage = lazy(() => import('../pages/user/GroupChatPage'));
const NearByPlacesPage = lazy(() => import('../pages/user/NearByPlacesPage'));
const FindGuidesPage = lazy(() => import('../pages/user/FindGuidesPage'));
const MyPaymentsPage = lazy(() => import('../pages/user/MyPaymentsPage'));

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserManagement = lazy(() => import('../pages/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const GuideManagement = lazy(() => import('../pages/admin/GuideManagement').then(m => ({ default: m.GuideManagement })));
const AdminPaymentsPage = lazy(() => import('../pages/admin/AdminPaymentsPage').then(m => ({ default: m.AdminPaymentsPage })));
const AdminTripManagementPage = lazy(() => import('../pages/admin/AdminTripManagementPage').then(m => ({ default: m.AdminTripManagementPage })));
const AdminRevenuePage = lazy(() => import('../pages/admin/AdminRevenuePage').then(m => ({ default: m.AdminRevenuePage })));
const ReportManagementPage = lazy(() => import('../pages/admin/ReportManagementPage'));

const GuideDashboard = lazy(() => import('../pages/guide/GuideDashboard').then(m => ({ default: m.GuideDashboard })));
const GuideProfilePage = lazy(() => import('../pages/guide/GuideProfilePage').then(m => ({ default: m.GuideProfilePage })));
const GuideBookingsPage = lazy(() => import('../pages/guide/GuideBookingsPage').then(m => ({ default: m.GuideBookingsPage })));
const GuideEarningsPage = lazy(() => import('../pages/guide/GuideEarningsPage').then(m => ({ default: m.GuideEarningsPage })));
const GuideReviewsPage = lazy(() => import('../pages/guide/GuideReviewsPage').then(m => ({ default: m.GuideReviewsPage })));
const GuideInvitationsPage = lazy(() => import('../pages/guide/GuideInvitationsPage').then(m => ({ default: m.GuideInvitationsPage })));
const GuideTripRequestDetailsPage = lazy(() => import('../pages/guide/GuideTripRequestDetailsPage').then(m => ({ default: m.GuideTripRequestDetailsPage })));

export default function AppRoutes() {
  return (
    <Suspense fallback={<GlobalLoader />}>
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
        <Route path="/trip-details/:id" element={<TripDetails />} />
        <Route path="/expenses" element={<ExpenseSplitPage />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:userId" element={<GalleryPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/manage-trip/:id" element={<TripManagementPage />} />
        <Route path="/nearby" element={<NearByPlacesPage />} />
        <Route path="/find-guides" element={<FindGuidesPage />} />
        <Route path="/my-payments" element={<MyPaymentsPage />} />
      </Route>

      {/* User KYC Required */}
      <Route element={<ProtectedRoute allowedRoles="user" requireKyc={true} />}>
        <Route path="/create-trip" element={<CreateTripPage />} />
        <Route path="/edit-trip/:id" element={<CreateTripPage />} />
        <Route path="/find-travelers" element={<FindTravelers />} />
        <Route path="/connection-requests" element={<ConnectionRequestsPage />} />
      </Route>

      {/* Shared: User + Guide (group chat) */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'guide']} />}>
        <Route path="/group-chat/:id" element={<GroupChatPage />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/guides" element={<GuideManagement />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="/admin/trips" element={<AdminTripManagementPage />} />
        <Route path="/admin/revenue" element={<AdminRevenuePage />} />
        <Route path="/admin/reports" element={<ReportManagementPage />} />
      </Route>

      {/* Guide */}
      <Route element={<ProtectedRoute allowedRoles="guide" />}>
        <Route path="/guide-dashboard" element={<GuideDashboard />} />
        <Route path="/guide/profile" element={<GuideProfilePage />} />
        <Route path="/guide/bookings" element={<GuideBookingsPage />} />
        <Route path="/guide/earnings" element={<GuideEarningsPage />} />
        <Route path="/guide/reviews" element={<GuideReviewsPage />} />
        <Route path="/guide/invitations" element={<GuideInvitationsPage />} />
        <Route
          path="/guide/trip-request/:id/:invitationId"
          element={<GuideTripRequestDetailsPage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
