# 🚀 SemViagem Deployment - PROCESSO VALIDADO

**Status**: ✅ PROCESSO VALIDADO EM PRODUÇÃO (05/12/2024)
**Deploy URL**: https://semviagem.com
**Plataforma**: Netlify
**Última atualização**: 05 Dezembro 2024

---

## ⚠️ PROCESSO CRÍTICO - SEGUIR EXATAMENTE

Este documento contém o **processo validado e testado** de deployment que resultou em deploy bem-sucedido em produção. **JAMAIS** pular etapas ou modificar a ordem.

---

## 🔒 PRÉ-REQUISITOS

### Validações obrigatórias ANTES de iniciar deploy:

- [ ] ✅ `npm run build` executado com sucesso localmente
- [ ] ✅ Bundle size < 1MB (verificar dist/)
- [ ] ✅ Gzip < 250kB (verificar build output)
- [ ] ✅ Nenhum erro crítico no console do browser (dev mode)
- [ ] ✅ Fluxo de busca funcionando: viewing → selecting → summary
- [ ] ✅ Design System v2.0 aplicado corretamente (tokens semânticos)
- [ ] ✅ PricingCard com preços corretos (R$ 19,90 e R$ 29,90)
- [ ] ✅ Sem arquivos `.backup-*` no repositório
- [ ] ✅ Git status limpo (ou apenas mudanças intencionais)

---

## 📋 FASE 1: DEBUG E VALIDAÇÃO LOCAL

### 1.1 Build de Produção

```bash
npm run build
```

**Saída esperada**:
```
✓ building client + server bundles...
✓ vite v5.4.0 building for production...
✓ 4829 modules transformed.
✓ dist/index.html
✓ dist/assets/*.js
✓ dist/assets/*.css

CSS:  137.69 kB → 21.92 kB gzip (84.1% redução) ✅
JS:   799.01 kB → 225.97 kB gzip (71.7% redução) ✅
HTML: 2.64 kB → 1.09 kB gzip (58.7% redução) ✅

Build completed in ~3-5 seconds ✅
```

**Se houver erros**:
- Verificar TypeScript errors → corrigir antes de prosseguir
- Verificar imports faltando → adicionar dependências
- Verificar paths inválidos → corrigir caminhos

### 1.2 Preview Local (Opcional mas Recomendado)

```bash
npm run preview
```

- Testa build de produção localmente
- Acessa http://localhost:4173
- Valida que tudo funciona como esperado
- `Ctrl+C` para parar servidor

### 1.3 Checklist de Qualidade

**Visual**:
- [ ] ✅ Pricing cards renderizando corretamente
- [ ] ✅ Ícones SVG aparecendo (não quebrados)
- [ ] ✅ Cores usando tokens semânticos (inspecionar DevTools)
- [ ] ✅ Sombras aplicadas corretamente
- [ ] ✅ Hover states funcionando

**Funcional**:
- [ ] ✅ Busca de voos retorna resultados
- [ ] ✅ Clique em "Selecionar" não perde dados
- [ ] ✅ Summary mostra dados corretos
- [ ] ✅ "Nova Busca" reseta estado
- [ ] ✅ Navegação entre páginas funcionando

**Performance**:
- [ ] ✅ Lighthouse score > 85 (Performance)
- [ ] ✅ First Contentful Paint < 1.5s
- [ ] ✅ Time to Interactive < 3.5s

---

## 📋 FASE 2: PREPARAÇÃO DO GIT

### 2.1 Verificar Status

```bash
git status
```

**Arquivos esperados para commit**:
- `src/components/PricingCard.tsx`
- `src/components/icons/*.tsx`
- `src/index.css`
- `src/styles/designSystem.ts`
- `src/pages/Home.tsx`
- `DESIGN_SYSTEM.md`
- `ARCHITECTURE.md`
- `DEPLOYMENT.md`
- `TROUBLESHOOTING.md`

**Arquivos a REMOVER (se existirem)**:
```bash
rm src/**/*.backup-*
```

### 2.2 Adicionar Mudanças

```bash
git add .
```

### 2.3 Commit Estruturado

