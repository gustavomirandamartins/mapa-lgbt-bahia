import { createClient } from "@supabase/supabase-js";

import type { IdtResultadoEixo, IdtValorResposta } from "@/lib/idt";
import type { Municipio } from "@/lib/auth-guards";

export interface IndicePublico {
  municipio_id: number;
  nome: string;
  nota_final: number;
  classificacao: string;
  notas_eixos: IdtResultadoEixo[];
  respostas?: Record<string, IdtValorResposta>;
  submitted_at: string;
}

/**
 * Cliente anônimo sem cookies: usado apenas para dados públicos do mapa.
 * Mantém a página inicial estática/cacheável (revalidate).
 */
function createAnonClient(revalidateSeconds: number | "no-store" = "no-store") {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (url, options) =>
          fetch(url, {
            ...options,
            ...(revalidateSeconds === "no-store"
              ? { cache: "no-store" as const }
              : { next: { revalidate: revalidateSeconds } }),
          }),
      },
    }
  );
}

export async function getIndicesPublicos(
  revalidateSeconds: number | "no-store" = "no-store"
): Promise<IndicePublico[]> {
  try {
    // Sem a coluna `respostas` (JSONB pesado): card e dashboard já leem as
    // respostas agregadas em `notas_eixos[].respostas`. `nota_final` é
    // normalizada para number (PostgREST pode serializar numeric como string).
    const { data, error } = await createAnonClient(revalidateSeconds)
      .from("indice_publico")
      .select("municipio_id, nome, nota_final, classificacao, notas_eixos, submitted_at");
    if (error) {
      console.error("Erro em getIndicesPublicos (Supabase):", error.message, error.details, error.hint);
      return [];
    }
    return (data ?? []).map((row) => ({
      ...(row as IndicePublico),
      nota_final: Number((row as IndicePublico).nota_final),
    }));
  } catch (err) {
    console.error("Exceção em getIndicesPublicos:", err);
    return [];
  }
}

export async function getMunicipios(): Promise<Municipio[]> {
  try {
    const { data, error } = await createAnonClient()
      .from("municipios")
      .select("id, nome")
      .order("nome");
    if (error) return [];
    return (data ?? []) as Municipio[];
  } catch {
    return [];
  }
}
