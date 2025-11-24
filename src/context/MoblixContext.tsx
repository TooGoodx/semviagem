import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabase } from '../config/supabase';
import { useAuth } from './AuthContext';
import moblixService from '../services/moblixService';
import moblixAuth from '../services/moblixAuth';
import toast from 'react-hot-toast';

interface MoblixContextType {
  // Auth states
  isAuthenticated: boolean;
  authStatus: string;
  isAuthenticating: boolean;

  // Data states
  dashboardData: DashboardData | null;
  isLoadingDashboard: boolean;
  
  // API states
  lastApiResponse: any;
  apiCallsToday: number;
  
  // Methods
  authenticate: () => Promise<boolean>;
  logout: () => void;
  refreshDashboard: () => Promise<void>;
  trackApiCall: (endpoint: string, method: string) => Promise<void>;
  
  // Notifications
  sendNotification: (title: string, message: string, userId?: string) => Promise<boolean>;
  
  // Analytics
  trackEvent: (eventType: string, properties?: any) => Promise<void>;
}

interface DashboardData {
  totalMiles: number;
  activeClients: number;
  monthlyTransactions: number;
  averageTicket: number;
  milesTrend: number;
  clientsTrend: number;
  transactionsTrend: number;
  ticketTrend: number;
  lastUpdated: Date;
}

const MoblixContext = createContext<MoblixContextType | undefined>(undefined);

export const useMoblix = () => {
  const context = useContext(MoblixContext);
  if (context === undefined) {
    throw new Error('useMoblix must be used within a MoblixProvider');
  }
  return context;
};

interface MoblixProviderProps {
  children: ReactNode;
}

