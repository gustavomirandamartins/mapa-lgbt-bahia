import Link from "next/link";
import { ShieldCheck, BarChart3 } from "lucide-react";

import { getIndicesPublicos, getMunicipios } from "@/lib/public-data";
import { BahiaMap } from "@/components/map/bahia-map";
import { PrideLogo } from "@/components/pride-logo";

export const revalidate = 0;

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
              Turismo <span className="pride-text">LGBTQIAPN+</span> na Bahia
            </h1>
            <p className="hidden text-[11px] leading-tight font-semibold text-[#64748b] sm:block sm:text-xs">
              Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <Link
            href="/dashboard"
            className="neuro-pill flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-bold text-[#2c3444] transition-transform active:scale-95 sm:px-5 sm:py-3 sm:text-sm"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-[#eef1f7] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(178,190,214,0.45)]">
              <BarChart3 className="size-3.5 text-[#10b981]" aria-hidden />
            </span>
            Dashboard
          </Link>
          <Link
            href="/login"
            className="neuro-pill flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-bold text-[#2c3444] transition-transform active:scale-95 sm:px-5 sm:py-3 sm:text-sm"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-[#eef1f7] shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(178,190,214,0.45)]">
              <ShieldCheck className="size-3.5 text-[#8b5cf6]" aria-hidden />
            </span>
            Central de Controle
          </Link>
        </div>
      </header>
    </main>
  );
}
