import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Hourglass,
  XCircle,
  FileEdit,
  CheckCircle2,
  MapPin,
} from "lucide-react";

import { requireUser } from "@/lib/auth-guards";
import { corDaNota, type IdtResultadoEixo } from "@/lib/idt";
import { PrideLogo } from "@/components/pride-logo";
import { LogoutButton } from "@/components/logout-button";

export const metadata: Metadata = { title: "Painel do Município" };

export const dynamic = "force-dynamic";

interface Avaliacao {
  id: string;
  status: "pendente" | "aprovado" | "rejeitado" | "substituida";
  nota_final: number;
  classificacao: string;
  notas_eixos: IdtResultadoEixo[];
  submitted_at: string;
  review_note: string | null;
}

const STATUS_UI: Record<
  Avaliacao["status"],
  { rotulo: string; classes: string; Icone: typeof CheckCircle2 }
> = {
  pendente: {
    rotulo: "Aguardando aprovação",
    classes: "bg-amber-500/10 text-amber-700",
    Icone: Hourglass,
  },
  aprovado: {
    rotulo: "Publicada no mapa",
    classes: "bg-green-500/10 text-green-700",
    Icone: CheckCircle2,
  },
  rejeitado: {
    rotulo: "Devolvida pelo admin",
    classes: "bg-red-500/10 text-red-600",
    Icone: XCircle,
  },
  substituida: {
    rotulo: "Versão anterior",
    classes: "bg-neutral-500/10 text-neutral-500",
    Icone: FileEdit,
  },
};

export default async function PainelPage() {
  const { supabase, profile } = await requireUser();

  if (profile.role === "admin") redirect("/admin");

  const { data: municipio } = profile.municipio_id
    ? await supabase
        .from("municipios")
        .select("nome")
        .eq("id", profile.municipio_id)
        .single()
    : { data: null };

  const { data: avaliacoesData } = await supabase
    .from("avaliacoes")
    .select("id, status, nota_final, classificacao, notas_eixos, submitted_at, review_note")
    .eq("user_id", profile.id)
    .order("submitted_at", { ascending: false });

  const avaliacoes = (avaliacoesData ?? []) as Avaliacao[];
  const publicada = avaliacoes.find((a) => a.status === "aprovado");
  const pendente = avaliacoes.find((a) => a.status === "pendente");

  return (
    <main className="app-backdrop min-h-dvh px-4 py-6 sm:py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        {/* Header */}
        <header className="glass flex items-center justify-between gap-3 rounded-3xl px-5 py-4">
          <div className="flex items-center gap-3.5">
            <PrideLogo size={52} />
            <div>
              <p className="text-sm font-extrabold tracking-tight">
                Painel do Município
              </p>
              <p className="flex items-center gap-1 text-xs font-medium text-neutral-500">
                <MapPin className="size-3" aria-hidden />
                {municipio?.nome ?? "—"} · {profile.nome}
              </p>
            </div>
          </div>
          <LogoutButton />
        </header>

        {/* Conta pendente de aprovação */}
        {profile.status === "pendente" && (
          <section className="glass-strong animate-fade-in rounded-[2rem] p-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
              <Hourglass className="size-7" aria-hidden />
            </span>
            <h1 className="mt-4 text-xl font-bold tracking-tight">
              Cadastro em análise
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
              O administrador vai revisar e aprovar seu cadastro. Assim que for
              liberado, você poderá responder ao questionário da Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal de{" "}
              <strong>{municipio?.nome}</strong>.
            </p>
          </section>
        )}

        {profile.status === "rejeitado" && (
          <section className="glass-strong animate-fade-in rounded-[2rem] p-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-500/15 text-red-600">
              <XCircle className="size-7" aria-hidden />
            </span>
            <h1 className="mt-4 text-xl font-bold tracking-tight">
              Cadastro não aprovado
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
              Entre em contato com a administração da plataforma para mais
              informações sobre o acesso.
            </p>
          </section>
        )}

        {/* Conta aprovada */}
        {profile.status === "aprovado" && (
          <>
            {/* Nota publicada */}
            {publicada ? (
              <section className="glass-strong animate-fade-in flex items-center gap-5 rounded-[2rem] p-6">
                <div
                  className="flex size-24 shrink-0 flex-col items-center justify-center rounded-[1.5rem] text-white shadow-lg"
                  style={{ backgroundColor: corDaNota(publicada.nota_final) }}
                >
                  <span className="text-3xl leading-none font-extrabold">
                    {Number(publicada.nota_final).toFixed(0)}
                  </span>
                  <span className="text-[10px] font-semibold opacity-90">/ 100</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
                    Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal publicada
                  </p>
                  <p
                    className="text-lg leading-tight font-bold"
                    style={{ color: corDaNota(publicada.nota_final) }}
                  >
                    {publicada.classificacao}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Avaliação de{" "}
                    {new Date(publicada.submitted_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </section>
            ) : (
              <section className="glass animate-fade-in rounded-[2rem] p-6 text-center">
                <p className="text-sm font-medium text-neutral-500">
                  {municipio?.nome} ainda não possui índice publicado no mapa.
                </p>
              </section>
            )}

            {/* CTA questionário */}
            {pendente ? (
              <section className="glass flex items-center gap-4 rounded-[2rem] p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
                  <Hourglass className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold">Avaliação em revisão</p>
                  <p className="text-xs text-neutral-500">
                    Enviada em{" "}
                    {new Date(pendente.submitted_at).toLocaleDateString("pt-BR")} ·
                    nota calculada: {Number(pendente.nota_final).toFixed(0)} pontos.
                    Aguarde a aprovação do administrador.
                  </p>
                </div>
              </section>
            ) : (
              <Link
                href="/painel/questionario"
                className="pride-gradient group flex items-center justify-between gap-3 rounded-[2rem] p-6 text-white shadow-xl transition-transform active:scale-[0.99]"
              >
                <div>
                  <p className="text-lg font-extrabold tracking-tight">
                    {publicada
                      ? "Responder nova avaliação"
                      : "Responder o questionário da Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal"}
                  </p>
                  <p className="text-sm opacity-90">
                    7 eixos · 49 perguntas · mapeamento municipal do turismo
                  </p>
                </div>
                <ClipboardList className="size-8 shrink-0 transition-transform group-hover:scale-110" aria-hidden />
              </Link>
            )}

            {/* Histórico */}
            {avaliacoes.length > 0 && (
              <section className="glass rounded-[2rem] p-6">
                <h2 className="mb-3 text-sm font-bold tracking-tight">
                  Histórico de avaliações
                </h2>
                <ul className="flex flex-col gap-2">
                  {avaliacoes.map((avaliacao) => {
                    const ui = STATUS_UI[avaliacao.status];
                    return (
                      <li
                        key={avaliacao.id}
                        className="glass-soft flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="flex size-9 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                            style={{
                              backgroundColor: corDaNota(avaliacao.nota_final),
                            }}
                          >
                            {Number(avaliacao.nota_final).toFixed(0)}
                          </span>
                          <div>
                            <p className="text-xs font-bold">
                              {new Date(
                                avaliacao.submitted_at
                              ).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {avaliacao.classificacao}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${ui.classes}`}
                        >
                          <ui.Icone className="size-3.5" aria-hidden />
                          {ui.rotulo}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
