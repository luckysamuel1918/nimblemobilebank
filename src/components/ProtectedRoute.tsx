
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { currentUser, isAdmin, loading, needsPinVerification } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', {
    currentUser: currentUser?.email,
    isAdmin,
    loading,
    needsPinVerification,
    adminOnly,
    pathname: location.pathname
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('No current user, redirecting to login');
    return <Navigate to="/user" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('Admin access denied. User email:', currentUser?.email, 'Is Admin:', isAdmin);
    return <Navigate to="/user-dashboard" replace />;
  }

  // For non-admin users, check if PIN verification is needed
  // Only redirect to PIN verification if we're not already there and PIN is needed
  if (!isAdmin && needsPinVerification && location.pathname !== '/pin-verification' && location.pathname !== '/set-pin') {
    console.log('PIN verification needed, redirecting from:', location.pathname);
    return <Navigate to="/pin-verification" state={{ from: location }} replace />;
  }

  // If we're on PIN verification page but PIN is no longer needed, redirect to dashboard
  if (!isAdmin && !needsPinVerification && location.pathname === '/pin-verification') {
    console.log('PIN no longer needed, redirecting to dashboard');
    return <Navigate to="/user-dashboard" replace />;
  }

  return <>{children}</>;
};

export { ProtectedRoute as default };
