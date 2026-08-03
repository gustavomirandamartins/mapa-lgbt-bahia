"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { CLASSIFICACOES, classificar } from "@/lib/idt";
import type { IndicePublico } from "@/lib/public-data";
import type { Municipio } from "@/lib/auth-guards";

export interface MapLegendProps {
  indices: IndicePublico[];
  municipios: Municipio[];
  municipioSelecionadoId?: number | null;
  onSelectMunicipio?: (municipioId: number) => void;
  faixaSelecionada?: string | null;
  onSelectFaixa?: (faixa: string | null) => void;
}

/**
 * Legenda das faixas da Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal exibida sobre o mapa, equipada com busca
 * de cidades e lista de rolagem dos 417 municípios da Bahia com status colorido.
 */
export function MapLegend({
  indices,
  municipios,
  municipioSelecionadoId,
  onSelectMunicipio,
  faixaSelecionada,
  onSelectFaixa,
}: MapLegendProps) {
  const [busca, setBusca] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const indicesPorId = useMemo(() => {
    const map = new Map<number, IndicePublico>();
    for (const ind of indices) {
      map.set(ind.municipio_id, ind);
    }
    return map;
  }, [indices]);

  const listaMunicipios = useMemo(() => {
    if (municipios.length > 0) return municipios;
    return indices
      .map((i) => ({ id: i.municipio_id, nome: i.nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [municipios, indices]);

  const normalizar = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const municipiosFiltrados = useMemo(() => {
    let lista = listaMunicipios;
    if (faixaSelecionada) {
      lista = lista.filter((m) => {
        const ind = indicesPorId.get(m.id);
        if (faixaSelecionada === "sem_avaliacao" || faixaSelecionada === "Sem Respostas") {
          return !ind;
        }
        if (!ind) return false;
        return faixaSelecionada === "Com Respostas" || faixaSelecionada === "Mapeado" || classificar(ind.nota_final).faixa === faixaSelecionada;
      });
    }
    if (!busca.trim()) return lista;
    const termo = normalizar(busca.trim());
    return lista.filter((m) => normalizar(m.nome).includes(termo));
  }, [listaMunicipios, busca, faixaSelecionada, indicesPorId]);

  const renderPilulasFaixas = () => (
    <ul className="flex shrink-0 flex-col gap-2">
      {CLASSIFICACOES.map((faixa) => {
        const isSelected = faixaSelecionada === faixa.faixa;
        const isDimmed = Boolean(faixaSelecionada) && !isSelected;
        return (
          <li key={faixa.nivel}>
            <button
              type="button"
              onClick={() =>
                onSelectFaixa?.(isSelected ? null : faixa.faixa)
              }
              className={`flex w-full items-center justify-center rounded-full px-3.5 py-2 text-xs font-extrabold text-white shadow-[0_4px_10px_rgba(0,0,0,0.14),inset_0_2px_2px_rgba(255,255,255,0.4)] transition-all ${
                isSelected
                  ? "scale-[1.03] ring-2 ring-[#2c3444] ring-offset-2 font-black"
                  : ""
              } ${isDimmed ? "opacity-45 hover:opacity-100" : ""}`}
              style={{ backgroundColor: faixa.cor }}
            >
              {faixa.faixa} • {faixa.nivel}
            </button>
          </li>
        );
      })}
      {faixaSelecionada && (
        <li>
          <button
            type="button"
            onClick={() => onSelectFaixa?.(null)}
            className="w-full text-center text-[11px] font-bold text-[#1880fb] underline hover:text-[#0055c4]"
          >
            Limpar filtro de status
          </button>
        </li>
      )}
    </ul>
  );

  const renderListaMunicipios = () => (
    <ul className="flex flex-col gap-1.5">
      {municipiosFiltrados.map((m) => {
        const ind = indicesPorId.get(m.id);
        const cor = ind ? CLASSIFICACOES[0].cor : CLASSIFICACOES[1].cor;
        const isSelecionado = municipioSelecionadoId === m.id;
        const rotulo = ind ? "Mapeado" : "Não Mapeado";

        return (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => {
                onSelectMunicipio?.(m.id);
                if (mobileOpen) setMobileOpen(false);
              }}
              className={`group flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition-all ${
                isSelecionado
                  ? "bg-white/90 shadow-sm ring-2 ring-[#1880fb]/60 font-extrabold"
                  : "hover:bg-white/60 active:scale-[0.98]"
              }`}
            >
              <span className="truncate text-xs font-bold text-[#1e293b] group-hover:text-[#1880fb]">
                {m.nome}
              </span>
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
                style={{ backgroundColor: cor }}
              >
                {rotulo}
              </span>
            </button>
          </li>
        );
      })}
      {municipiosFiltrados.length === 0 && (
        <li className="py-4 text-center text-xs font-semibold text-[#64748b]">
          Nenhum município encontrado.
        </li>
      )}
    </ul>
  );

  return (
    <>
      {/* 1. Legenda Desktop (Neumorphic Card com busca e lista de rolagem) */}
      <div className="pointer-events-auto neuro-card fixed bottom-6 left-6 z-20 hidden max-h-[calc(100dvh-5rem)] w-[18.5rem] flex-col rounded-[2.2rem] p-5 sm:flex">
        <h3 className="mb-3 text-center text-base font-extrabold tracking-tight text-[#1e293b]">
          Mapeamento dos Municípios
        </h3>

        {/* Pílulas de status (Mapeado vs Não Mapeado) clicáveis para filtrar */}
        {renderPilulasFaixas()}

        {/* Total mapeados ou filtrados */}
        <div className="mt-3.5 shrink-0 border-t border-[#dce3f0] pt-3 text-center">
          <p className="text-2xl leading-none font-extrabold tracking-tight text-[#1e293b]">
            {faixaSelecionada
              ? `${municipiosFiltrados.length} de ${listaMunicipios.length || 417}`
              : `${indices.length} de ${listaMunicipios.length || 417}`}
          </p>
          <p className="mt-1 text-[10px] font-extrabold tracking-widest text-[#64748b] uppercase">
            {faixaSelecionada ? "Municípios Filtrados" : "Municípios Mapeados"}
          </p>
        </div>

        {/* Campo de busca de cidades */}
        <div className="relative mt-3.5 shrink-0">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar cidade (${listaMunicipios.length || 417})...`}
            className="neuro-inset w-full rounded-2xl py-2 pr-8 pl-8.5 text-xs font-semibold text-[#2c3444] placeholder-[#94a3b8] outline-none transition-all focus:ring-2 focus:ring-[#1880fb]/30"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-[#64748b] hover:bg-white/60 hover:text-[#2c3444]"
              aria-label="Limpar busca"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Lista de rolagem dos 417 municípios com status de cor */}
        <div className="mt-3 max-h-[200px] min-h-[80px] flex-1 overflow-y-auto pr-1">
          {renderListaMunicipios()}
        </div>
      </div>

      {/* 2. Legenda e Busca no Mobile (Barra Flutuante -> Modal/Drawer) */}
      <div className="fixed inset-x-3 bottom-3 z-20 flex items-center justify-between gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="neuro-card pointer-events-auto flex flex-1 items-center justify-between gap-2.5 rounded-full px-4 py-3 text-left active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <Search className="size-4 text-[#1880fb]" />
            <span className="text-xs font-extrabold text-[#1e293b]">
              Buscar cidade ({listaMunicipios.length || 417})...
            </span>
          </div>
          <span className="rounded-full bg-[#1880fb]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#1880fb]">
            {indices.length} mapeados
          </span>
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30 backdrop-blur-xs sm:hidden">
          <div className="neuro-card flex max-h-[85dvh] w-full flex-col rounded-t-[2.5rem] p-6 pb-8 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold tracking-tight text-[#1e293b]">
                {listaMunicipios.length} Municípios
              </h3>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="neuro-pill rounded-full p-2 text-[#64748b]"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Filtros por status de cores no mobile */}
            <div className="mb-4 shrink-0">{renderPilulasFaixas()}</div>

            {/* Campo de busca no modal (sem autoFocus para não abrir teclado sem clique explícito em Buscar cidade) */}
            <div className="relative mb-3.5 shrink-0">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                inputMode="search"
                enterKeyHint="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={`Buscar cidade (${listaMunicipios.length || 417})...`}
                className="neuro-inset w-full rounded-2xl py-2.5 pr-8 pl-9 text-xs font-semibold text-[#2c3444] placeholder-[#94a3b8] outline-none"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-[#64748b]"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Lista com rolagem dos 417 municípios no mobile */}
            <div className="max-h-[55dvh] flex-1 overflow-y-auto pr-1">
              {renderListaMunicipios()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
