import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] Auth state:', { user: !!user, loading, userRole: user?.role, requiredRole, path: location.pathname });

  if (loading) {
    console.log('[ProtectedRoute] Still loading auth state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRoute] No user found, redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('[ProtectedRoute] Role mismatch. User role:', user.role, 'Required:', requiredRole);
    const redirectPath = user.role === 'artisan' ? '/artisan-dashboard' : '/buyer-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  console.log('[ProtectedRoute] Access granted for user:', user.role, 'to path:', location.pathname);
  return children;
};

export default ProtectedRoute;