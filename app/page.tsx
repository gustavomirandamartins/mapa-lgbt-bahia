import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { getIndicesPublicos, getMunicipios } from "@/lib/public-data";
import { BahiaMap } from "@/components/map/bahia-map";
import { MapLegend } from "@/components/map/map-legend";
import { PrideLogo } from "@/components/pride-logo";
import { AuroraCard } from "@/components/ui/aurora-card";

export const revalidate = 60;

export default async function HomePage() {
  const [indices, municipios] = await Promise.all([
    getIndicesPublicos(),
    getMunicipios(),
  ]);

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <BahiaMap indices={indices} municipios={municipios} />

      {/* Vinheta estática: chumbo nas extremidades → revela o rosa escuro da
          terra no centro (efeito de gradiente sobre o relevo terrestre). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 42%, rgba(31,41,55,0.5) 100%)",
        }}
      />

      {/* Header flutuante */}
      <header className="pointer-events-none fixed inset-x-3 top-3 z-20 flex items-start justify-between gap-3 sm:inset-x-5 sm:top-5">
        <AuroraCard
          className="pointer-events-auto rounded-3xl"
          innerClassName="glass flex items-center gap-3 rounded-3xl px-4 py-3"
        >
          <PrideLogo size={42} />
          <div>
            <h1 className="text-lg leading-tight font-extrabold tracking-tight sm:text-xl">
              Turismo <span className="pride-text">LGBTQIAPN+</span> · Bahia
            </h1>
            <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-[11px]">
              Índice de Desenvolvimento do Turismo LGBT (IDT-LGBT)
            </p>
          </div>
        </AuroraCard>

        <AuroraCard
          className="pointer-events-auto rounded-full"
          innerClassName="glass-strong rounded-full"
        >
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold text-neutral-700 transition-transform active:scale-95 sm:text-sm"
          >
            <ShieldCheck className="size-4 text-violet-600" aria-hidden />
            Central de Controle
          </Link>
        </AuroraCard>
      </header>

      <MapLegend avaliados={indices.length} total={municipios.length || 417} />

      {/* Legenda compacta (mobile): barra de faixas no rodapé */}
      <div className="glass pointer-events-none fixed bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full px-3 py-2 sm:hidden">
        <span className="text-[10px] font-bold text-neutral-500">0</span>
        <span className="h-2 w-24 rounded-full bg-[linear-gradient(to_right,#3b82f6,#22c55e,#facc15,#f97316,#ef4444)]" />
        <span className="text-[10px] font-bold text-neutral-500">100</span>
      </div>
    </main>
  );
}
