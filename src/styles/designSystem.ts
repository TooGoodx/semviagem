// ========================================
// SEMVIAGEM DESIGN SYSTEM v2.0
// ========================================
// Sistema de design completo e escalável
// Baseado nas otimizações aplicadas em Hero Section,
// Product Cards, Formulário de Busca e componentes internos
// ========================================

export const designSystem = {
  // ========================================
  // 1. CORES
  // ========================================
  colors: {
    // Cores principais da marca (V2)
    brand: {
      dark: '#060D1C',      // Navy - PRIMARY CTA, texto principal
      yellow: '#F0C72F',    // Amarelo - ACCENT apenas (badges, bullets)
      blue: '#4896C7',      // Azul secundário - links, hover states
    },

    // Backgrounds e superfícies
    background: '#FFFFFF',
    surface: '#E4E4E4',        // Cinza claro - cards
    surfaceAlt: '#F5F5F5',     // Cinza hover

    // Hierarquia de texto
    text: {
      primary: '#060D1C',      // Texto principal (navy)
      secondary: '#1F2937',    // Texto secundário (cinza escuro)
      muted: '#6B7280',        // Texto desabilitado (cinza médio)
      onYellow: '#060D1C',     // Texto em fundo amarelo
      onNavy: '#FFFFFF',       // Texto em fundo navy
    },

    // CTAs (Call-to-Actions) - V2: Navy is PRIMARY
    cta: {
      primary: '#060D1C',           // Navy - CTA principal
      primaryHover: '#0a1428',      // Navy hover (ligeiramente mais claro)
      secondary: '#4896C7',         // Azul - CTA secundário
      secondaryHover: '#3a7ab0',    // Azul hover
    },

    // Semânticos (feedbacks e estados)
    semantic: {
      success: '#16A34A',      // Verde
      danger: '#DC2626',       // Vermelho
      warning: '#F59E0B',      // Laranja
      info: '#3B82F6',         // Azul
    },

    // Bordas
    border: {
      light: '#E9EEF3',
      default: 'rgba(6,13,28,0.06)',
      dark: '#060D1C',
    },

    // Calendário
    calendar: {
      selected: '#3B82F6',
      hover: '#DBEAFE',
      disabled: '#F3F4F6',
      today: '#F0C72F',
    },

    // ========================================
    // BACKWARD COMPATIBILITY (Legacy V1)
    // ========================================
    primary: '#060D1C',           // Legacy alias for brand.dark
    accent: '#F0C72F',            // Legacy alias for brand.yellow
    accentBlue: '#4896C7',        // Legacy alias for brand.blue
    textPrimary: '#060D1C',       // Legacy alias for text.primary
    textSecondary: '#1F2937',     // Legacy alias for text.secondary
    textMuted: '#6B7280',         // Legacy alias for text.muted
    success: '#16A34A',           // Legacy flat access
    danger: '#DC2626',            // Legacy flat access
    warning: '#F59E0B',           // Legacy flat access
    info: '#3B82F6',              // Legacy flat access
    outline: '#060D1C',           // Legacy border color
    borderLight: '#E9EEF3',       // Legacy border.light
  },

  // ========================================
  // 2. ESPAÇAMENTO
  // ========================================
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  // ========================================
  // 3. TIPOGRAFIA
  // ========================================
  typography: {
    fontPrimary: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
    fontDisplay: 'Merriweather, Georgia, serif',

    scale: {
      heroTitle: 'clamp(28px, 4.1vw, 52px)',
      h1: 'clamp(32px, 3.5vw, 48px)',
      h2: 'clamp(24px, 2.8vw, 36px)',
      h3: '24px',
      h4: '20px',
      body: '16px',
      small: '14px',
      tiny: '12px',
    },

    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    lineHeights: {
      tight: 1.12,
      base: 1.5,
      relaxed: 1.8,
    },
  },

  // ========================================
  // 4. BORDAS (BORDER RADIUS)
  // ========================================
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  // ========================================
  // 5. SOMBRAS (BOX SHADOWS)
  // ========================================
  shadows: {
    sm: '0 1px 2px rgba(6, 13, 28, 0.05)',
    md: '0 10px 15px rgba(6, 13, 28, 0.08)',
    lg: '0 10px 30px rgba(6, 13, 28, 0.08)',
    xl: '0 20px 40px rgba(6, 13, 28, 0.12)',
    card: '0 10px 30px rgba(6, 13, 28, 0.08)',
    hover: '0 20px 40px rgba(6, 13, 28, 0.12)',
  },

  // ========================================
  // 6. ÍCONES
  // ========================================
  icons: {
    lg: 56,
    md: 40,
    sm: 28,
    xs: 20,
  },

};

