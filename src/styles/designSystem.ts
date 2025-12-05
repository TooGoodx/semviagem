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
    // Cores principais da marca
    primary: '#060D1C',        // Azul Navy Dark - texto principal
    accent: '#F0C730',         // Amarelo Dourado Vibrante - destaques
    accentBlue: '#4896C7',     // Azul Médio Vibrante - palavras destacadas
    background: '#FFFFFF',     // Branco
    surface: '#E4E4E4',        // Cinza Claro Neutro - cards e backgrounds
    surfaceAlt: '#F5F5F5',     // Cinza mais claro - hover states

    // Design System v2.0 Tokens
    brandYellow: '#F0C72F',
    brandDark: '#060D1C',
    brandBlue: '#4896C7',
    neutralLight: '#E4E4E4',
    neutral100: '#FFFFFF',
    border: 'rgba(6,13,28,0.06)',

    // Hierarquia de texto
    textPrimary: '#060D1C',    // Texto principal (preto azulado)
    textSecondary: '#1F2937',  // Texto secundário (cinza escuro)
    textMuted: '#6B7280',      // Texto desativado (cinza médio)
    textOnAccent: '#060D1C',   // Texto em fundo amarelo

    // CTAs (Call-to-Actions)
    ctaPrimary: '#EF4444',         // Vermelho - "Buscar voos" principal
    ctaPrimaryHover: '#DC2626',    // Vermelho hover
    ctaSecondary: '#0033AA',       // Azul - Botões secundários
    ctaSecondaryHover: '#0055FF',  // Azul hover

    // Estados e feedbacks
    outline: '#060D1C',
    borderLight: '#E9EEF3',    // Borda suave - cards e divisores
    success: '#16A34A',        // Verde - sucesso
    danger: '#DC2626',         // Vermelho - erro
    warning: '#F59E0B',        // Laranja - aviso
    info: '#3B82F6',           // Azul - informação

    // Calendário
    calendarSelected: '#3B82F6',      // Azul - data selecionada
    calendarHover: '#DBEAFE',         // Azul claro - hover
    calendarDisabled: '#F3F4F6',      // Cinza - desabilitado
    calendarToday: '#F0C730',         // Amarelo - hoje
  },

  // ========================================
  // 2. ESPAÇAMENTO
  // ========================================
  spacing: {
    xs: '4px',      // 0.25rem
    sm: '8px',      // 0.5rem
    md: '16px',     // 1rem
    lg: '24px',     // 1.5rem
    xl: '32px',     // 2rem
    '2xl': '48px',  // 3rem
    '3xl': '64px',  // 4rem
    '4xl': '96px',  // 6rem
  },

  // ========================================
  // 3. TIPOGRAFIA
  // ========================================
  typography: {
    // Hero Section
    heroTitle: {
      fontSize: 'clamp(28px, 4.1vw, 52px)',
      lineHeight: '1.12',
      fontWeight: '700',
      letterSpacing: '-0.015em',
      textWrap: 'balance',
    },
    heroSubtitle: {
      fontSize: 'clamp(16px, 1.5vw, 18px)',
      lineHeight: '1.8',
      fontWeight: '300',
    },

    // Títulos (Headings)
    h1: 'text-4xl sm:text-5xl font-bold',          // 36px → 48px
    h2: 'text-3xl sm:text-4xl font-bold',          // 30px → 36px
    h3: 'text-2xl font-bold',                      // 24px
    h4: 'text-xl font-semibold',                   // 20px
    h5: 'text-lg font-semibold',                   // 18px

    // Corpo de texto
    body: 'text-base leading-relaxed',             // 16px
    bodyLarge: 'text-lg leading-relaxed',          // 18px
    bodySmall: 'text-sm leading-relaxed',          // 14px
    label: 'text-sm font-medium',                  // 14px
    caption: 'text-xs text-gray-500',              // 12px

    // Cards de produto
    cardTitle: 'text-2xl font-bold',               // 24px
    cardPrice: 'text-xl font-semibold',            // 20px
    cardPriceSubtext: 'text-sm text-gray-500',     // 14px
    cardBullet: 'text-sm text-gray-700',           // 14px
    cardBadge: 'text-xs font-semibold',            // 12px
  },

  // ========================================
  // 4. BORDAS (BORDER RADIUS)
  // ========================================
  radii: {
    none: '0',
    sm: '8px',      // Inputs, tags pequenas
    md: '12px',     // Botões, badges
    lg: '16px',     // Cards pequenos
    xl: '24px',     // Cards grandes, modais
    '2xl': '32px',  // Containers especiais
    pill: '9999px', // Botões pill, badges redondos
  },

  // ========================================
  // 5. SOMBRAS (BOX SHADOWS)
  // ========================================
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(6, 13, 28, 0.05)',
    base: '0 4px 6px rgba(6, 13, 28, 0.07)',
    md: '0 10px 15px rgba(6, 13, 28, 0.08)',
    lg: '0 10px 30px rgba(6, 13, 28, 0.08)',
    xl: '0 20px 40px rgba(6, 13, 28, 0.12)',
    '2xl': '0 25px 50px rgba(6, 13, 28, 0.15)',

    // Sombras específicas de componentes
    card: '0 10px 30px rgba(6, 13, 28, 0.08)',
    cardHover: '0 20px 40px rgba(6, 13, 28, 0.12)',
    badge: '0 2px 8px rgba(0, 51, 170, 0.3)',
    dropdown: '0 10px 25px rgba(6, 13, 28, 0.1)',
  },

  // ========================================
  // 6. TRANSIÇÕES
  // ========================================
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // ========================================
  // 7. BREAKPOINTS
  // ========================================
  breakpoints: {
    sm: '640px',    // Mobile landscape
    md: '768px',    // Tablet portrait
    lg: '1024px',   // Tablet landscape / Desktop pequeno
    xl: '1280px',   // Desktop médio
    '2xl': '1536px', // Desktop grande
  },

  // ========================================
  // 8. Z-INDEX (HIERARQUIA DE CAMADAS)
  // ========================================
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    notification: 80,
  },

  // ========================================
  // 8.5 ICON SIZES
  // ========================================
  iconSizes: {
    lg: 56,
    md: 40,
    sm: 28,
    xs: 20,
  },

  // ========================================
  // 9. LAYOUTS (MAX-WIDTHS)
  // ========================================
  layouts: {
    maxWidthContainer: '1280px',      // max-w-7xl - Container principal
    maxWidthContent: '1024px',        // max-w-5xl - Conteúdo padrão
    maxWidthText: '768px',            // max-w-3xl - Textos longos
    maxWidthHero: '1350px',           // Hero Section específico
    maxWidthNarrow: '640px',          // max-w-2xl - Formulários
  },

  // ========================================
  // 10. BORDERS
  // ========================================
  borders: {
    widths: {
      thin: '1px',
      base: '2px',
      thick: '4px',
    },
    styles: {
      solid: 'solid',
      dashed: 'dashed',
      dotted: 'dotted',
    },
  },
};

