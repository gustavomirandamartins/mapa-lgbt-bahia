"use client";

import { X, TrendingUp, TrendingDown, CalendarDays, Info } from "lucide-react";

import { corDaNota } from "@/lib/idt";
import type { IndicePublico } from "@/lib/public-data";
import { RadarChart } from "@/components/map/radar-chart";

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
 * exibido ao tocar em um município no mapa.
 */
export function MunicipioCard({ nome, indice, onClose }: MunicipioCardProps) {
  return (
    <div className="animate-sheet-up pointer-events-auto fixed inset-x-3 bottom-3 z-30 mx-auto max-w-md sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96">
      <div className="neuro-card max-h-[76dvh] overflow-y-auto rounded-[2.2rem] p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase">
              Município
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
            <div className="mb-5 flex items-center gap-4">
              <div className="neuro-rainbow-ring">
                <div
                  className="flex size-20 shrink-0 flex-col items-center justify-center rounded-full text-[#2c3444] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-2px_-2px_4px_rgba(0,0,0,0.15)]"
                  style={{ backgroundColor: corDaNota(indice.nota_final) }}
                >
                  <span className="text-2xl leading-none font-extrabold">
                    {Number(indice.nota_final).toFixed(0)}
                  </span>
                  <span className="text-[10px] font-bold opacity-80">
                    / 100
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase">
                  IDT-LGBT
                </p>
                <p
                  className="inline-block rounded-full px-3 py-1 text-xs leading-tight font-extrabold text-[#2c3444] shadow-sm"
                  style={{ backgroundColor: corDaNota(indice.nota_final) }}
                >
                  {indice.classificacao}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#64748b]">
                  <CalendarDays className="size-3.5" aria-hidden />
                  Avaliado em {formatarData(indice.submitted_at)}
                </p>
              </div>
            </div>

            <div className="neuro-inset mb-4 flex justify-center rounded-3xl p-3">
              <RadarChart
                eixos={indice.notas_eixos.map((eixo) => ({
                  nome: eixo.nome,
                  nomeCurto: eixo.nomeCurto,
                  percentual: eixo.percentual,
                }))}
                size={230}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {indice.notas_eixos.map((eixo) => (
                <div
                  key={eixo.eixoId}
                  className="neuro-inset rounded-2xl px-3 py-2.5"
                >
                  <p className="truncate text-[11px] font-bold text-[#64748b]">
                    {eixo.nomeCurto}
                  </p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#dbe2f0] shadow-inner">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#96c8f2,#f7a1c2)] shadow-[2px_0_4px_rgba(0,0,0,0.1)]"
                      style={{ width: `${eixo.percentual}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] font-extrabold text-[#2c3444]">
                    {eixo.percentual.toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="neuro-inset rounded-full p-4 text-[#64748b]">
              <Info className="size-6" />
            </span>
            <p className="text-sm font-bold text-[#2c3444]">
              Este município ainda não possui avaliação IDT-LGBT publicada.
            </p>
            <p className="text-xs font-medium text-[#64748b]">
              O gestor municipal pode solicitar acesso na Central de Controle e
              responder ao questionário.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function CardResumoChip({
  icone,
  rotulo,
  valor,
}: {
  icone: "up" | "down";
  rotulo: string;
  valor: string;
}) {
  const Icone = icone === "up" ? TrendingUp : TrendingDown;
  return (
    <div className="neuro-inset flex items-center gap-2 rounded-2xl px-3.5 py-2.5">
      <Icone
        className={`size-4 ${icone === "up" ? "text-emerald-600" : "text-rose-500"}`}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-wide text-[#64748b] uppercase">
          {rotulo}
        </p>
        <p className="truncate text-xs font-extrabold text-[#2c3444]">{valor}</p>
      </div>
    </div>
  );
}
