import { useEffect, useRef } from 'react'; // 1. Import useRef
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  // 2. Create a ref to track if verification has started
  const hasStarted = useRef(false);

  useEffect(() => {
    const token = params.get('token');

    if (!token) {
      toast.error('Invalid verification link');
      return;
    }

    // 3. Check the ref. If true, skip the rest of the function.
    if (hasStarted.current) return;

    // 4. Set it to true immediately
    hasStarted.current = true;

    const verify = async () => {
      const loadToast = toast.loading('Verifying email...');
      try {
        await authService.verifyEmail(token);
        toast.success('Email verified successfully 🎉', { id: loadToast });
        navigate('/login');
      } catch (_err: unknown) {
        const errorObj = _err as { response?: { data?: { message?: string } } };
        const msg = errorObj.response?.data?.message || 'Link expired or invalid';
        toast.error(msg, { id: loadToast });
      }
    };

    verify();
  }, [params, navigate]); // Added dependencies for best practice

  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div className="space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-600 text-lg font-medium">Verifying your email...</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
