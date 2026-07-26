-- ============================================================================
-- IDT-LGBT Bahia — Schema inicial
-- Índice de Desenvolvimento do Turismo LGBTQIAPN+ (SETUR-BA)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Municípios da Bahia (417, códigos IBGE). Populado pela migration 0003.
-- ----------------------------------------------------------------------------
create table if not exists public.municipios (
  id integer primary key,           -- código IBGE (7 dígitos)
  nome text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7)
);

-- ----------------------------------------------------------------------------
-- Perfis de usuário (estende auth.users)
-- role:    'municipio' (gestor municipal) | 'admin'
-- status:  'pendente' (aguardando aprovação do admin) | 'aprovado' | 'rejeitado'
-- Cada gestor responde por exatamente um município.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  role text not null default 'municipio' check (role in ('municipio', 'admin')),
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado')),
  municipio_id integer references public.municipios (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_municipio_idx on public.profiles (municipio_id);

-- Um município só pode ter um gestor aprovado por vez.
create unique index if not exists profiles_municipio_aprovado_uniq
  on public.profiles (municipio_id)
  where status = 'aprovado' and role = 'municipio';

-- ----------------------------------------------------------------------------
-- Avaliações (questionário IDT-LGBT respondido pelo gestor)
-- status: 'pendente' -> aguardando revisão do admin
--         'aprovado' -> publicado no mapa
--         'rejeitado' -> devolvido pelo admin
--         'substituida' -> versão anterior, substituída por avaliação mais nova
-- ----------------------------------------------------------------------------
create table if not exists public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  municipio_id integer not null references public.municipios (id),
  user_id uuid not null references public.profiles (id),
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'rejeitado', 'substituida')),
  -- { "<pergunta_id>": valor(0-4), ... } — 35 respostas
  respostas jsonb not null,
  -- Resultado calculado no servidor (lib/idt.ts): percentual e ponderado por eixo
  notas_eixos jsonb not null,
  nota_final numeric(5, 2) not null check (nota_final >= 0 and nota_final <= 100),
  classificacao text not null,
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);

create index if not exists avaliacoes_municipio_idx on public.avaliacoes (municipio_id, status);
create index if not exists avaliacoes_status_idx on public.avaliacoes (status);

-- No máximo uma avaliação pendente e uma aprovada por município.
create unique index if not exists avaliacoes_pendente_uniq
  on public.avaliacoes (municipio_id) where status = 'pendente';
create unique index if not exists avaliacoes_aprovada_uniq
  on public.avaliacoes (municipio_id) where status = 'aprovado';

-- ----------------------------------------------------------------------------
-- Funções auxiliares (security definer: leem profiles sem recursão de RLS)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin' and status = 'aprovado'
  );
$$;

create or replace function public.meu_municipio_id()
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select municipio_id from profiles
  where id = auth.uid() and role = 'municipio' and status = 'aprovado';
$$;

-- ----------------------------------------------------------------------------
-- Trigger: cria o perfil automaticamente no signup
-- Metadados esperados em raw_user_meta_data: nome, municipio_id
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, municipio_id, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    nullif(new.raw_user_meta_data ->> 'municipio_id', '')::integer,
    'municipio',
    'pendente'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- View pública: somente avaliações APROVADAS (uma por município).
-- É a única leitura disponível para usuários anônimos (a tabela avaliacoes
-- fica fechada para anon; a view é o boundary de segurança).
-- ----------------------------------------------------------------------------
create or replace view public.indice_publico as
select
  a.municipio_id,
  m.nome,
  a.nota_final,
  a.classificacao,
  a.notas_eixos,
  a.submitted_at
from public.avaliacoes a
join public.municipios m on m.id = a.municipio_id
where a.status = 'aprovado';

-- ----------------------------------------------------------------------------
-- BOOTSTRAP DO PRIMEIRO ADMIN
-- 1. Crie o usuário em Authentication > Users (ou pelo /cadastro).
-- 2. Execute no SQL Editor:
--    update public.profiles set role = 'admin', status = 'aprovado',
--           municipio_id = null
--    where id = '4d404d50-cc72-4bb4-b1b8-e67593612561';
-- ----------------------------------------------------------------------------
