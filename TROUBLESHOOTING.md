# 🔧 SemViagem Troubleshooting - GUIA DE RESOLUÇÃO

**Status**: ✅ DOCUMENTAÇÃO COMPLETA (05/12/2024)
**Versão**: 2.0
**Deploy URL**: https://semviagem.com

---

## 📋 ÍNDICE DE PROBLEMAS

1. [Bugs Históricos Resolvidos](#bugs-históricos-resolvidos)
2. [Problemas de Design System](#problemas-de-design-system)
3. [Erros de Deploy](#erros-de-deploy)
4. [Problemas de API](#problemas-de-api)
5. [Emergency Rollback](#emergency-rollback)

---

## 🐛 BUGS HISTÓRICOS RESOLVIDOS

### BUG #1: Resultados de voo desapareciam ao clicar "Selecionar" [CRÍTICO]

**Status**: ✅ RESOLVIDO (05/12/2024)

**Sintomas**:
- Usuário busca voos
- Resultados aparecem corretamente
- Clica em "Selecionar" em um voo
- **Tela fica em branco** ou mostra "Nenhum resultado"
- Dados de voo selecionado perdidos

**Root cause**:
```typescript
// ❌ CÓDIGO QUEBRADO (antes da correção):
// Problema: 2 componentes separados + estado local

// FlightResults.tsx (componente A)
const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

const handleSelect = (flight: Flight) => {
  setSelectedFlight(flight);
  // Navega para FlightResultsSummary
  navigate('/summary');
};

// FlightResultsSummary.tsx (componente B - SEPARADO)
const { selectedFlight } = props; // ❌ Props vazia, dados perdidos
// Resultado: Tela branca
```

**Por que acontecia**:
1. Estado armazenado em `useState` local de `FlightResults.tsx`
2. Ao navegar para componente separado `FlightResultsSummary.tsx`, estado local é perdido
3. `SelectionContext` não estava sendo usado corretamente
4. Dados não persistiam entre componentes

**Solução implementada**:
```typescript
// ✅ CÓDIGO CORRETO (consolidação):

// FlightResults.tsx (ÚNICO COMPONENTE)
type ViewState = 'viewing' | 'selecting' | 'summary';
const [viewState, setViewState] = useState<ViewState>('viewing');
const { setOutboundFlight, outboundFlight } = useSelection(); // Contexto global

const handleSelect = (flight: Flight) => {
  setOutboundFlight(flight); // ✅ Persiste no contexto
  setViewState('summary');    // ✅ Muda estado visual
};

// Renderização condicional no MESMO componente:
return (
  <>
    {viewState === 'viewing' && <ResultsListView />}
    {viewState === 'selecting' && <FlightSelectionView />}
    {viewState === 'summary' && outboundFlight && (
      <SummaryView flight={outboundFlight} />
    )}
  </>
);
```

**Mudanças aplicadas**:
1. **Consolidação**: Unificou `FlightResults.tsx` e `FlightResultsSummary.tsx` em componente único
2. **State machine**: Implementou `viewState` para controlar renderização
3. **Context API**: Uso correto de `SelectionContext` para persistir dados
4. **Validação**: Checa se `outboundFlight` existe antes de renderizar summary

**Como testar que está resolvido**:
```bash
# 1. Inicia aplicação
npm run dev

# 2. Navega para /search
# 3. Busca voos (qualquer origem/destino)
# 4. Clica "Selecionar" em um voo da lista
# 5. ✅ VALIDA: Dados aparecem na tela de seleção
# 6. Clica em voo específico
# 7. ✅ VALIDA: Summary mostra dados corretos (não desaparece)
# 8. Clica "Nova Busca"
# 9. ✅ VALIDA: Estado reseta e volta para busca
```

**Arquivos modificados**:
- `src/components/FlightResults.tsx` (consolidação completa)
- `src/context/SelectionContext.tsx` (correção de uso)
- **DELETADO**: `src/components/FlightResultsSummary.tsx` (não existe mais)

**⚠️ JAMAIS REVERTER ESTA CORREÇÃO**

---

### BUG #2: Console poluído com logs em produção

**Status**: ✅ RESOLVIDO (05/12/2024)

**Sintomas**:
- Build de produção tinha centenas de `console.log()`
- Bundle maior que necessário
- Informações sensíveis expostas em console

**Root cause**:
```typescript
// ❌ CÓDIGO QUEBRADO:
console.log('Searching flights with params:', params);
console.log('API response:', response);
console.log('User clicked:', flightId);
```

**Solução**:
```typescript
// ✅ CÓDIGO CORRETO:
import logger from '@/utils/logger';

logger.debug('Searching flights with params:', params);
logger.debug('API response:', response);
logger.debug('User clicked:', flightId);
```

**Benefício**:
- Logs **removidos automaticamente** em produção (`import.meta.env.DEV`)
- Bundle ~10kB menor
- Console limpo em produção

**Implementação**:
```typescript
// src/utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(`🔍 ${message}`, data !== undefined ? data : '');
    }
  },
  // ... outros métodos
};
```

**Migration guide**:
```typescript
// ❌ Encontre e substitua:
console.log()    → logger.debug()
console.info()   → logger.info()
console.warn()   → logger.warn()
console.error()  → logger.error()
```

---

## 🎨 PROBLEMAS DE DESIGN SYSTEM

### PROBLEMA #1: Tokens semânticos não aplicando

**Sintomas**:
- Cores/espaçamentos aparecem com valores default (não customizados)
- DevTools mostra `var(--ds-brand-yellow)` mas resolve para valor errado
- Componentes não seguem Design System v2.0

**Diagnóstico**:
```bash
# 1. Verifica se tokens existem em index.css
grep -A 5 ":root" src/index.css

# 2. Verifica se build incluiu CSS
ls -lh dist/assets/*.css

# 3. Inspeciona no browser
# DevTools → Elements → Computed → filtra "ds-"
```

**Causas comuns**:

#### Causa A: Build não incluiu CSS custom properties
```bash
# Solução:
npm run build  # Re-build
# Verifica dist/assets/index-*.css contém ":root { --ds-..."
```

#### Causa B: Typo no nome do token
```typescript
// ❌ ERRADO:
className="bg-[var(--ds-brand-yelow)]"  // "yelow" typo

// ✅ CORRETO:
className="bg-[var(--ds-brand-yellow)]"
```

#### Causa C: Hardcoded values ainda presentes
```typescript
// ❌ ERRADO:
<div className="bg-[#F0C72F] p-6 rounded-[18px]">

// ✅ CORRETO:
<div className="bg-[var(--ds-brand-yellow)] p-[var(--ds-spacing-lg)] rounded-[var(--ds-radius-lg)]">
```

**Ferramenta de debug**:
```bash
# Busca hardcoded colors no código:
grep -r "#F0C72F" src/  # Deve retornar ZERO resultados (exceto index.css)
grep -r "#060D1C" src/  # Deve retornar ZERO resultados (exceto index.css)

# Busca magic numbers:
grep -r "p-6" src/      # Substituir por p-[var(--ds-spacing-*)]
grep -r "rounded-18" src/  # Substituir por rounded-[var(--ds-radius-*)]
```

---

### PROBLEMA #2: Regra 10% amarelo violada

**Sintomas**:
- Muito amarelo na tela (#F0C72F)
- Visual poluído, não premium

**Diagnóstico**:
```typescript
// Medir área amarela visualmente:
// 1. Tira screenshot da página
// 2. Abre no Photoshop/Figma
// 3. Seleciona todas áreas #F0C72F
// 4. Calcula % da área total
```

**Violações comuns**:
```typescript
// ❌ ERRADO: Fundo extenso amarelo (> 10%)
<div className="bg-[var(--ds-brand-yellow)] p-8 min-h-[400px]">

// ✅ CORRETO: Apenas badge/acento (< 10%)
<span className="bg-[var(--ds-brand-yellow)] px-2 py-1 rounded text-xs">
  MAIS POPULAR
</span>
```

**Regra de ouro**:
- Badges: ✅ OK
- Bullets: ✅ OK (círculos pequenos)
- Micro-acentos: ✅ OK
- Botões grandes: ❌ NUNCA
- Fundos de cards: ❌ NUNCA
- Seções inteiras: ❌ NUNCA

---

### PROBLEMA #3: Sombras inconsistentes

**Sintomas**:
- Sombras com valores diferentes entre componentes
- Hover states não funcionam

**Diagnóstico**:
```typescript
// ❌ ERRADO: Hardcoded shadow
<div className="shadow-[0_10px_30px_rgba(0,0,0,0.1)]">

// ✅ CORRETO: Token semântico
<div className="shadow-[var(--ds-shadow-card)]">
```

**Hierarquia correta**:
```typescript
// Elementos pequenos (badges, tooltips):
shadow-[var(--ds-shadow-sm)]

// Cards padrão:
shadow-[var(--ds-shadow-card)]

// Cards em hover:
hover:shadow-[var(--ds-shadow-card-hover)]
```

---

## 🚀 ERROS DE DEPLOY

### ERRO #1: Build failed - TypeScript errors

**Mensagem**:
```
Error: TS2322: Type 'string' is not assignable to type 'number'
Build failed
```

**Solução**:
```bash
# 1. Roda build localmente para ver erro completo:
npm run build

# 2. Corrige TypeScript errors mostrados
# Exemplo:
// ❌ const age: number = "30";
// ✅ const age: number = 30;

# 3. Commit e push novamente:
git add .
git commit -m "fix: TypeScript errors"
git push origin main
```

---

### ERRO #2: Functions failed to deploy

**Mensagem Netlify**:
```
Failed to deploy functions:
- aereo
- moblix-api
Error: Cannot find module 'axios'
```

**Causa**: Dependências faltando em `package.json`

**Solução**:
```bash
# 1. Adiciona dependência:
npm install axios

# 2. Verifica package.json:
cat package.json | grep axios

# 3. Commit e push:
git add package.json package-lock.json
git commit -m "fix: Add axios dependency"
git push origin main
```

---

### ERRO #3: Site loads but styles missing

**Sintomas**:
- HTML carrega
- Sem CSS (site aparece sem estilo)
- Console error: "Failed to load resource: /assets/index-*.css"

**Causa**: CSS não incluído no build ou caminho incorreto

**Diagnóstico**:
```bash
# Verifica se CSS existe no build:
ls -lh dist/assets/*.css

# Verifica referência no HTML:
cat dist/index.html | grep "\.css"
```

**Solução**:
```bash
# 1. Limpa dist e rebuild:
rm -rf dist
npm run build

# 2. Verifica novamente:
ls -lh dist/assets/

# 3. Se CSS existe, é problema de cache:
# - Limpa cache Netlify (dashboard → Deploys → Clear cache and retry)
# - Ou adiciona cache-busting hash no vite.config.ts
```

---

### ERRO #4: "Module not found" em produção (mas funciona local)

**Sintomas**:
- `npm run dev` funciona perfeitamente
- Produção quebra com "Cannot find module '@/components/Foo'"

**Causa**: Case-sensitivity ou path alias não configurado

**Solução**:
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## 🌐 PROBLEMAS DE API

### PROBLEMA #1: CORS error em produção

**Sintomas**:
```
Access to fetch at 'https://api.moblix.com.br/...' from origin 'https://semviagem.com'
has been blocked by CORS policy
```

**Causa**: Backend não permite origem `https://semviagem.com`

**Solução**:
```typescript
// Opção A: Configurar CORS no backend
// (adicionar https://semviagem.com nas allowed origins)

// Opção B: Usar Netlify Function como proxy:
// netlify/functions/proxy-api.ts
export const handler = async (event) => {
  const response = await fetch('https://api.moblix.com.br/...');
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: await response.text(),
  };
};
```

---

### PROBLEMA #2: API calls funcionam local mas falham produção

**Causa**: Environment variables faltando

**Diagnóstico**:
```bash
# Verifica variáveis no Netlify:
# Dashboard → Site Settings → Environment Variables

# Variáveis obrigatórias:
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID
VITE_STRIPE_PUBLIC_KEY
```

**Solução**:
1. Adiciona variáveis faltando no dashboard Netlify
2. Triggera novo deploy (ou espera próximo push)
3. Valida que variáveis foram aplicadas (verifica build log)

---

## 🚨 EMERGENCY ROLLBACK

### Quando usar rollback:

- ✅ Deploy quebrou site completamente (HTTP 500, tela branca)
- ✅ Bug crítico afetando todos usuários
- ✅ Dados sendo perdidos/corrompidos
- ❌ Bug menor visual (não precisa rollback)
- ❌ Erro afetando <5% usuários (pode fix e redeploy)

---

### MÉTODO 1: Rollback via Netlify (RECOMENDADO)

**Tempo**: ~30 segundos
**Risco**: Mínimo

**Passos**:
1. Acessa https://app.netlify.com/sites/[seu-site]/deploys
2. Identifica último deploy estável (antes do problema)
3. Clica no deploy → botão **"Publish deploy"**
4. Confirma rollback
5. Site volta ao estado anterior em ~30s

**Validação**:
```bash
# Testa produção:
curl -I https://semviagem.com
# Deve retornar HTTP 200

# Verifica no browser:
open https://semviagem.com
```

---

### MÉTODO 2: Rollback via Git

**Tempo**: ~4-5 minutos (build + deploy)
**Risco**: Médio (requer force push)

**Passos**:
```bash
# 1. Identifica commit estável:
git log --oneline

# 2. Opção A - Revert (cria novo commit):
git revert HEAD
git push origin main

# 3. Opção B - Reset (volta no tempo):
git reset --hard abc1234  # hash do commit estável
git push --force origin main  # ⚠️ CUIDADO com force

# 4. Monitora novo deploy no Netlify
```

**⚠️ Atenção com force push**:
- Pode sobrescrever commits de outros devs
- Coordena com time antes de executar
- Documenta motivo do rollback

---

### MÉTODO 3: Hotfix rápido

**Tempo**: ~2-3 minutos
**Quando usar**: Problema simples (typo, variável errada)

**Passos**:
```bash
# 1. Cria branch hotfix:
git checkout -b hotfix/critical-bug

# 2. Corrige problema:
# Edita arquivo quebrado
# Exemplo: src/components/Foo.tsx

# 3. Commit e push:
git add .
git commit -m "hotfix: Fix critical bug in Foo component"
git push origin hotfix/critical-bug

# 4. Merge direto para main:
git checkout main
git merge hotfix/critical-bug
git push origin main

# 5. Monitora deploy
```

---

## 🔍 DEBUG TOOLS

### Ferramenta 1: Verificar bundle size

```bash
npm run build

# Analisa output:
# CSS: X kB → Y kB gzip
# JS:  X kB → Y kB gzip
```

**Metas**:
- CSS gzip: < 25kB ✅
- JS gzip: < 250kB ✅
- Total gzip: < 300kB ✅

---

### Ferramenta 2: Testar production build localmente

```bash
npm run build
npm run preview

# Acessa http://localhost:4173
# Testa fluxo completo como se fosse produção
```

---

### Ferramenta 3: Inspecionar CSS variables

```javascript
// No browser console (DevTools):
getComputedStyle(document.documentElement).getPropertyValue('--ds-brand-yellow')
// Deve retornar: "#F0C72F"

// Lista todos tokens:
const styles = getComputedStyle(document.documentElement);
Array.from(styles).filter(prop => prop.startsWith('--ds-')).forEach(prop => {
  console.log(prop, ':', styles.getPropertyValue(prop));
});
```

---

### Ferramenta 4: Validar Context API

```typescript
// Adiciona debug temporário em SelectionContext.tsx:
export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [outboundFlight, setOutboundFlight] = useState<Flight | null>(null);

  useEffect(() => {
    logger.debug('SelectionContext - outboundFlight changed:', outboundFlight);
  }, [outboundFlight]);

  // ... resto do código
};
```

---

## 📋 CHECKLIST DE DEBUG

Quando algo quebra, seguir esta ordem:

### Nível 1 - Validação básica:
- [ ] `npm run build` roda sem erros?
- [ ] `npm run preview` funciona localmente?
- [ ] Git status limpo (sem arquivos não commitados)?
- [ ] Browser console tem erros?

### Nível 2 - Validação de ambiente:
- [ ] Variáveis de ambiente configuradas no Netlify?
- [ ] `netlify.toml` configurado corretamente?
- [ ] Node version correta (18)?
- [ ] Dependencies atualizadas (`npm install`)?

### Nível 3 - Validação de código:
- [ ] Sem hardcoded values (tokens semânticos 100%)?
- [ ] SelectionContext sendo usado corretamente?
- [ ] FlightResults consolidado (não separado)?
- [ ] Logger usado em vez de console.log?

### Nível 4 - Validação de deploy:
- [ ] Netlify build log sem erros?
- [ ] Functions deployed corretamente?
- [ ] Assets uploaded para CDN?
- [ ] URL produção acessível?

---

## 📚 REFERÊNCIAS RÁPIDAS

**Documentação relacionada**:
- `DESIGN_SYSTEM.md` → Regras de tokens e componentes
- `ARCHITECTURE.md` → Decisões críticas (FlightResults, Context)
- `DEPLOYMENT.md` → Processo validado de deploy

**Arquivos críticos**:
- `src/components/FlightResults.tsx` → Bug histórico resolvido
- `src/context/SelectionContext.tsx` → Estado global
- `src/utils/logger.ts` → Logging centralizado
- `src/index.css` → Tokens CSS (:root)
- `netlify.toml` → Configuração deploy

**Links úteis**:
- Netlify Dashboard: https://app.netlify.com
- Produção: https://semviagem.com
- Security Headers: https://securityheaders.com
- Lighthouse: Chrome DevTools → Lighthouse

---

**Última atualização**: 05 Dezembro 2024
**Versão**: 2.0 (Estável em produção)

---

**⚠️ IMPORTANTE**: Consulte sempre este guia antes de fazer debugging. Documentação histórica de bugs previne regressões e economiza horas de investigação.
