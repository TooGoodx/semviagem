# ⚠️ CORREÇÃO URGENTE: Auth0 Callback URL Mismatch

## Erro Atual
```
Callback URL mismatch.
The provided redirect_uri is not in the list of allowed callback URLs.
```

## 🔧 Solução Rápida (5 minutos)

### Passo 1: Acesse o Auth0 Dashboard
1. Abra: https://manage.auth0.com/
2. Faça login com suas credenciais

### Passo 2: Encontre sua Application
1. No menu lateral, clique em **Applications** → **Applications**
2. Procure pela application: **UWkClVFOk5ttmeC7jYrSWKKkwm4SGDYJ**
3. Ou procure pelo nome da sua aplicação "SemViagem" ou similar
4. Clique para abrir

### Passo 3: Vá para Settings
1. Clique na aba **Settings**
2. Role para baixo até encontrar **Application URIs**

### Passo 4: Atualize "Allowed Callback URLs"
Encontre o campo **Allowed Callback URLs** e adicione:

```
http://localhost:5174/auth/callback,
http://localhost:5173/auth/callback,
https://extraordinary-starship-9103ce.netlify.app/auth/callback
```

**IMPORTANTE:**
- Use vírgulas para separar
- Não adicione espaços extras
- Não adicione barra final `/`
- Certifique-se de incluir TODAS as três URLs

### Passo 5: Atualize "Allowed Logout URLs"
No mesmo formulário, encontre **Allowed Logout URLs**:

```
http://localhost:5174,
http://localhost:5173,
https://extraordinary-starship-9103ce.netlify.app
```

### Passo 6: Atualize "Allowed Web Origins"
Encontre **Allowed Web Origins**:

```
http://localhost:5174,
http://localhost:5173,
https://extraordinary-starship-9103ce.netlify.app
```

### Passo 7: Salve
1. Role até o FINAL da página
2. Clique no botão **Save Changes**
3. Aguarde confirmação de sucesso

---

## 🧪 Teste Novamente

Agora volte ao navegador:

1. **Recarregue a página** (F5 ou Cmd+R)
2. Vá para http://localhost:5174/login
3. Clique em **"Entrar"**
4. **Deve funcionar!** ✅

---

## 📸 Screenshot de Exemplo

O campo **Allowed Callback URLs** deve ficar assim:

```
┌─────────────────────────────────────────────────────────────┐
│ Allowed Callback URLs                                       │
│                                                             │
│ http://localhost:5174/auth/callback,                       │
│ http://localhost:5173/auth/callback,                       │
│ https://extraordinary-starship-9103ce.netlify.app/auth/    │
│ callback                                                    │
│                                                             │
│ ℹ️ After the user authenticates, Auth0 will redirect to    │
│    these URLs. Use commas to separate multiple URLs.       │
└─────────────────────────────────────────────────────────────┘
```

---

## ❓ FAQ

### Por que esse erro acontece?
Auth0 valida que a URL de retorno (`redirect_uri`) está na lista de URLs permitidas por segurança. Como mudamos de `/area-logada` para `/auth/callback`, precisamos atualizar a configuração.

### O que acontece se eu não atualizar?
A autenticação NUNCA vai funcionar. Auth0 vai bloquear todas as tentativas de login/cadastro.

### Preciso fazer isso para produção também?
SIM! Mas as configurações acima já incluem a URL de produção (`https://extraordinary-starship-9103ce.netlify.app/auth/callback`).

### E se usar outra porta (5173, 3000, etc)?
Adicione a URL correspondente. Exemplo:
```
http://localhost:3000/auth/callback
```

---

## ✅ Checklist

- [ ] Acessei https://manage.auth0.com/
- [ ] Encontrei a Application correta
- [ ] Abri a aba Settings
- [ ] Atualizei "Allowed Callback URLs"
- [ ] Atualizei "Allowed Logout URLs"
- [ ] Atualizei "Allowed Web Origins"
- [ ] Cliquei em "Save Changes"
- [ ] Vi confirmação de sucesso
- [ ] Recarreguei a página do app (F5)
- [ ] Testei login novamente
- [ ] Funcionou! 🎉

---

## 🚀 Depois de Corrigir

Continue com os testes no [TESTING_GUIDE.md](TESTING_GUIDE.md):

1. ✅ Teste 2: Fluxo de Cadastro
2. ✅ Teste 4: Fluxo de Login
3. ✅ Teste 5: Login Social (Google)

---

*Documento criado em: 2025-10-17*
*Tempo estimado: 5 minutos*
*Prioridade: 🔴 CRÍTICA*