export const MoblixProvider: React.FC<MoblixProviderProps> = ({ children }) => {
  // States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStatus, setAuthStatus] = useState('Não autenticado');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [lastApiResponse, setLastApiResponse] = useState<any>(null);
  const [apiCallsToday, setApiCallsToday] = useState(0);

  const { user, isAuthenticated: isSupabaseAuth } = useAuth();
  const supabase = getSupabase();

  // Initialize Moblix auth state
  useEffect(() => {
    const initMoblixAuth = async () => {
      try {
        if (!isSupabaseAuth) {
          setAuthStatus('Supabase não autenticado');
          return;
        }

        const isAuth = moblixAuth.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          setAuthStatus('Autenticado');
          // Load dashboard data automatically
          await refreshDashboard();
        } else {
          setAuthStatus('Token expirado ou inválido');
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação Moblix:', error);
        setAuthStatus('Erro de inicialização');
      }
    };

    initMoblixAuth();
  }, [isSupabaseAuth]);

  // Load API calls count from Supabase
  useEffect(() => {
    const loadApiCallsCount = async () => {
      if (!user) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('moblix_api_calls')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today);

        if (error) {
          console.error('Erro ao carregar contagem de API calls:', error);
          return;
        }

        const todayCount = data?.reduce((sum, call) => sum + (call.count || 1), 0) || 0;
        setApiCallsToday(todayCount);
      } catch (error) {
        console.error('Erro ao carregar API calls:', error);
      }
    };

    loadApiCallsCount();
  }, [user, supabase]);

  const authenticate = async (): Promise<boolean> => {
    if (!isSupabaseAuth) {
      toast.error('Faça login primeiro no sistema');
      return false;
    }

    setIsAuthenticating(true);
    setAuthStatus('Autenticando...');

    try {
      console.log('🔐 Iniciando autenticação Moblix...');
      
      // Clear previous auth
      moblixAuth.logout();
      
      // Attempt login
      const loginResult = await moblixAuth.login();
      
      if (loginResult.success) {
        setIsAuthenticated(true);
        setAuthStatus('Autenticado');
        
        // Store auth info in Supabase
        await supabase.from('moblix_sessions').upsert({
          user_id: user?.id,
          token_expires_at: new Date(loginResult.expiresAt).toISOString(),
          last_auth: new Date().toISOString(),
          auth_status: 'authenticated'
        });

        toast.success('Autenticação Moblix realizada com sucesso!');
        
        // Load dashboard data
        await refreshDashboard();
        
        return true;
      } else {
        throw new Error('Falha na autenticação');
      }
      
    } catch (error: any) {
      console.error('❌ Erro na autenticação Moblix:', error);
      setAuthStatus('Erro na autenticação');
      setIsAuthenticated(false);
      
      // Store error in Supabase
      await supabase.from('moblix_sessions').upsert({
        user_id: user?.id,
        auth_status: 'failed',
        last_error: error.message,
        last_auth: new Date().toISOString()
      });

      toast.error(`Erro na autenticação: ${error.message}`);
      return false;
      
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    moblixAuth.logout();
    setIsAuthenticated(false);
    setAuthStatus('Não autenticado');
    setDashboardData(null);
    setLastApiResponse(null);
    
    // Update status in Supabase
    if (user) {
      supabase.from('moblix_sessions').upsert({
        user_id: user.id,
        auth_status: 'logged_out',
        last_auth: new Date().toISOString()
      });
    }

    toast.success('Logout Moblix realizado com sucesso!');
  };

  const refreshDashboard = async (): Promise<void> => {
    if (!isAuthenticated) {
      toast.error('Authenticate Moblix first');
      return;
    }

    setIsLoadingDashboard(true);

    try {
      console.log('📊 Carregando dados do dashboard...');
      
      const data = await moblixService.getDashboardData();
      
      const dashboardInfo: DashboardData = {
        ...data,
        lastUpdated: new Date()
      };

      setDashboardData(dashboardInfo);
      setLastApiResponse(data);

      // Save dashboard data to Supabase
      if (user) {
        await supabase.from('moblix_dashboard_cache').upsert({
          user_id: user.id,
          data: dashboardInfo,
          updated_at: new Date().toISOString()
        });
      }

      console.log('✅ Dashboard atualizado com sucesso');
      toast.success('Dashboard atualizado!');

    } catch (error: any) {
      console.error('❌ Erro ao carregar dashboard:', error);
      toast.error(`Erro ao carregar dashboard: ${error.message}`);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const trackApiCall = async (endpoint: string, method: string): Promise<void> => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Insert API call log
      await supabase.from('moblix_api_calls').insert({
        user_id: user.id,
        endpoint,
        method: method.toUpperCase(),
        date: today,
        timestamp: new Date().toISOString(),
        count: 1
      });

      // Update local counter
      setApiCallsToday(prev => prev + 1);

    } catch (error) {
      console.error('Erro ao registrar chamada da API:', error);
    }
  };

  const sendNotification = async (title: string, message: string, userId?: string): Promise<boolean> => {
    try {
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        throw new Error('Usuário não identificado');
      }

      // Save notification to Supabase
      const { data, error } = await supabase.from('notifications').insert({
        user_id: targetUserId,
        title,
        message,
        type: 'moblix',
        status: 'sent',
        created_at: new Date().toISOString()
      }).select().single();

      if (error) {
        throw error;
      }

      await trackApiCall('/notifications/send', 'POST');
      
      console.log('📩 Notificação enviada:', data);
      toast.success('Notificação enviada com sucesso!');
      return true;

    } catch (error: any) {
      console.error('❌ Erro ao enviar notificação:', error);
      toast.error(`Erro ao enviar notificação: ${error.message}`);
      return false;
    }
  };

  const trackEvent = async (eventType: string, properties: any = {}): Promise<void> => {
    if (!user) return;

    try {
      // Save analytics event to Supabase
      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: eventType,
        properties,
        timestamp: new Date().toISOString(),
        source: 'moblix_context'
      });

      await trackApiCall('/analytics/track', 'POST');
      
      console.log('📈 Evento registrado:', eventType, properties);

    } catch (error: any) {
      console.error('❌ Erro ao registrar evento:', error);
    }
  };

  const value: MoblixContextType = {
    // Auth states
    isAuthenticated,
    authStatus,
    isAuthenticating,

    // Data states
    dashboardData,
    isLoadingDashboard,
    
    // API states
    lastApiResponse,
    apiCallsToday,
    
    // Methods
    authenticate,
    logout,
    refreshDashboard,
    trackApiCall,
    
    // Notifications
    sendNotification,
    
    // Analytics
    trackEvent
  };

  return (
    <MoblixContext.Provider value={value}>
      {children}
    </MoblixContext.Provider>
  );
};