// ========================================
// COMPONENTES PRÉ-DEFINIDOS (CLASSES TAILWIND)
// ========================================

export const componentClasses = {
  // ========================================
  // BUTTONS (V2: Navy Primary CTA)
  // ========================================
  button: {
    // Base styles
    base: 'w-full py-3 px-6 rounded-lg font-semibold shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2',

    // Variantes (V2: Navy is PRIMARY)
    primary: 'bg-[#060D1C] text-white hover:bg-[#0a1428] focus-visible:ring-[#060D1C]/30',
    secondary: 'bg-[#4896C7] text-white hover:bg-[#3a7ab0] focus-visible:ring-[#4896C7]/30',
    outline: 'bg-transparent border-2 border-[#060D1C] text-[#060D1C] hover:bg-[#060D1C] hover:text-white focus-visible:ring-[#060D1C]/30',
    ghost: 'bg-transparent text-[#060D1C] hover:bg-[#F5F5F5] focus-visible:ring-[#060D1C]/20',

    // Tamanhos
    small: 'py-2 text-sm',
    large: 'py-4 text-lg',
  },

  // ========================================
  // BADGES (V2: Yellow Accent Only)
  // ========================================
  badge: {
    base: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
    yellow: 'bg-[#F0C72F] text-[#060D1C]',
    navy: 'bg-[#060D1C] text-white',
    success: 'bg-[#16A34A] text-white',
    danger: 'bg-[#DC2626] text-white',
  },

  // ========================================
  // BULLETS (V2: Yellow Dots)
  // ========================================
  bullet: {
    dot: 'inline-flex h-2 w-2 rounded-full bg-[#F0C72F] flex-shrink-0 mt-1',
    container: 'flex items-start gap-2',
    list: 'space-y-2 text-sm text-gray-700',
  },

  // ========================================
  // CARDS
  // ========================================
  card: {
    base: 'bg-white rounded-2xl p-8 shadow-lg transition-all duration-300',
    hover: 'hover:shadow-xl hover:-translate-y-1',
    compact: 'bg-white rounded-xl p-6 shadow-md',
  },

  // ========================================
  // INPUTS (Legacy compatibility)
  // ========================================
  input: {
    base: 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#060D1C] focus:border-transparent transition-all',
    error: 'border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:ring-green-500',
    disabled: 'bg-gray-100 cursor-not-allowed',
  },
};

// ========================================
// CLASSES CSS GLOBAIS (LEGADO - MANTER COMPATIBILIDADE)
// ========================================

export const surfaceCardClasses =
  'rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-[0_25px_50px_rgba(6,13,28,0.12)] bg-[#E4E4E4]';

// ========================================
// HELPER FUNCTIONS (UTILITÁRIOS)
// ========================================

/**
 * Combina classes Tailwind removendo duplicatas
 */
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Retorna classes de botão completas baseado na variante
 */
export const getButtonClasses = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary', size?: 'small' | 'large') => {
  const baseClass = componentClasses.button.base;
  const variantClass = componentClasses.button[variant];
  const sizeClass = size ? componentClasses.button[size] : '';
  return cn(baseClass, variantClass, sizeClass);
};

/**
 * Retorna classes de badge baseado no tipo
 */
export const getBadgeClasses = (variant: 'yellow' | 'navy' | 'success' | 'danger' = 'yellow') => {
  return cn(componentClasses.badge.base, componentClasses.badge[variant]);
};
