# 🎨 SemViagem Design System v2.0 - DOCUMENTAÇÃO OFICIAL

**Status**: ✅ ESTÁVEL EM PRODUÇÃO (Deploy 05/12/2024)
**Versão**: 2.0
**Responsável**: Arquitetura consolidada via Claude Code
**Deploy URL**: https://semviagem.com

---

## ⚠️ REGRAS CRÍTICAS - JAMAIS QUEBRAR

### 🚨 REGRA #1: SEMANTIC TOKENS OBRIGATÓRIOS
- **NUNCA** usar valores hardcoded (ex: `text-[#060D1C]`, `rounded-[18px]`)
- **SEMPRE** usar tokens semânticos (ex: `text-[var(--ds-text-primary)]`, `rounded-[var(--ds-radius-lg)]`)
- **MOTIVO**: Maintainability + consistência visual + mudanças centralizadas

**❌ ERRADO:**
```tsx
<div className="bg-[#F0C72F] text-[#060D1C] rounded-[18px] p-6">
```

**✅ CORRETO:**
```tsx
<div className="bg-[var(--ds-brand-yellow)] text-[var(--ds-text-primary)] rounded-[var(--ds-radius-lg)] p-[var(--ds-spacing-lg)]">
```

### 🚨 REGRA #2: AMARELO <10% DA ÁREA
- `--ds-brand-yellow` (#F0C72F) deve ocupar **menos de 10%** da área visível
- **Permitido**: badges, bullets, micro-acentos
- **PROIBIDO**: fundos extensos, áreas principais, botões grandes
- **MOTIVO**: Brand guidelines + visual hierarchy

### 🚨 REGRA #3: HIERARQUIA DE SOMBRAS
- **Cards padrão**: `--ds-shadow-card` (10px 30px rgba)
- **Hover states**: `--ds-shadow-card-hover` (20px 40px rgba)
- **Elementos pequenos**: `--ds-shadow-sm` (1px 2px rgba)
- **JAMAIS**: sombras custom hardcoded

### 🚨 REGRA #4: ESPAÇAMENTO SEM MAGIC NUMBERS
- **Usar apenas**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
- **NUNCA**: `p-3`, `gap-4`, `mt-6` (exceto onde Tailwind obriga)
- **Preferir**: `p-[var(--ds-spacing-sm)]` em vez de `p-2`

---

## 📋 TOKENS OFICIAIS

### 🎨 Cores (`--ds-*`)

```css
/* Marca */
--ds-brand-yellow: #F0C72F;     /* Acentos, badges. <10% área. JAMAIS em fundos grandes */
--ds-brand-dark: #060D1C;       /* CTAs primários, títulos principais */
--ds-brand-blue: #4896C7;       /* Acentos secundários (pouco usado) */

/* Neutros */
--ds-neutral-light: #E4E4E4;    /* Bordas, dividers, backgrounds secundários */
--ds-neutral-100: #FFFFFF;      /* Backgrounds principais */

/* Texto */
--ds-text-primary: #060D1C;     /* Títulos, textos principais (preto azulado) */
--ds-text-secondary: #1F2937;   /* Subtítulos (cinza escuro) */
--ds-text-muted: #6B7280;       /* Textos desabilitados, metadados (cinza médio) */

/* Utilitários */
--ds-border: rgba(6,13,28,0.06); /* Bordas sutis padronizadas */
```

**Aplicações:**
- Títulos H1/H2: `--ds-text-primary`
- Descrições/parágrafos: `--ds-text-secondary`
- Metadados (datas, contadores): `--ds-text-muted`
- Badges principais: fundo `--ds-brand-yellow`, texto `--ds-brand-dark`

### 📏 Espaçamento (`--ds-spacing-*`)

```css
--ds-spacing-xs: 4px;   /* Micro-ajustes, bullets offset */
--ds-spacing-sm: 8px;   /* Gap entre ícone/texto, padding labels */
--ds-spacing-md: 16px;  /* Padding padrão componentes, margins internas */
--ds-spacing-lg: 24px;  /* Layout entre seções, grid gaps */
--ds-spacing-xl: 32px;  /* Padding externo cards em desktop */
--ds-spacing-2xl: 48px; /* Grandes seções verticais */
```

**Uso:**
- Gap entre ícone e título: `gap-[var(--ds-spacing-sm)]` (8px)
- Padding card mobile: `p-[var(--ds-spacing-lg)]` (24px)
- Padding card desktop: `p-[var(--ds-spacing-xl)]` (32px)
- Grid gap entre cards: `gap-[var(--ds-spacing-lg)]` (24px)

### 📐 Raios (`--ds-radius-*`)

```css
--ds-radius-sm: 8px;    /* Badges, tags pequenas */
--ds-radius-md: 12px;   /* Botões, containers médios, ícones */
--ds-radius-lg: 18px;   /* Cards principais (PricingCard) */
--ds-radius-xl: 24px;   /* Modais, containers especiais */
--ds-radius-pill: 9999px; /* Botões pill, avatares */
```

### 🌑 Sombras (`--ds-shadow-*`)

```css
--ds-shadow-sm: 0 1px 2px rgba(6, 13, 28, 0.05);
--ds-shadow-card: 0 10px 30px rgba(6, 13, 28, 0.08);
--ds-shadow-card-hover: 0 20px 40px rgba(6, 13, 28, 0.12);
```

**Estados:**
- Default card: `shadow-[var(--ds-shadow-card)]`
- Hover card: `hover:shadow-[var(--ds-shadow-card-hover)]`
- Micro-elevação: `shadow-[var(--ds-shadow-sm)]`

### 🎯 Ícones (`--ds-icon-*`)

```css
--ds-icon-lg: 56px;     /* Product cards principais */
--ds-icon-md: 40px;     /* Features secundárias */
--ds-icon-sm: 28px;     /* Mobile, compactos */
--ds-icon-xs: 20px;     /* Micro-informações, inline icons */
```

---

## 🏗️ COMPONENTES CRÍTICOS

### PricingCard.tsx - 8 AJUSTES UX APLICADOS

**Status**: ✅ Funcionando perfeitamente
**Data implementação**: 05/12/2024
**Arquivo**: `src/components/PricingCard.tsx`

#### ✅ Ajustes aplicados (NÃO REVERTER):

1. **Ícones aumentados**:
   - Container: `w-16 h-16` (64px)
   - Padding interno: `p-[var(--ds-spacing-sm)]` (8px)
   - SVG size: 40px (para ocupar ~70% do container)

2. **Gap ícone/título reduzido**:
   - Antes: 16px (muito espaçoso)
   - Depois: `gap-[var(--ds-spacing-sm)]` (8px)

3. **Bullets melhorados**:
   - Tamanho: `w-[var(--ds-spacing-sm)] h-[var(--ds-spacing-sm)]` (8px círculos)
   - Margin-right: `mr-[var(--ds-spacing-sm)]` (8px)
   - Margin-top: `mt-[var(--ds-spacing-xs)]` (4px, alinhamento vertical)

4. **CTA spacing otimizado**:
   - Antes: `mt-6` (24px, muito espaçado)
   - Depois: `mt-[var(--ds-spacing-md)]` (16px)

5. **Badge "EM BREVE" subdued**:
   ```tsx
   bg-[rgba(240,199,47,0.18)]  // Amarelo 18% opacidade
   text-[11.5px]               // Ligeiramente menor
   px-[10px] py-[2px]          // Padding mais compacto
   ```

6. **CTA shadows premium**:
   - Default: `shadow-[var(--ds-shadow-card)]`
   - Hover: `hover:shadow-[var(--ds-shadow-card-hover)]`
   - Transform: `hover:-translate-y-0.5`

7. **Prova social centralizada**:
   ```tsx
   text-center font-semibold
   style={{ marginTop: '10px' }}  // 2px extra (8+2=10px)
   ```

8. **Grid gap exato**:
   ```tsx
   gap-[var(--ds-spacing-lg)]  // 24px entre cards
   ```

#### 🔒 Dados dos cards (MANTER EXATO):

```tsx
// Card 1: Busca Ilimitada
<PricingCard
  variant="busca"
  title="Busca Ilimitada"
  price="R$ 19,90"
  priceSub="/mês"
  bullets={[
    "Busca ilimitada de voos com milhas e dinheiro",
    "Comparação automática de tarifas reais",
  ]}
  // SEM badge, SEM prova social
/>

// Card 2: AI Agent Alertas (PRINCIPAL)
<PricingCard
  variant="alertas"
  title="AI Agent Alertas"  // ⚠️ EXATO
  badge="MAIS POPULAR"       // ⚠️ NÃO "MAIOR VANTAGEM"
  price="R$ 29,90"
  priceSub="/mês"
  bullets={[...]}
  // ÚNICO COM: "📈 +30.000 alertas enviados neste mês"
/>

// Card 3: AI Concierge
<PricingCard
  variant="concierge"
  title="AI Concierge"
  badge="EM BREVE"  // ⚠️ Badge subdued
  bullets={[...]}
  // SEM preço, SEM prova social
/>
```

### SVG Icons - Arquitetura

**Localização**: `src/components/icons/`

**Componentes**:
- `IconBusca.tsx` - Estrela amarela (busca de voos)
- `IconAlertas.tsx` - Sino azul com badge (alertas)
- `IconConcierge.tsx` - Robô (AI concierge)

**Padrão de implementação**:
```tsx
interface IconProps {
  size?: number;
  className?: string;
  title?: string;
  color?: string;
  variant?: "full" | "micro";
  ariaHidden?: boolean;
}

// Sempre incluir acessibilidade
<svg aria-labelledby={titleId} aria-hidden={ariaHidden}>
  {!ariaHidden && <title id={titleId}>{title}</title>}
  {/* SVG paths */}
</svg>
```

---

## 📁 ESTRUTURA CSS

### Arquivo principal: `src/index.css`

```css
:root {
  /* ========================================
     DESIGN SYSTEM v2.0 - SEMANTIC TOKENS
     ======================================== */

  /* Tokens aqui */
}

/* NUNCA adicionar estilos inline custom fora dos tokens */
```

### Arquivo utilitário: `src/styles/designSystem.ts`

**Export de tokens JS** (legacy, manter compatibilidade):
```typescript
export const designSystem = {
  colors: { /* tokens */ },
  spacing: { /* tokens */ },
  radii: { /* tokens */ },
  shadows: { /* tokens */ },
  iconSizes: { /* tokens */ },
  // ...
};
```

**Helper functions**:
```typescript
export const cn = (...classes) => classes.filter(Boolean).join(' ');
export const getColorClass = (type) => { /* ... */ };
export const getBgColorClass = (type) => { /* ... */ };
```

---

## 🔒 PROTEÇÕES E CHECKLIST

### Antes de modificar PricingCard.tsx:

- [ ] ✅ Mantém os 8 ajustes UX
- [ ] ✅ Usa 100% tokens semânticos (zero hardcode)
- [ ] ✅ Valida regra 10% amarelo
- [ ] ✅ Testa hover states (card + CTA)
- [ ] ✅ Verifica responsividade (mobile/tablet/desktop)
- [ ] ✅ Confirma prova social APENAS no card "AI Agent Alertas"
- [ ] ✅ Badge "EM BREVE" mantém estilo subdued

### Checklist de qualidade geral:

- [ ] `npm run build` sem warnings críticos
- [ ] Bundle size < 1MB (atualmente 799kB OK)
- [ ] Gzip < 250kB (atualmente 226kB OK)
- [ ] Contrast ratios WCAG AA (4.5:1 mínimo)
- [ ] Hover states funcionando
- [ ] Touch targets ≥44px (mobile)

### Debug se algo quebrar:

1. **Tokens não aplicam**:
   - Verificar `src/index.css` tem `:root` tokens
   - Confirmar build incluiu CSS variables
   - Inspecionar DevTools → Computed → ver se `var(--ds-*)` resolve

2. **Espaçamento incorreto**:
   - Procurar magic numbers (`p-3`, `gap-4`, `mt-6`)
   - Substituir por tokens semânticos
   - Re-build e testar

3. **Cores inconsistentes**:
   - Buscar hex colors hardcoded (`#F0C72F`, `#060D1C`)
   - Substituir por `var(--ds-*)`
   - Validar regra 10% amarelo

---

## 📊 MÉTRICAS DE SUCESSO

**Bundle atual (05/12/2024)**:
```
CSS:  137.69 kB → 21.92 kB gzip (84.1% redução) ✅
JS:   799.01 kB → 225.97 kB gzip (71.7% redução) ✅
HTML: 2.64 kB → 1.09 kB gzip (58.7% redução) ✅
```

**Metas futuras**:
- Code-splitting: reduzir JS bundle para <600kB
- Tree-shaking Radix UI: economizar ~50kB
- Image optimization: lazy loading

---

## 🚀 DEPLOY NOTES

**Build command**: `npm run build`
**Output dir**: `dist/`
**Netlify**: Auto-deploy on push to `main`

**Environment**: Production
**URL**: https://semviagem.com
**Status**: ✅ LIVE

---

## 📚 REFERÊNCIAS

- **Arquivo tokens**: `/src/index.css` (linhas 5-88)
- **Design System TS**: `/src/styles/designSystem.ts`
- **PricingCard**: `/src/components/PricingCard.tsx`
- **Icons**: `/src/components/icons/*.tsx`

**Última atualização**: 05 Dezembro 2024
**Versão**: 2.0 (Estável em produção)

---

**⚠️ IMPORTANTE**: Esta documentação é a "constituição do código". Qualquer mudança nos componentes críticos deve primeiro consultar este documento para evitar regressões.
