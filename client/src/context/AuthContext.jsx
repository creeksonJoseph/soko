import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[AuthContext] Starting auth check...');
      setError(null);
      const data = await api.auth.getSession();
      console.log('[AuthContext] Session response:', data);
      
      // Handle different response formats from backend
      if (data && data.authenticated && data.user) {
        setUser(data.user);
        console.log('[AuthContext] User authenticated:', data.user);
      } else {
        setUser(null);
        console.log('[AuthContext] User not authenticated, session data:', data);
      }
    } catch (error) {
      console.warn('[AuthContext] Auth check failed:', error.message);
      setUser(null);
      // Don't set error for session check failures
    } finally {
      console.log('[AuthContext] Auth check complete, loading set to false');
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.auth.login(credentials);
      console.log('Login response:', data);
      
      // Handle different response formats from backend
      if (data && data.user) {
        setUser(data.user);
        console.log('User logged in:', data.user);
      } else {
        // After login, check session to get user data
        console.log('Login successful, checking session...');
        await checkAuth();
      }
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.auth.register(userData);
      console.log('Registration response:', data);
      
      // Handle different response formats from backend
      if (data && data.user) {
        setUser(data.user);
        console.log('User registered and set:', data.user);
      } else {
        // After registration, check session to get user data
        console.log('Registration successful, checking session...');
        await checkAuth();
      }
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await api.auth.logout();
    } catch (error) {
      console.warn('Logout error:', error.message);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const data = await api.auth.updateProfile(profileData);
      if (data.user) {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    clearError,
    isAuthenticated: !!user,
    isArtisan: user?.role?.toLowerCase() === 'artisan',
    isBuyer: user?.role?.toLowerCase() === 'buyer',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = (Component, requiredRole = null) => {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access this page.</p>
            <a href="/login" className="btn-primary">Go to Login</a>
          </div>
        </div>
      );
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <a href="/" className="btn-primary">Go Home</a>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};
