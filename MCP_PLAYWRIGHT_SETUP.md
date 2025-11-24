# MCP Server Playwright - Instalação Completa ✅

## Data: 2025-10-17

## 🎉 Status: INSTALADO

O MCP Server Playwright foi configurado com sucesso no projeto!

---

## 📋 O que é MCP Server Playwright?

**MCP (Model Context Protocol)** é um protocolo da Anthropic que permite que Claude interaja com ferramentas externas.

**Playwright MCP Server** permite que Claude:
- 🌐 Navegue automaticamente em websites
- 🔍 Extraia informações de páginas web
- 🧪 Teste aplicações web automaticamente
- 📸 Tire screenshots de páginas
- ⚡ Execute ações de browser (clicks, preenchimento de formulários, etc)

**Diferencial:** Usa a árvore de acessibilidade do Playwright ao invés de screenshots, tornando a automação mais precisa e rápida.

---

## ✅ O que foi instalado

### Arquivo criado: `.mcp.json`

Localização: `/Users/bruno/Downloads/buscadorReact-main/.mcp.json`

Conteúdo:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

**Escopo:** Project (compartilhado com a equipe via git)

---

## 🔧 Como funciona

1. **Claude Code lê o `.mcp.json`** ao abrir o projeto
2. **Quando necessário**, executa: `npx -y @playwright/mcp@latest`
3. **npx baixa e executa** o Playwright MCP server automaticamente
4. **Claude pode então usar** ferramentas do Playwright via MCP

**Vantagens:**
- ✅ Não precisa instalar globalmente
- ✅ Sempre usa a versão mais recente (`@latest`)
- ✅ `-y` aceita instalação automaticamente
- ✅ Funciona em qualquer máquina que tenha Node.js

---

## 🚀 Como usar

### Exemplo 1: Testar o login do projeto

```
Você: Use o Playwright para testar o fluxo de login em http://localhost:5174/login
```

Claude vai:
1. Abrir o browser via Playwright
2. Navegar para a URL
3. Interagir com os elementos da página
4. Reportar o resultado

### Exemplo 2: Extrair informações de uma página

```
Você: Vá em https://exemplo.com/produtos e me liste todos os produtos disponíveis
```

Claude vai:
1. Navegar para a página
2. Ler a árvore de acessibilidade
3. Extrair os dados dos produtos
4. Retornar uma lista estruturada

### Exemplo 3: Preencher um formulário

```
Você: Preencha o formulário de contato em http://localhost:5174/contato com dados de teste
```

Claude vai:
1. Abrir a página
2. Identificar os campos do formulário
3. Preencher com dados apropriados
4. Enviar ou reportar o resultado

---

## 🛠️ Ferramentas MCP disponíveis

O Playwright MCP Server fornece ferramentas como:

- **`playwright_navigate`** - Navegar para uma URL
- **`playwright_click`** - Clicar em elementos
- **`playwright_fill`** - Preencher campos de texto
- **`playwright_screenshot`** - Tirar screenshots
- **`playwright_evaluate`** - Executar JavaScript na página
- **`playwright_get_by_role`** - Buscar elementos por role (acessibilidade)
- **`playwright_get_by_text`** - Buscar elementos por texto

E muitas outras!

---

## 🔍 Verificar instalação

### Método 1: Perguntar ao Claude

```
Você: Liste os MCP servers instalados
```

Ou use o comando `/mcp` no chat.

### Método 2: Testar diretamente

```
Você: Use o Playwright para abrir https://www.google.com e tirar um screenshot
```

Se funcionar, está instalado corretamente!

---

## 📁 Estrutura de arquivos

```
buscadorReact-main/
├── .mcp.json                 ← Configuração do MCP (NOVO)
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── AuthCallback.tsx
│   └── routes/
│       └── AppRoutes.tsx
├── package.json
└── ...
```

---

## 🔄 Atualização

O MCP Server Playwright **se atualiza automaticamente** porque usamos `@latest`.

Se quiser forçar uma atualização:
```bash
npx clear-npx-cache
```

