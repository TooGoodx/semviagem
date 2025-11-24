# Guia de Testes - Fluxo de Autenticação

## Status do Servidor
✅ **Servidor rodando em:** http://localhost:5174/

## 🔑 Configuração Necessária

### ⚠️ IMPORTANTE: Atualizar Auth0 Dashboard PRIMEIRO

Antes de testar, você **DEVE** atualizar as configurações no Auth0:

1. Acesse: https://manage.auth0.com/
2. Vá em **Applications** → **UWkClVFOk5ttmeC7jYrSWKKkwm4SGDYJ** → **Settings**
3. Atualize os seguintes campos:

```
Allowed Callback URLs:
http://localhost:5174/auth/callback,
http://localhost:5173/auth/callback,
https://extraordinary-starship-9103ce.netlify.app/auth/callback

Allowed Logout URLs:
http://localhost:5174,
http://localhost:5173,
https://extraordinary-starship-9103ce.netlify.app

Allowed Web Origins:
http://localhost:5174,
http://localhost:5173,
https://extraordinary-starship-9103ce.netlify.app
```

4. Clique em **Save Changes** no final da página

---

## 📋 Roteiro de Testes

### Teste 1: Verificar Homepage
**Objetivo:** Confirmar que a aplicação carrega corretamente

1. ✅ Abra http://localhost:5174/
2. ✅ Verifique se a página inicial carrega sem erros
3. ✅ Abra o Console do navegador (F12 ou Cmd+Option+I)
4. ✅ Verifique se não há erros em vermelho no console

**Resultado esperado:**
- Homepage carrega normalmente
- Sem erros no console
- Logo e branding visíveis

---

### Teste 2: Fluxo de Cadastro (PRINCIPAL)
**Objetivo:** Testar o fluxo completo de registro de novo usuário

#### Passo a Passo:

1. **Navegue para a página de registro**
   - Abra http://localhost:5174/register
   - Ou clique no botão "Cadastrar" na homepage

2. **Preencha o formulário**
   ```
   Nome: Test User
   Email: test+{timestamp}@example.com (use um email único)
   Telefone: (11) 99999-9999
   [x] Aceito receber ofertas
   ```

3. **Clique em "Criar Conta"**
   - ✅ Deve redirecionar para Auth0
   - ✅ URL deve ser: `https://dev-z4okudaokz1tfpki.us.auth0.com/...`

4. **No Auth0 - Crie a senha**
   - ✅ Deve mostrar tela de "Sign Up"
   - Digite uma senha forte (mínimo 8 caracteres)
   - Clique em "Continue"

5. **Verifique o retorno**
   - ✅ Deve redirecionar para: http://localhost:5174/auth/callback
   - ✅ Deve mostrar "Autenticando..." brevemente
   - ✅ Deve redirecionar para: http://localhost:5174/dashboard

6. **Verifique o Console (F12)**
   ```javascript
   // Você deve ver estes logs:
   "Saving registration data to localStorage: {...}"
   "Processando registro pendente: {...}"
   "User data saved successfully" // ou erro se Netlify Function não existir
   ```

7. **Verifique localStorage**
   ```javascript
   // No Console, execute:
   localStorage.getItem('pendingRegistration')
   // Deve retornar: null (foi limpo após processar)
   ```

8. **Verifique sessionStorage**
   ```javascript
   // No Console, execute:
   sessionStorage.getItem('subscription_status')
   // Deve retornar: {"hasSubscription":false,"checkedAt":"..."}
   ```

**Resultado esperado:**
- ✅ Toast de boas-vindas: "Bem-vindo, Test User! 🎉"
- ✅ Redirecionado para /dashboard
- ✅ pendingRegistration limpo do localStorage
- ✅ subscription_status salvo no sessionStorage

**Possíveis erros:**
- ❌ Se ficar preso no Auth0: Verifique se atualizou as Callback URLs no Auth0 Dashboard
- ❌ Se voltar para /login: Verifique erros no console
- ❌ Se "User data saved" falhar: Normal - Netlify Functions não estão rodando localmente

---

### Teste 3: Logout
**Objetivo:** Testar logout e limpeza de dados

1. **No Dashboard, faça logout**
   - Clique no botão de logout/perfil
   - Ou navegue para o menu de usuário

2. **Verifique:**
   ```javascript
   // No Console:
   sessionStorage.getItem('subscription_status')
   // Deve retornar: null (foi limpo)
   ```

