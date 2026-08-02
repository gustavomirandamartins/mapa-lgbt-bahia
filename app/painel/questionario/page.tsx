import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUser } from "@/lib/auth-guards";
import { QuestionnaireWizard } from "@/components/questionnaire/questionnaire-wizard";

export const metadata: Metadata = { title: "Questionário PLATUR-LGBT+" };

export const dynamic = "force-dynamic";

export default async function QuestionarioPage() {
  const { supabase, profile } = await requireUser();

  if (profile.role !== "municipio") redirect("/admin");
  if (profile.status !== "aprovado" || !profile.municipio_id) {
    redirect("/painel");
  }

  const { data: municipio } = await supabase
    .from("municipios")
    .select("nome")
    .eq("id", profile.municipio_id)
    .single();

  return (
    <main className="app-backdrop min-h-dvh px-4 py-6 sm:py-10">
      <div className="mx-auto mb-4 max-w-2xl">
        <Link
          href="/painel"
          className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-600"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Painel
        </Link>
      </div>
      <QuestionnaireWizard nomeMunicipio={municipio?.nome ?? "Município"} />
    </main>
  );
}
