# SemViagem Design System Documentation

> **Comprehensive design system extracted from production codebase**
> Last Updated: December 2024
> Version: 1.0.0

---

## Table of Contents
1. [Brand Colors](#1-brand-colors)
2. [Typography System](#2-typography-system)
3. [Component Library](#3-component-library)
4. [Spacing System](#4-spacing-system)
5. [Border Radius System](#5-border-radius-system)
6. [Shadow System](#6-shadow-system)
7. [Interaction Patterns](#7-interaction-patterns)
8. [Responsive Design](#8-responsive-design-patterns)
9. [Brand Voice & Messaging](#9-brand-voice--messaging)
10. [Icon & Illustration System](#10-icon--illustration-system)
11. [Elevation & Z-Index](#11-elevation--z-index-hierarchy)
12. [Architecture & Code](#12-architecture--code-patterns)
13. [Tailwind Configuration](#13-tailwind-configuration)
14. [Component Variations](#14-component-variations--states)
15. [Accessibility](#15-accessibility-wcag-21-aa)
16. [Implementation Guidelines](#16-implementation-guidelines)
17. [Color Reference](#17-complete-color-reference)

---

## 1. BRAND COLORS

### Primary Brand Colors

**Brand Dark (Navy): #060D1C**
- **Usage**: Primary text, main brand color, button backgrounds, brand emphasis
- **Accessibility**: WCAG AAA contrast on white backgrounds (21:1)
- **Examples**: Navbar links, primary buttons, body text, headers
- **File Locations**:
  - `src/pages/Home.tsx` - Hero text, section headers
  - `src/styles/designSystem.ts` - Core brand color token

**Brand Yellow: #F0C72F / #F0C730**
- **Usage**: Accent color, pricing highlights, brand emphasis, special callouts
- **Font Pairing**: Playfair Display italic (e.g., "quase de graça")
- **Accessibility**: WCAG AAA with dark text (8.19:1)
- **Examples**:
  - Badge backgrounds
  - Pricing highlights
  - Primary CTA buttons
  - Hero emphasis text
- **File Locations**:
  - `src/pages/Home.tsx` - "quase de graça" styling, CTA buttons
  - `src/components/paywall/*.tsx` - Paywall accent colors

**Brand Blue: #4896C7**
- **Usage**: Secondary accent, interactive elements, links, secondary CTAs
- **Accessibility**: WCAG AA with white text (4.54:1)
- **Examples**:
  - "Busca Ilimitada" text
  - Form focus states
  - Secondary buttons
  - Link hover states
- **File Locations**:
  - `src/components/paywall/PaywallOverlay.tsx` - Modal headers
  - `src/components/FlightResults.tsx` - Pagination active state

**Neutral Light: #E4E4E4**
- **Usage**: Card backgrounds, light surface areas, subtle dividers
- **Accessibility**: Good contrast for dark text
- **Examples**: Surface backgrounds, button backgrounds (secondary)
- **File Locations**: Various card components

**White: #FDFDFD / #FFFFFF**
- **Usage**: Card backgrounds, primary surface, text backgrounds
- **Examples**: Main content areas, modal backgrounds
- **File Locations**: Universal across all components

### Extended Color Palette

#### Primary (Brand Dark) Shades
```
50:  #f8f9fb  (Lightest - backgrounds)
100: #f1f3f6
200: #e3e7ed
300: #d5dbe4
400: #b9c3d1
500: #9dabbe  (Middle - muted elements)
600: #6b7a8f
700: #4a5968
800: #2a3441
900: #060D1C  (Brand Dark - primary text)
```

#### Secondary (Brand Yellow) Shades
```
50:  #fefcf0  (Lightest - backgrounds)
100: #fdf9e1
200: #fbf3c3
300: #f9eda5
400: #f5e169
500: #F0C72F  (Brand Yellow - primary accent)
600: #d8b329  (Hover state)
700: #b59622
800: #91791b
900: #766316  (Darkest - borders)
```

### Semantic Colors

**Text Colors**
- Primary: `#060D1C` (same as brand dark)
- Secondary: `#1F2937` (dark gray)
- Muted: `#6B7280` (medium gray)
- On Accent: `#060D1C` (dark on yellow)

**Status & Feedback Colors**
- Success: `#16A34A` (Green)
- Danger: `#DC2626` (Red)
- Warning: `#F59E0B` (Orange)
- Info: `#3B82F6` (Blue)

**UI Colors**
- Background: `#F9FAFB` (very light gray)
- Border: `rgba(6, 13, 28, 0.06)` (transparent dark)
- Border Light: `#E9EEF3` (light gray border)

### Color Usage Guidelines

**Primary Actions**
```tsx
// Primary CTA (Yellow)
<button className="bg-[#F0C730] text-[#060D1C] hover:bg-[#d8b329]">
  Assinar Agora
</button>

// Secondary Action (Navy)
<button className="bg-[#060D1C] text-white hover:opacity-80">
  Saiba Mais
</button>
```

**Text Hierarchy**
```tsx
// Primary headline
<h1 className="text-[#060D1C]">Main Title</h1>

// Secondary text
<p className="text-[#1F2937]">Supporting content</p>

// Muted/helper text
<span className="text-[#6B7280]">Additional info</span>
```

**Status Indicators**
```tsx
// Success message
<div className="text-[#16A34A]">Booking confirmed!</div>

// Error message
<div className="text-[#DC2626]">Invalid date selected</div>
```

---

## 2. TYPOGRAPHY SYSTEM

### Font Families

**Primary Font: Plus Jakarta Sans**
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- Usage: All body text, UI elements, most headings
- Source: Google Fonts
- Fallback: System font stack

**Display Font: Playfair Display**
- Weights: 400 (Regular), 700 (Bold)
- Style: Serif, italic for emphasis
- Usage: Special brand phrases ("quase de graça"), elegant headlines
- Source: Google Fonts

**System Font Stack**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
             'Helvetica Neue', sans-serif;
```

### Type Scale

#### Hero Section Typography
```tsx
// Hero Title
<h1 style={{
  fontSize: 'clamp(28px, 4.1vw, 52px)', // Responsive scaling
  fontWeight: 700,
  lineHeight: 1.12,
  letterSpacing: '-0.015em',
  color: 'rgba(255,255,255,0.96)',
  textShadow: '0 2px 8px rgba(0,0,0,0.25)',
  maxWidth: '1350px',
}}>
  O maior ecossistema de viagens baratas do Brasil
</h1>

// Mobile adjustments
@media (max-width: 640px) {
  fontSize: clamp(22px, 6.5vw, 30px)
}

// Hero Subtitle
<p style={{
  fontSize: 'clamp(16px, 1.5vw, 18px)',
  fontWeight: 300,
  lineHeight: 1.8,
  color: 'rgba(255,255,255,0.85)',
  maxWidth: '680px',
  marginBottom: '56px',
}}>
  Encontre voos usando milhas -
  <span style={{
    fontFamily: 'Playfair Display, serif',
    fontStyle: 'italic',
    color: '#F0C730'
  }}>quase de graça</span>
</p>
```

#### Heading Scale
```tsx
// H1 - Page Titles
<h1 className="text-4xl sm:text-5xl font-bold text-[#060D1C]">
  // 36px → 48px responsive
</h1>

// H2 - Section Headers
<h2 className="text-3xl sm:text-4xl font-bold text-[#060D1C]">
  // 30px → 36px responsive
</h2>

// H3 - Subsection Headers
<h3 className="text-2xl font-bold text-[#060D1C]">
  // 24px
</h3>

// H4 - Card Titles
<h4 className="text-xl font-semibold text-[#060D1C]">
  // 20px
</h4>

// H5 - Small Headers
<h5 className="text-lg font-semibold text-[#060D1C]">
  // 18px
</h5>
```

#### Body Text Scale
```tsx
// Large body (emphasis)
<p className="text-lg leading-relaxed text-[#1F2937]">
  // 18px, line-height: 1.625
</p>

// Standard body
<p className="text-base leading-relaxed text-[#1F2937]">
  // 16px, line-height: 1.625
</p>

// Small body
<p className="text-sm leading-relaxed text-[#6B7280]">
  // 14px, line-height: 1.625
</p>
```

#### UI Text
```tsx
// Form labels
<label className="text-sm font-medium text-gray-700">
  // 14px, weight: 500
</label>

// Captions / helper text
<span className="text-xs text-gray-500">
  // 12px
</span>

// Button text
<button className="text-sm font-medium">
  // 14px, weight: 500
</button>
```

### Special Typography Patterns

#### "Quase de Graça" Styling
```tsx
<span style={{
  fontFamily: 'Playfair Display, serif',
  fontStyle: 'italic',
  color: '#F0C730',
  fontWeight: 400,
}}>
  quase de graça
</span>
```

#### Pricing Display
```tsx
// Main price
<div className="text-2xl font-bold text-[#060D1C]">
  R$ 29,90
  <span className="text-sm font-normal text-[#6B7280]">/mês</span>
</div>

// Yellow accent pricing
<div style={{
  fontSize: '20px',
  fontWeight: 700,
  color: '#F0C730',
}}>
  R$ 29,90/mês
</div>
```

#### Flight Card Typography (Responsive)
```tsx
// Flight time (responsive)
Desktop: 24px
Tablet (1024px): 21.6px
Mobile (420px): 18px

// Flight price
Desktop: 20px
Tablet: 18px
Mobile: 16px

// Flight details (duration, airline)
Desktop: 13px-14px
Mobile: 11px-12px
```

### Typography Guidelines

**Do's**
- Use Plus Jakarta Sans for all UI and body text
- Use Playfair Display italic for brand emphasis phrases
- Maintain proper hierarchy (h1 → h2 → h3)
- Use responsive font sizes (clamp, viewport units)
- Ensure sufficient line-height for readability (1.5-1.8)

**Don'ts**
- Don't use more than 2 font families
- Don't use Playfair Display for long body text
- Don't use all caps for long text (accessibility)
- Don't use font sizes below 12px (mobile accessibility)

---

## 3. COMPONENT LIBRARY

### Buttons

#### Base Button Structure
All buttons share these common properties:
```tsx
className="inline-flex items-center justify-center gap-2 whitespace-nowrap
           rounded-md text-sm font-medium transition-all duration-200
           focus-visible:outline-none focus-visible:ring-2
           focus-visible:ring-offset-2 disabled:pointer-events-none
           disabled:opacity-50"
```

#### Primary Button (Yellow CTA)
```tsx
<button className="bg-[#F0C730] text-[#060D1C] hover:bg-[#d8b329]
                   shadow-md hover:shadow-lg hover:-translate-y-0.5
                   px-6 py-3 rounded-full font-medium">
  Assinar Agora
</button>

// Tailwind class equivalent
className="bg-yellow-500 hover:bg-yellow-600"
```

#### Secondary Button (Navy)
```tsx
<button className="bg-[#060D1C] text-white hover:opacity-80
                   shadow-md hover:shadow-lg px-6 py-3 rounded-lg
                   font-medium">
  Saiba Mais
</button>
```

#### Outline Button
```tsx
<button className="border-2 border-[#060D1C] text-[#060D1C]
                   bg-transparent hover:bg-[#060D1C] hover:text-white
                   px-6 py-3 rounded-lg font-medium transition-all">
  Ver Detalhes
</button>
```

#### Ghost Button
```tsx
<button className="text-[#060D1C] hover:bg-gray-100 px-4 py-2
                   rounded-lg transition-colors">
  Cancelar
</button>
```

#### Button Sizes
```tsx
// Small
<button className="h-9 px-3 text-sm">Small</button>

// Default
<button className="h-10 px-4 py-2">Default</button>

// Large
<button className="h-11 px-8 text-lg">Large</button>

// Hero size
<button className="px-6 py-4 text-lg">Hero CTA</button>
```

#### Icon Buttons
```tsx
<button className="size-10 rounded-full flex items-center
                   justify-center hover:bg-gray-100">
  <IconComponent className="size-4" />
</button>
```

### Cards

#### Primary Card
```tsx
<div className="bg-white rounded-2xl p-8 shadow-lg
                hover:shadow-2xl hover:-translate-y-1
                transition-all duration-300 h-full flex flex-col">
  {/* Card content */}
</div>

// With accent border
<div className="... border-b-4 border-[#F0C730]">
```

#### Pricing Card
```tsx
<div className="bg-white rounded-2xl p-8 shadow-xl relative">
  {/* Popular badge */}
  <div className="absolute -top-3 left-1/2 -translate-x-1/2
                  bg-gradient-to-r from-yellow-400 to-yellow-500
                  text-gray-900 px-4 py-1 rounded-full
                  text-xs font-bold uppercase tracking-wider shadow-md">
    MAIS POPULAR
  </div>

  {/* Pricing content */}
  <h3 className="text-2xl font-bold mb-4">Busca Ilimitada</h3>
  <div className="text-4xl font-bold text-[#F0C730] mb-2">
    R$ 29,90
    <span className="text-sm font-normal text-gray-500">/mês</span>
  </div>
</div>
```

#### Flight Result Card
```tsx
<div className="bg-white rounded-xl border border-gray-200
                p-4 hover:border-[#4896C7] hover:shadow-md
                transition-all cursor-pointer">
  {/* Flight details */}
</div>
```

#### Compact Card
```tsx
<div className="bg-white rounded-xl p-6 shadow-md">
  {/* Minimal content */}
</div>
```

### Badges

#### Badge Variants
```tsx
// Primary (Navy)
<span className="inline-flex items-center px-3 py-1 rounded-full
                 text-xs font-semibold bg-[#0033AA] text-white shadow-md">
  NOVO
</span>

// Accent (Yellow)
<span className="inline-flex items-center px-3 py-1 rounded-full
                 text-xs font-semibold bg-[#F0C730] text-[#060D1C]">
  POPULAR
</span>

// Success
<span className="... bg-[#16A34A] text-white">ATIVO</span>

// Danger
<span className="... bg-[#DC2626] text-white">ERRO</span>

// Floating badge
<div className="absolute top-4 right-4">
  <span className="...">DESTAQUE</span>
</div>
```

### Form Elements

#### Text Input
```tsx
<div className="relative">
  {/* Icon (optional) */}
  <div className="absolute left-3 top-3 h-5 w-5 text-gray-400">
    <IconComponent />
  </div>

  <input
    type="text"
    className="w-full h-[52px] px-4 pl-10 py-3
               border border-gray-300 rounded-xl
               focus:outline-none focus:ring-2
               focus:ring-[#4896C7] focus:border-transparent
               transition-all text-base"
    placeholder="Digite aqui..."
  />
</div>

// Error state
<input className="... border-red-500 focus:ring-red-500" />

// Success state
<input className="... border-green-500 focus:ring-green-500" />
```

#### Select / Dropdown
```tsx
<select className="w-full h-[52px] pl-10 pr-4
                   border border-gray-300 rounded-xl
                   focus:border-[#4896C7] focus:ring-2
                   focus:ring-[#4896C7] bg-white
                   appearance-none cursor-pointer
                   hover:border-blue-400 transition-colors">
  <option>Selecione...</option>
</select>
```

#### Date Picker
```tsx
<div className="relative">
  <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
  <input
    type="date"
    className="w-full h-[52px] px-4 pl-10 py-3
               border border-gray-300 rounded-xl
               cursor-pointer hover:border-blue-400
               transition-colors"
  />
</div>
```

#### Checkbox
```tsx
<input
  type="checkbox"
  className="w-4 h-4 text-blue-600 bg-gray-100
             border-gray-300 rounded
             focus:ring-blue-500 focus:ring-2"
/>
```

### Navigation Components

#### Navbar
```tsx
<nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
  <div className="mx-auto px-4 h-16 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center gap-8">
      <Logo />
      {/* Nav links - desktop */}
      <div className="hidden md:flex gap-6">
        <a className="text-sm font-medium text-[#060D1C]
                      hover:text-[#F0C730] transition-colors">
          Buscar Voos
        </a>
      </div>
    </div>

    {/* User menu */}
    <div className="flex items-center gap-4">
      {/* User dropdown */}
    </div>
  </div>
</nav>
```

#### Pagination (Minimalist)
```tsx
<div className="mt-6 flex justify-center items-center gap-2">
  {/* Previous button */}
  <button className="w-8 h-8 rounded-full text-sm
                     transition-colors text-gray-600
                     hover:bg-gray-100 disabled:opacity-30"
          disabled={currentPage === 0}>
    ←
  </button>

  {/* Page numbers */}
  {visiblePages.map((i) => (
    <button
      key={i}
      className={`w-8 h-8 text-sm transition-colors ${
        currentPage === i
          ? 'font-bold text-[#4896C7]'
          : 'text-gray-600 hover:text-[#4896C7]'
      }`}
    >
      {i + 1}
    </button>
  ))}

  {/* Next button */}
  <button className="..." disabled={currentPage === totalPages - 1}>
    →
  </button>
</div>
```

### Modals & Overlays

#### Modal Structure
```tsx
{/* Backdrop */}
<div className="fixed inset-0 bg-black bg-opacity-60
                flex items-center justify-center z-50 p-4"
     onClick={onClose}>

  {/* Modal content */}
  <div className="bg-white rounded-2xl max-w-md w-full
                  shadow-2xl relative animate-fadeIn"
       onClick={(e) => e.stopPropagation()}>

    {/* Close button */}
    <button className="absolute top-4 right-4 text-gray-400
                       hover:text-gray-600 text-2xl w-8 h-8
                       flex items-center justify-center">
      ×
    </button>

    {/* Modal body */}
    <div className="p-6">
      {/* Content */}
    </div>
  </div>
</div>

// Fade-in animation
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
```

#### Paywall Overlay Pattern
```tsx
{/* Overlay with gradient */}
<div className="absolute inset-0 bg-gradient-to-b
                from-transparent via-white/50 to-white
                z-10 flex items-center justify-center
                backdrop-blur-sm">

  {/* Upgrade card */}
  <div className="bg-white rounded-2xl shadow-2xl p-8
                  max-w-md text-center">
    <div className="text-4xl mb-4">🔒</div>
    <h3 className="text-2xl font-bold mb-2"
        style={{
          color: '#4896C7',
          fontFamily: 'Playfair Display, serif'
        }}>
      42 Voos Encontrados!
    </h3>
    <button className="w-full bg-[#4896C7] text-white
                       font-bold py-4 rounded-lg
                       hover:scale-[1.02] transition-all">
      Ver Todos os Voos
    </button>
  </div>
</div>
```

---

## 4. SPACING SYSTEM

### Spacing Tokens
```css
--ds-spacing-xs: 4px;
--ds-spacing-sm: 8px;
--ds-spacing-md: 16px;
--ds-spacing-lg: 24px;
--ds-spacing-xl: 32px;
--ds-spacing-2xl: 48px;
--ds-spacing-3xl: 64px;
--ds-spacing-4xl: 96px;
```

### Tailwind Spacing Scale
```
0:    0px
0.5:  2px
1:    4px
2:    8px
3:    12px
4:    16px
5:    20px
6:    24px
7:    28px
8:    32px
10:   40px
12:   48px
16:   64px
20:   80px
24:   96px
32:   128px
```

### Common Spacing Patterns

#### Section Spacing
```tsx
// Vertical section spacing
<section className="py-20">       {/* 80px top/bottom */}
<section className="py-16">       {/* 64px top/bottom */}
<section className="py-12">       {/* 48px top/bottom */}

// Horizontal container padding
<div className="px-4 sm:px-6 lg:px-8">  {/* Responsive */}
```

#### Component Spacing
```tsx
// Card padding
<div className="p-8">             {/* 32px all sides */}
<div className="p-6">             {/* 24px all sides */}
<div className="p-4">             {/* 16px all sides */}

// Element margins
<h2 className="mb-6">             {/* 24px bottom */}
<p className="mb-4">              {/* 16px bottom */}
<span className="mb-2">           {/* 8px bottom */}
```

#### Gap Spacing
```tsx
// Flex gaps
<div className="flex gap-2">      {/* 8px gap */}
<div className="flex gap-4">      {/* 16px gap */}
<div className="flex gap-6">      {/* 24px gap */}

// Grid gaps
<div className="grid gap-4">      {/* 16px gap */}
<div className="grid gap-6">      {/* 24px gap */}
```

#### Stack Spacing
```tsx
// Vertical stacking
<div className="space-y-2">       {/* 8px between children */}
<div className="space-y-4">       {/* 16px between children */}
<div className="space-y-6">       {/* 24px between children */}
```

---

## 5. BORDER RADIUS SYSTEM

### Radius Tokens
```css
--ds-radius-sm: 8px;
--ds-radius-md: 12px;
--ds-radius-lg: 16px;
--ds-radius-xl: 24px;
--ds-radius-2xl: 32px;
--ds-radius-full: 9999px;
```

### Tailwind Border Radius
```
rounded-none:   0px
rounded-sm:     2px
rounded:        4px
rounded-md:     6px
rounded-lg:     8px
rounded-xl:     12px
rounded-2xl:    16px
rounded-3xl:    24px
rounded-full:   9999px
```

### Component Usage
```tsx
// Buttons
<button className="rounded-md">        {/* 6px - small buttons */}
<button className="rounded-lg">        {/* 8px - default buttons */}
<button className="rounded-full">      {/* Pill buttons */}

// Cards
<div className="rounded-xl">           {/* 12px - standard cards */}
<div className="rounded-2xl">          {/* 16px - featured cards */}

// Inputs
<input className="rounded-lg">         {/* 8px - default */}
<input className="rounded-xl">         {/* 12px - larger inputs */}

// Badges
<span className="rounded-full">        {/* Pill shape */}
```

---

## 6. SHADOW SYSTEM

### Shadow Tokens
```css
--ds-shadow-sm: 0 1px 2px rgba(6, 13, 28, 0.05);
--ds-shadow-base: 0 4px 6px rgba(6, 13, 28, 0.07);
--ds-shadow-md: 0 10px 15px rgba(6, 13, 28, 0.08);
--ds-shadow-lg: 0 10px 30px rgba(6, 13, 28, 0.08);
--ds-shadow-xl: 0 20px 40px rgba(6, 13, 28, 0.12);
--ds-shadow-2xl: 0 25px 50px rgba(6, 13, 28, 0.15);

--ds-shadow-card: 0 10px 30px rgba(6, 13, 28, 0.08);
--ds-shadow-card-hover: 0 20px 40px rgba(6, 13, 28, 0.12);
```

### Tailwind Shadows
```tsx
shadow-sm         // Subtle shadow
shadow            // Default shadow
shadow-md         // Medium shadow
shadow-lg         // Large shadow
shadow-xl         // Extra large shadow
shadow-2xl        // 2X large shadow
```

### Component Shadow Patterns
```tsx
// Cards
<div className="shadow-lg hover:shadow-2xl transition-shadow">

// Buttons
<button className="shadow-md hover:shadow-lg">

// Dropdowns
<div className="shadow-xl">

// Floating elements
<div className="shadow-2xl">
```

---

## 7. INTERACTION PATTERNS

### Hover States

#### Link Hovers
```tsx
<a className="text-[#060D1C] hover:text-[#F0C730]
              transition-colors duration-200">
```

#### Button Hovers
```tsx
// Scale + shadow
<button className="hover:scale-[1.02] hover:shadow-lg
                   transition-all duration-200">

// Translate up
<button className="hover:-translate-y-0.5 transition-transform">

// Opacity
<button className="hover:opacity-80 transition-opacity">

// Background change
<button className="hover:bg-[#d8b329] transition-colors">
```

#### Card Hovers
```tsx
<div className="hover:shadow-2xl hover:-translate-y-1
                transition-all duration-300">
```

### Focus States
```tsx
// Form inputs
<input className="focus:outline-none focus:ring-2
                  focus:ring-[#4896C7] focus:border-transparent
                  transition-all">

// Buttons
<button className="focus-visible:outline-none
                   focus-visible:ring-2
                   focus-visible:ring-offset-2">
```

### Active States
```tsx
// Mobile tap
<button className="active:opacity-80
                   -webkit-tap-highlight-color: transparent">
```

### Transitions & Animations

#### Standard Transitions
```tsx
transition-all duration-200        // Fast general transition
transition-all duration-300        // Medium general transition
transition-colors duration-150     // Color-only fast
transition-transform duration-200  // Transform-only
transition-shadow duration-300     // Shadow-only
```

#### Custom Animations
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

#### Animation Classes
```tsx
<div className="animate-fadeIn">        // Fade in with slide up
<div className="animate-slideUp">       // Slide up entrance
<div className="animate-gradient">      // Animated gradient background
```

### Mobile Interaction Optimizations
```tsx
// Remove tap highlight
<button style={{ WebkitTapHighlightColor: 'transparent' }}>

// Prevent double-tap zoom
<button style={{ touchAction: 'manipulation' }}>

// Safe areas
<div style={{
  paddingTop: 'max(16px, env(safe-area-inset-top))'
}}>
```

---

## 8. RESPONSIVE DESIGN PATTERNS

### Breakpoints
```tsx
sm:  640px    // Mobile landscape
md:  768px    // Tablet portrait
lg:  1024px   // Tablet landscape / small desktop
xl:  1280px   // Desktop
2xl: 1536px   // Large desktop
```

### Mobile-First Strategy
All base styles are mobile-first, then enhanced:
```tsx
// Typography
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Spacing
<div className="px-4 sm:px-6 lg:px-8">

// Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```

### Responsive Typography
```tsx
// Clamp for fluid scaling
fontSize: 'clamp(28px, 4.1vw, 52px)'   // Hero title
fontSize: 'clamp(16px, 1.5vw, 18px)'   // Hero subtitle

// Breakpoint-based
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
```

### Responsive Layouts

#### Grid Systems
```tsx
// Single → Two → Four columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// Single → Three columns
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
```

#### Flex Direction
```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
```

#### Hide/Show Elements
```tsx
// Mobile menu
<div className="md:hidden">      {/* Show only on mobile */}

// Desktop nav
<div className="hidden md:flex"> {/* Show only on desktop */}
```

### Container Widths
```tsx
max-w-7xl     // 1280px - Full container
max-w-5xl     // 1024px - Content container
max-w-3xl     // 768px - Text container
max-w-2xl     // 640px - Narrow container
```

### Touch-Friendly Sizing
```tsx
// Minimum touch targets (iOS/Android guidelines)
minHeight: '44px'
minWidth: '44px'

// Form elements
<input className="h-[52px]">      {/* Touch-friendly height */}
<button className="h-[44px]">     {/* Minimum touch target */}
```

---

## 9. BRAND VOICE & MESSAGING

### Core Brand Phrases

#### "Quase de Graça" (Almost for Free)
- **Styling**: Playfair Display, italic, #F0C730
- **Context**: Value proposition, pricing emphasis
- **Full Example**: "...viver as melhores experiências do mundo usando milhas - quase de graça"

#### "Busca Ilimitada" (Unlimited Search)
- **Context**: Premium subscription tier
- **Usage**: Paywall messaging, upgrade prompts
- **Color**: #4896C7 or standard text

### Taglines & Value Props
```
"O maior ecossistema de viagens baratas do Brasil"
"Encontre voos usando milhas - quase de graça"
"Viaje o mundo quase de graça"
"Tudo o que você precisa para aprender a viajar o mundo - quase de graça"
```

### Product Tier Names
- **Busca**: Basic flight search
- **Alertas**: AI-powered price alerts
- **Concierge**: Premium concierge service

### Call-to-Action Patterns
```
"Buscar Voos"
"Saiba Mais"
"Assinar Agora"
"Assine Busca Ilimitada"
"Ver Todos os Voos"
"Escolher"
"Emitir Passagem"
```

### Pricing Format
```
R$ 29,90/mês
A partir de R$ 29,90/mês
Cancele quando quiser
```

### Social Proof Patterns
```
"+30.000 alertas enviados neste mês"
"MAIS POPULAR" (badge)
```

### Tone Guidelines
- **Portuguese**: All user-facing content in Brazilian Portuguese
- **Friendly**: Approachable, helpful tone
- **Value-Focused**: Emphasize savings and benefits
- **Trustworthy**: Clear, transparent pricing
- **Aspirational**: Travel dream language ("viajar o mundo")

---

## 10. ICON & ILLUSTRATION SYSTEM

### Icon Sizes
```tsx
size-4:   16px    // Inline icons (buttons)
size-5:   20px    // Form icons, small UI
size-6:   24px    // Default icons
size-8:   32px    // Medium icons
size-10:  40px    // Large icons
size-16:  64px    // Feature icons
size-20:  80px    // Hero icons
```

### Icon Usage Patterns
```tsx
// Form input icon
<div className="absolute left-3 top-3 h-5 w-5 text-gray-400">
  <IconComponent />
</div>

// Button icon
<button className="flex items-center gap-2">
  <IconComponent className="size-4" />
  Button Text
</button>

// Feature card icon
<div className="w-16 h-16 bg-[#F0C730] rounded-full
                flex items-center justify-center mb-4">
  <IconComponent className="size-8 text-[#060D1C]" />
</div>
```

### Icon Colors
```tsx
text-gray-400      // Muted/inactive icons
text-gray-600      // Secondary icons
text-[#060D1C]     // Primary icons
text-[#F0C730]     // Accent icons
text-[#4896C7]     // Link icons
```

---

## 11. ELEVATION & Z-INDEX HIERARCHY

### Z-Index Scale
```css
Base:              0
Dropdown:         10
Sticky:           20
Fixed:            30
Modal Backdrop:   40
Modal:            50
Popover:          60
Tooltip:          70
Toast:            80
```

### Component Z-Index
```tsx
// Navbar
<nav className="sticky top-0 z-50">

// Mobile menu
<div className="fixed inset-0 z-40">

// Dropdown menu
<div className="absolute z-9999">    {/* Always on top */}

// Modal backdrop
<div className="fixed inset-0 z-40">

// Modal content
<div className="... z-50">

// Paywall overlay
<div className="... z-10">
```

---

## 12. ARCHITECTURE & CODE PATTERNS

### Design System Location
```
/src/styles/designSystem.ts
/src/index.css
/tailwind.config.ts
```

### Design System Export Structure
```typescript
// designSystem.ts
export const designSystem = {
  colors: { /* brand colors */ },
  spacing: { /* spacing tokens */ },
  typography: { /* font definitions */ },
  shadows: { /* shadow tokens */ },
  radius: { /* border radius */ },
};

export const componentClasses = {
  button: { /* button variants */ },
  card: { /* card variants */ },
  input: { /* input variants */ },
};

// Helper functions
export function getColorClass(color: string): string;
export function getBgColorClass(color: string): string;
export function cn(...classes: string[]): string;
```

### CSS Custom Properties
```css
/* index.css */
:root {
  /* Brand colors */
  --color-brand-dark: #060D1C;
  --color-brand-yellow: #F0C72F;
  --color-brand-blue: #4896C7;

  /* Spacing */
  --ds-spacing-xs: 4px;
  --ds-spacing-sm: 8px;
  --ds-spacing-md: 16px;
  /* ... */

  /* Shadows */
  --ds-shadow-card: 0 10px 30px rgba(6, 13, 28, 0.08);
  /* ... */
}
```

### Component File Organization
```
/src/components/ui/         # Radix UI + Shadcn
/src/components/            # Feature components
/src/pages/                 # Route components
```

### Styling Approach Priority
1. Tailwind utility classes (primary)
2. CSS variables for design tokens
3. Inline styles for dynamic values (minimal)

### ESM Architecture
```typescript
// All components use ES modules
import { Button } from '@/components/ui/button';
export default ComponentName;
export { NamedExport };
```

---

## 13. TAILWIND CONFIGURATION

### Config Location
`/tailwind.config.ts`

### Container Settings
```typescript
container: {
  center: true,
  padding: "2rem",
  screens: {
    "2xl": "1400px",
  },
}
```

### Extended Colors
```typescript
extend: {
  colors: {
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
    },
    // ... semantic colors
  },
}
```

### Animations
```typescript
extend: {
  keyframes: {
    "accordion-down": {
      from: { height: "0" },
      to: { height: "var(--radix-accordion-content-height)" },
    },
    "accordion-up": {
      from: { height: "var(--radix-accordion-content-height)" },
      to: { height: "0" },
    },
  },
  animation: {
    "accordion-down": "accordion-down 0.2s ease-out",
    "accordion-up": "accordion-up 0.2s ease-out",
  },
}
```

### Border Radius
```typescript
extend: {
  borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
  },
}
```

### Plugins
```typescript
plugins: [
  require("tailwindcss-animate"),
  // Optional: @tailwindcss/forms, @tailwindcss/typography
]
```

---

## 14. COMPONENT VARIATIONS & STATES

### Button Variants Complete
```tsx
// Primary (Yellow)
bg-[#F0C730] text-[#060D1C] hover:bg-[#d8b329]

// Secondary (Navy)
bg-[#060D1C] text-white hover:opacity-80

// Destructive
bg-[#DC2626] text-white hover:bg-[#b91c1c]

// Outline
border-2 border-[#060D1C] bg-transparent hover:bg-[#060D1C] hover:text-white

// Ghost
text-[#060D1C] hover:bg-gray-100

// Link
text-[#4896C7] underline-offset-4 hover:underline
```

### Input States Complete
```tsx
// Default
border-gray-300 focus:border-[#4896C7] focus:ring-2 focus:ring-[#4896C7]

// Error
border-red-500 focus:ring-red-500

// Success
border-green-500 focus:ring-green-500

// Disabled
bg-gray-100 cursor-not-allowed opacity-50
```

### Card States
```tsx
// Default
shadow-lg

// Hover
hover:shadow-2xl hover:-translate-y-1

// Selected
border-2 border-[#4896C7]

// Disabled
opacity-50 pointer-events-none
```

---

## 15. ACCESSIBILITY (WCAG 2.1 AA)

### Color Contrast Ratios
```
Text on White:
  #060D1C (Brand Dark)  → 21:1    (AAA)
  #1F2937 (Gray 900)    → 16.5:1  (AAA)
  #6B7280 (Gray 500)    → 4.54:1  (AA)

Text on #F0C730 (Yellow):
  #060D1C               → 8.19:1  (AAA)

White Text on #4896C7 (Blue):
                        → 4.54:1  (AA)
```

### Focus Indicators
```tsx
// All interactive elements
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-offset-2

// Form inputs
focus:ring-2 focus:ring-[#4896C7]
```

### Touch Targets
```tsx
// Minimum size
min-h-[44px] min-w-[44px]

// Button heights
h-10 (40px)  // Acceptable for desktop
h-11 (44px)  // Mobile-friendly
h-[52px]     // Large inputs
```

### Semantic HTML
```tsx
// Proper heading hierarchy
<h1> → <h2> → <h3>

// Form labels
<label htmlFor="input-id">

// ARIA labels
<button aria-label="Close modal">
  <X className="h-4 w-4" />
</button>

// Landmarks
<nav>, <main>, <header>, <footer>
```

### Keyboard Navigation
```tsx
// Tab order maintained
tabIndex={0}  // Focusable
tabIndex={-1} // Skip in tab order

// Enter/Space for buttons
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
}}
```

---

## 16. IMPLEMENTATION GUIDELINES

### Using the Design System

#### Import Design Tokens
```typescript
import { designSystem, componentClasses } from '@/styles/designSystem';

// Use in code
const primaryColor = designSystem.colors.brand.primary;
```

#### Use CSS Variables
```tsx
// In className
<button className="bg-[var(--ds-brand-yellow)]
                   text-[var(--ds-brand-dark)]">

// In inline styles
<div style={{
  backgroundColor: 'var(--ds-brand-yellow)',
  padding: 'var(--ds-spacing-lg)',
}}>
```

#### Combine Tailwind + Design System
```tsx
<div className="rounded-[var(--ds-radius-lg)]
                shadow-[var(--ds-shadow-card)]
                p-[var(--ds-spacing-lg)]">
```

### Creating New Components

1. **Follow Structure**
```tsx
// /src/components/ui/NewComponent.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface NewComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function NewComponent({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: NewComponentProps) {
  return (
    <div
      className={cn(
        'base-classes',
        variant === 'primary' && 'variant-classes',
        size === 'md' && 'size-classes',
        className
      )}
      {...props}
    />
  );
}
```

2. **Use Design Tokens**
```tsx
// Don't hardcode values
<div className="p-8">  ❌

// Use design system tokens
<div className="p-[var(--ds-spacing-lg)]">  ✅
```

3. **Mobile-First Responsive**
```tsx
<div className="text-sm md:text-base lg:text-lg">
```

4. **TypeScript Interfaces**
```tsx
interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary';
}
```

5. **Accessibility**
```tsx
<button
  aria-label="Descriptive label"
  className="focus-visible:ring-2"
>
```

### Extending the Design System

#### Add New Color
```typescript
// designSystem.ts
export const designSystem = {
  colors: {
    brand: {
      // ...existing
      newColor: '#HEXCODE',
    },
  },
};
```

```css
/* index.css */
:root {
  --color-new-color: #HEXCODE;
}
```

#### Add New Spacing Token
```typescript
// designSystem.ts
spacing: {
  // ...existing
  '5xl': '128px',
}
```

```css
/* index.css */
:root {
  --ds-spacing-5xl: 128px;
}
```

#### Create New Animation
```css
/* index.css */
@keyframes newAnimation {
  from { /* initial state */ }
  to { /* final state */ }
}

.animate-new {
  animation: newAnimation 0.3s ease-out;
}
```

---

## 17. COMPLETE COLOR REFERENCE

### Quick Reference Table

| Color Name | Hex Code | Usage | Contrast |
|------------|----------|-------|----------|
| Brand Dark | #060D1C | Primary text, buttons | AAA (21:1) |
| Brand Yellow | #F0C72F | Accents, CTAs | AAA (8.19:1) |
| Brand Blue | #4896C7 | Links, secondary | AA (4.54:1) |
| Light Gray | #E4E4E4 | Surfaces, backgrounds | Good |
| Success Green | #16A34A | Success states | AAA |
| Danger Red | #DC2626 | Error states | AAA |
| Warning Orange | #F59E0B | Warning states | AA |
| Info Blue | #3B82F6 | Informational | AA |

### Color Palette Swatches

#### Brand Colors
```
█ #060D1C  Brand Dark (Navy)
█ #F0C72F  Brand Yellow
█ #4896C7  Brand Blue
█ #E4E4E4  Neutral Light
█ #FFFFFF  White
```

#### Gray Scale
```
█ #F9FAFB  Gray 50  (Backgrounds)
█ #F3F4F6  Gray 100 (Hover states)
█ #E5E7EB  Gray 200 (Borders)
█ #D1D5DB  Gray 300 (Dividers)
█ #9CA3AF  Gray 400 (Icons)
█ #6B7280  Gray 500 (Muted text)
█ #4B5563  Gray 600 (Secondary text)
█ #374151  Gray 700 (Body text)
█ #1F2937  Gray 800 (Headers)
█ #111827  Gray 900 (Emphasis)
```

#### Status Colors
```
█ #16A34A  Success (Green)
█ #DC2626  Danger (Red)
█ #F59E0B  Warning (Orange)
█ #3B82F6  Info (Blue)
```

---

## FINAL NOTES & BEST PRACTICES

### Do's
✅ Use design system tokens consistently
✅ Follow mobile-first responsive approach
✅ Maintain accessibility standards (WCAG 2.1 AA)
✅ Use semantic HTML elements
✅ Implement proper focus states
✅ Test on multiple devices and browsers
✅ Use Plus Jakarta Sans for UI, Playfair for emphasis
✅ Follow established component patterns

### Don'ts
❌ Hardcode colors, spacing, or typography values
❌ Create new patterns without documenting them
❌ Skip accessibility features
❌ Use font sizes below 12px
❌ Ignore responsive design
❌ Mix different design patterns inconsistently
❌ Use more than 2 font families

### Maintenance Checklist
- [ ] Regular design review (quarterly)
- [ ] Component audit for consistency
- [ ] Accessibility testing
- [ ] Performance monitoring
- [ ] User feedback integration
- [ ] Design system documentation updates

---

**Documentation Version**: 1.0.0
**Last Updated**: December 2024
**Maintained By**: SemViagem Engineering Team
**Questions?**: Contact design-system@semviagem.com.br

---

*This design system documentation was extracted from production source code and represents the current state of the SemViagem platform. All values, patterns, and guidelines are actively used in the live application.*
