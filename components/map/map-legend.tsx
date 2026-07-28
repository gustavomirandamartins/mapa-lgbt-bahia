import { CLASSIFICACOES, COR_SEM_DADOS } from "@/lib/idt";

/** Legenda das faixas do IDT-LGBT exibida sobre o mapa (estilo pílulas coloridas vivas Neumorphic). */
export function MapLegend({ avaliados, total }: { avaliados: number; total: number }) {
  return (
    <div className="pointer-events-auto neuro-card fixed bottom-6 left-6 z-20 hidden w-[15.5rem] rounded-[2.2rem] p-5 sm:block">
      <h3 className="mb-3.5 text-center text-base font-extrabold tracking-tight text-[#1e293b]">
        IDT-LGBT (0–100)
      </h3>
      <ul className="flex flex-col gap-2.5">
        {CLASSIFICACOES.map((faixa) => {
          const isAmarelo = faixa.cor === "#ffd000";
          return (
            <li key={faixa.nivel}>
              <div
                className={`flex w-full items-center justify-center rounded-full px-3.5 py-2 text-xs font-extrabold shadow-[0_4px_10px_rgba(0,0,0,0.14),inset_0_2px_2px_rgba(255,255,255,0.4)] transition-transform hover:scale-[1.02] ${
                  isAmarelo ? "text-[#111827]" : "text-white"
                }`}
                style={{ backgroundColor: faixa.cor }}
              >
                {faixa.faixa} • {faixa.nivel.replace("Município ", "")}
              </div>
            </li>
          );
        })}
        <li>
          <div
            className="flex w-full items-center justify-center rounded-full px-3.5 py-2 text-xs font-extrabold text-[#334155] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12),-2px_-2px_4px_rgba(255,255,255,0.8),2px_2px_4px_rgba(178,190,214,0.5)] transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: COR_SEM_DADOS }}
          >
            Sem avaliação
          </div>
        </li>
      </ul>

      <div className="mt-4 border-t border-[#dce3f0] pt-3.5 text-center">
        <p className="text-3xl leading-none font-extrabold tracking-tight text-[#1e293b]">
          {avaliados} de {total}
        </p>
        <p className="mt-1.5 text-[10px] font-extrabold tracking-widest text-[#64748b] uppercase">
          Municípios Avaliados
        </p>
      </div>
    </div>
  );
}
