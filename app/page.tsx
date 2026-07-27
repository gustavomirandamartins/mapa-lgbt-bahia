import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { getIndicesPublicos, getMunicipios } from "@/lib/public-data";
import { BahiaMap } from "@/components/map/bahia-map";
import { MapLegend } from "@/components/map/map-legend";
import { PrideLogo } from "@/components/pride-logo";

export const revalidate = 60;

export default async function HomePage() {
  const [indices, municipios] = await Promise.all([
    getIndicesPublicos(),
    getMunicipios(),
  ]);

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <BahiaMap indices={indices} municipios={municipios} />

      {/* Header flutuante */}
      <header className="pointer-events-none fixed inset-x-3 top-3 z-20 flex items-start justify-between gap-3 sm:inset-x-5 sm:top-5">
        <div className="glass pointer-events-auto flex items-center gap-3 rounded-3xl px-4 py-3">
          <PrideLogo size={38} />
          <div>
            <h1 className="text-sm leading-tight font-extrabold tracking-tight sm:text-base">
              Turismo <span className="pride-text">LGBTQIAPN+</span> · Bahia
            </h1>
            <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-[11px]">
              Índice de Desenvolvimento do Turismo LGBT (IDT-LGBT)
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="glass-strong pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold text-neutral-700 transition-transform active:scale-95 sm:text-sm"
        >
          <ShieldCheck className="size-4 text-violet-600" aria-hidden />
          Central de Controle
        </Link>
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