**Formato obrigatório**:
```bash
git commit -m "$(cat <<'EOF'
feat: Implement Design System v2.0 with semantic tokens

- Created SVG icon components (IconBusca, IconAlertas, IconConcierge)
- Updated PricingCard with 8 UX/UI premium adjustments
- Applied semantic tokens (100% coverage, zero hardcoded values)
- Updated pricing: R$ 19,90 (Busca), R$ 29,90 (Alertas)
- Fixed text: "AI Agent Alertas", badge "MAIS POPULAR"
- Added comprehensive documentation (DESIGN_SYSTEM.md, ARCHITECTURE.md, etc.)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Validar commit**:
```bash
git log -1
```

---

## 📋 FASE 3: DEPLOY PARA NETLIFY

### 3.1 Push para Main

```bash
git push origin main
```

**Saída esperada**:
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Delta compression using up to 8 threads
Compressing objects: 100% (X/X), done.
Writing objects: 100% (X/X), X.XX KiB | X.XX MiB/s, done.
Total X (delta X), reused 0 (delta 0)
To https://github.com/[user]/[repo].git
   [hash]..[hash]  main -> main
```

### 3.2 Monitorar Deploy Netlify

**Auto-deploy ativa** (push to `main` → deploy automático)

**Acesse**: https://app.netlify.com/sites/[seu-site]/deploys

**Fases do deploy**:
1. ⏳ **Building** (2-3 min)
   - `npm run build`
   - Gerando assets
   - Otimizando bundle

2. ⏳ **Deploying** (30-60s)
   - Upload de arquivos para CDN
   - Configuração de redirects
   - Deploy de functions

3. ✅ **Published** (completo)
   - Deploy bem-sucedido
   - URL disponível

**Métricas esperadas no Netlify**:
```
Build time: ~3-4 minutes ✅
Deploy time: ~30-60 seconds ✅
Total: ~4-5 minutes ✅

Build log summary:
- npm install: ~60s
- npm run build: ~180s
- Functions deployed: 10 ✅
- Edge functions: 1 ✅
- Assets uploaded: ~50 files ✅
```

### 3.3 Validação Pós-Deploy

**Acesse produção**: https://semviagem.com

**Checklist de validação**:
- [ ] ✅ Site carrega sem erro 404
- [ ] ✅ CSS aplicado corretamente (não aparece sem estilo)
- [ ] ✅ JavaScript carrega (não aparece console errors)
- [ ] ✅ Pricing cards renderizando
- [ ] ✅ Ícones SVG aparecendo
- [ ] ✅ Busca de voos funciona (API calls bem-sucedidos)
- [ ] ✅ Fluxo de seleção funcionando
- [ ] ✅ Cores/espaçamentos usando tokens semânticos
- [ ] ✅ Mobile responsivo funcionando

**Teste específico - Fluxo completo**:
1. Acessa https://semviagem.com
2. Vai para /search
3. Preenche formulário de busca
4. Clica "Buscar Voos"
5. Resultados aparecem
6. Clica "Selecionar" em um voo
7. Vê lista de voos específicos
8. Clica em voo específico
9. **VALIDA**: Summary aparece com dados corretos (bug histórico resolvido)
10. Clica "Nova Busca"
11. **VALIDA**: Estado reseta corretamente

---

## 📋 FASE 4: VALIDAÇÃO DE AMBIENTE

### 4.1 Variáveis de Ambiente (Netlify)

**Verificar no dashboard** → Site Settings → Environment Variables

**Variáveis obrigatórias**:
```bash
# Auth0
VITE_AUTH0_DOMAIN=seu-dominio.auth0.com
VITE_AUTH0_CLIENT_ID=seu_client_id
VITE_AUTH0_CALLBACK_URL=https://semviagem.com/callback

# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# APIs
VITE_MOBLIX_API_URL=https://api.moblix.com.br
```

**Se alguma variável estiver faltando**:
1. Adiciona no dashboard Netlify
2. Triggera novo deploy (ou espera próximo push)

### 4.2 Configuração Netlify (netlify.toml)

**Arquivo**: `/netlify.toml`

**Configuração crítica**:
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**JAMAIS alterar** estas linhas sem motivo válido.

### 4.3 Headers de Segurança

