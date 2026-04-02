import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
}

export default ProtectedRoute;
