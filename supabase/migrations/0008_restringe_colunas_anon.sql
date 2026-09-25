-- ============================================================================
-- 0008_restringe_colunas_anon.sql
-- Restaura o princípio de menor privilégio para o papel anon, que a
-- migração 0007 afrouxou ao conceder SELECT em nível de tabela
-- (expondo inclusive a coluna user_id das avaliações aprovadas).
--
-- Mantém o acesso público intencional às avaliações aprovadas (policy
-- avaliacoes_select_publica_aprovadas), agora novamente restrito às
-- colunas necessárias ao mapa, incluindo `respostas` (liberada na 0005).
-- Não altera os privilégios de authenticated nem service_role.
-- ============================================================================

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
