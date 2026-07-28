import { CLASSIFICACOES, COR_SEM_DADOS } from "@/lib/idt";

/** Legenda das faixas do IDT-LGBT exibida sobre o mapa. */
export function MapLegend({ avaliados, total }: { avaliados: number; total: number }) {
  return (
    <div className="pointer-events-auto neuro-card fixed bottom-5 left-6 z-20 hidden max-w-[13.5rem] rounded-3xl p-4 sm:block">
      <p className="mb-2.5 text-[10px] font-bold tracking-widest text-[#64748b] uppercase">
        IDT-LGBT (0–100)
      </p>
      <ul className="flex flex-col gap-2">
        {CLASSIFICACOES.map((faixa) => (
          <li key={faixa.nivel} className="flex items-center gap-2.5">
            <span
              className="size-3.5 shrink-0 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.18),-2px_-2px_4px_rgba(255,255,255,0.8),2px_2px_4px_rgba(178,190,214,0.5)]"
              style={{ backgroundColor: faixa.cor }}
            />
            <span className="text-[11px] leading-tight font-bold text-[#2c3444]">
              {faixa.faixa} · <span className="font-medium text-[#526071]">{faixa.nivel.replace("Município ", "")}</span>
            </span>
          </li>
        ))}
        <li className="flex items-center gap-2.5">
          <span
            className="size-3.5 shrink-0 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.18),-2px_-2px_4px_rgba(255,255,255,0.8),2px_2px_4px_rgba(178,190,214,0.5)]"
            style={{ backgroundColor: COR_SEM_DADOS }}
          />
          <span className="text-[11px] leading-tight font-medium text-[#526071]">
            Sem avaliação
          </span>
        </li>
      </ul>
      <div className="mt-3.5 border-t border-white/80 pt-2.5 text-[11px] font-bold text-[#64748b]">
        {avaliados} de {total} municípios avaliados
      </div>
    </div>
  );
}
