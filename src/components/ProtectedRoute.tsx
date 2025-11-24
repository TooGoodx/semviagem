import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated || !user?.sub) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch(`/.netlify/functions/check-subscription?auth0_id=${encodeURIComponent(user.sub)}`);
        
        if (response.ok) {
          const result = await response.json();
          setHasSubscription(result.hasActiveSubscription || false);
        } else {
          setHasSubscription(false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasSubscription(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, user]);

  // Show loading while checking authentication or subscription
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto mb-4" style={{ borderColor: '#F0C72F' }}></div>
          <p className="text-lg" style={{ color: '#060D1C' }}>Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to premium page if no subscription
  if (hasSubscription === false) {
    return <Navigate to="/premium" replace />;
  }

  // Render children if user has subscription
  return <>{children}</>;
};

export default ProtectedRoute;
