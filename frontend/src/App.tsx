// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./modules/auth/pages/HomePage";
import AuthPage from "./modules/auth/pages/AuthPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import KYCPage from "./modules/auth/pages/KYCPage";
import KYCStatusPage from './modules/auth/pages/KYCStatusPage';
import DashboardPage from "./modules/auth/pages/DashboardPage";
import CreateTripPage from "./modules/auth/pages/CreateTripPage";
import { FindTravelers } from "./modules/auth/pages/FindTravelers";
import { ForgotPasswordPage } from "./modules/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./modules/auth/pages/ResetPasswordPage";
import { GuideRegistrationPage } from "./modules/auth/pages/GuideRegistrationPage";
//  import { Toaster } from 'react-hot-toast';




function App() {
  return (
    <> 
      {/* <Toaster position="top-right" reverseOrder={false} /> */}
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<HomePage />} />
        
        {/* Auth Routes */}
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
         <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        {/* --- Protected Routes --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-trip" element={<CreateTripPage />} />
          <Route path="/kyc-status" element={<KYCStatusPage />} />
          <Route path="/kyc-verification" element={<KYCPage />} /> 
          <Route path="/find-travelers" element={<FindTravelers/>}/>
         <Route path="/join-guide" element={<GuideRegistrationPage/>}/>

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;