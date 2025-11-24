# 🎭 Playwright MCP - Todas as Funcionalidades

## 📋 Índice
1. [Navegação](#navegação)
2. [Interação com Elementos](#interação-com-elementos)
3. [Formulários e Inputs](#formulários-e-inputs)
4. [Inspeção e Debug](#inspeção-e-debug)
5. [Recursos Avançados](#recursos-avançados)
6. [Exemplos Práticos](#exemplos-práticos)

---

## 🧭 Navegação

### `browser_navigate`
**Descrição:** Navega para uma URL específica

**Uso:**
```
Navegue para https://www.google.com
Abra http://localhost:5174/login
Vá para a página de dashboard
```

**O que faz:**
- Abre a URL no browser
- Espera a página carregar completamente
- Retorna o status de carregamento

---

### `browser_go_back`
**Descrição:** Volta para a página anterior no histórico

**Uso:**
```
Volte para a página anterior
Clique no botão voltar do navegador
```

---

### `browser_go_forward`
**Descrição:** Avança para a próxima página no histórico

**Uso:**
```
Avance para a próxima página
Vá para frente no histórico
```

---

## 🖱️ Interação com Elementos

### `browser_click`
**Descrição:** Clica em elementos da página (single ou double click)

**Uso:**
```
Clique no botão "Entrar"
Clique duas vezes no elemento com texto "Editar"
Clique no link "Cadastrar"
```

**Parâmetros:**
- Tipo de clique: single (padrão) ou double
- Seletor ou texto do elemento
- Posição (opcional)

**Exemplos práticos:**
```
Clique no botão "Continue with Google"
Clique no ícone de menu
Clique no primeiro item da lista
```

---

### `browser_drag`
**Descrição:** Arrasta um elemento e solta em outro (drag & drop)

**Uso:**
```
Arraste o arquivo para a área de upload
Mova o card "Task 1" para a coluna "Done"
Arraste o slider para a posição 50%
```

**Casos de uso:**
- Upload de arquivos via drag & drop
- Reordenação de listas
- Sliders e controles personalizados
- Interfaces de arrastar e soltar

---

## 📝 Formulários e Inputs

### `browser_fill_form`
**Descrição:** Preenche múltiplos campos de formulário simultaneamente

**Uso:**
```
Preencha o formulário de registro com:
- Nome: João Silva
- Email: joao@exemplo.com
- Telefone: (11) 99999-9999
```

**Vantagens:**
- Preenche vários campos de uma vez
- Mais rápido que preencher campo por campo
- Ideal para formulários complexos

---

### `browser_type`
**Descrição:** Digita texto em um campo de input específico

**Uso:**
```
Digite "teste@email.com" no campo de email
Escreva "senha123" no campo de senha
Digite "São Paulo" no campo de busca
```

**Diferença do fill_form:**
- Mais preciso para campos individuais
- Simula digitação real (tecla por tecla)
- Útil para campos com validação em tempo real

---

### `browser_select_option`
**Descrição:** Seleciona opção em dropdown/select

**Uso:**
```
Selecione "Brasil" no dropdown de país
Escolha a opção "Cartão de Crédito" no método de pagamento
Selecione "São Paulo" na lista de estados
```

**Suporta:**
- Select nativo HTML
- Dropdowns customizados (com acessibilidade)
- Listas de seleção múltipla

---

### `browser_file_upload`
**Descrição:** Faz upload de um ou múltiplos arquivos

**Uso:**
```
Faça upload do arquivo "documento.pdf"
Envie as imagens "foto1.jpg" e "foto2.jpg"
Carregue o arquivo "relatorio.xlsx" no campo de upload
```

**Suporta:**
- Upload único
- Upload múltiplo
- Qualquer tipo de arquivo

---

## 🔍 Inspeção e Debug

### `browser_snapshot`
**Descrição:** Captura o estado atual da página como árvore de acessibilidade

**Uso:**
```
Tire um snapshot da página atual
Capture o estado do formulário
Mostre a estrutura da página
```

**O que retorna:**
- Estrutura completa da página
- Todos os elementos e seus roles
- Textos visíveis
- Estados dos elementos (habilitado/desabilitado, etc)

**Diferencial:**
- NÃO usa screenshots (mais rápido)
- Usa árvore de acessibilidade estruturada
- Mais preciso que visão computacional

---

### `browser_console_messages`
**Descrição:** Captura mensagens do console do browser

**Uso:**
```
Mostre as mensagens do console
Liste os erros no console
Capture warnings e erros JavaScript
```

**Tipos de mensagens:**
- `log` - console.log()
- `warn` - console.warn()
- `error` - console.error()
- `info` - console.info()
- `debug` - console.debug()

**Com filtro de erros:**
```
Mostre apenas os erros no console
Liste warnings do console
```

---

### `browser_evaluate`
**Descrição:** Executa código JavaScript diretamente na página

**Uso:**
```
Execute: document.title
Rode o código: localStorage.getItem('token')
Verifique: window.location.href
```

**Casos de uso:**
- Ler valores de variáveis JavaScript
- Verificar localStorage/sessionStorage
- Executar funções customizadas
- Manipular DOM diretamente
- Debug avançado

**Exemplos práticos:**
```
Execute: document.querySelector('.user-name').textContent
Rode: JSON.parse(localStorage.getItem('user'))
Verifique: window.innerWidth
```

---

### `browser_close`
**Descrição:** Fecha a página/browser atual

**Uso:**
```
Feche o browser
Encerre a sessão
Feche a página atual
```

---

## 🚀 Recursos Avançados

### PDF Generation (Cap: `pdf`)
**Descrição:** Gera PDF da página atual

**Ativação:** Adicione `--caps pdf` na configuração

**Uso:**
```
Gere um PDF desta página
Crie um PDF do dashboard
Exporte a página como PDF
```

**Casos de uso:**
- Relatórios automatizados
- Documentação de telas
- Arquivamento de páginas
- Comprovantes

---

### Vision/Coordinate-based (Cap: `vision`)
**Descrição:** Interações baseadas em coordenadas visuais

**Ativação:** Adicione `--caps vision` na configuração

**Uso:**
```
Clique nas coordenadas (100, 200)
Interaja com o elemento na posição X:500 Y:300
```

**Casos de uso:**
- Elementos sem acessibilidade adequada
- Canvas e gráficos interativos
- Jogos web
- Interfaces complexas

---

### Tab Management (Cap: `tabs`)
**Descrição:** Gerenciamento de múltiplas abas

**Ativação:** Adicione `--caps tabs` na configuração

**Uso:**
```
Abra uma nova aba
Troque para a aba 2
Feche a aba atual
Liste todas as abas abertas
```

**Casos de uso:**
- Testes com múltiplas janelas
- Comparação de páginas
- Workflows multi-página
- Login em múltiplas contas

---

### Browser Installation (Cap: `install`)
**Descrição:** Ferramentas para instalar browsers

**Ativação:** Adicione `--caps install` na configuração

**Uso:**
```
Instale os browsers do Playwright
Baixe o Chromium
Verifique browsers instalados
```

---

## 💡 Exemplos Práticos para o Projeto

### 1. Testar Login Completo
```
Você: Use o Playwright para:
1. Abrir http://localhost:5174/login
2. Clicar em "Continue with Google"
3. Capturar mensagens do console
4. Me mostrar o snapshot da página final
```

**O que o Playwright fará:**
- `browser_navigate` para /login
- `browser_click` no botão Google
- `browser_console_messages` para capturar logs
- `browser_snapshot` para mostrar estado final

---

### 2. Preencher Formulário de Cadastro
```
Você: Preencha o formulário de registro em http://localhost:5174/register com dados de teste
```

**O que o Playwright fará:**
- `browser_navigate` para /register
- `browser_fill_form` com:
  - Nome: "Teste User"
  - Email: "teste@exemplo.com"
  - Telefone: "(11) 99999-9999"
  - Checkbox: aceitar marketing

---

### 3. Validar Dashboard
```
Você: Verifique se o dashboard está carregado corretamente e me mostre os elementos principais
```

**O que o Playwright fará:**
- `browser_navigate` para /dashboard
- `browser_snapshot` para capturar estrutura
- Analisa elementos presentes
- Reporta status

---

### 4. Testar Responsividade
```
Você: Teste a página /login em mobile (375px de largura)
```

**O que o Playwright fará:**
- `browser_evaluate` para setar viewport:
  ```javascript
  window.innerWidth = 375
  window.innerHeight = 667
  ```
- `browser_snapshot` para verificar layout
- Analisa se elementos estão visíveis

---

### 5. Debug de Erros
```
Você: Abra http://localhost:5174/dashboard e me mostre todos os erros do console
```

**O que o Playwright fará:**
- `browser_navigate` para /dashboard
- `browser_console_messages` filtrando apenas erros
- Lista todos os erros JavaScript encontrados

---

### 6. Verificar LocalStorage
```
Você: Verifique o que está salvo no localStorage após o login
```

**O que o Playwright fará:**
- `browser_evaluate` executando:
  ```javascript
  Object.keys(localStorage).map(key => ({
    key,
    value: localStorage.getItem(key)
  }))
  ```
- Retorna todos os dados do localStorage

---

### 7. Testar Upload de Arquivo
```
Você: Teste o upload de uma imagem no formulário de perfil
```

**O que o Playwright fará:**
- `browser_navigate` para /profile
- `browser_file_upload` com arquivo de teste
- `browser_click` em "Salvar"
- Verifica sucesso

---

## 🎯 Casos de Uso Avançados

### Automação de Testes E2E
```
Você: Execute o fluxo completo:
1. Cadastro de novo usuário
2. Login
3. Preenchimento de perfil
4. Verificação de dashboard
5. Logout
```

### Extração de Dados
```
Você: Extraia todos os preços da página de ofertas
```

### Validação de Acessibilidade
```
Você: Verifique se todos os botões têm labels apropriados
```

### Teste de Performance
```
Você: Meça o tempo de carregamento da página /dashboard
```

### Comparação de Estados
```
Você: Compare o estado da página antes e depois do login
```

---

## 🔧 Configuração Avançada

Para habilitar recursos adicionais, edite `.mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest",
        "--caps", "pdf",
        "--caps", "vision",
        "--caps", "tabs"
      ]
    }
  }
}
```

---

## 📊 Resumo de Ferramentas

| Categoria | Ferramentas | Quantidade |
|-----------|-------------|------------|
| **Navegação** | navigate, go_back, go_forward, close | 4 |
| **Interação** | click, drag | 2 |
| **Formulários** | fill_form, type, select_option, file_upload | 4 |
| **Inspeção** | snapshot, console_messages, evaluate | 3 |
| **Avançado** | PDF, Vision, Tabs, Install | 4 |
| **TOTAL** | | **17+** |

---

## 🎓 Melhores Práticas

### 1. Use snapshot antes de interagir
```
Primeiro tire um snapshot para ver a estrutura da página
```

### 2. Verifique console messages após ações
```
Após clicar em "Entrar", mostre os erros do console
```

### 3. Use fill_form para múltiplos campos
```
Prefira fill_form ao invés de type múltiplo
```

### 4. Combine ferramentas
```
1. Navigate para /login
2. Fill form com credenciais
3. Click em "Entrar"
4. Console messages para verificar erros
5. Snapshot para confirmar sucesso
```

---

## 🆚 Playwright vs Outras Ferramentas

### Playwright MCP vs Puppeteer
- ✅ Mais leve (usa acessibilidade, não screenshots)
- ✅ Mais rápido
- ✅ Funciona com múltiplos browsers (Chromium, Firefox, WebKit)
- ✅ Integrado com Claude via MCP

### Playwright MCP vs Selenium
- ✅ API moderna e simples
- ✅ Mais estável (menos flaky tests)
- ✅ Melhor suporte para SPA
- ✅ Integração nativa com Claude

---

## 🐛 Troubleshooting

### Problema: "Element not found"
**Solução:** Tire um snapshot primeiro para ver a estrutura real da página

### Problema: "Browser not installed"
**Solução:** Execute `npx playwright install`

### Problema: "Timeout waiting for selector"
**Solução:** A página pode estar carregando. Use snapshot para verificar estado atual

---

## 📚 Recursos Adicionais

- **Documentação oficial:** https://github.com/microsoft/playwright-mcp
- **Playwright Docs:** https://playwright.dev/
- **Exemplos:** https://playwright.dev/docs/intro

---

*Documento criado em: 2025-10-17*
*Playwright MCP versão: @latest*
*Total de ferramentas: 17+*
