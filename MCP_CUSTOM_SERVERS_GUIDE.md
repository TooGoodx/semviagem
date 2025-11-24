# 🔌 Guia: Criar MCP Servers Customizados

## 🎯 Objetivo
Transformar Claude em um agente AI que pode:
- 💬 Enviar mensagens via Evolution API (WhatsApp/Meta)
- 🗄️ Ler/escrever no Supabase
- 📧 Enviar emails
- 🔧 Executar qualquer função da sua aplicação

---

## 🏗️ Arquitetura Proposta

```
┌────────────────────────────────────────────────────────┐
│                   USUÁRIO                               │
│  "Claude, envie uma mensagem de boas-vindas para       │
│   todos os novos usuários cadastrados hoje"            │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│               CLAUDE CODE (Agente AI)                   │
│                                                         │
│  Entende a intenção e decide:                          │
│  1. Buscar novos usuários (MCP Supabase)               │
│  2. Para cada usuário, enviar msg (MCP Evolution)      │
│  3. Registrar log (MCP Supabase)                       │
└────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
┌──────────────────┐          ┌──────────────────┐
│  MCP: Supabase   │          │  MCP: Evolution  │
│                  │          │                  │
│  select * from   │          │  POST /message   │
│  users where     │          │  {to: phone,     │
│  created_at=today│          │   text: "Bem-    │
│                  │          │   vindo!"}       │
└──────────────────┘          └──────────────────┘
```

---

## 📦 Passo 1: Criar MCP Server para Evolution API

### Estrutura do projeto:

```
buscadorReact-main/
├── mcp-servers/                    ← Nova pasta
│   ├── evolution-api/
│   │   ├── package.json
│   │   ├── index.js
│   │   └── README.md
│   └── supabase-mcp/
│       ├── package.json
│       ├── index.js
│       └── README.md
├── .mcp.json                       ← Atualizar
└── ...
```

### Código do MCP Server Evolution API:

**mcp-servers/evolution-api/package.json:**
```json
{
  "name": "evolution-api-mcp",
  "version": "1.0.0",
  "type": "module",
  "description": "MCP Server para Evolution API (WhatsApp/Meta)",
  "main": "index.js",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "axios": "^1.6.0"
  }
}
```

**mcp-servers/evolution-api/index.js:**
```javascript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';

// Configuração da Evolution API
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;

// Criar servidor MCP
const server = new Server(
  {
    name: 'evolution-api-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Registrar ferramentas disponíveis
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'send_whatsapp_message',
        description: 'Envia mensagem via WhatsApp usando Evolution API',
        inputSchema: {
          type: 'object',
          properties: {
            phone: {
              type: 'string',
              description: 'Número do telefone (com código do país, ex: 5511999999999)',
            },
            message: {
              type: 'string',
              description: 'Texto da mensagem a ser enviada',
            },
          },
          required: ['phone', 'message'],
        },
      },
      {
        name: 'send_whatsapp_image',
        description: 'Envia imagem via WhatsApp',
        inputSchema: {
          type: 'object',
          properties: {
            phone: {
              type: 'string',
              description: 'Número do telefone',
            },
            imageUrl: {
              type: 'string',
              description: 'URL da imagem',
            },
            caption: {
              type: 'string',
              description: 'Legenda da imagem (opcional)',
            },
          },
          required: ['phone', 'imageUrl'],
        },
      },
      {
        name: 'get_whatsapp_status',
        description: 'Verifica status da conexão WhatsApp',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_whatsapp_chats',
        description: 'Lista conversas recentes do WhatsApp',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Número de conversas a retornar (padrão: 20)',
            },
          },
        },
      },
    ],
  };
});

// Implementar ferramentas
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'send_whatsapp_message': {
        const response = await axios.post(
          `${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`,
          {
            number: args.phone,
            text: args.message,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': EVOLUTION_API_KEY,
            },
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                messageId: response.data.key?.id,
                status: 'sent',
                phone: args.phone,
              }),
            },
          ],
        };
      }

      case 'send_whatsapp_image': {
        const response = await axios.post(
          `${EVOLUTION_API_URL}/message/sendMedia/${INSTANCE_NAME}`,
          {
            number: args.phone,
            mediatype: 'image',
            media: args.imageUrl,
            caption: args.caption || '',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': EVOLUTION_API_KEY,
            },
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                messageId: response.data.key?.id,
              }),
            },
          ],
        };
      }

      case 'get_whatsapp_status': {
        const response = await axios.get(
          `${EVOLUTION_API_URL}/instance/connectionState/${INSTANCE_NAME}`,
          {
            headers: {
              'apikey': EVOLUTION_API_KEY,
            },
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                instance: INSTANCE_NAME,
                state: response.data.state,
                connected: response.data.state === 'open',
              }),
            },
          ],
        };
      }

      case 'list_whatsapp_chats': {
        const limit = args.limit || 20;
        const response = await axios.get(
          `${EVOLUTION_API_URL}/chat/findChats/${INSTANCE_NAME}`,
          {
            headers: {
              'apikey': EVOLUTION_API_KEY,
            },
            params: { limit },
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                chats: response.data,
                count: response.data.length,
              }),
            },
          ],
        };
      }

      default:
        throw new Error(`Ferramenta desconhecida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            details: error.response?.data || null,
          }),
        },
      ],
      isError: true,
    };
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Evolution API MCP Server rodando...');
}