**Verificar** em `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.auth0.com; ..."
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

**Testar headers** em https://securityheaders.com/?q=https://semviagem.com

---

## 📋 FASE 5: PÓS-DEPLOY

### 5.1 Monitoramento

**Verificar logs de erro** (primeiras 24h):
- Netlify Functions logs
- Browser console errors (usuários reais)
- Sentry/Error tracking (se configurado)

### 5.2 Métricas de Sucesso

**Bundle atual (05/12/2024)**:
```
CSS:  137.69 kB → 21.92 kB gzip (84.1% redução) ✅
JS:   799.01 kB → 225.97 kB gzip (71.7% redução) ✅
HTML: 2.64 kB → 1.09 kB gzip (58.7% redução) ✅
Total: ~250kB gzip ✅
```

**Performance (Lighthouse)**:
- Performance: > 85 ✅
- Accessibility: > 90 ✅
- Best Practices: > 90 ✅
- SEO: > 90 ✅

**Uptime**:
- 99.9% (garantido por Netlify CDN)

### 5.3 Rollback (Se Necessário)

**Se algo quebrar em produção**:

1. **Rollback imediato via Netlify**:
   - Dashboard → Deploys → Deploy anterior → "Publish deploy"
   - Produção volta ao estado anterior em ~30s

2. **Rollback via Git**:
   ```bash
   git revert HEAD
   git push origin main
   # Ou
   git reset --hard HEAD~1
   git push --force origin main  # ⚠️ Cuidado com force push
   ```

3. **Debug local**:
   - Checkout do commit quebrado
   - Reproduz problema localmente
   - Corrige bug
   - Novo commit e deploy

**Ver detalhes em**: `TROUBLESHOOTING.md` → Seção "Emergency Rollback"

---

## 🔧 TROUBLESHOOTING COMUM

### Erro: "Build failed"

**Causa**: TypeScript errors, missing dependencies

**Solução**:
```bash
# Local
npm run build
# Corrige erros mostrados
# Commit + push novamente
```

### Erro: "Functions failed to deploy"

**Causa**: Node version incompatível, dependências faltando

**Solução**:
- Verifica `netlify.toml` → `NODE_VERSION = "18"`
- Verifica `package.json` → dependencies corretas
- Limpa cache Netlify → Trigger rebuild

### Erro: "Site loads but no styles"

**Causa**: CSS não incluído no build, caminho incorreto

**Solução**:
- Verifica `dist/assets/*.css` existe
- Verifica `index.html` referencia CSS correto
- Limpa cache browser (Cmd+Shift+R)

### Erro: "API calls failing in production"

**Causa**: CORS, environment variables faltando

**Solução**:
- Verifica variáveis de ambiente no Netlify
- Verifica CORS configuration nas APIs
- Testa endpoints direto (Postman/curl)

---

## 📊 CHECKLIST FINAL

### Antes de deploy:

- [ ] ✅ `npm run build` sem erros
- [ ] ✅ Bundle size validado (< 1MB)
- [ ] ✅ Fluxo completo testado localmente
- [ ] ✅ Git commit estruturado
- [ ] ✅ Sem arquivos backup no repo

### Durante deploy:

- [ ] ✅ Push para `main` bem-sucedido
- [ ] ✅ Netlify build completado (2-4 min)
- [ ] ✅ Deploy published (visible na URL)

### Após deploy:

- [ ] ✅ Site carrega em https://semviagem.com
- [ ] ✅ Fluxo de busca funcionando
- [ ] ✅ Design System aplicado corretamente
- [ ] ✅ Mobile responsivo
- [ ] ✅ Sem console errors
- [ ] ✅ Lighthouse score > 85

---

## 🚨 AVISOS CRÍTICOS

### ❌ NUNCA fazer:

1. **Deploy sem testar localmente** (`npm run build` obrigatório)
2. **Force push sem backup** (pode perder código)
3. **Alterar `netlify.toml` sem entender** (pode quebrar deploy)
4. **Commit arquivos `.backup-*`** (poluição do repo)
5. **Deploy em horário de pico** (fazer em horários de baixo tráfego)

### ✅ SEMPRE fazer:

1. **Testa build local antes de push**
2. **Commit estruturado com mensagem clara**
3. **Monitora deploy no dashboard Netlify**
4. **Valida produção após deploy**
5. **Tem plano de rollback pronto**

---

## 📚 REFERÊNCIAS

- **Netlify Dashboard**: https://app.netlify.com
- **Production URL**: https://semviagem.com
- **Git Repository**: [seu repositório]
- **Documentação relacionada**:
  - `DESIGN_SYSTEM.md` (tokens e componentes)
  - `ARCHITECTURE.md` (decisões técnicas)
  - `TROUBLESHOOTING.md` (debug e fixes)

**Última atualização**: 05 Dezembro 2024
**Deploy validado**: 05/12/2024 18:45 UTC-3

---

**⚠️ IMPORTANTE**: Este processo foi validado e testou em produção. Seguir exatamente estas etapas garante deploy bem-sucedido e minimiza risco de erros.
