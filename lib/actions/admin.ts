"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth-guards";

export interface AdminActionState {
  error: string | null;
  sucesso?: string | null;
}

// ----------------------------------------------------------------------------
// Perfis (cadastros de município)
// ----------------------------------------------------------------------------

export async function aprovarPerfil(perfilId: string): Promise<AdminActionState> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ status: "aprovado", updated_at: new Date().toISOString() })
    .eq("id", perfilId)
    .eq("status", "pendente");

  if (error) {
    if (error.code === "23505") {
      return {
        error: "Este município já possui um gestor aprovado. Rejeite o cadastro duplicado.",
      };
    }
    return { error: `Erro ao aprovar: ${error.message}` };
  }

  revalidatePath("/admin");
  return { error: null, sucesso: "Cadastro aprovado." };
}

export async function rejeitarPerfil(perfilId: string): Promise<AdminActionState> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("profiles")
    .update({ status: "rejeitado", updated_at: new Date().toISOString() })
    .eq("id", perfilId)
    .eq("status", "pendente");

  if (error) return { error: `Erro ao rejeitar: ${error.message}` };

  revalidatePath("/admin");
  return { error: null, sucesso: "Cadastro rejeitado." };
}

// ----------------------------------------------------------------------------
// Avaliações (questionários IDT-LGBT)
// ----------------------------------------------------------------------------

export async function aprovarAvaliacao(
  avaliacaoId: string
): Promise<AdminActionState> {
  const { supabase, user } = await requireAdmin();

  const { data: avaliacao } = await supabase
    .from("avaliacoes")
    .select("id, municipio_id, status")
    .eq("id", avaliacaoId)
    .single();

  if (!avaliacao) return { error: "Avaliação não encontrada." };
  if (avaliacao.status !== "pendente") {
    return { error: "Esta avaliação já foi revisada." };
  }

  // Substitui a versão anteriormente aprovada do mesmo município.
  const { error: erroSubstituicao } = await supabase
    .from("avaliacoes")
    .update({ status: "substituida" })
    .eq("municipio_id", avaliacao.municipio_id)
    .eq("status", "aprovado");

  if (erroSubstituicao) {
    return { error: `Erro ao substituir versão anterior: ${erroSubstituicao.message}` };
  }

  const { error } = await supabase
    .from("avaliacoes")
    .update({
      status: "aprovado",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", avaliacaoId)
    .eq("status", "pendente");

  if (error) return { error: `Erro ao aprovar: ${error.message}` };

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null, sucesso: "Avaliação aprovada e publicada no mapa." };
}

export async function rejeitarAvaliacao(
  avaliacaoId: string,
  nota?: string
): Promise<AdminActionState> {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("avaliacoes")
    .update({
      status: "rejeitado",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_note: nota ?? null,
    })
    .eq("id", avaliacaoId)
    .eq("status", "pendente");

  if (error) return { error: `Erro ao rejeitar: ${error.message}` };

  revalidatePath("/admin");
  return { error: null, sucesso: "Avaliação devolvida ao município." };
}
