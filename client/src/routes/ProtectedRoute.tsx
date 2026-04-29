import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/c.authService';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: string | string[];
  requireKyc?: boolean;
}

const ProtectedRoute = ({ allowedRoles, requireKyc }: ProtectedRouteProps) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const token = authService.getToken();

  useEffect(() => {
    const verifyStatus = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser || !token) {
        setLoading(false);
        return;
      }

      // If KYC is required and not approved locally, fetch the latest status
      if (requireKyc && currentUser.role === 'user' && currentUser.kycStatus !== 'approved') {
        try {
          const res = await api.get(`/api/kyc-status/${currentUser.id}`);
          const latestStatus = res.data.data?.status || 'none';
          
          if (latestStatus !== currentUser.kycStatus) {
            // Update localStorage and state
            const updatedUser = { ...currentUser, kycStatus: latestStatus };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            // Trigger storage event for other components
            window.dispatchEvent(new Event('storage'));
          }
        } catch (err) {
          console.error('Failed to verify KYC status in ProtectedRoute:', err);
        }
      }
      setLoading(false);
    };

    verifyStatus();
  }, [requireKyc, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (user.isBlocked === true) {
    authService.logout();
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(user.role)) {
      if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (user.role === 'guide') return <Navigate to="/guide-dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  if (requireKyc && user.role === 'user') {
    if (user.kycStatus !== 'approved') {
      if (user.kycStatus === 'pending') {
        return <Navigate to="/kyc-status" replace />;
      }
      return <Navigate to="/kyc-verification" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