// ========================================
// COMPONENTES PRÉ-DEFINIDOS (CLASSES TAILWIND)
// ========================================

export const componentClasses = {
  // ========================================
  // CARDS
  // ========================================
  card: {
    base: 'bg-white rounded-2xl p-8 shadow-lg transition-all duration-300',
    hover: 'hover:shadow-xl hover:-translate-y-1',
    withAccent: 'border-b-4 border-[#F0C730]',
    compact: 'bg-white rounded-xl p-6 shadow-md',
  },

  // ========================================
  // BADGES
  // ========================================
  badge: {
    base: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
    primary: 'bg-[#0033AA] text-white shadow-md',
    accent: 'bg-[#F0C730] text-[#060D1C]',
    success: 'bg-[#16A34A] text-white',
    danger: 'bg-[#DC2626] text-white',
    floating: 'absolute top-4 right-4',
  },

  // ========================================
  // BUTTONS
  // ========================================
  button: {
    base: 'w-full py-3 rounded-lg font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2',

    // Variantes
    primary: 'bg-[#EF4444] text-white hover:bg-[#DC2626] focus:ring-[#EF4444]/30',
    secondary: 'bg-[#0033AA] text-white hover:bg-[#0055FF] focus:ring-[#0033AA]/30',
    accent: 'bg-[#F0C730] text-[#060D1C] hover:bg-[#FFD54A] focus:ring-[#F0C730]/30',
    outline: 'bg-transparent border-2 border-[#060D1C] text-[#060D1C] hover:bg-[#060D1C] hover:text-white',
    ghost: 'bg-transparent text-[#060D1C] hover:bg-[#F5F5F5]',

    // Tamanhos
    small: 'py-2 text-sm',
    large: 'py-4 text-lg',
  },

  // ========================================
  // BULLETS (LISTAS)
  // ========================================
  bullet: {
    dot: 'inline-flex h-2 w-2 rounded-full bg-[#F0C730] flex-shrink-0 mt-1',
    container: 'flex items-start gap-2',
    list: 'space-y-2 text-sm text-gray-700',
  },

  // ========================================
  // FOCUS STATES (ACESSIBILIDADE)
  // ========================================
  focus: {
    ring: 'focus:outline-none focus:ring-4 focus:ring-offset-2',
    primary: 'focus:ring-[#0033AA]/30',
    accent: 'focus:ring-[#F0C730]/30',
    danger: 'focus:ring-[#DC2626]/30',
  },

  // ========================================
  // INPUTS
  // ========================================
  input: {
    base: 'w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0033AA] focus:border-transparent transition-all',
    error: 'border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:ring-green-500',
    disabled: 'bg-gray-100 cursor-not-allowed',
  },

  // ========================================
  // CONTAINERS
  // ========================================
  container: {
    full: 'container mx-auto px-4 sm:px-6 lg:px-8',
    section: 'pt-20 pb-20 px-4',
    maxWidth: 'max-w-7xl mx-auto',
    narrow: 'max-w-3xl mx-auto',
  },

  // ========================================
  // GRID LAYOUTS
  // ========================================
  grid: {
    cards: 'grid grid-cols-1 md:grid-cols-3 gap-6',
    twoCol: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    fourCol: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  },

  // ========================================
  // DIVIDERS
  // ========================================
  divider: {
    horizontal: 'h-px bg-gray-200',
    vertical: 'w-px bg-gray-200',
    accent: 'h-1 bg-[#F0C730] rounded-full',
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
 * Retorna classe de cor baseada no tipo
 */
export const getColorClass = (type: 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'info') => {
  const colorMap = {
    primary: 'text-[#060D1C]',
    accent: 'text-[#F0C730]',
    success: 'text-[#16A34A]',
    danger: 'text-[#DC2626]',
    warning: 'text-[#F59E0B]',
    info: 'text-[#3B82F6]',
  };
  return colorMap[type];
};

/**
 * Retorna classe de background baseada no tipo
 */
export const getBgColorClass = (type: 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'info') => {
  const bgMap = {
    primary: 'bg-[#060D1C]',
    accent: 'bg-[#F0C730]',
    success: 'bg-[#16A34A]',
    danger: 'bg-[#DC2626]',
    warning: 'bg-[#F59E0B]',
    info: 'bg-[#3B82F6]',
  };
  return bgMap[type];
};

/**
 * Combina classes Tailwind removendo duplicatas
 */
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};
