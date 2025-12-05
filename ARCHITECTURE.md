# 🏗️ SemViagem Architecture - DOCUMENTAÇÃO OFICIAL

**Status**: ✅ ESTÁVEL EM PRODUÇÃO (Deploy 05/12/2024)
**Versão**: 2.0
**Responsável**: Arquitetura consolidada via Claude Code
**Deploy URL**: https://semviagem.com

---

## ⚠️ DECISÕES CRÍTICAS - JAMAIS REVERTER

### 🚨 DECISÃO #1: FLIGHTRESULTS CONSOLIDADO

**Contexto histórico**:
- Anteriormente havia 2 componentes separados: `FlightResults.tsx` e `FlightResultsSummary.tsx`
- Causava **bug crítico**: resultados desapareciam ao clicar em "Selecionar" na listagem
- **Root cause**: Estado dividido entre 2 componentes, perda de dados no SelectionContext

**Solução implementada** (05/12/2024):
- **CONSOLIDAÇÃO COMPLETA** em um único componente `FlightResults.tsx`
- State machine com 3 estados: `'viewing' | 'selecting' | 'summary'`
- Uso correto do `SelectionContext` para persistir dados selecionados

**Arquivo crítico**: `src/components/FlightResults.tsx` (linhas 1-450)

**JAMAIS**:
- ❌ Separar novamente em 2 componentes
- ❌ Criar componente `FlightResultsSummary.tsx` standalone
- ❌ Mover lógica de seleção para fora do contexto
- ❌ Usar estado local para voos selecionados

**SEMPRE**:
- ✅ Manter consolidação em componente único
- ✅ Usar `viewState` para controlar fluxo
- ✅ Persistir seleções no `SelectionContext`
- ✅ Validar que dados não desaparecem ao navegar entre estados

---

### 🚨 DECISÃO #2: SELECTIONCONTEXT PATTERN

**Responsabilidade**: Gerenciar estado global de seleções de voos (ida/volta)

**Arquivo**: `src/context/SelectionContext.tsx`

**Interface crítica**:
```typescript
interface SelectionContextType {
  outboundFlight: Flight | null;
  returnFlight: Flight | null;
  setOutboundFlight: (flight: Flight | null) => void;
  setReturnFlight: (flight: Flight | null) => void;
  clearSelections: () => void;
}
```

**Regras de uso**:
1. **Nunca** armazenar voos selecionados em estado local de componentes
2. **Sempre** usar `setOutboundFlight` / `setReturnFlight` para persistir
3. **Validar** presença do contexto antes de usar (useSelection hook)
4. **Limpar** seleções ao iniciar nova busca (`clearSelections()`)

**Exemplo correto**:
```tsx
const { setOutboundFlight } = useSelection();

const handleSelectFlight = (flight: Flight) => {
  setOutboundFlight(flight); // ✅ Persiste no contexto global
  setViewState('summary');    // ✅ Muda estado visual
};
```

**Exemplo ERRADO**:
```tsx
const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null); // ❌ Estado local

const handleSelectFlight = (flight: Flight) => {
  setSelectedFlight(flight); // ❌ Dados perdem-se ao desmontar componente
};
```

---

### 🚨 DECISÃO #3: ESTRUTURA DE PASTAS

```
src/
├── components/
│   ├── FlightResults.tsx          # 🔒 CONSOLIDADO (viewing + summary)
│   ├── PricingCard.tsx             # 🔒 Design System v2.0
│   ├── icons/
│   │   ├── IconBusca.tsx           # SVG components
│   │   ├── IconAlertas.tsx
│   │   └── IconConcierge.tsx
│   └── ui/                         # Radix UI components
├── context/
│   └── SelectionContext.tsx        # 🔒 Global flight selection state
├── pages/
│   ├── Home.tsx                    # Landing page (pricing cards)
│   └── FlightSearch.tsx            # Search page (usa FlightResults)
├── utils/
│   └── logger.ts                   # 🔒 Centralized logging (DEV only)
├── styles/
│   └── designSystem.ts             # Design tokens export (legacy)
└── index.css                       # 🔒 CSS custom properties (:root tokens)
```

**JAMAIS**:
- ❌ Criar `FlightResultsSummary.tsx` como arquivo separado
- ❌ Duplicar lógica de seleção em múltiplos arquivos
- ❌ Mover tokens do `index.css` para arquivos CSS separados
- ❌ Usar `console.log` direto (usar `logger.debug()`)

---

### 🚨 DECISÃO #4: STATE MANAGEMENT PATTERN