3. **Resultado esperado:**
   - ✅ Redirecionado para homepage ou /login
   - ✅ sessionStorage limpo

---

### Teste 4: Fluxo de Login (Usuário Existente)
**Objetivo:** Testar login com o usuário criado no Teste 2

1. **Navegue para http://localhost:5174/login**

2. **Clique em "Entrar"**
   - ✅ Deve redirecionar para Auth0

3. **No Auth0 - Faça login**
   - Digite o email usado no cadastro
   - Digite a senha
   - Clique em "Continue"

4. **Verifique o retorno**
   - ✅ Deve redirecionar para: http://localhost:5174/auth/callback
   - ✅ Deve mostrar "Autenticando..." brevemente
   - ✅ Deve redirecionar para: http://localhost:5174/dashboard

5. **Verifique o Console**
   ```javascript
   // Deve ver:
   "Subscription status checked"
   // NÃO deve ver "Processando registro pendente" (não há dados novos)
   ```

**Resultado esperado:**
- ✅ Toast de boas-vindas: "Bem-vindo de volta, Test User! 👋"
- ✅ Redirecionado para /dashboard
- ✅ Sem erros no console

---

### Teste 5: Login Social (Google)
**Objetivo:** Testar login com provedor social

1. **Navegue para http://localhost:5174/login**

2. **Clique no botão "Continue with Google"**
   - ✅ Deve redirecionar para Google
   - ✅ URL deve conter `accounts.google.com`

3. **Autorize com sua conta Google**
   - Selecione uma conta
   - Conceda permissões

4. **Verifique o retorno**
   - ✅ Deve retornar para http://localhost:5174/auth/callback
   - ✅ Deve redirecionar para /dashboard

**Resultado esperado:**
- ✅ Login bem-sucedido com conta Google
- ✅ Toast de boas-vindas
- ✅ Redirecionado para /dashboard

---

### Teste 6: Proteção de Rotas
**Objetivo:** Verificar que rotas protegidas exigem autenticação

1. **Faça logout (se estiver logado)**

2. **Tente acessar diretamente:**
   - http://localhost:5174/dashboard
   - http://localhost:5174/profile

3. **Resultado esperado:**
   - ✅ Deve redirecionar automaticamente para /login
   - ✅ Ou mostrar "Verificando acesso..." e depois redirecionar

---

## 🔍 Verificações de Debug

### Console do Navegador

Abra o Console (F12) e execute:

```javascript
// 1. Verificar localStorage
console.log('pendingRegistration:', localStorage.getItem('pendingRegistration'));

// 2. Verificar sessionStorage
console.log('subscription_status:', sessionStorage.getItem('subscription_status'));
console.log('show_subscription_banner:', sessionStorage.getItem('show_subscription_banner'));

// 3. Ver todos os dados
console.log('All localStorage:', {...localStorage});
console.log('All sessionStorage:', {...sessionStorage});
```

### Network Tab (Rede)

1. Abra DevTools (F12) → Aba **Network**
2. Durante o callback, procure por:
   - `/.netlify/functions/save-user-data` (pode dar erro 404 - normal em dev)
   - `/.netlify/functions/check-subscription` (pode dar erro 404 - normal em dev)

---

## ⚠️ Erros Esperados em Ambiente Local

### Erro 404: Netlify Functions
```
POST http://localhost:5174/.netlify/functions/save-user-data 404 (Not Found)
GET http://localhost:5174/.netlify/functions/check-subscription 404 (Not Found)
```

**Isso é NORMAL!** As Netlify Functions só funcionam em produção no Netlify.

**O que fazer:**
- ✅ Ignore esses erros 404 durante testes locais
- ✅ O fluxo de autenticação deve continuar funcionando
- ✅ Em produção, essas chamadas vão funcionar

---

## ❌ Problemas Comuns e Soluções

### Problema 1: "Callback URL mismatch"
**Erro:** `The redirect URI is wrong. Please review the callback URL...`

**Solução:**
1. Vá ao Auth0 Dashboard
2. Adicione `http://localhost:5174/auth/callback` nas Allowed Callback URLs
3. Salve e tente novamente

---

### Problema 2: Fica preso em /auth/callback
**Sintomas:** Página mostra "Autenticando..." infinitamente

**Solução:**
1. Abra o Console (F12)
2. Veja os erros
3. Provavelmente é erro de API (404) - ignore e veja se redireciona
4. Se não redirecionar, recarregue a página (F5)

---

