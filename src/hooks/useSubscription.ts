import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface SubscriptionStatus {
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useSubscription = (): SubscriptionStatus => {
  const { user, isAuthenticated } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated || !user?.sub) {
        setIsPremium(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/.netlify/functions/check-subscription?auth0_id=${encodeURIComponent(user.sub)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // User not found, not premium
            setIsPremium(false);
          } else {
            throw new Error('Failed to check subscription status');
          }
        } else {
          const result = await response.json();
          setIsPremium(result.hasActiveSubscription || false);
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsPremium(false); // Default to not premium on error
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, user?.sub]);

  return { isPremium, isLoading, error };
};