main().catch((error) => {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
});
```

---

## 📦 Passo 2: Criar MCP Server para Supabase

**mcp-servers/supabase-mcp/package.json:**
```json
{
  "name": "supabase-mcp",
  "version": "1.0.0",
  "type": "module",
  "description": "MCP Server para Supabase",
  "main": "index.js",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

**mcp-servers/supabase-mcp/index.js:**
```javascript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Criar servidor MCP
const server = new Server(
  {
    name: 'supabase-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Registrar ferramentas
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'supabase_query',
        description: 'Executa query SELECT no Supabase',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Nome da tabela',
            },
            select: {
              type: 'string',
              description: 'Colunas a selecionar (ex: "*" ou "id,name")',
            },
            filters: {
              type: 'object',
              description: 'Filtros (ex: {email: "user@example.com"})',
            },
            limit: {
              type: 'number',
              description: 'Limite de resultados',
            },
          },
          required: ['table', 'select'],
        },
      },
      {
        name: 'supabase_insert',
        description: 'Insere dados no Supabase',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Nome da tabela',
            },
            data: {
              type: 'object',
              description: 'Dados a inserir',
            },
          },
          required: ['table', 'data'],
        },
      },
      {
        name: 'supabase_update',
        description: 'Atualiza dados no Supabase',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Nome da tabela',
            },
            data: {
              type: 'object',
              description: 'Dados a atualizar',
            },
            filters: {
              type: 'object',
              description: 'Filtros para WHERE',
            },
          },
          required: ['table', 'data', 'filters'],
        },
      },
      {
        name: 'supabase_delete',
        description: 'Deleta dados no Supabase',
        inputSchema: {
          type: 'object',
          properties: {
            table: {
              type: 'string',
              description: 'Nome da tabela',
            },
            filters: {
              type: 'object',
              description: 'Filtros para WHERE',
            },
          },
          required: ['table', 'filters'],
        },
      },
    ],
  };
});

// Implementar ferramentas
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'supabase_query': {
        let query = supabase.from(args.table).select(args.select);

        // Aplicar filtros
        if (args.filters) {
          Object.entries(args.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        // Aplicar limite
        if (args.limit) {
          query = query.limit(args.limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                data,
                count: data.length,
              }),
            },
          ],
        };
      }

      case 'supabase_insert': {
        const { data, error } = await supabase
          .from(args.table)
          .insert(args.data)
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                data,
              }),
            },
          ],
        };
      }

      case 'supabase_update': {
        let query = supabase.from(args.table).update(args.data);

        // Aplicar filtros
        Object.entries(args.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { data, error } = await query.select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                data,
                updated: data.length,
              }),
            },
          ],
        };
      }

      case 'supabase_delete': {
        let query = supabase.from(args.table).delete();

        // Aplicar filtros
        Object.entries(args.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });

        const { data, error } = await query.select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                deleted: data.length,
              }),
            },
          ],
        };
      }

      default:
        throw new Error(`Ferramenta desconhecida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
          }),
        },
      ],
      isError: true,
    };
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Supabase MCP Server rodando...');
}

main().catch((error) => {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
});
```

---

## ⚙️ Passo 3: Configurar .mcp.json

Atualize o arquivo `.mcp.json` para incluir os novos MCP servers:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "evolution-api": {
      "command": "node",
      "args": ["./mcp-servers/evolution-api/index.js"],
      "env": {
        "EVOLUTION_API_URL": "http://localhost:8080",
        "EVOLUTION_API_KEY": "sua-api-key-aqui",
        "EVOLUTION_INSTANCE_NAME": "sua-instancia"
      }
    },
    "supabase": {
      "command": "node",
      "args": ["./mcp-servers/supabase-mcp/index.js"],
      "env": {
        "SUPABASE_URL": "https://seu-projeto.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "sua-service-role-key"
      }
    }
  }
}
```

