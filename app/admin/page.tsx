import type { Metadata } from "next";
import Link from "next/link";
import { Users, ClipboardCheck, Eye, Map as MapIcon } from "lucide-react";

import { requireAdmin } from "@/lib/auth-guards";
import {
  aprovarPerfil,
  rejeitarPerfil,
  aprovarAvaliacao,
  rejeitarAvaliacao,
} from "@/lib/actions/admin";
import { corDaNota } from "@/lib/idt";
import { PrideLogo } from "@/components/pride-logo";
import { LogoutButton } from "@/components/logout-button";
import { AdminActions } from "@/components/admin-actions";

export const metadata: Metadata = { title: "Administração" };

export const dynamic = "force-dynamic";

interface PerfilPendente {
  id: string;
  nome: string;
  created_at: string;
  municipios: { nome: string } | null;
}

interface AvaliacaoPendente {
  id: string;
  nota_final: number;
  classificacao: string;
  submitted_at: string;
  municipios: { nome: string } | null;
  profiles: { nome: string } | null;
}

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const [{ data: perfis }, { data: avaliacoes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nome, created_at, municipios(nome)")
      .eq("status", "pendente")
      .order("created_at", { ascending: true }),
    supabase
      .from("avaliacoes")
      .select("id, nota_final, classificacao, submitted_at, municipios(nome), profiles(nome)")
      .eq("status", "pendente")
      .order("submitted_at", { ascending: true }),
  ]);

  const perfisPendentes = (perfis ?? []) as unknown as PerfilPendente[];
  const avaliacoesPendentes = (avaliacoes ?? []) as unknown as AvaliacaoPendente[];

  return (
    <main className="app-backdrop min-h-dvh px-4 py-6 sm:py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {/* Header */}
        <header className="glass flex items-center justify-between gap-3 rounded-3xl px-5 py-4">
          <div className="flex items-center gap-3">
            <PrideLogo size={40} />
            <div>
              <p className="text-sm font-extrabold tracking-tight">
                Administração · IDT-LGBT
              </p>
              <p className="text-xs font-medium text-neutral-500">
                Aprovações de cadastros e avaliações
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="glass-soft flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-neutral-600"
            >
              <MapIcon className="size-4" aria-hidden />
              Mapa
            </Link>
            <LogoutButton />
          </div>
        </header>

        {/* Cadastros pendentes */}
        <section className="glass rounded-[2rem] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-tight">
            <Users className="size-4 text-neutral-500" aria-hidden />
            Cadastros aguardando aprovação
            <span className="glass-soft rounded-full px-2 py-0.5 text-xs font-bold text-neutral-500">
              {perfisPendentes.length}
            </span>
          </h2>

          {perfisPendentes.length === 0 ? (
            <p className="text-sm text-neutral-400">
              Nenhum cadastro pendente no momento.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {perfisPendentes.map((perfil) => (
                <li
                  key={perfil.id}
                  className="glass-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold">{perfil.nome}</p>
                    <p className="text-xs text-neutral-500">
                      {perfil.municipios?.nome ?? "Município não informado"} ·{" "}
                      {new Date(perfil.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <AdminActions
                    compact
                    onAprovar={aprovarPerfil.bind(null, perfil.id)}
                    onRejeitar={rejeitarPerfil.bind(null, perfil.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Avaliações pendentes */}
        <section className="glass rounded-[2rem] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-tight">
            <ClipboardCheck className="size-4 text-neutral-500" aria-hidden />
            Avaliações aguardando revisão
            <span className="glass-soft rounded-full px-2 py-0.5 text-xs font-bold text-neutral-500">
              {avaliacoesPendentes.length}
            </span>
          </h2>

          {avaliacoesPendentes.length === 0 ? (
            <p className="text-sm text-neutral-400">
              Nenhuma avaliação pendente no momento.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {avaliacoesPendentes.map((avaliacao) => (
                <li
                  key={avaliacao.id}
                  className="glass-soft flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow"
                      style={{ backgroundColor: corDaNota(avaliacao.nota_final) }}
                    >
                      {Number(avaliacao.nota_final).toFixed(0)}
                    </span>
                    <div>
                      <p className="text-sm font-bold">
                        {avaliacao.municipios?.nome ?? "—"}
                      </p>
                      <p className="text-xs text-neutral-500">
                        por {avaliacao.profiles?.nome ?? "—"} ·{" "}
                        {new Date(avaliacao.submitted_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/avaliacoes/${avaliacao.id}`}
                      className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white shadow transition-transform active:scale-95"
                    >
                      <Eye className="size-3.5" aria-hidden />
                      Revisar
                    </Link>
                    <AdminActions
                      compact
                      onAprovar={aprovarAvaliacao.bind(null, avaliacao.id)}
                      onRejeitar={rejeitarAvaliacao.bind(null, avaliacao.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
