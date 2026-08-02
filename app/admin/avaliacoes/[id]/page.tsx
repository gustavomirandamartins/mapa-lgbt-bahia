import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { requireAdmin } from "@/lib/auth-guards";
import {
  aprovarAvaliacao,
  rejeitarAvaliacao,
} from "@/lib/actions/admin";
import {
  IDT_QUESTIONARIO,
  corDaNota,
  formatarRespostaTexto,
  type IdtRespostas,
  type IdtResultadoEixo,
} from "@/lib/idt";
import { AdminActions } from "@/components/admin-actions";

export const metadata: Metadata = { title: "Revisão de Avaliação - PLATUR-LGBT+" };

export const dynamic = "force-dynamic";

interface AvaliacaoDetalhe {
  id: string;
  status: string;
  respostas: IdtRespostas;
  notas_eixos: IdtResultadoEixo[];
  nota_final: number;
  classificacao: string;
  submitted_at: string;
  municipios: { nome: string } | null;
  profiles: { nome: string } | null;
}

export default async function AvaliacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("avaliacoes")
    .select(
      "id, status, respostas, notas_eixos, nota_final, classificacao, submitted_at, municipios(nome), profiles!user_id(nome)"
    )
    .eq("id", id)
    .single();

  if (!data) notFound();
  const avaliacao = data as unknown as AvaliacaoDetalhe;
  const pendente = avaliacao.status === "pendente";

  return (
    <main className="app-backdrop min-h-dvh px-4 py-6 sm:py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <Link
          href="/admin"
          className="glass-soft inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-600"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Administração
        </Link>

        {/* Resumo */}
        <section className="glass-strong flex flex-wrap items-center gap-5 rounded-[2rem] p-6">
          <div
            className="flex size-20 shrink-0 flex-col items-center justify-center rounded-[1.5rem] text-white shadow-lg"
            style={{ backgroundColor: corDaNota(avaliacao.nota_final) }}
          >
            <CheckCircle2 className="size-10" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
              Revisão de Mapeamento · PLATUR-LGBT+
            </p>
            <h1 className="text-xl leading-tight font-bold tracking-tight">
              {avaliacao.municipios?.nome}
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              Enviada por {avaliacao.profiles?.nome} em{" "}
              {new Date(avaliacao.submitted_at).toLocaleDateString("pt-BR")}
            </p>
            <p
              className="mt-1 text-sm font-bold"
              style={{ color: corDaNota(avaliacao.nota_final) }}
            >
              {avaliacao.classificacao}
            </p>
          </div>
          {pendente ? (
            <AdminActions
              onAprovar={aprovarAvaliacao.bind(null, avaliacao.id)}
              onRejeitar={rejeitarAvaliacao.bind(null, avaliacao.id)}
            />
          ) : (
            <span className="glass-soft rounded-full px-3 py-1.5 text-xs font-bold text-neutral-500 capitalize">
              {avaliacao.status}
            </span>
          )}
        </section>

        {/* Respostas por eixo */}
        {IDT_QUESTIONARIO.map((eixo) => {
          return (
            <section key={eixo.id} className="glass rounded-[2rem] p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold tracking-tight">{eixo.nome}</h2>
                <span className="glass-soft rounded-full px-2.5 py-1 text-[11px] font-bold text-neutral-600">
                  {eixo.perguntas.length} perguntas
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {eixo.perguntas.map((pergunta) => {
                  const valor = avaliacao.respostas[pergunta.id];
                  const textoFormatado = formatarRespostaTexto(valor);
                  return (
                    <li
                      key={pergunta.id}
                      className="glass-soft flex flex-col gap-1 rounded-xl px-3.5 py-2.5"
                    >
                      <p className="text-xs leading-snug font-semibold text-neutral-700">
                        {pergunta.texto}
                      </p>
                      <p className="text-xs font-extrabold text-[#1880fb]">
                        {textoFormatado}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
