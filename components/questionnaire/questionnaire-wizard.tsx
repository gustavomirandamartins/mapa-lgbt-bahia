"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Send,
  Loader2,
  PartyPopper,
  Check,
} from "lucide-react";

import {
  IDT_QUESTIONARIO,
  TOTAL_PERGUNTAS,
  type IdtRespostas,
} from "@/lib/idt";
import { submeterAvaliacao } from "@/lib/actions/avaliacao";

/**
 * Wizard do questionário da Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal: 7 etapas (uma por eixo), mobile-first.
 * Suporta perguntas do tipo rádio (sim/não/opções), múltipla escolha (checkbox) e texto livre.
 */
export function QuestionnaireWizard({ nomeMunicipio }: { nomeMunicipio: string }) {
  const router = useRouter();
  const [etapa, setEtapa] = useState(0);
  const [respostas, setRespostas] = useState<IdtRespostas>({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState<{
    classificacao: string;
  } | null>(null);

  const [confirmandoEnvio, setConfirmandoEnvio] = useState(false);

  const tiposPorPergunta = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const eixo of IDT_QUESTIONARIO) {
      for (const pergunta of eixo.perguntas) {
        mapa.set(pergunta.id, pergunta.tipo);
      }
    }
    return mapa;
  }, []);
  const respondidas = Object.keys(respostas).filter((id) => {
    const val = respostas[id];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "string" && tiposPorPergunta.get(id) === "text") {
      return val.trim() !== "";
    }
    return val !== undefined && val !== "";
  }).length;
  const progresso = Math.round((respondidas / TOTAL_PERGUNTAS) * 100);

  const isPerguntaRespondida = (perguntaId: string, tipo: string) => {
    const val = respostas[perguntaId];
    if (tipo === "radio") {
      return val !== undefined && val !== "";
    }
    // Checkbox e Texto são livres/complementares na metodologia
    return true;
  };

  const etapaCompleta = eixoAtual.perguntas.every((pergunta) =>
    isPerguntaRespondida(pergunta.id, pergunta.tipo)
  );
  const ultimaEtapa = etapa === IDT_QUESTIONARIO.length - 1;

  // Resumo por eixo para a tela de revisão antes do envio final.
  const resumoEnvio = IDT_QUESTIONARIO.map((eixo) => {
    const radios = eixo.perguntas.filter((p) => p.tipo === "radio");
    const respondidos = radios.filter((p) => {
      const v = respostas[p.id];
      return v !== undefined && v !== "";
    }).length;
    return { eixo, total: radios.length, respondidos };
  });

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
      classificacao: resultado.classificacao ?? "Mapeado",
    });
  }

  const toggleCheckbox = (perguntaId: string, valor: string) => {
    const atuais: string[] = Array.isArray(respostas[perguntaId])
      ? respostas[perguntaId]
      : [];
    const novo = atuais.includes(valor)
      ? atuais.filter((item) => item !== valor)
      : [...atuais, valor];
    setRespostas((atual) => ({
      ...atual,
      [perguntaId]: novo,
    }));
  };

  if (concluido) {
    return (
      <div className="glass-strong animate-sheet-up mx-auto w-full max-w-lg rounded-[2rem] p-8 text-center">
        <span className="pride-gradient mx-auto flex size-16 items-center justify-center rounded-full text-white shadow-lg">
          <PartyPopper className="size-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#2c3444]">
          Mapeamento enviado!
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Suas respostas à Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal foram registradas e aguardam a revisão do
          administrador para serem publicadas no mapa interativo da Bahia.
        </p>
        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-[#10b981] px-5 py-2.5 text-white shadow-lg">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          <span className="text-sm font-extrabold">{concluido.classificacao}</span>
        </div>
        <button
          onClick={() => router.push("/painel")}
          className="glass-soft mt-6 w-full rounded-2xl px-4 py-3.5 text-base font-semibold text-neutral-700 transition-transform active:scale-[0.98]"
        >
          Voltar ao painel do município
        </button>
      </div>
    );
  }

  return (
    <div className="glass-strong mx-auto w-full max-w-2xl rounded-[2rem] p-5 sm:p-8">
      {/* Cabeçalho e progresso */}
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
          Questionário · {nomeMunicipio}
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
          <h1 className="text-xl font-bold tracking-tight text-[#2c3444] sm:text-2xl">
            {eixoAtual.nome}
          </h1>
        </div>
        <span className="glass-soft shrink-0 rounded-full px-3 py-1.5 text-xs font-bold text-neutral-600">
          {eixoAtual.perguntas.length} perguntas
        </span>
      </div>

      {/* Perguntas */}
      <div className="flex flex-col gap-5">
        {eixoAtual.perguntas.map((pergunta, indice) => {
          const valorAtual = respostas[pergunta.id];
          const respondida =
            pergunta.tipo === "checkbox"
              ? Array.isArray(valorAtual) && valorAtual.length > 0
              : valorAtual !== undefined && valorAtual !== "";

          return (
            <fieldset
              key={pergunta.id}
              className="glass-soft rounded-2xl p-4"
            >
              <legend className="sr-only">{pergunta.texto}</legend>
              <p className="mb-3 flex items-start gap-2 text-sm leading-snug font-semibold text-[#2c3444]">
                {respondida ? (
                  <CheckCircle2
                    className="mt-0.5 size-4.5 shrink-0 text-emerald-500"
                    aria-hidden
                  />
                ) : (
                  <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-neutral-300/80 text-[10px] font-bold text-white">
                    {indice + 1}
                  </span>
                )}
                {pergunta.texto}
              </p>

              {/* 1. Perguntas do tipo Rádio */}
              {pergunta.tipo === "radio" && pergunta.opcoes && (
                <div className="flex flex-col gap-2">
                  {pergunta.opcoes.map((opcao) => {
                    const selecionada = valorAtual === opcao.valor;
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
                            ? "border-[#1880fb] bg-[#1880fb]/10 font-bold text-[#1880fb] shadow-sm"
                            : "border-white/60 bg-white/40 text-neutral-700 hover:bg-white/70"
                        }`}
                        aria-pressed={selecionada}
                      >
                        {opcao.rotulo}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. Perguntas do tipo Checkbox */}
              {pergunta.tipo === "checkbox" && pergunta.opcoes && (
                <div className="flex flex-col gap-2">
                  {pergunta.opcoes.map((opcao) => {
                    const arrayAtual: string[] = Array.isArray(valorAtual)
                      ? valorAtual
                      : [];
                    const selecionada = arrayAtual.includes(String(opcao.valor));
                    return (
                      <button
                        key={opcao.valor}
                        type="button"
                        onClick={() => toggleCheckbox(pergunta.id, String(opcao.valor))}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all active:scale-[0.99] ${
                          selecionada
                            ? "border-[#1880fb] bg-[#1880fb]/10 font-bold text-[#1880fb] shadow-sm"
                            : "border-white/60 bg-white/40 text-neutral-700 hover:bg-white/70"
                        }`}
                        aria-pressed={selecionada}
                      >
                        <span>{opcao.rotulo}</span>
                        {selecionada && (
                          <Check className="size-4 shrink-0 text-[#1880fb]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. Perguntas do tipo Texto Livre */}
              {pergunta.tipo === "text" && (
                <div className="mt-1">
                  <input
                    type="text"
                    value={
                      valorAtual !== undefined && valorAtual !== null
                        ? String(valorAtual)
                        : ""
                    }
                    onChange={(e) =>
                      setRespostas((atual) => ({
                        ...atual,
                        [pergunta.id]: e.target.value,
                      }))
                    }
                    placeholder={pergunta.placeholder ?? "Descreva aqui..."}
                    maxLength={2000}
                    className="neuro-inset w-full rounded-xl px-4 py-3 text-sm font-semibold text-[#2c3444] placeholder-[#94a3b8] outline-none transition-all focus:ring-2 focus:ring-[#1880fb]/30"
                  />
                </div>
              )}
            </fieldset>
          );
        })}
      </div>

      {erro && (
        <p className="animate-fade-in mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </p>
      )}

      {/* Revisão antes do envio final */}
      {confirmandoEnvio && ultimaEtapa && (
        <div className="animate-fade-in mt-4 rounded-2xl border border-white/60 bg-white/50 p-4">
          <p className="text-sm font-bold text-[#2c3444]">
            Revise antes de enviar
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Perguntas obrigatórias (rádio) respondidas por eixo. Volte às
            etapas anteriores para corrigir, se preciso.
          </p>
          <ul className="mt-3 flex flex-col gap-1.5">
            {resumoEnvio.map(({ eixo, total, respondidos }) => (
              <li
                key={eixo.id}
                className="flex items-center justify-between gap-2 text-xs font-semibold"
              >
                <span className="text-neutral-600">{eixo.nome}</span>
                <span
                  className={
                    respondidos === total
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }
                >
                  {respondidos}/{total}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmandoEnvio(false)}
              disabled={enviando}
              className="glass-soft flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-transform active:scale-[0.98] disabled:opacity-40"
            >
              Revisar respostas
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={enviando}
              className="pride-gradient flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {enviando ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
              {enviando ? "Enviando…" : "Confirmar envio"}
            </button>
          </div>
        </div>
      )}

      {/* Navegação */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setConfirmandoEnvio(false);
            setEtapa((atual) => Math.max(0, atual - 1));
          }}
          disabled={etapa === 0 || enviando}
          className="glass-soft flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-600 transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Anterior
        </button>

        {ultimaEtapa ? (
          <button
            type="button"
            onClick={() => {
              if (confirmandoEnvio) {
                handleSubmit();
              } else {
                setConfirmandoEnvio(true);
              }
            }}
            disabled={!etapaCompleta || enviando}
            className="pride-gradient flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {enviando ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            {enviando
              ? "Enviando…"
              : confirmandoEnvio
                ? "Confirmar envio"
                : "Revisar e enviar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              setEtapa((atual) => Math.min(IDT_QUESTIONARIO.length - 1, atual + 1))
            }
            disabled={!etapaCompleta}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#2c3444] px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            Próximo eixo
            <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
