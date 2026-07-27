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
    <div className="animate-sheet-up pointer-events-auto fixed inset-x-3 bottom-3 z-30 mx-auto max-w-md sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-96">
      <div className="glass-strong max-h-[72dvh] overflow-y-auto rounded-[1.75rem] p-5 shadow-[0_0_24px_-6px_rgba(255,20,147,0.35)] ring-1 ring-[#ff1493]/10 transition-all duration-300 hover:shadow-[0_0_36px_-3px_rgba(255,20,147,0.65)] hover:ring-[#ff1493]/30">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
              Município
            </p>
            <h2 className="text-xl leading-tight font-bold tracking-tight">
              {nome}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar card"
            className="glass-soft rounded-full p-2 text-neutral-500 transition-transform active:scale-95"
          >
            <X className="size-4" />
          </button>
        </div>

        {indice ? (
          <>
            <div className="mb-4 flex items-center gap-4">
              <div
                className="flex size-20 shrink-0 flex-col items-center justify-center rounded-3xl text-white shadow-lg"
                style={{ backgroundColor: corDaNota(indice.nota_final) }}
              >
                <span className="text-2xl leading-none font-extrabold">
                  {Number(indice.nota_final).toFixed(0)}
                </span>
                <span className="text-[10px] font-semibold opacity-90">
                  / 100
                </span>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
                  IDT-LGBT
                </p>
                <p
                  className="inline-block rounded-full px-2.5 py-1 text-xs leading-tight font-bold text-white"
                  style={{ backgroundColor: corDaNota(indice.nota_final) }}
                >
                  {indice.classificacao}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-neutral-500">
                  <CalendarDays className="size-3.5" aria-hidden />
                  Avaliado em {formatarData(indice.submitted_at)}
                </p>
              </div>
            </div>

            <RadarChart
              eixos={indice.notas_eixos.map((eixo) => ({
                nome: eixo.nome,
                nomeCurto: eixo.nomeCurto,
                percentual: eixo.percentual,
              }))}
              size={230}
            />

            <div className="mt-3 grid grid-cols-2 gap-2">
              {indice.notas_eixos.map((eixo) => (
                <div
                  key={eixo.eixoId}
                  className="glass-soft rounded-xl px-2.5 py-2"
                >
                  <p className="truncate text-[11px] font-semibold text-neutral-500">
                    {eixo.nomeCurto}
                  </p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-200/70">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${eixo.percentual}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] font-bold text-neutral-700">
                    {eixo.percentual.toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="glass-soft rounded-full p-3 text-neutral-400">
              <Info className="size-6" />
            </span>
            <p className="text-sm font-medium text-neutral-500">
              Este município ainda não possui avaliação IDT-LGBT publicada.
            </p>
            <p className="text-xs text-neutral-400">
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
    <div className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
      <Icone
        className={`size-4 ${icone === "up" ? "text-green-600" : "text-red-500"}`}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wide text-neutral-400 uppercase">
          {rotulo}
        </p>
        <p className="truncate text-xs font-bold text-neutral-700">{valor}</p>
      </div>
    </div>
  );
}