**FlightResults.tsx - State Machine**:
```typescript
type ViewState = 'viewing' | 'selecting' | 'summary';
const [viewState, setViewState] = useState<ViewState>('viewing');

// Transições válidas:
// 'viewing' → 'selecting' (clique em "Selecionar")
// 'selecting' → 'summary' (após selecionar voo)
// 'summary' → 'viewing' (clique em "Nova Busca")
```

**Fluxo correto**:
1. **Usuário vê resultados** → `viewState = 'viewing'`
2. **Clica "Selecionar"** → `viewState = 'selecting'`
3. **Escolhe voo específico** → `setOutboundFlight()` + `viewState = 'summary'`
4. **Vê resumo com dados persistidos** → `viewState = 'summary'`
5. **Clica "Nova Busca"** → `clearSelections()` + `viewState = 'viewing'`

**Validação crítica**:
```tsx
// ✅ SEMPRE verificar se dados existem antes de renderizar summary
{viewState === 'summary' && outboundFlight && (
  <div className="summary">
    {/* Renderizar detalhes de outboundFlight */}
  </div>
)}
```

---

## 📁 COMPONENTES CRÍTICOS

### FlightResults.tsx - Consolidação Completa

**Status**: ✅ Funcionando perfeitamente (bug de desaparecimento RESOLVIDO)
**Data implementação**: 05/12/2024
**Arquivo**: `src/components/FlightResults.tsx`

#### Estrutura do componente:

```typescript
interface FlightResultsProps {
  searchParams: SearchParams;
  onNewSearch: () => void;
}

export default function FlightResults({ searchParams, onNewSearch }: FlightResultsProps) {
  const [viewState, setViewState] = useState<ViewState>('viewing');
  const { outboundFlight, returnFlight, setOutboundFlight, setReturnFlight } = useSelection();

  // Renderização condicional baseada em viewState:
  return (
    <>
      {viewState === 'viewing' && <ResultsListView />}
      {viewState === 'selecting' && <FlightSelectionView />}
      {viewState === 'summary' && <SummaryView />}
    </>
  );
}
```

#### Bug histórico (RESOLVIDO):

**Problema**: Ao clicar em "Selecionar" na listagem de voos, os resultados desapareciam da tela.

**Root cause**:
- Componente `FlightResultsSummary.tsx` separado não tinha acesso aos dados
- Estado local perdido ao trocar de componente
- `SelectionContext` não estava sendo usado corretamente

**Solução**:
- Consolidação em componente único
- State machine `viewState` para controlar renderização
- Uso correto do `SelectionContext` para persistir seleções

**JAMAIS REVERTER ESTA CONSOLIDAÇÃO**

---

### SelectionContext.tsx - Gerenciamento de Estado Global

**Arquivo**: `src/context/SelectionContext.tsx`

**Implementação crítica**:
```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Flight {
  // ... definição de Flight
}

interface SelectionContextType {
  outboundFlight: Flight | null;
  returnFlight: Flight | null;
  setOutboundFlight: (flight: Flight | null) => void;
  setReturnFlight: (flight: Flight | null) => void;
  clearSelections: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [outboundFlight, setOutboundFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);

  const clearSelections = () => {
    setOutboundFlight(null);
    setReturnFlight(null);
  };

  return (
    <SelectionContext.Provider value={{
      outboundFlight,
      returnFlight,
      setOutboundFlight,
      setReturnFlight,
      clearSelections,
    }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection deve ser usado dentro de SelectionProvider');
  }
  return context;
};
```

**Uso no App.tsx**:
```tsx
import { SelectionProvider } from './context/SelectionContext';

function App() {
  return (
    <SelectionProvider>
      <Router>
        {/* routes */}
      </Router>
    </SelectionProvider>
  );
}
```

---

### Logger.ts - Sistema de Logging Centralizado

**Arquivo**: `src/utils/logger.ts`

**Objetivo**: Eliminar `console.log` diretos e otimizar bundle de produção

**Implementação**:
```typescript
export const logger = {
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`🔍 ${message}`, data !== undefined ? data : '');
    }
  },

  info: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.info(`ℹ️ ${message}`, data !== undefined ? data : '');
    }
  },

  warn: (message: string, data?: any) => {
    console.warn(`⚠️ ${message}`, data !== undefined ? data : '');
  },

  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error !== undefined ? error : '');
  },

  success: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${message}`, data !== undefined ? data : '');
    }
  }
};
```

**Uso correto**:
```typescript
import logger from '@/utils/logger';

// ❌ ERRADO
console.log('Buscando voos...', params);

