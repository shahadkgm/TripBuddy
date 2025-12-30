// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../modules/auth/services/auth.service';

const ProtectedRoute = () => {
  const user = authService.getCurrentUser();

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  // If authorized, render the child components (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;