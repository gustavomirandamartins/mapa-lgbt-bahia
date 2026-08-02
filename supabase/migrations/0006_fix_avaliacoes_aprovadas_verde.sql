-- ============================================================================
-- 0006_fix_avaliacoes_aprovadas_verde.sql
-- Garante que todas as avaliações já aprovadas tenham nota_final = 100
-- e classificacao = 'Mapeado' para que apareçam na cor verde no mapa interativo
-- após a mudança de metodologia (sem pontuações / pesos).
-- ============================================================================

update public.avaliacoes
set nota_final = 100,
    classificacao = 'Mapeado'
where status = 'aprovado'
  and (nota_final is null or nota_final <> 100 or classificacao <> 'Mapeado');
