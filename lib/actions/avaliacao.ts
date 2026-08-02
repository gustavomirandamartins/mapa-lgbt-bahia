"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-guards";
import { calcularIdt, type IdtRespostas } from "@/lib/idt";

export interface SubmissaoState {
  error: string | null;
  notaFinal?: number;
  classificacao?: string;
}

/**
 * Submete o questionário da Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal.
 * As respostas são salvas no formato nativo do questionário (sem cálculo de notas ou pesos).
 */
export async function submeterAvaliacao(
  respostas: IdtRespostas
): Promise<SubmissaoState> {
  const { supabase, user, profile } = await requireUser();

  if (profile.role !== "municipio") {
    return { error: "Apenas contas de município podem responder ao questionário." };
  }
  if (profile.status !== "aprovado") {
    return { error: "Seu cadastro ainda não foi aprovado pelo administrador." };
  }
  if (!profile.municipio_id) {
    return { error: "Seu cadastro não está vinculado a um município." };
  }

  let resultado;
  try {
    resultado = calcularIdt(respostas);
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `Questionário incompleto ou inválido (${err.message}).`
          : "Questionário inválido.",
    };
  }

  const { error } = await supabase.from("avaliacoes").insert({
    municipio_id: profile.municipio_id,
    user_id: user.id,
    status: "pendente",
    respostas,
    notas_eixos: resultado.eixos,
    nota_final: resultado.notaFinal,
    classificacao: resultado.classificacao.nivel,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error:
          "Já existe uma avaliação do seu município aguardando aprovação. Aguarde a revisão do administrador.",
      };
    }
    return { error: `Erro ao salvar a avaliação: ${error.message}` };
  }

  revalidatePath("/admin");
  revalidatePath("/painel");
  return {
    error: null,
    notaFinal: resultado.notaFinal,
    classificacao: resultado.classificacao.nivel,
  };
}