// ✅ CORRETO
logger.debug('Buscando voos...', params);
```

**Benefícios**:
- Debug logs removidos em produção (bundle menor)
- Formato consistente com emojis
- Controle centralizado de logging
- Fácil de desabilitar/habilitar por ambiente

---

## 🔒 REGRAS DE MODIFICAÇÃO

### Antes de modificar FlightResults.tsx:

- [ ] ✅ Leu ARCHITECTURE.md completo
- [ ] ✅ Entende o bug histórico de desaparecimento
- [ ] ✅ Valida que `viewState` está sendo usado corretamente
- [ ] ✅ Confirma que `SelectionContext` persiste dados
- [ ] ✅ Testa fluxo completo: viewing → selecting → summary
- [ ] ✅ Verifica que "Nova Busca" limpa seleções corretamente
- [ ] ✅ Não cria componente separado para summary

### Antes de modificar SelectionContext.tsx:

- [ ] ✅ Entende que este é o ÚNICO local para armazenar seleções
- [ ] ✅ Valida que interface `SelectionContextType` não muda
- [ ] ✅ Testa que `clearSelections()` funciona
- [ ] ✅ Confirma que `useSelection` hook está sendo usado em todos componentes que precisam

### Checklist de qualidade geral:

- [ ] `npm run build` sem erros
- [ ] Fluxo de seleção funcionando (viewing → selecting → summary)
- [ ] Dados não desaparecem ao navegar entre estados
- [ ] "Nova Busca" reseta estado corretamente
- [ ] Logs usando `logger.*` em vez de `console.*`
- [ ] Nenhum estado de voo armazenado fora do `SelectionContext`

---

## 📊 STACK TECNOLÓGICA

**Frontend**:
- React 18.3.1
- TypeScript 5.x
- Vite 5.4.0 (build tool)
- Tailwind CSS 4.1.9
- React Router DOM 7.8.1

**UI Components**:
- Radix UI (accordion, dialog, toast, etc.)
- Custom SVG icons (IconBusca, IconAlertas, IconConcierge)
- PricingCard component (Design System v2.0)

**State Management**:
- Context API (SelectionContext)
- React useState/useContext hooks
- NO Redux, NO Zustand (simplicidade intencional)

**Backend/APIs**:
- Netlify Functions (serverless)
- Supabase (auth, database, realtime)
- Stripe (pagamentos)
- Auth0 (autenticação)
- Moblix API (busca de voos)

**Deploy**:
- Netlify (auto-deploy on push to `main`)
- Domain: https://semviagem.com
- CDN: Netlify Edge

---

## 🚀 FLUXO DE DESENVOLVIMENTO

### Workflow recomendado:

1. **Leia documentação primeiro**:
   - `DESIGN_SYSTEM.md` (para mudanças visuais)
   - `ARCHITECTURE.md` (para mudanças de lógica)
   - `DEPLOYMENT.md` (antes de deploy)
   - `TROUBLESHOOTING.md` (se algo quebrar)

2. **Faça mudanças incrementais**:
   - Uma feature por vez
   - Teste localmente antes de commit
   - Use `logger.debug()` para debugging

3. **Teste fluxo completo**:
   ```bash
   npm run dev
   # Testa:
   # 1. Busca de voos
   # 2. Clique em "Selecionar"
   # 3. Escolha de voo específico
   # 4. Visualização de summary
   # 5. "Nova Busca" → reset correto
   ```

4. **Build e validação**:
   ```bash
   npm run build
   # Verifica:
   # - Bundle size < 1MB
   # - Gzip < 250kB
   # - Sem warnings críticos
   ```

5. **Commit estruturado**:
   ```bash
   git add .
   git commit -m "feat: Descrição da feature

   - Detalhe 1
   - Detalhe 2

   🤖 Generated with Claude Code"
   ```

6. **Deploy**:
   ```bash
   git push origin main
   # Netlify auto-deploy ativa
   # Verifica em https://semviagem.com após 2-3min
   ```

---

## 📚 REFERÊNCIAS

- **FlightResults consolidado**: `/src/components/FlightResults.tsx`
- **SelectionContext**: `/src/context/SelectionContext.tsx`
- **Logger centralizado**: `/src/utils/logger.ts`
- **Design System tokens**: `/src/index.css` (linhas 5-88)
- **PricingCard**: `/src/components/PricingCard.tsx`
- **Home page**: `/src/pages/Home.tsx`

**Última atualização**: 05 Dezembro 2024
**Versão**: 2.0 (Estável em produção)

---

**⚠️ IMPORTANTE**: Esta documentação protege decisões arquiteturais críticas que resolveram bugs históricos. Qualquer mudança nos componentes FlightResults ou SelectionContext deve primeiro consultar este documento para evitar regressões.
