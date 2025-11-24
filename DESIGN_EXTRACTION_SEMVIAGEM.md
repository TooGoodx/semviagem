# 🎨 EXTRAÇÃO COMPLETA DE DESIGN - PROJETO SEMVIAGEM

**Data de Extração:** 2025-10-20
**Projeto:** SemViagem - Plataforma de Busca de Voos
**URL Analisada:** http://localhost:5173/
**Viewport:** Desktop 1920x1080

---

## 📋 ÍNDICE

1. [Estrutura Geral](#1-estrutura-geral)
2. [Paleta de Cores Completa](#2-paleta-de-cores-completa)
3. [Tipografia](#3-tipografia)
4. [Buscador de Voos (Prioridade Máxima)](#4-buscador-de-voos-prioridade-máxima)
5. [Componentes Principais](#5-componentes-principais)
6. [Cards de Features](#6-cards-de-features)
7. [Seção de Impacto Social](#7-seção-de-impacto-social)
8. [Seção de Companhias Aéreas](#8-seção-de-companhias-aéreas)
9. [FAQ Section](#9-faq-section)
10. [Seção de Contato](#10-seção-de-contato)
11. [Espaçamento e Grid System](#11-espaçamento-e-grid-system)
12. [Iconografia](#12-iconografia)
13. [Micro-interações e Estados](#13-micro-interações-e-estados)
14. [Responsividade](#14-responsividade)
15. [Padrões de Design](#15-padrões-de-design)

---

## 1️⃣ ESTRUTURA GERAL

### Layout Principal

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER/NAVBAR (fixo no topo)                                │
│ - Logo (esquerda)                                           │
│ - Menu de navegação (centro/direita)                       │
│ - Botões CTA (direita)                                     │
├─────────────────────────────────────────────────────────────┤
│ HERO SECTION                                                │
│ - Background: Imagem de cidade italiana (colorida)         │
│ - Overlay escuro semi-transparente                         │
│ - Título principal: "SemViagem" (bicolor)                  │
│ - Subtítulo explicativo                                    │
│ - Card de busca de voos (branco, centralizado)            │
├─────────────────────────────────────────────────────────────┤
│ FEATURES SECTION (3 cards horizontais)                      │
│ - Fundo branco                                             │
│ - 3 cards com ilustrações e CTAs amarelos                  │
├─────────────────────────────────────────────────────────────┤
│ IMPACTO SOCIAL SECTION                                      │
│ - Fundo cinza claro                                        │
│ - 3 cards de estatísticas                                  │
│ - Números grandes em azul/amarelo                          │
├─────────────────────────────────────────────────────────────┤
│ COMPANHIAS AÉREAS                                           │
│ - Fundo branco                                             │
│ - Logos de companhias em linha                             │
├─────────────────────────────────────────────────────────────┤
│ FAQ SECTION                                                 │
│ - Fundo branco                                             │
│ - Accordion/collapse items                                 │
├─────────────────────────────────────────────────────────────┤
│ CONTATO SECTION                                             │
│ - Fundo branco                                             │
│ - Split layout: Info (esquerda) + Formulário (direita)    │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
│ (não visível nas screenshots)                              │
└─────────────────────────────────────────────────────────────┘
```

### Hierarquia Visual
- ✅ Header fixo no topo (sempre visível)
- ✅ Hero com altura de ~70vh (viewport height)
- ✅ Seções com padding vertical generoso (80-120px)
- ✅ Containers centralizados com max-width ~1200px
- ✅ Espaçamento consistente entre seções

---

## 2️⃣ PALETA DE CORES COMPLETA

### Cores Primárias

| Nome | HEX | RGB | Uso Principal | Observação |
|------|-----|-----|---------------|------------|
| **Amarelo Principal** | `#FDB913` | `rgb(253, 185, 19)` | Botões CTA, destaques, números | Cor de identidade principal |
| **Azul Céu** | `#5DADE2` | `rgb(93, 173, 226)` | Título "Sem" do logo, números de impacto | Complementar ao amarelo |
| **Azul Escuro** | `#2C3E50` | `rgb(44, 62, 80)` | Textos de corpo, títulos secundários | Alta legibilidade |
| **Cinza Escuro** | `#3D4852` | `rgb(61, 72, 82)` | Textos descritivos, labels | Contraste médio |
| **Cinza Claro** | `#E5E7EB` | `rgb(229, 231, 235)` | Fundo de seções alternadas | Background suave |
| **Branco** | `#FFFFFF` | `rgb(255, 255, 255)` | Cards, inputs, fundo principal | Base limpa |

### Cores Secundárias

| Nome | HEX | RGB | Uso |
|------|-----|-----|-----|
| **Cinza Médio** | `#9CA3AF` | `rgb(156, 163, 175)` | Placeholders, textos secundários |
| **Cinza Borda** | `#D1D5DB` | `rgb(209, 213, 219)` | Bordas de inputs, separadores |
| **Amarelo Hover** | `#F0B429` | `rgb(240, 180, 41)` | Hover state de botões amarelos |
| **Azul Button** | `#4A9FD8` | `rgb(74, 159, 216)` | Botão "Somente ida" |

### Cores de Overlay/Transparências

| Nome | Valor | Uso |
|------|-------|-----|
| **Overlay Hero** | `rgba(0, 0, 0, 0.5)` ou `rgba(44, 62, 80, 0.6)` | Escurecimento sobre imagem de fundo |
| **Shadow Card** | `rgba(0, 0, 0, 0.1)` | Box-shadow dos cards |
| **Border Subtle** | `rgba(0, 0, 0, 0.05)` | Bordas muito sutis |

### Uso de Cores por Contexto

**Botões:**
- Primário (CTA): `#FDB913` (amarelo)
- Secundário: `#4A9FD8` (azul)
- Hover primário: `#F0B429` (amarelo escuro)

**Textos:**
- Títulos principais: `#2C3E50` (azul escuro)
- Corpo: `#3D4852` (cinza escuro)
- Secundário/descrição: `#9CA3AF` (cinza médio)
- Placeholders: `#9CA3AF` (cinza médio)

**Backgrounds:**
- Seções principais: `#FFFFFF` (branco)
- Seções alternadas: `#E5E7EB` (cinza claro)
- Cards: `#FFFFFF` (branco)
- Hero: Imagem + overlay escuro

---

## 3️⃣ TIPOGRAFIA

### Família de Fontes

**Fonte Principal:** Provavelmente **Inter** ou **System UI/Sans-serif stack**

Baseado na análise visual, a fonte aparenta ser:
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

### Escala Tipográfica

| Elemento | Tamanho (px) | Tamanho (rem) | Peso (font-weight) | Line-height | Cor | Uso |
|----------|-------------|---------------|-------------------|-------------|-----|-----|
| **Logo (marca)** | 18px | 1.125rem | 700 (Bold) | 1.2 | `#2C3E50` | Logo "sem viagem" |
| **Hero Title** | 64px | 4rem | 700 (Bold) | 1.1 | `#5DADE2` + `#FDB913` | "SemViagem" |
| **Hero Subtitle** | 18px | 1.125rem | 400 (Regular) | 1.6 | `#FFFFFF` | Texto abaixo do título |
| **H2 (Seções)** | 36px | 2.25rem | 700 (Bold) | 1.2 | `#2C3E50` | "Enquanto você viaja..." |
| **H3 (Cards)** | 20px | 1.25rem | 700 (Bold) | 1.3 | `#2C3E50` | Títulos de cards |
| **Body Large** | 16px | 1rem | 400 (Regular) | 1.6 | `#3D4852` | Descrições de cards |
| **Body Regular** | 14px | 0.875rem | 400 (Regular) | 1.5 | `#3D4852` | Textos gerais |
| **Small Text** | 12px | 0.75rem | 400 (Regular) | 1.4 | `#9CA3AF` | Legendas, notas |
| **Button Text** | 16px | 1rem | 600 (Semibold) | 1.2 | `#2C3E50` | Texto de botões |
| **Input Text** | 14px | 0.875rem | 400 (Regular) | 1.4 | `#2C3E50` | Texto digitado |
| **Placeholder** | 14px | 0.875rem | 400 (Regular) | 1.4 | `#9CA3AF` | Placeholders |
| **Stats Numbers** | 48px | 3rem | 700 (Bold) | 1.1 | `#5DADE2` / `#FDB913` | "150+", "50k+", "R$ 2M+" |

### Peso de Fontes Utilizados

```css
font-weight: 400; /* Regular - textos corpo */
font-weight: 600; /* Semibold - botões, destaques */
font-weight: 700; /* Bold - títulos, números */
```

### Letter Spacing

```css
/* Títulos grandes */
letter-spacing: -0.02em; /* -0.32px em 16px */

/* Títulos H2/H3 */
letter-spacing: -0.01em; /* -0.2px */

/* Corpo de texto */
letter-spacing: normal; /* 0 */

/* Botões */
letter-spacing: 0.01em; /* 0.16px */
```

---

## 4️⃣ BUSCADOR DE VOOS (PRIORIDADE MÁXIMA)

### Estrutura Visual

```
┌────────────────────────────────────────────────────────────┐
│  Card Branco Centralizado                                  │
│  (Posicionado sobre o Hero com overlay)                    │
│                                                            │
│  Para onde você quer ir?                                   │
│                                                            │
│  [◯ Ida e volta]  [◯ Somente ida]                         │
│                                                            │
│  De                              Para                      │
│  [📍 Insira uma origem]          [✈️ Insira um destino]   │
│                                                            │
│  (Continuação abaixo - data, passageiros, buscar)         │
└────────────────────────────────────────────────────────────┘
```

### Card do Buscador

**Dimensões e Espaçamento:**
```css
width: 90%; /* ou ~1100px max */
max-width: 1100px;
background-color: #FFFFFF;
border-radius: 16px;
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
padding: 40px 48px;
margin: 0 auto;
position: relative; /* ou absolute no hero */
top: -80px; /* "flutua" sobre o hero */
```

### Título do Buscador

**"Para onde você quer ir?"**

```css
font-size: 24px; /* 1.5rem */
font-weight: 700;
color: #2C3E50;
margin-bottom: 24px;
line-height: 1.3;
```

### Botões de Tipo de Viagem

#### Estrutura
Dois botões radio/toggle:
1. "✓ Ida e volta" (ativo por padrão)
2. "Somente ida"

#### Estado Normal (Não selecionado)
```css
background-color: transparent;
border: 2px solid #D1D5DB;
border-radius: 24px; /* pill shape */
padding: 10px 24px;
font-size: 14px;
font-weight: 600;
color: #3D4852;
cursor: pointer;
transition: all 0.2s ease;
```

#### Estado Ativo (Selecionado)
```css
/* Ida e volta (amarelo) */
background-color: #FDB913;
border: 2px solid #FDB913;
color: #2C3E50;

/* Somente ida (azul) */
background-color: #4A9FD8;
border: 2px solid #4A9FD8;
color: #FFFFFF;
```

#### Ícone do Check
```css
/* Checkmark antes do texto */
content: '✓';
margin-right: 6px;
font-weight: 700;
```

### Campos de Input (Origem e Destino)

#### Container dos Inputs
```css
display: grid;
grid-template-columns: 1fr 1fr; /* 2 colunas iguais */
gap: 24px;
margin-top: 24px;
```

#### Label dos Inputs
**"De" e "Para"**

```css
font-size: 14px;
font-weight: 600;
color: #2C3E50;
margin-bottom: 8px;
display: block;
```

#### Input Field (Origem)

**Visual:**
- Ícone: 📍 (pin de localização) - cinza médio
- Placeholder: "Insira uma origem"

```css
/* Container do input */
position: relative;
width: 100%;

/* Input em si */
width: 100%;
padding: 14px 16px 14px 44px; /* espaço para ícone */
font-size: 14px;
font-weight: 400;
color: #2C3E50;
background-color: #FFFFFF;
border: 1.5px solid #D1D5DB;
border-radius: 8px;
transition: all 0.2s ease;

/* Placeholder */
::placeholder {
  color: #9CA3AF;
  font-weight: 400;
}

/* Ícone dentro do input */
.icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9CA3AF;
}
```

#### Input Field (Destino)

**Visual:**
- Ícone: ✈️ (avião) - cinza médio
- Placeholder: "Insira um destino"

```css
/* Mesmas propriedades do input de origem */
/* Apenas o ícone muda */
```

### Estados dos Inputs

#### Normal (Default)
```css
border: 1.5px solid #D1D5DB;
background-color: #FFFFFF;
```

#### Focus (Focado)
```css
border: 1.5px solid #FDB913;
outline: none;
box-shadow: 0 0 0 3px rgba(253, 185, 19, 0.1);
```

#### Hover
```css
border-color: #9CA3AF;
```

#### Error (se houver)
```css
border: 1.5px solid #EF4444; /* vermelho */
```

#### Filled (Preenchido)
```css
border: 1.5px solid #10B981; /* verde sutil */
color: #2C3E50;
font-weight: 500;
```

### Campos Adicionais (Não visíveis na screenshot mas inferidos)

Baseado na estrutura típica de buscadores:

#### Data de Ida
```css
/* Similar aos inputs anteriores */
/* Ícone: 📅 calendário */
padding: 14px 16px 14px 44px;
```

#### Data de Volta
```css
/* Desabilitado quando "Somente ida" selecionado */
opacity: 0.5;
cursor: not-allowed;
```

#### Passageiros
```css
/* Dropdown/select */
/* Ícone: 👤 pessoa */
```

#### Classe (Econômica/Executiva)
```css
/* Dropdown/select */
/* Ícone: 💺 assento */
```

### Botão de Busca (CTA Principal)

**Texto:** "Buscar Voos" ou "Buscar"

#### Dimensões
```css
width: 100%; /* ou auto com padding generoso */
max-width: 300px;
height: 56px;
margin-top: 32px;
```

#### Estilo Normal
```css
background-color: #FDB913;
color: #2C3E50;
font-size: 16px;
font-weight: 700;
border: none;
border-radius: 12px;
padding: 16px 48px;
cursor: pointer;
box-shadow: 0 4px 12px rgba(253, 185, 19, 0.3);
transition: all 0.3s ease;
text-transform: uppercase; /* possivelmente */
letter-spacing: 0.5px;
```

#### Hover
```css
background-color: #F0B429; /* amarelo mais escuro */
transform: translateY(-2px);
box-shadow: 0 8px 20px rgba(253, 185, 19, 0.4);
```

#### Active (Clicado)
```css
transform: translateY(0);
box-shadow: 0 2px 8px rgba(253, 185, 19, 0.3);
```

#### Disabled
```css
background-color: #E5E7EB;
color: #9CA3AF;
cursor: not-allowed;
box-shadow: none;
```

### Responsividade do Buscador

#### Tablet (< 1024px)
```css
.search-card {
  padding: 32px 24px;
}

.input-grid {
  grid-template-columns: 1fr; /* 1 coluna */
  gap: 16px;
}
```

#### Mobile (< 768px)
```css
.search-card {
  width: 95%;
  padding: 24px 20px;
  border-radius: 12px;
}

.title {
  font-size: 20px;
}

.trip-type-buttons {
  flex-direction: column;
  gap: 12px;
}
```

---

## 5️⃣ COMPONENTES PRINCIPAIS

### 5.1 Header/Navbar

#### Estrutura
```
┌────────────────────────────────────────────────────────────┐
│ [Logo] Buscar | Sobre Nós | Impacto Social | FAQ | Contato │ Entrar [Cadastrar-se] │
└────────────────────────────────────────────────────────────┘
```

#### Container
```css
position: fixed; /* ou sticky */
top: 0;
left: 0;
right: 0;
z-index: 1000;
background-color: #FFFFFF;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
height: 72px;
padding: 0 48px;
```

#### Logo

**Visual:** Círculo amarelo com ícone + texto "sem viagem"

```css
/* Container do logo */
display: flex;
align-items: center;
gap: 12px;

/* Círculo do ícone */
width: 48px;
height: 48px;
background-color: #FDB913;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;

/* Ícone dentro (parece ser símbolo de avião/viagem) */
color: #2C3E50;
font-size: 24px;

/* Texto do logo */
font-size: 18px;
font-weight: 700;
color: #2C3E50;
line-height: 1.2;
/* Duas linhas: "sem" em cima, "viagem" embaixo */
```

#### Links de Navegação

```css
/* Container dos links */
display: flex;
align-items: center;
gap: 32px;

/* Cada link */
font-size: 14px;
font-weight: 500;
color: #2C3E50;
text-decoration: none;
padding: 8px 0;
position: relative;
transition: color 0.2s ease;

/* Hover */
color: #FDB913;

/* Underline animado (opcional) */
&::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #FDB913;
  transition: width 0.3s ease;
}

&:hover::after {
  width: 100%;
}
```

#### Botão "Entrar" (Texto)

```css
font-size: 14px;
font-weight: 600;
color: #2C3E50;
background: transparent;
border: none;
padding: 8px 16px;
cursor: pointer;

/* Hover */
color: #FDB913;
```

#### Botão "Cadastrar-se" (CTA)

```css
background-color: #FDB913;
color: #2C3E50;
font-size: 14px;
font-weight: 700;
padding: 12px 28px;
border-radius: 8px;
border: none;
cursor: pointer;
transition: all 0.2s ease;

/* Hover */
background-color: #F0B429;
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(253, 185, 19, 0.3);
```

### 5.2 Hero Section

#### Container
```css
height: 75vh;
min-height: 600px;
position: relative;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 120px 24px 180px; /* espaço para card flutuante */
overflow: hidden;
```

#### Background Image
```css
background-image: url('hero-italian-city.jpg');
background-size: cover;
background-position: center;
background-repeat: no-repeat;
```

#### Overlay Escuro
```css
&::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(44, 62, 80, 0.7) 0%,
    rgba(44, 62, 80, 0.5) 100%
  );
  /* ou */
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}
```

#### Título "SemViagem"

**Visual:** "Sem" em azul + "Viagem" em amarelo

```css
/* Container */
position: relative;
z-index: 2;
margin-bottom: 24px;
text-align: center;

/* Estilo do texto */
font-size: 64px; /* ~4rem */
font-weight: 700;
line-height: 1.1;
letter-spacing: -0.02em;

/* "Sem" */
.blue-text {
  color: #5DADE2;
}

/* "Viagem" */
.yellow-text {
  color: #FDB913;
}
```

#### Subtítulo Hero

**Texto:** "Sem truques, sem tarifas escondidas. Nosso propósito é simples: democratizar viagens, com transparência total e preço honesto para todos os brasileiros."

```css
position: relative;
z-index: 2;
max-width: 800px;
text-align: center;
font-size: 18px;
font-weight: 400;
color: #FFFFFF;
line-height: 1.6;
margin-bottom: 60px;
```

---

## 6️⃣ CARDS DE FEATURES

### Estrutura Geral

**Layout:** 3 cards horizontais em grid

```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 32px;
padding: 80px 48px;
max-width: 1200px;
margin: 0 auto;
```

### Card Individual

#### Container
```css
background-color: #FFFFFF;
border-radius: 16px;
padding: 40px 32px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
transition: all 0.3s ease;
text-align: center;
display: flex;
flex-direction: column;
align-items: center;

/* Hover */
&:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}
```

#### Ilustração

**Visual:** Ilustrações coloridas no estilo line-art com amarelo

```css
width: 180px;
height: 180px;
margin-bottom: 32px;
/* Ilustrações SVG ou imagens */
```

**Temas das ilustrações:**
1. Pessoa com mapa (busca)
2. Pessoa com celular/notificação (avisos)
3. Duas pessoas juntas (agente/guia)

#### Título do Card
```css
font-size: 20px;
font-weight: 700;
color: #2C3E50;
line-height: 1.3;
margin-bottom: 16px;
```

**Textos:**
1. "Voe alto com suas milhas. Nós encontramos a melhor viagem para você!"
2. "Receba avisos que vão fazer bem ao seu bolso!"
3. "Sua viagem, orquestrada por IA. Como um agente de viagens e guia de bolso!"

#### Descrição do Card
```css
font-size: 14px;
font-weight: 400;
color: #9CA3AF;
line-height: 1.6;
margin-bottom: 32px;
flex-grow: 1; /* empurra botão para baixo */
```

**Textos:**
1. "Busque voos com milhas ou dinheiro real em um só lugar. Sem taxas escondidas ou truques, apenas um bom preço."
2. "Cadastre seu destino e data. Assim que o preço cair, você receberá um alerta direto no WhatsApp. É fácil e simples, posso te avisar?"
3. "Escolha destino, período, experiências e orçamento. O Plan&Go cuida do resto. Seja roteiro, hospedagem, passagem e etc... com um agente pessoal de IA"

#### Botão CTA do Card

```css
width: 100%;
background-color: #FDB913;
color: #2C3E50;
font-size: 14px;
font-weight: 700;
padding: 14px 24px;
border-radius: 10px;
border: none;
cursor: pointer;
transition: all 0.2s ease;
text-align: center;

/* Hover */
background-color: #F0B429;
transform: scale(1.02);
```

**Textos dos botões:**
1. "Quero Milhas na Mão"
2. "Quero usar o Avisa!"
3. "Entre para a VIP list!"

#### Texto Secundário (abaixo do botão)
```css
font-size: 12px;
font-weight: 400;
color: #9CA3AF;
margin-top: 12px;
```

**Textos:**
1. "Acesso completo por R$ 29,90/mês"
2. "Lançamento em breve, garanta acesso antecipado"

---

## 7️⃣ SEÇÃO DE IMPACTO SOCIAL

### Container da Seção

```css
background-color: #E5E7EB; /* cinza claro */
padding: 80px 48px;
text-align: center;
```

### Título da Seção

**Texto:** "Enquanto você viaja, você ajuda na educação das nossas crianças!"

```css
font-size: 36px; /* 2.25rem */
font-weight: 700;
color: #2C3E50;
line-height: 1.2;
max-width: 900px;
margin: 0 auto 60px;
```

### Grid de Estatísticas

```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 40px;
max-width: 1100px;
margin: 0 auto 40px;
```

### Card de Estatística

```css
background-color: #FFFFFF;
border-radius: 16px;
padding: 48px 32px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
text-align: center;
border-bottom: 4px solid #FDB913; /* borda amarela embaixo */
transition: all 0.3s ease;

/* Hover */
&:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
```

### Número Grande (Estatística)

**Valores:** "150+", "50k+", "R$ 2M+"

```css
font-size: 48px; /* 3rem */
font-weight: 700;
line-height: 1.1;
margin-bottom: 12px;

/* Cores alternadas */
/* Card 1 (150+) */
color: #5DADE2; /* azul */

/* Card 2 (50k+) */
color: #FDB913; /* amarelo */

/* Card 3 (R$ 2M+) */
color: #5DADE2; /* azul */
```

### Label da Estatística

**Textos:** "Projetos Apoiados", "Vidas Impactadas", "Investidos em Comunidades"

```css
font-size: 16px;
font-weight: 600;
color: #3D4852;
line-height: 1.4;
```

### Texto Explicativo (abaixo dos cards)

**Texto:** "Cada passagem comprada contribui diretamente para projetos que transformam vidas"

```css
font-size: 16px;
font-weight: 400;
color: #3D4852;
line-height: 1.6;
max-width: 700px;
margin: 0 auto;
```

---

## 8️⃣ SEÇÃO DE COMPANHIAS AÉREAS

### Container

```css
background-color: #FFFFFF;
padding: 60px 48px;
text-align: center;
```

### Título

**Texto:** "As melhores cias aéreas, 15 países, 127 aeroportos e continuamos adicionando destinos!"

```css
font-size: 24px;
font-weight: 700;
color: #2C3E50;
line-height: 1.4;
max-width: 900px;
margin: 0 auto 48px;
```

### Grid de Logos

```css
display: grid;
grid-template-columns: repeat(6, 1fr);
gap: 48px 32px;
align-items: center;
justify-items: center;
max-width: 1100px;
margin: 0 auto;
```

### Logo Individual

```css
width: auto;
height: 40px; /* altura consistente */
object-fit: contain;
filter: grayscale(100%);
opacity: 0.7;
transition: all 0.3s ease;

/* Hover */
&:hover {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.1);
}
```

**Companhias visíveis:**
1. LATAM Airlines
2. Azul (logo azul/laranja)
3. GOL
4. American Airlines
5. TAP Air Portugal
6. Copa Airlines
7. IBERIA
8. Interline Azul

---

## 9️⃣ FAQ SECTION

### Container

```css
background-color: #FFFFFF;
padding: 80px 48px;
text-align: center;
```

### Título

**Texto:** "FAQ Atualizado"

```css
font-size: 36px;
font-weight: 700;
color: #2C3E50;
margin-bottom: 16px;
```

### Subtítulo

**Texto:** "Tire suas dúvidas sobre nossa plataforma e serviços"

```css
font-size: 16px;
font-weight: 400;
color: #9CA3AF;
margin-bottom: 48px;
```

### Accordion Container

```css
max-width: 900px;
margin: 0 auto;
display: flex;
flex-direction: column;
gap: 16px;
```

### Accordion Item (Fechado)

```css
background-color: #FFFFFF;
border: 1px solid #E5E7EB;
border-radius: 12px;
padding: 24px 28px;
cursor: pointer;
transition: all 0.2s ease;

/* Hover */
&:hover {
  background-color: #F9FAFB;
  border-color: #D1D5DB;
}
```

### Pergunta (Header)

```css
display: flex;
justify-content: space-between;
align-items: center;
font-size: 16px;
font-weight: 600;
color: #2C3E50;
```

**Perguntas:**
1. "O que é a Conta PRO SemViagem?"
2. "Como funciona o SemViagem?"
3. "Como cada viagem gera impacto social?"
4. "Quais métodos de pagamento são aceitos?"
5. "Posso cancelar minha assinatura a qualquer momento?"

### Ícone de Expandir

```css
/* Chevron para baixo */
width: 20px;
height: 20px;
color: #9CA3AF;
transition: transform 0.3s ease;

/* Quando aberto */
&.open {
  transform: rotate(180deg);
  color: #FDB913;
}
```

### Resposta (Conteúdo - quando aberto)

```css
padding-top: 16px;
font-size: 14px;
font-weight: 400;
color: #3D4852;
line-height: 1.6;
text-align: left;
animation: slideDown 0.3s ease;
```

---

## 🔟 SEÇÃO DE CONTATO

### Container Principal

```css
background-color: #FFFFFF;
padding: 80px 48px 120px;
```

### Título Principal

**Texto:** "Entre em Contato" (com ícone de telefone)

```css
font-size: 36px;
font-weight: 700;
color: #2C3E50;
text-align: center;
margin-bottom: 16px;

/* Ícone de telefone antes */
&::before {
  content: '📞';
  margin-right: 12px;
}
```

### Subtítulo

**Texto:** "Estamos aqui para ajudar você a planejar sua próxima viagem. Entre em contato conosco!"

```css
font-size: 16px;
font-weight: 400;
color: #3D4852;
text-align: center;
margin-bottom: 60px;
max-width: 700px;
margin-left: auto;
margin-right: auto;
```

### Layout de Duas Colunas

```css
display: grid;
grid-template-columns: 1fr 1.2fr;
gap: 80px;
max-width: 1200px;
margin: 0 auto;
```

### Coluna Esquerda: Informações de Contato

#### Título da Seção
**Texto:** "Informações de Contato"

```css
font-size: 24px;
font-weight: 700;
color: #2C3E50;
margin-bottom: 32px;
```

#### Card de Contato (E-mail)

```css
display: flex;
align-items: flex-start;
gap: 16px;
margin-bottom: 32px;
```

**Ícone:**
```css
width: 56px;
height: 56px;
background-color: #FDB913;
border-radius: 12px;
display: flex;
align-items: center;
justify-content: center;
flex-shrink: 0;

/* Ícone dentro */
color: #2C3E50;
font-size: 24px;
```

**Conteúdo:**
```css
/* Título */
.contact-label {
  font-size: 16px;
  font-weight: 700;
  color: #2C3E50;
  margin-bottom: 4px;
}

/* Valor */
.contact-value {
  font-size: 14px;
  font-weight: 500;
  color: #3D4852;
  margin-bottom: 4px;
}

/* Descrição */
.contact-description {
  font-size: 12px;
  font-weight: 400;
  color: #9CA3AF;
}
```

**Dados:**
- **E-mail:** contato@semviagem.com.br | Resposta em até 24 horas
- **Telefone:** (11) 4040-4040 | Segunda a sexta, 9h às 18h
- **WhatsApp:** (31) 99733-4723 | Atendimento rápido e personalizado

### Coluna Direita: Formulário

#### Título
**Texto:** "Envie sua Mensagem"

```css
font-size: 24px;
font-weight: 700;
color: #2C3E50;
margin-bottom: 32px;
```

#### Grid de Inputs (Nome + E-mail)

```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: 20px;
margin-bottom: 20px;
```

#### Label do Input

```css
font-size: 14px;
font-weight: 600;
color: #2C3E50;
margin-bottom: 8px;
display: block;
```

#### Input Field (Nome, E-mail)

```css
width: 100%;
padding: 14px 16px;
font-size: 14px;
color: #2C3E50;
background-color: #FFFFFF;
border: 1.5px solid #E5E7EB;
border-radius: 8px;
transition: all 0.2s ease;

/* Placeholder */
::placeholder {
  color: #9CA3AF;
  font-weight: 400;
}

/* Focus */
&:focus {
  outline: none;
  border-color: #FDB913;
  box-shadow: 0 0 0 3px rgba(253, 185, 19, 0.1);
}
```

**Placeholders:**
- Nome: "Seu nome completo"
- E-mail: "seu@email.com"

#### Input Assunto (Full Width)

```css
width: 100%;
margin-bottom: 20px;
/* Mesmos estilos dos outros inputs */
```

**Placeholder:** "Como podemos ajudar?"

#### Textarea (Mensagem)

```css
width: 100%;
min-height: 140px;
padding: 14px 16px;
font-size: 14px;
font-family: inherit;
color: #2C3E50;
background-color: #FFFFFF;
border: 1.5px solid #E5E7EB;
border-radius: 8px;
resize: vertical;
transition: all 0.2s ease;
margin-bottom: 24px;

/* Placeholder */
::placeholder {
  color: #9CA3AF;
}

/* Focus */
&:focus {
  outline: none;
  border-color: #FDB913;
  box-shadow: 0 0 0 3px rgba(253, 185, 19, 0.1);
}
```

**Placeholder:** "Descreva sua dúvida, sugestão ou como podemos te ajudar..."

#### Botão Enviar

```css
width: 100%;
background-color: #FDB913;
color: #2C3E50;
font-size: 16px;
font-weight: 700;
padding: 16px 32px;
border: none;
border-radius: 10px;
cursor: pointer;
transition: all 0.3s ease;
box-shadow: 0 4px 12px rgba(253, 185, 19, 0.25);

/* Hover */
&:hover {
  background-color: #F0B429;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(253, 185, 19, 0.35);
}

/* Active */
&:active {
  transform: translateY(0);
}
```

**Texto:** "Enviar Mensagem"

---

## 1️⃣1️⃣ ESPAÇAMENTO E GRID SYSTEM

### Grid Base

**Sistema provável:** 8px base unit (ou 4px)

```css
/* Unidades de espaçamento */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
--spacing-4xl: 80px;
--spacing-5xl: 120px;
```

### Padding das Seções

```css
/* Seções principais */
section {
  padding-top: 80px;
  padding-bottom: 80px;
  padding-left: 48px;
  padding-right: 48px;
}

/* Hero section */
.hero {
  padding-top: 120px;
  padding-bottom: 180px;
}
```

### Max-Width dos Containers

```css
.container {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

/* Container estreito (textos) */
.container-narrow {
  max-width: 900px;
}

/* Container médio (formulários) */
.container-medium {
  max-width: 1100px;
}
```

### Gaps e Margens Comuns

```css
/* Gap entre cards */
gap: 32px; /* 2rem */

/* Gap entre inputs */
gap: 20px; /* 1.25rem */

/* Margin entre título e conteúdo */
margin-bottom: 24px; /* 1.5rem */

/* Margin entre seções */
margin-bottom: 60px; /* 3.75rem */

/* Padding interno de cards */
padding: 40px 32px; /* 2.5rem 2rem */

/* Padding interno de inputs */
padding: 14px 16px; /* 0.875rem 1rem */
```

---

## 1️⃣2️⃣ ICONOGRAFIA

### Estilo dos Ícones

**Tipo:** Outline / Line icons (não filled)

**Tamanhos:**
- Ícones pequenos (inputs): 20px x 20px
- Ícones médios (contato): 24px x 24px
- Ícones em cards: 56px x 56px

### Ícones Utilizados

| Localização | Ícone | Cor | Tamanho | Unicode/Emoji |
|-------------|-------|-----|---------|---------------|
| Input Origem | 📍 Pin/Location | `#9CA3AF` | 20px | U+1F4CD |
| Input Destino | ✈️ Avião | `#9CA3AF` | 20px | U+2708 |
| Card E-mail | ✉️ Envelope | `#2C3E50` | 24px | - |
| Card Telefone | 📞 Telefone | `#2C3E50` | 24px | - |
| Card WhatsApp | 💬 WhatsApp logo | `#2C3E50` | 24px | - |
| FAQ Expandir | ⌄ Chevron Down | `#9CA3AF` | 20px | - |

### Background dos Ícones (Cards de Contato)

```css
background-color: #FDB913;
border-radius: 12px;
width: 56px;
height: 56px;
display: flex;
align-items: center;
justify-content: center;
```

---

## 1️⃣3️⃣ MICRO-INTERAÇÕES E ESTADOS

### Transições Globais

```css
/* Transição padrão */
transition: all 0.2s ease;

/* Transição de hover em cards */
transition: all 0.3s ease;

/* Transição de transform */
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Efeitos de Hover

#### Botões
```css
/* Elevação */
transform: translateY(-2px);

/* Sombra aumenta */
box-shadow: 0 6px 16px rgba(253, 185, 19, 0.35);

/* Cor escurece ligeiramente */
background-color: #F0B429;
```

#### Cards
```css
/* Elevação maior */
transform: translateY(-8px);

/* Sombra mais pronunciada */
box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
```

#### Links de Navegação
```css
/* Cor muda */
color: #FDB913;

/* Underline animado */
&::after {
  width: 0 → width: 100%;
  transition: width 0.3s ease;
}
```

#### Logos de Companhias
```css
/* Remove grayscale */
filter: grayscale(100%) → grayscale(0%);

/* Aumenta opacidade */
opacity: 0.7 → opacity: 1;

/* Escala ligeiramente */
transform: scale(1.1);
```

### Animações

#### Accordion Expand
```css
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 500px;
    transform: translateY(0);
  }
}
```

#### Fade In (Elementos ao scroll)
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Estados de Foco

#### Inputs
```css
&:focus {
  outline: none;
  border-color: #FDB913;
  box-shadow: 0 0 0 3px rgba(253, 185, 19, 0.1);
}
```

#### Botões (acessibilidade)
```css
&:focus-visible {
  outline: 2px solid #FDB913;
  outline-offset: 2px;
}
```

### Durações

```css
/* Rápido (hover, foco) */
duration: 0.2s;

/* Médio (cards, transições) */
duration: 0.3s;

/* Lento (animações complexas) */
duration: 0.5s;
```

### Easing Functions

```css
/* Padrão */
ease

/* Suave (preferido) */
cubic-bezier(0.4, 0, 0.2, 1)

/* Bounce (opcional) */
cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

---

## 1️⃣4️⃣ RESPONSIVIDADE

### Breakpoints Inferidos

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Telefones grandes */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops pequenos */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Telas grandes */
```

### Adaptações por Dispositivo

#### Desktop (> 1024px)
- Layout de 3 colunas para cards
- Navbar horizontal completa
- Hero com altura ~75vh
- Formulário de contato em 2 colunas

#### Tablet (768px - 1024px)
```css
/* Cards de features */
grid-template-columns: repeat(2, 1fr);
/* Terceiro card vai para baixo */

/* Buscador */
.search-card {
  width: 90%;
  padding: 32px 24px;
}

/* Logos de companhias */
grid-template-columns: repeat(4, 1fr);
```

#### Mobile (< 768px)
```css
/* Cards em coluna única */
grid-template-columns: 1fr;

/* Navbar vira hamburger menu */
.nav-links {
  display: none;
}

.mobile-menu-toggle {
  display: block;
}

/* Hero */
.hero-title {
  font-size: 40px; /* reduz de 64px */
}

.hero-subtitle {
  font-size: 16px; /* reduz de 18px */
}

/* Buscador */
.search-card {
  width: 95%;
  padding: 24px 20px;
  top: -40px; /* reduz elevação */
}

.input-grid {
  grid-template-columns: 1fr; /* 1 coluna */
}

/* Estatísticas */
.stats-number {
  font-size: 36px; /* reduz de 48px */
}

/* Formulário de contato */
.contact-layout {
  grid-template-columns: 1fr;
}

.contact-input-grid {
  grid-template-columns: 1fr;
}

/* Padding das seções */
section {
  padding-top: 48px;
  padding-bottom: 48px;
  padding-left: 20px;
  padding-right: 20px;
}
```

---

## 1️⃣5️⃣ PADRÕES DE DESIGN

### Princípios Observados

#### 1. **Minimalismo Intencional**
- Uso generoso de whitespace
- Paleta de cores limitada (amarelo + azul + neutros)
- Componentes limpos e sem excessos
- Foco no essencial

#### 2. **Hierarquia Visual Clara**
- Títulos grandes e bold
- Contraste de tamanhos bem definido
- Uso de cor para direcionar atenção (amarelo nos CTAs)
- Números grandes para estatísticas

#### 3. **Consistência**
- Border-radius consistente (8px inputs, 12px botões, 16px cards)
- Espaçamento baseado em múltiplos de 8px
- Mesma família de fonte em todo o site
- Padrão de sombras similar

#### 4. **Acessibilidade**
- Contraste adequado de cores
- Tamanhos de fonte legíveis (mínimo 14px)
- Estados de foco bem definidos
- Áreas de clique generosas (min 44px)

#### 5. **Call-to-Action Estratégico**
- Botões amarelos destacam-se claramente
- Sempre visíveis e bem posicionados
- Textos diretos e acionáveis
- Hierarquia de botões (primário vs secundário)

### Design System Implícito

#### Tipografia
```css
/* Scale */
12px → 14px → 16px → 18px → 20px → 24px → 36px → 48px → 64px

/* Pesos */
Regular (400), Semibold (600), Bold (700)
```

#### Espaçamento
```css
/* Scale */
4px → 8px → 12px → 16px → 24px → 32px → 48px → 64px → 80px → 120px
```

#### Border Radius
```css
/* Scale */
8px → 10px → 12px → 16px → 24px (pill)
```

#### Elevação (Box Shadow)
```css
/* Níveis */
Level 1: 0 2px 8px rgba(0, 0, 0, 0.06);
Level 2: 0 4px 12px rgba(0, 0, 0, 0.08);
Level 3: 0 8px 20px rgba(0, 0, 0, 0.12);
Level 4: 0 12px 24px rgba(0, 0, 0, 0.15);
```

### Estratégia de UX

1. **Foco no Buscador:** O card de busca é o elemento mais destacado da página
2. **Prova Social:** Estatísticas de impacto geram confiança
3. **Transparência:** Textos claros sobre propósito e valores
4. **Múltiplos CTAs:** Diferentes pontos de entrada (busca, avisos, VIP)
5. **Redução de Fricção:** Formulários simples, navegação clara

---

## 📊 RESUMO EXECUTIVO

### Cores Principais
- **Amarelo:** `#FDB913` (CTAs, destaques)
- **Azul:** `#5DADE2` (título, números)
- **Escuro:** `#2C3E50` (textos)
- **Cinza:** `#E5E7EB` (backgrounds)

### Tipografia
- **Fonte:** Inter (provável)
- **Títulos:** 36-64px, Bold (700)
- **Corpo:** 14-16px, Regular (400)
- **Botões:** 14-16px, Bold (700)

### Componentes Principais
1. **Navbar:** Fixo, branco, sombra sutil
2. **Hero:** Imagem de fundo + overlay + título bicolor
3. **Buscador:** Card branco flutuante, border-radius 16px
4. **Cards:** 3 colunas, ilustrações coloridas, CTAs amarelos
5. **Inputs:** Border 1.5px, radius 8px, ícones internos
6. **Botões:** Amarelo (#FDB913), radius 10-12px, hover com elevação

### Espaçamento
- **Base:** 8px grid system
- **Padding de seções:** 80px vertical
- **Gap entre cards:** 32px
- **Padding de cards:** 40px vertical, 32px horizontal

### Interações
- **Hover em botões:** Cor escurece + elevação
- **Hover em cards:** Elevação de 4px → 12px
- **Transições:** 0.2-0.3s ease
- **Focus:** Borda amarela + shadow

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Para replicar este design:

- [ ] Configurar paleta de cores (8 cores principais)
- [ ] Importar fonte Inter (Google Fonts)
- [ ] Criar componentes de botão (primário, secundário)
- [ ] Criar componente de input (com ícones)
- [ ] Criar componente de card (feature, stat)
- [ ] Implementar navbar com scroll sticky
- [ ] Implementar hero com overlay e buscador flutuante
- [ ] Implementar grid de 3 colunas responsivo
- [ ] Implementar accordion FAQ
- [ ] Implementar formulário de contato
- [ ] Adicionar transições e hovers
- [ ] Adicionar estados de focus (acessibilidade)
- [ ] Implementar breakpoints responsivos
- [ ] Otimizar imagens e ilustrações
- [ ] Adicionar meta tags e SEO

---

**📅 Documento criado em:** 2025-10-20
**🤖 Gerado por:** Claude Code (Sonnet 4.5)
**📊 Total de componentes catalogados:** 15+
**🎨 Total de cores documentadas:** 12
**📏 Total de tamanhos de fonte:** 9

---

**Este documento serve como referência completa para:**
- ✅ Replicar o design visualmente
- ✅ Manter consistência em novas features
- ✅ Onboarding de designers/desenvolvedores
- ✅ Documentação técnica do sistema de design
- ✅ Base para criação de um design system formal

**💡 Próximos passos sugeridos:**
1. Criar arquivo de variáveis CSS/Tailwind com todas as cores
2. Componentizar elementos reutilizáveis
3. Documentar estados de erro e validação
4. Adicionar animações e micro-interações adicionais
5. Criar guia de acessibilidade completo
