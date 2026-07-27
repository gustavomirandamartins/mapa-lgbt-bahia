-- ============================================================================
-- IDT-LGBT Bahia — Corrige view pública para SECURITY INVOKER
-- ============================================================================
-- A view public.indice_publico era SECURITY DEFINER (padrão detectado pelo
-- linter do Supabase). Isso faz com que ela execute com as permissões do
-- dono da view em vez do usuário que a consulta, ignorando RLS do invocador.
--
-- Correção:
--  1. Recriar a view com security_invoker = true.
--  2. Adicionar política RLS SELECT para que anon/leitores possam ler apenas
--     avaliações com status = 'aprovado'.
--  3. Conceder acesso por coluna ao anon, expondo somente os dados necessários
--     ao mapa público (municipio_id, nota_final, classificacao, notas_eixos,
--     submitted_at, status). A coluna user_id e o JSONB respostas não são
--     expostos ao anônimo.
-- ============================================================================

-- Recria a view como invoker: quem consulta precisa ter permissões reais
-- sobre as tabelas subjacentes (respeitando RLS e privilégios de coluna).
drop view if exists public.indice_publico;

create or replace view public.indice_publico
  with (security_invoker = true)
  as
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

-- Política pública: qualquer usuário (anon ou autenticado) pode ler avaliações
-- aprovadas. Gestores e admins continuam lendo suas próprias avaliações via
-- política avaliacoes_select existente. Esta policy é permissiva (OR).
create policy avaliacoes_select_publica_aprovadas
  on public.avaliacoes for select
  using (status = 'aprovado');

-- Restringe as colunas visíveis ao anon. Não altera os privilégios de
-- authenticated nem service_role.
revoke select on public.avaliacoes from anon;
grant select (
  municipio_id,
  nota_final,
  classificacao,
  notas_eixos,
  submitted_at,
  status
) on public.avaliacoes to anon;

-- Garante leitura da view para anon (já concedido pelas default privileges,
-- mas deixamos explícito para auditoria).
grant select on public.indice_publico to anon;
