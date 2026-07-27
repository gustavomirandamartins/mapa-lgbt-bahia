"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Send,
  Loader2,
  PartyPopper,
} from "lucide-react";

import {
  IDT_QUESTIONARIO,
  TOTAL_PERGUNTAS,
  corDaNota,
  type IdtRespostas,
} from "@/lib/idt";
import { submeterAvaliacao } from "@/lib/actions/avaliacao";

/**
 * Wizard do questionário IDT-LGBT: 7 etapas (uma por eixo), mobile-first.
 */
export function QuestionnaireWizard({ nomeMunicipio }: { nomeMunicipio: string }) {
  const router = useRouter();
  const [etapa, setEtapa] = useState(0);
  const [respostas, setRespostas] = useState<IdtRespostas>({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState<{
    nota: number;
    classificacao: string;
  } | null>(null);

  const eixoAtual = IDT_QUESTIONARIO[etapa];
  const respondidas = Object.keys(respostas).length;
  const progresso = Math.round((respondidas / TOTAL_PERGUNTAS) * 100);
  const etapaCompleta = eixoAtual.perguntas.every(
    (pergunta) => respostas[pergunta.id] !== undefined
  );
  const ultimaEtapa = etapa === IDT_QUESTIONARIO.length - 1;

  async function handleSubmit() {
    setEnviando(true);
    setErro(null);
    const resultado = await submeterAvaliacao(respostas);
    setEnviando(false);
    if (resultado.error) {
      setErro(resultado.error);
      return;
    }
    setConcluido({
      nota: resultado.notaFinal ?? 0,
      classificacao: resultado.classificacao ?? "",
    });
  }

  if (concluido) {
    return (
      <div className="glass-strong animate-sheet-up mx-auto w-full max-w-lg rounded-[2rem] p-8 text-center">
        <span className="pride-gradient mx-auto flex size-16 items-center justify-center rounded-full text-white shadow-lg">
          <PartyPopper className="size-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Questionário enviado!
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Sua avaliação foi registrada e aguarda aprovação do administrador para
          ser publicada no mapa.
        </p>
        <div
          className="mx-auto mt-6 flex size-28 flex-col items-center justify-center rounded-[1.75rem] text-white shadow-xl"
          style={{ backgroundColor: corDaNota(concluido.nota) }}
        >
          <span className="text-4xl font-extrabold">{concluido.nota.toFixed(0)}</span>
          <span className="text-xs font-semibold opacity-90">/ 100</span>
        </div>
        <p className="mt-3 text-sm font-bold" style={{ color: corDaNota(concluido.nota) }}>
          {concluido.classificacao}
        </p>
        <button
          onClick={() => router.push("/painel")}
          className="glass-soft mt-6 w-full rounded-2xl px-4 py-3.5 text-base font-semibold text-neutral-700 transition-transform active:scale-[0.98]"
        >
          Voltar ao painel
        </button>
      </div>
    );
  }

  return (
    <div className="glass-strong mx-auto w-full max-w-2xl rounded-[2rem] p-5 sm:p-8">
      {/* Cabeçalho e progresso */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
          Questionário IDT-LGBT · {nomeMunicipio}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200/70">
            <div
              className="pride-gradient h-full rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <span className="text-xs font-bold text-neutral-500">
            {respondidas}/{TOTAL_PERGUNTAS}
          </span>
        </div>
      </div>

      {/* Eixo atual */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
            Eixo {etapa + 1} de {IDT_QUESTIONARIO.length}
          </p>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {eixoAtual.nome}
          </h1>
        </div>
        <span className="glass-soft shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-neutral-600">
          Peso {(eixoAtual.peso * 100).toFixed(0)}%
        </span>
      </div>

      {/* Perguntas */}
      <div className="flex flex-col gap-5">
        {eixoAtual.perguntas.map((pergunta, indice) => {
          const respondida = respostas[pergunta.id] !== undefined;
          return (
            <fieldset
              key={pergunta.id}
              className="glass-soft rounded-2xl p-4"
            >
              <legend className="sr-only">{pergunta.texto}</legend>
              <p className="mb-3 flex items-start gap-2 text-sm leading-snug font-semibold">
                {respondida ? (
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-green-500" aria-hidden />
                ) : (
                  <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-neutral-300/80 text-[10px] font-bold text-white">
                    {indice + 1}
                  </span>
                )}
                {pergunta.texto}
              </p>
              <div className="flex flex-col gap-2">
                {pergunta.opcoes.map((opcao) => {
                  const selecionada = respostas[pergunta.id] === opcao.valor;
                  return (
                    <button
                      key={opcao.valor}
                      type="button"
                      onClick={() =>
                        setRespostas((atual) => ({
                          ...atual,
                          [pergunta.id]: opcao.valor,
                        }))
                      }
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all active:scale-[0.99] ${
                        selecionada
                          ? "border-neutral-400 bg-neutral-900/10 text-neutral-900 shadow-sm"
                          : "border-white/60 bg-white/40 text-neutral-600 hover:bg-white/70"
                      }`}
                      aria-pressed={selecionada}
                    >
                      {opcao.rotulo}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      {erro && (
        <p className="animate-fade-in mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </p>
      )}

      {/* Navegação */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setEtapa((atual) => Math.max(0, atual - 1))}
          disabled={etapa === 0 || enviando}
          className="glass-soft flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-600 transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Anterior
        </button>

        {ultimaEtapa ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!etapaCompleta || enviando}
            className="pride-gradient flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {enviando ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            {enviando ? "Enviando…" : "Enviar avaliação"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              setEtapa((atual) => Math.min(IDT_QUESTIONARIO.length - 1, atual + 1))
            }
            disabled={!etapaCompleta}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            Próximo eixo
            <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
