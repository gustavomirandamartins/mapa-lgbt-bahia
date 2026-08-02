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
function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );
}

export async function getIndicesPublicos(): Promise<IndicePublico[]> {
  try {
    const { data, error } = await createAnonClient()
      .from("indice_publico")
      .select("municipio_id, nome, nota_final, classificacao, notas_eixos, respostas, submitted_at");
    if (error) return [];
    return (data ?? []) as IndicePublico[];
  } catch {
    // Sem Supabase configurado ainda: mapa renderiza sem dados.
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
