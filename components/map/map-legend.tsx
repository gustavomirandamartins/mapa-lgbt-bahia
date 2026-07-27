import { CLASSIFICACOES, COR_SEM_DADOS } from "@/lib/idt";
import { AuroraCard } from "@/components/ui/aurora-card";

/** Legenda das faixas do IDT-LGBT exibida sobre o mapa. */
export function MapLegend({ avaliados, total }: { avaliados: number; total: number }) {
  return (
    <AuroraCard
      className="pointer-events-auto fixed bottom-3 left-3 z-20 hidden max-w-[11.5rem] rounded-2xl sm:block"
      innerClassName="glass rounded-2xl p-3.5"
    >
      <p className="mb-2 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
        IDT-LGBT (0–100)
      </p>
      <ul className="flex flex-col gap-1.5">
        {CLASSIFICACOES.map((faixa) => (
          <li key={faixa.nivel} className="flex items-center gap-2">
            <span
              className="size-3 shrink-0 rounded-full shadow-inner"
              style={{ backgroundColor: faixa.cor }}
            />
            <span className="text-[11px] leading-tight font-medium text-neutral-600">
              {faixa.faixa} · {faixa.nivel.replace("Município ", "")}
            </span>
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span
            className="size-3 shrink-0 rounded-full shadow-inner"
            style={{ backgroundColor: COR_SEM_DADOS }}
          />
          <span className="text-[11px] leading-tight font-medium text-neutral-600">
            Sem avaliação
          </span>
        </li>
      </ul>
      <p className="mt-2.5 border-t border-white/60 pt-2 text-[11px] font-semibold text-neutral-500">
        {avaliados} de {total} municípios avaliados
      </p>
    </AuroraCard>
  );
}
