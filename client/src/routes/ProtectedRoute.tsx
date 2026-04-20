//client/src/routes/protectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/c.authService';

interface ProtectedRouteProps {
  allowedRoles?: string | string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const user = authService.getCurrentUser();
  const token = authService.getToken();
  console.log('user from protected ', user, 'token', token);

  if (!user || !token) {
    console.log('from first c- protected route props');
    return <Navigate to="/login" replace />;
  }

  if (user.isBlocked === true) {
    console.warn('Access Denied: Account is blocked.');
    authService.logout();
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(user.role)) {
      console.error('Access Denied: Unauthorized role:', user.role);
      // Redirect to their respective dashboard instead of login
      if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (user.role === 'guide') return <Navigate to="/guide-dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