### Problema 3: Volta para /login após Auth0
**Sintomas:** Autentica no Auth0 mas volta para /login

**Causas possíveis:**
1. Auth0 não está retornando `isAuthenticated = true`
2. Erro no processamento do callback
3. Token inválido

**Debug:**
```javascript
// No Console, depois de voltar para /login:
console.log('Auth0 state:', window.localStorage);
```

**Solução:**
1. Limpe localStorage/sessionStorage
2. Tente novamente
3. Verifique se Auth0 config está correto

---

### Problema 4: "Connection 'Username-Password-Authentication' not found"
**Sintomas:** Erro ao tentar fazer login por email

**Solução:**
1. Vá ao Auth0 Dashboard
2. Vá em **Authentication** → **Database**
3. Verifique se existe uma database connection
4. Se o nome for diferente, atualize em:
   - `src/pages/Login.tsx` linha 25
   - `src/pages/Register.tsx` linha 26

---

## 📊 Checklist de Teste Completo

Marque conforme testa:

### Funcionalidades Básicas
- [ ] Homepage carrega sem erros
- [ ] Console não tem erros críticos
- [ ] Navegação funciona

### Fluxo de Cadastro
- [ ] Formulário de registro aceita dados
- [ ] Redireciona para Auth0
- [ ] Auth0 permite criar conta
- [ ] Retorna para /auth/callback
- [ ] Processa dados de registro (veja console)
- [ ] Redireciona para /dashboard
- [ ] Toast de boas-vindas aparece
- [ ] localStorage limpo (pendingRegistration = null)
- [ ] sessionStorage atualizado

### Fluxo de Login
- [ ] Botão "Entrar" redireciona para Auth0
- [ ] Auth0 permite login
- [ ] Retorna para /auth/callback
- [ ] Redireciona para /dashboard
- [ ] Toast de boas-vindas aparece
- [ ] Não processa registro (não há dados pendentes)

### Login Social
- [ ] Botão Google funciona
- [ ] Redireciona para Google
- [ ] Retorna para /auth/callback
- [ ] Login bem-sucedido

### Proteção de Rotas
- [ ] /dashboard sem login → redireciona para /login
- [ ] /profile sem login → redireciona para /login
- [ ] /dashboard com login → acessa normalmente

### Logout
- [ ] Logout funciona
- [ ] sessionStorage limpo
- [ ] Redireciona para home ou /login

---

## 🎯 Resultado Esperado Final

Após todos os testes, você deve ter:

✅ **Fluxo de Cadastro funcionando:**
- Register → Auth0 → Callback → Dashboard

✅ **Fluxo de Login funcionando:**
- Login → Auth0 → Callback → Dashboard

✅ **Dados persistidos corretamente:**
- localStorage usado para dados temporários
- sessionStorage usado para cache de sessão
- Dados limpos após processamento

✅ **Erros tratados:**
- 404 nas Netlify Functions (esperado em dev)
- Redirecionamentos corretos
- Toasts informativos

---

## 🚀 Próximos Passos (Deploy)

Após validar localmente:

1. **Commit das mudanças**
   ```bash
   git add .
   git commit -m "Fix: Authentication flow - Register → Auth0 → Callback → Dashboard"
   git push
   ```

2. **Deploy no Netlify**
   - Netlify vai fazer deploy automático
   - Aguarde build completar

3. **Teste em Produção**
   - Use https://extraordinary-starship-9103ce.netlify.app
   - Repita os testes acima
   - Agora as Netlify Functions VÃO funcionar

4. **Verificar em Produção:**
   - Dados salvos no Supabase
   - Stripe checkout funcional
   - Subscription checking funcional

---

## 📞 Support

Se encontrar problemas:

1. Verifique o Console (F12) para erros
2. Verifique Auth0 Dashboard configurações
3. Verifique os arquivos modificados:
   - [AuthCallback.tsx](src/pages/AuthCallback.tsx)
   - [Login.tsx](src/pages/Login.tsx)
   - [Register.tsx](src/pages/Register.tsx)
   - [AuthContext.tsx](src/context/AuthContext.tsx)
   - [auth0.ts](src/config/auth0.ts)

4. Consulte os documentos:
   - [AUTH_FIXES_IMPLEMENTED.md](AUTH_FIXES_IMPLEMENTED.md)
   - [AUTH_DEEP_ANALYSIS.md](AUTH_DEEP_ANALYSIS.md)

---

*Guia criado em: 2025-10-17*
*Servidor rodando em: http://localhost:5174/*
