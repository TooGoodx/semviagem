# Integração Stripe - Sem Viagem

## Configuração Completa

### 1. Estrutura Implementada

```
src/
├── config/
│   └── stripe.ts          # Configurações do Stripe
├── lib/
│   └── stripe.ts          # Funções utilitárias do Stripe
├── components/
│   └── StripeCheckout.tsx # Componente de checkout
├── pages/
│   ├── CheckoutDemo.tsx   # Página de demonstração
│   ├── Success.tsx        # Página de sucesso
│   └── Cancel.tsx         # Página de cancelamento
└── services/
    └── webhook.ts         # Handlers de webhook

server/
├── index.js              # Servidor Express para webhooks
└── package.json          # Dependências do servidor
```

### 2. Chaves Configuradas

- **Public Key**: `pk_live_51OyFRwRtN3YwSDWnX7l0Nh8lRCDijNack0r4becarAP3naafshFTGnDcNz7STR4q5iPcz1hX41fsE8770BhzGb1Q00TExFo0kt`
- **Price ID**: `price_1RfmLZRtN3YwSDWn5pXFxsGQ`
- **Domain ID**: `pmd_1Rx5lSRtN3YwSDWnWAvnPqt3`
- **Webhook Secret**: `whsec_M5gEbLtXtwvWNPU8vpmDG7X0xlXbibYx`

### 3. URLs de Redirecionamento

- **Sucesso**: `https://semviagem.com/success`
- **Cancelamento**: `https://semviagem.com/cancel`
- **Webhook**: `https://www.semviagem.com/stripe-checkout`

### 4. Como Usar

#### Iniciar o Servidor Backend
```bash
cd server
npm start
```

#### Iniciar o Frontend
```bash
npm run dev
```

#### Testar o Checkout
1. Acesse `http://localhost:5173/checkout`
2. Clique em "Assinar Agora"
3. Será redirecionado para o Stripe Checkout

### 5. Eventos de Webhook Configurados

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `invoice.paid`
- `invoice.payment_failed`

### 6. Componente de Uso

```tsx
import StripeCheckout from '../components/StripeCheckout';

// Uso básico
<StripeCheckout>Comprar Agora</StripeCheckout>

// Com customização
<StripeCheckout className="w-full bg-green-600">
  Assinar Premium - R$ 29,90/mês
</StripeCheckout>
```

### 7. Configuração do Stripe CLI (Para Desenvolvimento)

```bash
# Login no Stripe
stripe login

# Escutar webhooks localmente
stripe listen --forward-to localhost:3001/webhook

# Testar eventos
stripe trigger checkout.session.completed
```

### 8. Deploy em Produção

1. Configure as variáveis de ambiente no servidor
2. Atualize as URLs no arquivo `stripe.ts`
3. Configure o webhook endpoint no dashboard do Stripe
4. Teste o fluxo completo

### 9. Segurança

- ✅ Chave secreta armazenada apenas no backend
- ✅ Verificação de assinatura do webhook
- ✅ Validação de eventos do Stripe
- ✅ CORS configurado adequadamente

### 10. Próximos Passos

- [ ] Integrar com banco de dados para salvar assinaturas
- [ ] Implementar sistema de usuários
- [ ] Adicionar notificações por email
- [ ] Configurar logs de auditoria
- [ ] Implementar retry logic para webhooks
