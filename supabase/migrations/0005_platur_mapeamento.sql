-- ============================================================================
-- PLATUR-LGBT+ Bahia — Atualização da metodologia e view pública
-- Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal
-- ============================================================================

-- 1. Recria a view indice_publico com a coluna "respostas"
--    para que o público em geral e o mapa interativo possam acessar
--    e consultar todas as respostas de mapeamento enviadas por cada município.
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
  a.respostas,
  a.submitted_at
from public.avaliacoes a
join public.municipios m on m.id = a.municipio_id
where a.status = 'aprovado';

-- 3. Atualiza as permissões para o usuário anônimo poder ler a coluna respostas
--    na view indice_publico (respeitando a RLS de avaliações aprovadas).
revoke select on public.avaliacoes from anon;
grant select (
  municipio_id,
  nota_final,
  classificacao,
  notas_eixos,
  respostas,
  submitted_at,
  status
) on public.avaliacoes to anon;

grant select on public.indice_publico to anon;
