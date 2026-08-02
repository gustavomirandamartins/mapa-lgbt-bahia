# IDT-LGBT Bahia — Mapa do Turismo LGBTQIAPN+ 🏳️‍🌈

[![Next.js 16](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre%20GL-3178C6?style=for-the-badge&logo=maplibre&logoColor=white)](https://maplibre.org/)

Aplicativo full-stack mobile-first (PWA) para mapeamento, acompanhamento e exibição pública do **Índice de Desenvolvimento do Turismo LGBTQIAPN+ (IDT-LGBT)** nos **417 municípios do Estado da Bahia**.

---

## 📌 Visão Geral

O **IDT-LGBT Bahia** é uma plataforma que conecta gestão pública municipal, coordenação estadual e o público em geral. A aplicação combina:

- **Mapa Coroplético Interativo (100% Local)**: Visualização cartográfica dos 417 municípios da Bahia utilizando geometrias oficiais do IBGE, coloridas de acordo com a maturidade turística LGBTQIAPN+ e renderizadas em MapLibre GL sem dependência de tiles externos.
- **Transparência e Raio-X Municipal**: Cards de detalhe com gráfico de radar (desempenho nos 7 eixos), destaques para pontos fortes, fragilidades e recomendações de políticas públicas.
- **Central de Controle (Gestores Municipais e Administração)**: Painéis autenticados para submissão de questionário municipal, fluxo de revisão, moderação e aprovação de avaliações.

---

## 📊 Metodologia do IDT-LGBT

O índice mede o grau de estruturação de um município para acolher, promover e desenvolver o turismo voltado à comunidade LGBTQIAPN+, com nota final em escala de **0 a 100 pontos**, dividida em **5 faixas de classificação**:

| Faixa de Pontuação | Nível de Maturidade | Cor Oficial |
| :---: | :--- | :--- |
| **0 – 19** | ⚪ Inexistente | Cinza (`#94a3b8`) |
| **20 – 39** | 🔴 Inicial | Vermelho (`#ef4444`) |
| **40 – 59** | 🟠 Emergente | Laranja (`#f97316`) |
| **60 – 79** | 🟡 Estruturado | Amarelo (`#facc15`) |
| **80 – 100** | 🟢 Referência | Verde (`#22c55e`) |

### Os 7 Eixos Avaliados (35 Perguntas)

O questionário oficial abrange 35 perguntas distribuídas em 7 eixos temáticos com pesos diferenciados na composição da nota final:

1. **Governança (20%)**: Estrutura institucional, dotação orçamentária, conselhos municipais e planos de turismo.
2. **Legislação e Direitos Humanos (15%)**: Leis antidiscriminação, adoção de nome social, combate à LGBTfobia e direitos civis.
3. **Pesquisa e Dados (15%)**: Monitoramento do perfil, fluxo e satisfação do turista LGBTQIAPN+, além de dados de violência.
4. **Qualificação (15%)**: Treinamento e capacitação do trade turístico, servidores públicos e segurança pública.
5. **Promoção Turística (10%)**: Participação em feiras, campanhas específicas, material promocional e calendário de eventos.
6. **Segurança e Proteção (15%)**: Delegacias especializadas, protocolos de acolhimento e canais de denúncia de LGBTfobia.
7. **Oferta Turística (10%)**: Existência de estabelecimentos focados ou *LGBT-friendly* (meios de hospedagem, entretenimento, gastronomia).

> 📖 **Fonte da Verdade Metodológica**: Consulte os documentos oficiais em [`docs/IDT_LGBT_Calculo.md`](file:///Users/gustavomartins/Projetos/setur/mapa-lgbt-bahia/docs/IDT_LGBT_Calculo.md) e [`docs/IDT_LGBT_Completo.md`](file:///Users/gustavomartins/Projetos/setur/mapa-lgbt-bahia/docs/IDT_LGBT_Completo.md).

---

## 🏗️ Arquitetura e Stack Tecnológico

- **Next.js 16 (App Router + Turbopack)**: Aplicação full-stack com Server Actions, renderização no servidor e middleware assíncrono (`proxy.ts`).
- **React 19 + TypeScript**: Tipagem estática rigorosa em todo o ecossistema.
- **Tailwind CSS v4**: Arquitetura CSS-first com design system global (`@theme` em `app/globals.css`), utilizando estética de *glassmorphism* claro estilo iOS (`.glass`, `.glass-strong`, `.glass-soft`).
- **Supabase (Postgres 17 + Auth + RLS)**:
  - Banco de dados relacional com **Row Level Security (RLS)** restrito em todas as tabelas.
  - A tabela `avaliacoes` expõe para usuários anônimos apenas avaliações aprovadas através da view segura `indice_publico` (`security_invoker = true`).
  - **Zero chaves de serviço no frontend**: Segurança ponta a ponta sem segredos expostos no cliente.
- **MapLibre GL v6**: Renderização vetorial e interativa sem servidor de tiles externo. O mapa utiliza arquivos GeoJSON estáticos em `public/geo/`. O worker é servido localmente de `public/vendor/maplibre-gl-worker.mjs`.
- **Motor do IDT (`lib/idt.ts`)**: Módulo universal e autocontido **sem dependências de runtime**, executável tanto no Next.js quanto nativamente no Node.js. Toda submissão é recalculada no servidor.

---

## 🔄 Fluxo de Governança e Moderação

1. **Cadastro Municipal (`pendente`)**: O representante municipal cria conta vinculando-se a um dos 417 municípios em `/cadastro`.
2. **Aprovação de Perfil (`aprovado`)**: A administração revisa e autoriza o gestor municipal através do painel administrativo (`/admin`).
3. **Submissão da Avaliação (`pendente`)**: O gestor municipal autenticado responde ao questionário com os 7 eixos em `/painel`.
4. **Publicação no Mapa (`aprovado`)**: A administração analisa a avaliação em `/admin/avaliacoes/[id]`. Ao ser aprovada, a avaliação torna-se pública no mapa e substitui automaticamente a versão anterior (`substituida`).

---

## 📁 Estrutura do Projeto

```text
├── app/                      # Rotas da aplicação (Next.js 16 App Router)
│   ├── admin/                # Central de administração
│   ├── cadastro/             # Cadastro de gestores municipais
│   ├── login/                # Autenticação (Supabase Auth)
│   ├── painel/               # Painel do município e questionário IDT
│   ├── globals.css           # Tokens @theme Tailwind v4 e classes utilitárias
│   └── page.tsx              # Mapa público interativo da Bahia
├── components/               # Componentes React
│   ├── map/                  # Mapa MapLibre GL, card municipal, legenda e gráfico radar
│   ├── questionnaire/        # Wizard interativo de 35 perguntas
│   └── ui/                   # Cards, logotipos e elementos de UI
├── docs/                     # Documentação oficial da metodologia
├── lib/                      # Lógica de negócios e integrações
│   ├── actions/              # Next.js Server Actions (auth, avaliações, admin)
│   ├── idt.ts                # Motor de cálculo do IDT-LGBT (módulo universal)
│   ├── idt.test.ts           # Suíte de testes unitários do motor (Node.js test runner)
│   ├── auth-guards.ts        # Guards de autenticação e permissões de perfil
│   └── public-data.ts        # Agregador de dados para o mapa público
├── public/                   # Ativos estáticos, geometrias e workers
│   ├── geo/                  # GeoJSONs dos municípios e contornos da Bahia
│   └── vendor/               # Workers locais do MapLibre GL
└── supabase/                 # Configurações do banco de dados
    └── migrations/           # Migrações SQL (Schema, RLS, Seed de Municípios e Views)
```

---

## 🚀 Guia de Setup e Desenvolvimento

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20 ou superior)
- [npm](https://www.npmjs.com/) ou compatível
- Projeto no [Supabase](https://supabase.com/) com PostgreSQL 17

### 2. Instalação das Dependências

```bash
git clone https://github.com/gustavomirandamartins/mapa-lgbt-bahia.git
cd mapa-lgbt-bahia
npm install
```

### 3. Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com base em `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_key
```

> ⚠️ **Importante**: A variável `NEXT_PUBLIC_SUPABASE_URL` deve conter **apenas** a URL base do projeto (sem o sufixo `/rest/v1/`).

### 4. Configuração do Banco de Dados (Supabase)

No **SQL Editor** do painel do Supabase, execute as migrações em ordem (ou via CLI `supabase db push`):

1. `supabase/migrations/0001_schema.sql`: Estrutura das tabelas (`profiles`, `municipios`, `avaliacoes`) e triggers de autenticação.
2. `supabase/migrations/0002_policies.sql`: Políticas de segurança em nível de linha (RLS).
3. `supabase/migrations/0003_seed_municipios.sql`: População inicial dos 417 municípios da Bahia.
4. `supabase/migrations/0004_view_security_invoker.sql`: Criação da view `indice_publico` respeitando `security_invoker = true`.

Para criar o **primeiro usuário administrador**, crie a conta em *Authentication* no Supabase e execute o SQL indicado no comentário final da migração `0001_schema.sql`:

```sql
UPDATE profiles SET role = 'admin', status = 'aprovado' WHERE email = 'seu@email.com';
```

### 5. Executando o Projeto

```bash
# Iniciar o servidor de desenvolvimento com Turbopack (http://localhost:3000)
npm run dev

# Executar a suíte de testes unitários da metodologia IDT-LGBT
npm test

# Executar verificação de linter (ESLint)
npm run lint

# Gerar build otimizada de produção
npm run build
```

---

## 🧪 Testes Unitários do Motor IDT

O motor de cálculo (`lib/idt.ts`) é rigorosamente testado nativamente via Node.js Test Runner:

```bash
npm test
```

A suíte em `lib/idt.test.ts` valida:
- Consistência dos pesos e escalas dos 7 eixos (100% de soma total).
- Retorno correto das 5 faixas de classificação.
- Destaques automáticos dos 2 principais pontos fortes, fragilidades e recomendações para eixos abaixo de 50%.
- Rejeição de respostas inválidas ou fora das escalas de pontuação permitidas.

---

## 📜 Licença e Institucional

Projeto desenvolvido para fortalecimento, transparência e planejamento do turismo LGBTQIAPN+ no Estado da Bahia.