---

## 🚀 Passo 4: Instalar Dependências

```bash
# Instalar dependências do Evolution API MCP
cd mcp-servers/evolution-api
npm install

# Instalar dependências do Supabase MCP
cd ../supabase-mcp
npm install

# Voltar para raiz
cd ../..
```

---

## 🎯 Passo 5: Usar os MCP Servers

Recarregue o VSCode e agora você pode usar comandos como:

### Exemplo 1: Buscar usuários e enviar WhatsApp

```
Você: Liste todos os usuários cadastrados hoje no Supabase
e envie uma mensagem de boas-vindas via WhatsApp para cada um
```

**Claude fará:**
1. Usa `supabase_query` para buscar usuários de hoje
2. Para cada usuário, usa `send_whatsapp_message`
3. Reporta o resultado

### Exemplo 2: Notificar sobre nova oferta

```
Você: Busque todos os usuários que aceitaram marketing
e envie uma mensagem sobre a nova promoção
```

### Exemplo 3: Verificar status e logs

```
Você: Verifique o status da conexão WhatsApp e me mostre
os últimos 10 usuários cadastrados
```

---

## 🔐 Segurança: Variáveis de Ambiente

**IMPORTANTE:** Não commite senhas no `.mcp.json`!

**Solução:** Use arquivo `.env` ou variáveis de ambiente do sistema.

**.env:**
```bash
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave-secreta
EVOLUTION_INSTANCE_NAME=minha-instancia
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

**.mcp.json (versão segura):**
```json
{
  "mcpServers": {
    "evolution-api": {
      "command": "node",
      "args": ["./mcp-servers/evolution-api/index.js"],
      "env": {
        "EVOLUTION_API_URL": "${EVOLUTION_API_URL}",
        "EVOLUTION_API_KEY": "${EVOLUTION_API_KEY}",
        "EVOLUTION_INSTANCE_NAME": "${EVOLUTION_INSTANCE_NAME}"
      }
    }
  }
}
```

**.gitignore:**
```
.env
.mcp.json
```

---

## 📊 Casos de Uso Reais

### 1. Automação de Onboarding
```
Claude: Quando um novo usuário se cadastrar:
1. Envie email de boas-vindas
2. Envie WhatsApp com tutorial
3. Crie tarefa de follow-up para 7 dias
```

### 2. Notificações Inteligentes
```
Claude: Se um usuário não acessa há 30 dias:
1. Verifique última interação no Supabase
2. Envie WhatsApp personalizado
3. Registre tentativa de reengajamento
```

### 3. Suporte Automatizado
```
Claude: Monitore mensagens no WhatsApp.
Se alguém perguntar sobre preços, responda automaticamente
consultando os dados do Supabase
```

### 4. Relatórios Automáticos
```
Claude: Todo dia às 9h:
1. Busque métricas de ontem (Supabase)
2. Gere relatório
3. Envie para gerente via WhatsApp
```

---

## 🎓 Próximos Passos

1. ✅ Criar estrutura de pastas `mcp-servers/`
2. ✅ Implementar Evolution API MCP
3. ✅ Implementar Supabase MCP
4. ✅ Atualizar `.mcp.json`
5. ✅ Instalar dependências
6. ✅ Testar cada MCP individualmente
7. ✅ Criar workflows complexos combinando MCPs
8. ✅ Documentar casos de uso específicos do projeto

---

## 🔗 Recursos Adicionais

- **MCP SDK Docs:** https://modelcontextprotocol.io/
- **Evolution API Docs:** https://doc.evolution-api.com/
- **Supabase JS Client:** https://supabase.com/docs/reference/javascript
- **Exemplos de MCP Servers:** https://github.com/modelcontextprotocol/servers

---

## 💡 Dica Final

Você pode criar MCP servers para **QUALQUER** API:
- 📧 SendGrid (emails)
- 💳 Stripe (pagamentos)
- 📊 Google Analytics
- 🔔 Slack/Discord
- 📱 Twilio (SMS)
- 🗓️ Google Calendar
- 📦 Shopify
- ...e muito mais!

O limite é a sua criatividade! 🚀
