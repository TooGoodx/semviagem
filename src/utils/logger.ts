/**
 * Sistema de Logging Centralizado - SemViagem
 *
 * Substitui console.logs diretos por um sistema centralizado
 * que só exibe logs em desenvolvimento
 */

export const logger = {
  /**
   * Debug: Informações de desenvolvimento (só aparece em DEV)
   */
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`🔍 ${message}`, data !== undefined ? data : '');
    }
  },

  /**
   * Info: Informações gerais (só aparece em DEV)
   */
  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.info(`ℹ️ ${message}`, data !== undefined ? data : '');
    }
  },

  /**
   * Warn: Avisos importantes (aparece sempre)
   */
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ ${message}`, data !== undefined ? data : '');
  },

  /**
   * Error: Erros críticos (aparece sempre)
   */
  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error !== undefined ? error : '');
  },

  /**
   * Success: Operações bem-sucedidas (só aparece em DEV)
   */
  success: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${message}`, data !== undefined ? data : '');
    }
  }
};

export default logger;
