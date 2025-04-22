import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Permission } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
}

export function ProtectedRoute({ children, requiredPermissions = [] }: ProtectedRouteProps) {
  const user = useAuthStore(state => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermissions.length > 0 && 
      !requiredPermissions.every(permission => user.permissions.includes(permission))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}