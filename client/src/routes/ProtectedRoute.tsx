//client/src/routes/protectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  allowedRoles?: string; 
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const user = authService.getCurrentUser();
  const token = authService.getToken();
  console.log("user from protected ",user)

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  
  if (user.isBlocked === true) {
    console.warn("Access Denied: Account is blocked.");
    authService.logout(); 
    return <Navigate to="/login" replace />;
  }
  console.log("user role",user.role,"allowed role",allowedRoles)
  if(user.role!==allowedRoles){
    console.log("not allowed from protect")
        return <Navigate to="/login" replace />;

  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.error("Access Denied: Unauthorized role:", user.role);
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

export default ProtectedRoute;