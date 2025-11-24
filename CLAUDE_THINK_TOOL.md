# Claude Think Tool - Guia de Implementação

Esta implementação é baseada no artigo oficial da Anthropic: [Claude Think Tool](https://www.anthropic.com/engineering/claude-think-tool)

## O que é o Think Tool?

O **Think Tool** permite que o Claude pause durante a geração de resposta para realizar raciocínio estruturado. Diferentemente do "extended thinking" (que ocorre antes da resposta), o think tool opera **durante** a geração para ajudar o Claude a processar novas informações de outputs de ferramentas.

### Diferenças Principais

| Extended Thinking | Think Tool |
|------------------|------------|
| Ocorre antes da resposta | Ocorre durante a resposta |
| Melhor para cenários simples | Ideal para cadeias de ferramentas complexas |
| Bom para código, matemática, física | Excelente para conformidade de políticas |

## Quando Usar

### Cenários Ideais
- ✅ Análise de output de ferramentas que requer processamento cuidadoso
- ✅ Ambientes com muitas políticas e requisitos de conformidade
- ✅ Tomada de decisões sequenciais onde erros são custosos
- ✅ Avaliação de trade-offs entre diferentes opções

### Quando Evitar
- ❌ Chamadas de ferramentas únicas ou paralelas simples
- ❌ Seguimento de instruções simples com poucas restrições
- ❌ Tarefas diretas sem necessidade de análise complexa

## Resultados de Performance

Baseado nos benchmarks da Anthropic com Claude 3.7 Sonnet:

### τ-Bench Evaluation
- **Domínio Airline**: 54% de melhoria relativa (0.370 → 0.570)
- **Domínio Retail**: Score de 0.812 (vs. 0.783 baseline)

### SWE-Bench
- **Melhoria média**: 1.6% (estatisticamente significativa)

## Estrutura do Projeto

```
src/
├── types/
│   └── claude-think.ts          # Definições de tipos TypeScript
├── services/
│   └── claudeThinkService.ts    # Serviço principal da API
├── hooks/
│   └── useClaudeThink.ts        # Hook React customizado
└── pages/
    └── ClaudeThinkDemo.tsx      # Página de demonstração
```

## Uso Básico

### 1. Importar e Configurar

```typescript
import { useClaudeThink } from './hooks/useClaudeThink';

function MyComponent() {
  const {
    sendMessage,
    response,
    thinkLogs,
    isLoading,
    error,
  } = useClaudeThink({
    apiKey: 'sua-chave-api-aqui',
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4096,
    systemPrompt: `Você é um assistente útil com acesso a uma ferramenta "think".
Use a ferramenta think para pausar e raciocinar cuidadosamente quando necessário.`,
  });

  // Usar o hook...
}
```

### 2. Enviar Mensagem

```typescript
await sendMessage('Analise os prós e contras de microserviços vs monolito');
```

### 3. Acessar Resultados

```typescript
// Resposta final do Claude
console.log(response);

// Logs de pensamento
thinkLogs.forEach(log => {
  console.log(`[${log.timestamp}] ${log.thought}`);
});
```

## Uso Direto do Serviço (sem React)

```typescript
import { ClaudeThinkService } from './services/claudeThinkService';

const service = new ClaudeThinkService('sua-chave-api-aqui');

const result = await service.chat('Sua pergunta aqui', {
  model: 'claude-3-5-sonnet-20241022',
  maxTokens: 4096,
  systemPrompt: 'Seu prompt do sistema...',
});

console.log('Resposta:', result.response);
console.log('Pensamentos:', result.thinkLogs);
```

## Definição da Ferramenta

O think tool usa a seguinte especificação JSON:

```json
{
  "name": "think",
  "description": "Use esta ferramenta para pausar e pensar cuidadosamente sobre as informações recebidas...",
  "input_schema": {
    "type": "object",
    "properties": {
      "thought": {
        "type": "string",
        "description": "Seu processo de raciocínio, análise ou deliberação sobre a situação atual."
      }
    },
    "required": ["thought"]
  }
}
```

## Melhores Práticas

### 1. Prompting Estratégico
Forneça exemplos específicos do domínio mostrando padrões de raciocínio:

```typescript
const systemPrompt = `Você é um especialista em segurança de APIs.

Ao analisar implementações de segurança, use o think tool para:
1. Avaliar cada camada de segurança separadamente
2. Identificar potenciais vulnerabilidades
3. Considerar cenários de ataque
4. Validar conformidade com OWASP Top 10

Exemplo de raciocínio:
- "Estou vendo autenticação JWT. Preciso verificar: armazenamento seguro, tempo de expiração, algoritmo de assinatura..."
`;
```

### 2. Colocação no System Prompt
Coloque orientações complexas no system prompt ao invés da descrição da ferramenta.

### 3. Monitoramento
Acompanhe padrões de uso e refine prompts iterativamente:

```typescript
// Analise os think logs para entender o padrão de raciocínio
const avgThoughts = thinkLogs.length;
const avgThoughtLength = thinkLogs.reduce((acc, log) =>
  acc + log.thought.length, 0) / thinkLogs.length;

console.log(`Média de pensamentos: ${avgThoughts}`);
console.log(`Tamanho médio: ${avgThoughtLength} caracteres`);
```

## Executar a Demo

1. **Instalar dependências** (se necessário):
```bash
npm install
```

2. **Adicionar rota no seu router** (se usando React Router):
```typescript
import ClaudeThinkDemo from './pages/ClaudeThinkDemo';

// No seu App.tsx ou router
<Route path="/claude-think-demo" element={<ClaudeThinkDemo />} />
```

3. **Acessar a demo**:
```
http://localhost:5173/claude-think-demo
```

4. **Inserir sua API Key**:
- Obtenha uma chave em: https://console.anthropic.com/
- A chave é usada apenas localmente e não é armazenada

## API Reference

### `ClaudeThinkService`

#### Constructor
```typescript
new ClaudeThinkService(apiKey: string)
```

#### Métodos

##### `chat(userMessage, options)`
Realiza uma conversa completa com gerenciamento automático do think tool.

**Parâmetros:**
- `userMessage` (string): Mensagem do usuário
- `options` (objeto opcional):
  - `conversationHistory`: Histórico anterior
  - `model`: Modelo a usar (padrão: claude-3-5-sonnet-20241022)
  - `maxTokens`: Limite de tokens (padrão: 4096)
  - `systemPrompt`: Prompt do sistema
  - `maxRounds`: Máximo de rodadas de pensamento (padrão: 10)

**Retorna:**
```typescript
{
  response: string;
  thinkLogs: ThinkToolLog[];
  fullConversation: ClaudeMessage[];
}
```

##### `getThinkLogs()`
Retorna os logs de pensamento atuais.

##### `clearThinkLogs()`
Limpa os logs de pensamento.

### `useClaudeThink` Hook

**Parâmetros:**
```typescript
{
  apiKey: string;
  model?: string;
  maxTokens?: number;
  systemPrompt?: string;
  maxRounds?: number;
}
```

**Retorna:**
```typescript
{
  sendMessage: (message: string) => Promise<void>;
  response: string | null;
  thinkLogs: ThinkToolLog[];
  conversationHistory: ClaudeMessage[];
  isLoading: boolean;
  error: Error | null;
  clearConversation: () => void;
}
```

## Tipos TypeScript

Todos os tipos estão disponíveis em `src/types/claude-think.ts`:

- `ThinkToolDefinition`: Definição da ferramenta
- `ThinkToolInput`: Input da ferramenta
- `ThinkToolResult`: Resultado da ferramenta
- `ClaudeMessage`: Mensagem na conversa
- `ClaudeRequest`: Request para a API
- `ClaudeResponse`: Response da API
- `ThinkToolLog`: Log de pensamento

## Troubleshooting

### Erro: "API key not valid"
- Verifique se sua chave está correta
- Confirme que tem créditos na sua conta Anthropic

### Erro: "Maximum rounds exceeded"
- O Claude pode estar preso em um loop de pensamento
- Reduza `maxRounds` ou ajuste o system prompt
- Verifique se a pergunta não é ambígua demais

### Think tool não está sendo usado
- Adicione mais complexidade ao cenário
- Ajuste o system prompt para encorajar uso
- Use perguntas que requerem análise multi-etapa

## Exemplos de Uso

### Análise de Segurança
```typescript
await sendMessage(`
Analise esta implementação de autenticação:
- JWT com expiração de 24h
- Refresh token armazenado em cookie httpOnly
- Rate limiting de 5 req/min
- CORS habilitado para qualquer origem

Identifique vulnerabilidades e sugira melhorias.
`);
```

### Decisão Arquitetural
```typescript
await sendMessage(`
Preciso escolher entre:
1. Lambda + API Gateway (serverless)
2. ECS Fargate (containers)
3. EC2 com auto-scaling

Contexto:
- Tráfego: 10k req/dia com picos de 2x
- Orçamento: $500/mês
- Time: 3 devs júnior
- Prazo: 3 meses

Analise cada opção considerando custo, complexidade e manutenção.
`);
```

## Limitações

1. **Custo**: Cada pensamento consome tokens adicionais
2. **Latência**: O processo de think adiciona tempo à resposta
3. **Rounds**: Limite de 10 rounds por padrão para evitar loops
4. **Rate Limits**: Respeite os limites da API da Anthropic

## Recursos Adicionais

- [Artigo Original da Anthropic](https://www.anthropic.com/engineering/claude-think-tool)
- [Documentação da API Claude](https://docs.anthropic.com/)
- [Console Anthropic](https://console.anthropic.com/)

## Licença

Este código é fornecido como exemplo educacional baseado na documentação pública da Anthropic.
