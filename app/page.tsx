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
    <main className="app-backdrop relative h-dvh w-full overflow-hidden">
      <BahiaMap indices={indices} municipios={municipios} />

      {/* Header flutuante em relevo Neumórfico (Soft UI 3D) */}
      <header className="pointer-events-none fixed inset-x-3 top-3 z-20 flex items-start justify-between gap-3 sm:inset-x-6 sm:top-6">
        <div className="pointer-events-auto neuro-card flex items-center gap-3.5 rounded-3xl px-5 py-3.5">
          <PrideLogo size={46} />
          <div>
            <h1 className="text-lg leading-tight font-extrabold tracking-tight text-[#2c3444] sm:text-xl">
              Turismo <span className="pride-text">LGBTQIAPN+</span> · Bahia
            </h1>
            <p className="text-[11px] leading-tight font-semibold text-[#64748b] sm:text-xs">
              Índice de Desenvolvimento do Turismo LGBT (IDT-LGBT)
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="pointer-events-auto neuro-pill flex items-center gap-2.5 rounded-full px-5 py-3 text-xs font-bold text-[#2c3444] transition-transform active:scale-95 sm:text-sm"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-[#eef1f7] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(178,190,214,0.45)]">
            <ShieldCheck className="size-3.5 text-[#8b5cf6]" aria-hidden />
          </span>
          Central de Controle
        </Link>
      </header>

      <MapLegend avaliados={indices.length} total={municipios.length || 417} />

      {/* Legenda compacta (mobile): barra de faixas no rodapé */}
      <div className="neuro-card pointer-events-none fixed bottom-3 left-3 z-20 flex items-center gap-2 rounded-full px-4 py-2 sm:hidden">
        <span className="text-[10px] font-bold text-[#64748b]">0</span>
        <span className="h-2.5 w-24 rounded-full bg-[linear-gradient(to_right,#96c8f2,#8fe5d0,#fcd2b1,#f8ac7a,#f7a1c2)] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.15)]" />
        <span className="text-[10px] font-bold text-[#64748b]">100</span>
      </div>
    </main>
  );
}
