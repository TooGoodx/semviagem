import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configurações do Supabase usando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rtxrgqlhdbsztsbnycln.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0eHJncWxoZGJzenRzYm55Y2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NjU1MTAsImV4cCI6MjA2NjE0MTUxMH0.IcF22qbU7vMlwQ04RfY3Tc4z9vmQYs-2sYxKxQoTnpw';

// Instância do Supabase
let supabaseInstance: SupabaseClient | null = null;

// Configuração de armazenamento personalizado
const storage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }
};

// Função para obter a instância do Supabase
export function getSupabase(): SupabaseClient {
  // Se já temos uma instância, retornamos ela
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Verifica se está rodando no navegador
  if (typeof window === 'undefined') {
    console.warn('Supabase pode ser inicializado apenas no navegador');
    return null as any;
  }

  try {
    console.log('Inicializando Supabase com URL:', supabaseUrl);
    console.log('Supabase Anon Key definido:', !!supabaseAnonKey);
    
    // Cria a instância do cliente Supabase
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: storage,
        storageKey: 'sb-auth-token',
        flowType: 'pkce',
        debug: import.meta.env.DEV
      }
    });

    console.log('Supabase cliente criado com sucesso');

    // Atualiza a instância global para debug
    if (window && import.meta.env.DEV) {
      (window as any).supabase = supabaseInstance;
    }

    return supabaseInstance;
  } catch (error) {
    console.error('Erro ao criar o cliente Supabase:', error);
    return null as any;
  }
}

// Exporta apenas a função para obter o Supabase quando necessário
// export const supabase = getSupabase(); // Removido para evitar inicialização prematura
