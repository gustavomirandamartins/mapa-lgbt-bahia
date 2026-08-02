-- ============================================================================
-- 0007_fix_permissoes_e_rls.sql
-- Corrige permissões de SELECT para os usuários anon e authenticated em
-- avaliacoes, municipios e na view indice_publico para evitar qualquer falha
-- de "permission denied for table avaliacoes" ao consultar a coluna respostas
-- via security_invoker = true.
-- ============================================================================

-- 1. Concede permissão de SELECT sobre as tabelas e views para anon e authenticated
grant select on public.avaliacoes to anon, authenticated;
grant select on public.municipios to anon, authenticated;
grant select on public.indice_publico to anon, authenticated;

-- 2. Recria a view indice_publico garantindo que traga avaliações com status = 'aprovado'
-- e todas as colunas necessárias para o mapa interativo e visualização pública
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

-- 3. Garante que qualquer avaliação com status 'aprovado' tenha nota_final = 100
-- e classificacao = 'Mapeado'
update public.avaliacoes
set nota_final = 100,
    classificacao = 'Mapeado'
where status = 'aprovado'
  and (nota_final is null or nota_final <> 100 or classificacao <> 'Mapeado');
