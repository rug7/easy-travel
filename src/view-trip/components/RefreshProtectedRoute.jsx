import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const RefreshProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('shouldRedirect', 'true');
    };

    const checkRefresh = () => {
      const shouldRedirect = localStorage.getItem('shouldRedirect');
      if (shouldRedirect) {
        localStorage.removeItem('shouldRedirect');
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    checkRefresh();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate]);

  return children;
};