-- ============================================================================
-- IDT-LGBT Bahia — Row Level Security (RLS)
-- ============================================================================
-- Modelo de acesso:
--   anon:        lê apenas a view indice_publico (avaliações aprovadas).
--   município:   lê o próprio perfil; insere avaliações apenas do próprio
--                município (conta aprovada); lê as próprias avaliações.
--   admin:       lê e atualiza perfis e avaliações (aprovações/rejeições).
-- ============================================================================

alter table public.municipios enable row level security;
alter table public.profiles enable row level security;
alter table public.avaliacoes enable row level security;

-- ----------------------------------------------------------------------------
-- municipios: leitura pública (lista usada no cadastro e no mapa)
-- ----------------------------------------------------------------------------
create policy municipios_select_publico
  on public.municipios for select
  using (true);

-- Sem políticas de insert/update/delete: catálogo administrado via migration.

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create policy profiles_select
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

-- Atualização somente pelo admin (aprovação de cadastros, troca de papel).
-- O usuário NUNCA pode alterar o próprio role/status/municipio_id.
create policy profiles_update_admin
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Insert acontece apenas via trigger handle_new_user (security definer).

-- ----------------------------------------------------------------------------
-- avaliacoes
-- ----------------------------------------------------------------------------
-- Gestor lê as próprias avaliações (qualquer status). Admin lê todas.
-- Anônimo NÃO lê a tabela: o acesso público é via view indice_publico.
create policy avaliacoes_select
  on public.avaliacoes for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Gestor com conta aprovada submete avaliação apenas do próprio município,
-- sempre como 'pendente' (o cálculo é feito e gravado pelo servidor).
create policy avaliacoes_insert
  on public.avaliacoes for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pendente'
    and municipio_id = public.meu_municipio_id()
  );

-- Somente o admin altera avaliações (aprovar / rejeitar / substituir).
create policy avaliacoes_update_admin
  on public.avaliacoes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
