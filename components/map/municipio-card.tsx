"use client";

import { useState } from "react";
import { X, CalendarDays, CheckCircle2, AlertCircle } from "lucide-react";

import {
  IDT_QUESTIONARIO,
  corDaNota,
  formatarRespostaTexto,
  type IdtEixoId,
  type IdtValorResposta,
} from "@/lib/idt";
import type { IndicePublico } from "@/lib/public-data";

interface MunicipioCardProps {
  nome: string;
  indice: IndicePublico | null;
  onClose: () => void;
}

function formatarData(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

/**
 * Card do município (bottom sheet no mobile / painel flutuante no desktop),
 * exibindo as respostas completas aos 7 eixos do PLATUR-LGBT+.
 */
export function MunicipioCard({ nome, indice, onClose }: MunicipioCardProps) {
  const [eixoAtivo, setEixoAtivo] = useState<IdtEixoId>("governanca");

  const eixoSelecionado = IDT_QUESTIONARIO.find((e) => e.id === eixoAtivo) ?? IDT_QUESTIONARIO[0];

  // Mescla respostas salvas no objeto indice.respostas ou em indice.notas_eixos
  const obterResposta = (perguntaId: string): IdtValorResposta => {
    if (indice?.respostas && perguntaId in indice.respostas) {
      return indice.respostas[perguntaId];
    }
    for (const eixo of indice?.notas_eixos ?? []) {
      if (eixo.respostas && perguntaId in eixo.respostas) {
        return eixo.respostas[perguntaId];
      }
    }
    return null;
  };

  return (
    <div className="animate-sheet-up pointer-events-auto fixed inset-x-3 bottom-3 z-30 mx-auto max-w-md sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[28rem]">
      <div className="neuro-card max-h-[82dvh] overflow-y-auto rounded-[2.2rem] p-6">
        {/* Cabeçalho do Card */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase">
              Município da Bahia
            </p>
            <h2 className="text-xl leading-tight font-extrabold tracking-tight text-[#2c3444]">
              {nome}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar card"
            className="neuro-pill rounded-full p-2.5 text-[#64748b] transition-transform active:scale-95"
          >
            <X className="size-4" />
          </button>
        </div>

        {indice ? (
          <>
            {/* Badge de Status e Data de Submissão */}
            <div className="mb-5 flex items-center gap-3">
              <div
                className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm"
                style={{ backgroundColor: corDaNota(indice.nota_final) }}
              >
                <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                <span>{indice.classificacao}</span>
              </div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#64748b]">
                <CalendarDays className="size-3.5" aria-hidden />
                {formatarData(indice.submitted_at)}
              </p>
            </div>

            {/* Seletor horizontal de Eixos */}
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-extrabold tracking-wider text-[#64748b] uppercase">
                Respostas por Eixo Temático
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {IDT_QUESTIONARIO.map((eixo) => {
                  const isAtivo = eixo.id === eixoAtivo;
                  return (
                    <button
                      key={eixo.id}
                      type="button"
                      onClick={() => setEixoAtivo(eixo.id)}
                      className={`neuro-pill shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                        isAtivo
                          ? "bg-[#1880fb] text-white shadow-[0_4px_10px_rgba(24,128,251,0.35)]"
                          : "text-[#64748b] hover:text-[#2c3444]"
                      }`}
                    >
                      {eixo.nomeCurto}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Título do Eixo Ativo */}
            <div className="mb-3">
              <h3 className="text-sm font-extrabold text-[#2c3444]">
                {eixoSelecionado.nome}
              </h3>
              <p className="text-[11px] font-semibold text-[#64748b]">
                {eixoSelecionado.perguntas.length} perguntas neste eixo
              </p>
            </div>

            {/* Lista de Perguntas e Respostas daquele Eixo */}
            <div className="flex flex-col gap-3">
              {eixoSelecionado.perguntas.map((perg) => {
                const valor = obterResposta(perg.id);
                const textoFormatado = formatarRespostaTexto(valor);
                const isNaoInformado = textoFormatado === "Não informado";

                return (
                  <div
                    key={perg.id}
                    className="neuro-inset rounded-2xl p-3.5 text-left"
                  >
                    <p className="text-xs leading-snug font-bold text-[#2c3444]">
                      {perg.texto}
                    </p>
                    <p
                      className={`mt-1.5 text-xs font-semibold ${
                        isNaoInformado
                          ? "italic text-[#94a3b8]"
                          : "text-[#1880fb]"
                      }`}
                    >
                      {textoFormatado}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="neuro-inset rounded-full p-4 text-[#64748b]">
              <AlertCircle className="size-6" />
            </span>
            <p className="text-sm font-bold text-[#2c3444]">
              Este município ainda não possui respostas publicadas no PLATUR-LGBT+.
            </p>
            <p className="text-xs font-medium text-[#64748b]">
              O gestor municipal pode solicitar acesso na Central de Controle e
              responder ao questionário oficial.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
