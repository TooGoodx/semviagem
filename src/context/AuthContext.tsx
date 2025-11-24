import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth0, User } from '@auth0/auth0-react';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | undefined>;
  processPendingRegistration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { 
    user, 
    isAuthenticated, 
    isLoading: auth0Loading, 
    logout, 
    getAccessTokenSilently 
  } = useAuth0();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Initialize auth context
  useEffect(() => {
    if (!auth0Loading) {
      setIsInitialized(true);
    }
  }, [auth0Loading]);

  // Handle authentication state changes (SIMPLIFIED - no forced modal)
  useEffect(() => {
    if (isAuthenticated && user && !hasShownWelcome && isInitialized) {
      // Mark that we've shown welcome to prevent re-showing
      setHasShownWelcome(true);
    } else if (!isAuthenticated && hasShownWelcome) {
      // User logged out
      sessionStorage.removeItem('auth0_logged_in');
      sessionStorage.removeItem('subscription_status');
      sessionStorage.removeItem('show_subscription_banner');
      setHasShownWelcome(false);
    }
  }, [isAuthenticated, user, hasShownWelcome, isInitialized]);

  const processPendingRegistration = async () => {
    try {
      const pendingData = localStorage.getItem('pendingRegistration');
      if (pendingData && user) {
        const registrationData = JSON.parse(pendingData);
        
        console.log('Processing pending registration data:', {
          auth0User: user,
          formData: registrationData
        });

        // Save user data to database
        await saveUserToDatabase(user, registrationData);
        
        toast.success('Cadastro realizado com sucesso!');
        localStorage.removeItem('pendingRegistration');

        // Redirect to Stripe checkout for premium subscription
        setTimeout(() => {
          showStripeCheckout();
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing pending registration:', error);
      toast.error('Erro ao processar cadastro. Tente novamente.');
    }
  };

  const saveUserToDatabase = async (userData: any, registrationData: any) => {
    try {
      const response = await fetch('/.netlify/functions/save-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData,
          registrationData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user data');
      }

      const result = await response.json();
      console.log('User data saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving user to database:', error);
      throw error;
    }
  };

  const getUserFromDatabase = async (auth0Id: string) => {
    try {
      const response = await fetch(`/.netlify/functions/get-user-data?auth0_id=${encodeURIComponent(auth0Id)}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // User not found in database
        }
        throw new Error('Failed to get user data');
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      console.error('Error getting user from database:', error);
      return null;
    }
  };

  const checkUserSubscription = async () => {
    try {
      if (!user?.sub) return;
      
      // Check if user has active subscription in database
      const hasSubscription = await getUserSubscriptionStatus(user.sub);
      
      if (!hasSubscription) {
        // User doesn't have subscription, redirect to Stripe
        setTimeout(() => {
          showStripeCheckout();
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // If error, show Stripe checkout as fallback
      setTimeout(() => {
        showStripeCheckout();
      }, 2000);
    }
  };

  const getUserSubscriptionStatus = async (auth0Id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/.netlify/functions/check-subscription?auth0_id=${encodeURIComponent(auth0Id)}`);

      if (!response.ok) {
        return false; // No subscription found
      }

      const result = await response.json();
      return result.hasActiveSubscription || false;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return false;
    }
  };

  const showStripeCheckout = () => {
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <div className="font-semibold"> Bem-vindo ao SemViagem!</div>
        <div className="text-sm">Para acessar a área logada, você precisa de uma assinatura premium.</div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              window.location.href = '/premium';
            }}
            className="px-3 py-1 bg-yellow-500 text-black rounded text-sm font-medium"
          >
            Assinar Agora
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              // Redirect back to home if user doesn't want to subscribe
              window.location.href = '/';
            }}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm"
          >
            Voltar
          </button>
        </div>
      </div>
    ), {
      duration: 15000,
    });
  };

  const signOut = async () => {
    try {
      await logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const getAccessToken = async (): Promise<string | undefined> => {
    try {
      if (isAuthenticated) {
        return await getAccessTokenSilently();
      }
      return undefined;
    } catch (error) {
      console.error('Error getting access token:', error);
      return undefined;
    }
  };

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated,
    isInitialized,
    isLoading: auth0Loading,
    signOut,
    getAccessToken,
    processPendingRegistration,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