Depois, na próxima vez que Claude usar o Playwright, será baixada a versão mais recente.

---

## 🎯 Casos de uso para este projeto

### 1. Testar fluxo de autenticação
```
Você: Use o Playwright para testar o fluxo completo:
1. Abrir /register
2. Preencher o formulário
3. Verificar se redireciona para Auth0
```

### 2. Verificar se elementos existem
```
Você: Verifique se o botão "Entrar" existe na página /login
```

### 3. Capturar screenshots para documentação
```
Você: Tire screenshots de todas as páginas principais do projeto
```

### 4. Testar responsividade
```
Você: Teste a página /dashboard em mobile (375px) e desktop (1920px)
```

### 5. Validar formulários
```
Você: Teste o formulário de registro com dados inválidos e veja as mensagens de erro
```

---

## ⚙️ Configurações Avançadas (Opcional)

Se precisar de configurações adicionais, você pode expandir o `.mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "~/.cache/ms-playwright"
      }
    }
  }
}
```

---

## 🐛 Troubleshooting

### Erro: "MCP server 'playwright' not found"

**Solução:**
1. Verifique se `.mcp.json` existe na raiz do projeto
2. Recarregue o VSCode: Cmd+Shift+P → "Reload Window"
3. Verifique se Node.js está instalado: `node --version`

### Erro: "Failed to launch browser"

**Causa:** Playwright precisa baixar os browsers na primeira execução.

**Solução:**
```bash
npx playwright install
```

Isso vai baixar Chromium, Firefox e WebKit.

### Erro: "command not found: npx"

**Causa:** Node.js não está instalado ou não está no PATH.

**Solução:**
```bash
# Verifique se Node.js está instalado
which node
node --version

# Se não estiver, instale via Homebrew (macOS)
brew install node
```

---

## 📊 Comparação: Com vs Sem MCP Playwright

### Sem MCP Playwright:
```
Você: Teste se o login funciona
Claude: Posso revisar o código e sugerir testes manuais...
```

### Com MCP Playwright:
```
Você: Teste se o login funciona
Claude: Vou testar agora! [usa Playwright para abrir o browser e testar]
       Resultado: ✅ Login funcionou, redirecionou para /dashboard
```

---

## 🔗 Recursos Adicionais

- **Documentação oficial:** https://github.com/microsoft/playwright-mcp
- **Playwright docs:** https://playwright.dev/
- **MCP Protocol:** https://modelcontextprotocol.io/
- **Claude Code MCP Guide:** https://docs.claude.com/en/docs/claude-code/mcp

---

## 📝 Notas Importantes

1. **Primeira execução pode demorar** - npx precisa baixar o pacote
2. **Browsers são baixados sob demanda** - primeira vez que usar, Playwright baixa Chromium (~170MB)
3. **`.mcp.json` deve estar no git** - para que toda a equipe tenha acesso
4. **Funciona em CI/CD** - pode ser usado em pipelines de teste automático

---

## ✅ Checklist de Instalação

- [x] Arquivo `.mcp.json` criado na raiz do projeto
- [x] Configuração do Playwright MCP Server adicionada
- [x] Documentação criada (este arquivo)
- [ ] Recarregar VSCode para aplicar mudanças
- [ ] Testar com um comando simples (ex: "Liste os MCP servers")
- [ ] Testar navegação (ex: "Abra google.com com Playwright")

---

## 🎉 Próximos Passos

1. **Recarregue o VSCode:**
   - Cmd+Shift+P (Mac) ou Ctrl+Shift+P (Windows)
   - Digite "Reload Window"
   - Enter

2. **Teste a instalação:**
   ```
   Você: Use o Playwright para abrir https://www.google.com
   ```

3. **Use no projeto:**
   ```
   Você: Teste o fluxo de login completo da aplicação
   ```

---

*Instalação concluída em: 2025-10-17*
*MCP Server: @playwright/mcp@latest*
*Escopo: Project*
*Status: ✅ PRONTO PARA USO*
