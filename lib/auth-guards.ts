import { redirect } from "next/navigation";

import { getProfile } from "@/lib/supabase/server";

export interface Municipio {
  id: number;
  nome: string;
}

export interface Profile {
  id: string;
  nome: string;
  role: "municipio" | "admin";
  status: "pendente" | "aprovado" | "rejeitado";
  municipio_id: number | null;
}

/**
 * Exige usuário autenticado; redireciona para /login caso contrário.
 */
export async function requireUser() {
  const { supabase, user, profile } = await getProfile();
  if (!user || !profile) redirect("/login");
  return { supabase, user: user!, profile: profile as Profile };
}

/**
 * Exige admin aprovado; redireciona para /painel caso contrário.
 */
export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.profile.role !== "admin" || ctx.profile.status !== "aprovado") {
    redirect("/painel");
  }
  return ctx;
}
