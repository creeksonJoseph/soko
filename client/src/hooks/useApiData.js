import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

// Custom hook for data loading with proper error handling
export const useApiData = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
      } catch (error) {
        setError(error.message);
        if (error.message.includes('Authentication')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, dependencies);

  return { data, loading, error, refetch: () => loadData() };
};

// Custom hook for authenticated actions
export const useAuthenticatedAction = () => {
  const navigate = useNavigate();

  const executeAction = async (action) => {
    try {
      // Check authentication first
      const session = await api.auth.getSession();
      if (!session.authenticated) {
        navigate('/login');
        return null;
      }

      return await action();
    } catch (error) {
      if (error.message.includes('Authentication')) {
        navigate('/login');
      }
      throw error;
    }
  };

  return executeAction;
};

// Example usage patterns
export const useProducts = () => {
  return useApiData(() => api.products.getAll());
};

export const useCart = () => {
  return useApiData(() => api.cart.get());
};

export const useArtisanDashboard = () => {
  return useApiData(() => api.artisan.getDashboard());
};