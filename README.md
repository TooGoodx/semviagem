# 🚀 API Visual Demo - React

Uma aplicação moderna de busca de voos construída com React, TypeScript e as mais recentes tecnologias web.

## ✨ Demo ao Vivo

**🌐 URL de Produção**: [https://extraordinary-starship-9103ce.netlify.app](https://extraordinary-starship-9103ce.netlify.app)

## 📋 Sobre o Projeto

Sistema completo de busca de voos integrado com a **API Moblix**, oferecendo:

- 🔍 **Busca de Voos em Tempo Real**
- 💰 **Comparação de Preços** (Dinheiro e Milhas)
- ✈️ **Múltiplas Companhias Aéreas**
- 📱 **Interface Responsiva e Moderna**
- 🔐 **Sistema de Autenticação**
- 📊 **Dashboard com Gráficos**

## 🛠️ Stack Tecnológico

### 🎨 **Frontend & Core**
- **React 19.1.1** - Framework JavaScript
- **TypeScript 5.8.3** - Tipagem estática
- **Vite 7.1.2** - Build tool ultra-rápido
- **React Router DOM 7.8.0** - Navegação SPA

### 🎯 **UI & Styling**
- **Tailwind CSS 4.1.11** - Framework CSS utility-first
- **Headless UI 2.2.7** - Componentes acessíveis
- **Heroicons 2.2.0** - Biblioteca de ícones SVG
- **React Hot Toast 2.5.2** - Notificações elegantes

### 📊 **Dados & Estado**
- **Zustand 5.0.7** - Gerenciamento de estado
- **Supabase 2.55.0** - Backend-as-a-Service
- **Axios 1.11.0** - Cliente HTTP
- **Chart.js 4.5.0** - Gráficos e visualizações

### 🌐 **Deploy & Infraestrutura**
- **Netlify** - Hosting e CI/CD
- **Netlify Functions** - Serverless backend
- **Netlify Edge Functions** - Edge computing

## 📦 Instalação

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env.local
   ```

3. **Execute o projeto:**
   ```bash
   npm run dev
   ```

## 🌟 Funcionalidades

### ✅ Páginas Migradas
- **Home** - Landing page
- **Dashboard** - Painel administrativo
- **Flights** - Busca de voos
- **Hotels** - Busca de hotéis
- **Moblix Explorer** - Interface para API Moblix
- **Área Logada** - Área restrita

### ✅ Autenticação
- Login/Register completo
- Recuperação de senha
- Proteção de rotas
- Contexto global de auth

### ✅ Integração com APIs
- Supabase (banco + auth)
- Moblix API (voos)
- Express Backend

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase (para autenticação)

### 1. Clone o repositório
```bash
git clone https://github.com/Mytoogood/buscadorReact.git
cd buscadorReact
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Crie um arquivo .env.local com as credenciais atuais
VITE_SUPABASE_URL=https://vqflmhngywnbravitxxl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_SkNTS88mBZpTt7swmwgLgQ_6jWviV0z
```

### 4. Execute em desenvolvimento
```bash
npm run dev
```

### 5. Build para produção
```bash
npm run build
```

## 📚 Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run preview    # Preview do build
npm run lint       # Verificação de código
```

## 🔌 Integração com APIs

### API Moblix
- Busca de voos em tempo real
- Múltiplas companhias aéreas
- Preços em dinheiro e milhas
- Dados atualizados automaticamente

### Supabase
- Autenticação de usuários
- Banco de dados PostgreSQL
- Real-time subscriptions

## 📱 Funcionalidades Principais

### ✈️ **Busca de Voos**
- Pesquisa por origem, destino e data
- Filtros por companhia aérea
- Ordenação por preço ou tempo
- Suporte a ida e volta

### 💰 **Comparação de Preços**
- Preços em reais (R$)
- Preços em milhas
- Filtros por tipo de pagamento
- Melhor preço destacado

### 👥 **Sistema de Usuários**
- Cadastro e login
- Perfil do usuário
- Histórico de buscas
- Dashboard personalizado

### 📊 **Analytics**
- Gráficos de preços
- Estatísticas de busca
- Tendências de voos
- Relatórios visuais

## 🏗️ Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── services/      # Serviços e APIs
├── hooks/         # Custom hooks React
├── utils/         # Utilitários e helpers
├── types/         # Definições TypeScript
└── styles/        # Arquivos de estilo

netlify/
├── functions/     # Serverless functions
└── edge-functions/ # Edge functions
```

## 🔧 Configurações Avançadas

### Proxy de Desenvolvimento
```javascript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://api.moblix.com.br',
      changeOrigin: true,
      secure: false
    }
  }
}
```

### Deploy na Netlify
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido por **Felipe** - Sistema de busca de voos profissional

## 🆘 Suporte

Para suporte e dúvidas:
- 📧 **Email**: Entre em contato através do GitHub
- 🐛 **Issues**: [GitHub Issues](https://github.com/Mytoogood/buscadorReact/issues)
- 📖 **Documentação**: Este README

## 🔄 Migração Vue → React

| Vue | React |
|-----|-------|
| `<template>` | JSX |
| `ref()`, `reactive()` | `useState()` |
| `computed()` | `useMemo()` |
| `onMounted()` | `useEffect()` |
| Pinia | Zustand |
| Vue Router | React Router DOM |

---

⭐ **Se este projeto foi útil, não esqueça de dar uma estrela no GitHub!**

**Migrado por**: Felipe  
**Cliente**: Júlio Martins - Especialista em Milhas  
**Data**: Janeiro 2025
