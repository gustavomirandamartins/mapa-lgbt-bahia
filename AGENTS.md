<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# IDT-LGBT Bahia — Mapa do Turismo LGBTQIAPN+

Aplicativo full-stack mobile-first (PWA) do Índice de Desenvolvimento do
Turismo LGBTQIAPN+ (IDT-LGBT) dos 417 municípios da Bahia.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **TailwindCSS v4** (CSS-first, `@theme` em `app/globals.css`)
- **Supabase** (PostgreSQL + Auth + RLS). **Sem service key no frontend.**
- **MapLibre GL v6** (imports nomeados, sem default export) com **estilo 100%
  local** (sem tiles externos — o GeoJSON IBGE dos municípios é o próprio
  mapa). O worker é servido de `public/vendor/` via `setWorkerUrl()` porque o
  Turbopack não publica `maplibre-gl-worker.mjs` automaticamente —
  **ao atualizar `maplibre-gl`, copiar novamente
  `node_modules/maplibre-gl/dist/{maplibre-gl-worker,maplibre-gl-shared}.mjs`
  para `public/vendor/`**.- **Vercel** (deploy), PWA via `app/manifest.ts` + `app/icon.svg`

## Comandos

```bash
npm run dev    # desenvolvimento
npm run build  # build de produção
npm test       # testes do motor do IDT (node --test, roda .ts nativamente)
npm run lint   # eslint
```

## Convenções específicas deste projeto

- **Motor do IDT**: `lib/idt.ts` é módulo **autocontido, sem imports de
  runtime** — o mesmo arquivo roda no client, no servidor e no Node puro
  (testes). Não quebrar essa propriedade. Toda mudança de regra de validação
  exige atualizar `lib/idt.test.ts` e `docs/`.
- **Metodologia oficial** (fonte da verdade): o questionário vigente está em
  `lib/idt.ts` (`IDT_QUESTIONARIO`) — metodologia TGS-DT de **mapeamento, sem
  pontuação**: 7 eixos, 49 perguntas (rádio obrigatórias; checkbox/texto
  opcionais), status Mapeado/Não Mapeado. `docs/IDT_LGBT_*.md` descrevem a
  metodologia de pontuação anterior e são referência histórica.
- **A validação é sempre refeita no servidor** (`validarRespostas` em
  `lib/actions/avaliacao.ts` via `calcularIdt`). O cliente nunca envia notas.
- **Next 16**: middleware chama-se **`proxy.ts`** (named export `proxy`).
  `cookies()` é assíncrono. `params` em páginas dinâmicas é `Promise`.
- **Auth/perfis**: signup cria `profiles` via trigger `handle_new_user`
  (metadados `nome`, `municipio_id`). Guards server-side em
  `lib/auth-guards.ts` (`requireUser`, `requireAdmin`).
- **RLS**: a tabela `avaliacoes` é acessível a anon apenas para avaliações
  aprovadas (policy em `0004`) e somente nas colunas públicas (`municipio_id`,
  `nota_final`, `classificacao`, `notas_eixos`, `respostas`, `submitted_at`,
  `status` — sem `user_id`; ver `0008`). O mapa público lê a view
  `indice_publico`, criada com `security_invoker = true` para respeitar a RLS
  do invocador. Policies em `supabase/migrations/0002_policies.sql`,
  `0004_view_security_invoker.sql` e `0008_restringe_colunas_anon.sql`.
- **Fluxo de aprovação**: perfil `pendente` → admin aprova → gestor responde
  questionário → avaliação `pendente` → admin aprova → publicada no mapa
  (versão anterior vira `substituida`).
- **Imports com extensão `.ts`** são permitidos apenas em arquivos de teste
  (`allowImportingTsExtensions`) para compatibilidade com `node --test`.
- **Estética**: glassmorphism claro estilo iOS — classes utilitárias `.glass`,
  `.glass-strong`, `.glass-soft`, `.pride-gradient` em `globals.css`.
  Cores das faixas: `corDaNota()` em `lib/idt.ts` (não duplicar a tabela).

## Setup do Supabase (uma vez)

1. Criar projeto (Postgres 17, região São Paulo, Data API ligada, RLS automático ligado).
2. Copiar `.env.example` para `.env.local` e preencher `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   ⚠️ A URL é **apenas** `https://<ref>.supabase.co` — **sem** `/rest/v1/`
   no final (a página de Data API do dashboard exibe o endpoint completo;
   copiar com o caminho quebra todas as chamadas com PGRST125).
3. Rodar as migrations `supabase/migrations/0001..0004` no SQL Editor
   (ou `supabase db push`).
4. Bootstrap do primeiro admin: criar o usuário em Authentication e rodar o
   `update` indicado no comentário final de `0001_schema.sql`.
5. Recomendado: desativar "Confirm email" em Auth > Sign In / Up (ou configurar SMTP).
