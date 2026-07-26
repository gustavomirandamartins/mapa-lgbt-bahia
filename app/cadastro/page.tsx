import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { CadastroForm } from "@/components/cadastro-form";
import { PrideLogo } from "@/components/pride-logo";
import type { Municipio } from "@/lib/auth-guards";

export const metadata: Metadata = { title: "Cadastro de Município" };

export const dynamic = "force-dynamic";

export default async function CadastroPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("municipios")
    .select("id, nome")
    .order("nome");
  const municipios: Municipio[] = data ?? [];

  return (
    <main className="app-backdrop flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="glass-strong w-full max-w-md rounded-[2rem] p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <PrideLogo size={56} />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Cadastro de Município
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            O acesso é liberado após aprovação do administrador. Cada gestor
            responde por um único município.
          </p>
        </div>

        <CadastroForm municipios={municipios} />

        <p className="mt-6 text-center text-sm text-neutral-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-violet-600">
            Entrar
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="glass-soft mt-6 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-600"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar ao mapa
      </Link>
    </main>
  );
}
