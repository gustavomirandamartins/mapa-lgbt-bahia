"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { COR_SEM_DADOS, corDaNota, classificar } from "@/lib/idt";
import type { IndicePublico } from "@/lib/public-data";
import type { Municipio } from "@/lib/auth-guards";
import { MunicipioCard } from "@/components/map/municipio-card";
import { MapLegend } from "@/components/map/map-legend";

/**
 * Estilo 100% local: sem tiles externos — os GeoJSONs do mapa fornecem toda a
 * geometria. Funciona offline (PWA) e carrega instantaneamente.
 */
const ESTILO_LOCAL: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "rgba(238, 241, 247, 0)" },
    },
  ],
};

/** Polígono mundial completo para cobrir o oceano sem emendas nem cortes. */
const FULL_WORLD_OCEAN: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-180, -90],
            [180, -90],
            [180, 90],
            [-180, 90],
            [-180, -90],
          ],
        ],
      },
      properties: {},
    },
  ],
};

/** Bounding box do estado da Bahia (ampliado para visualização completa sem cortes). */
const BAHIA_BOUNDS: [[number, number], [number, number]] = [
  [-47.45, -19.05],
  [-36.65, -7.75],
];

const FILTRO_VAZIO = ["==", ["to-number", ["get", "codarea"]], -1] as never;

interface BahiaMapProps {
  indices: IndicePublico[];
  municipios: Municipio[];
}

interface Selecao {
  municipioId: number;
}

export function BahiaMap({ indices, municipios }: BahiaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const centroidesRef = useRef<Map<number, [number, number]>>(new Map());
  const [selecao, setSelecao] = useState<Selecao | null>(null);
  const [faixaSelecionada, setFaixaSelecionada] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const indicesPorMunicipio = useMemo(() => {
    const mapa = new Map<number, IndicePublico>();
    for (const indice of indices) mapa.set(indice.municipio_id, indice);
    return mapa;
  }, [indices]);

  const nomesPorMunicipio = useMemo(() => {
    const mapa = new Map<number, string>();
    for (const municipio of municipios) mapa.set(municipio.id, municipio.nome);
    return mapa;
  }, [municipios]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Turbopack não publica o worker do MapLibre; usamos a cópia em /public.
    setWorkerUrl("/vendor/maplibre-gl-worker.mjs");

    const map = new MapLibreMap({
      container: containerRef.current,
      style: ESTILO_LOCAL,
      bounds: BAHIA_BOUNDS,
      fitBoundsOptions: { padding: 50 },
      maxBounds: [
        [-50.5, -21.5],
        [-33.5, -5.5],
      ],
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      fadeDuration: 0,
      // Permite capturas de tela/compartilhamento do mapa renderizado
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });
    mapRef.current = map;

    map.addControl(
      new NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    map.on("error", (event) => {
      // Glifos ausentes não quebram o mapa; outros erros vão para o console.
      console.error("[mapa]", event.error?.message ?? event);
    });
    map.on("load", async () => {
      const [terra, geojson, contorno] = await Promise.all([
        fetch("/geo/terra.geojson").then((r) => r.json()),
        fetch("/geo/bahia-municipios.geojson").then((r) => r.json()),
        fetch("/geo/bahia-contorno.geojson").then((r) => r.json()),
      ]);

      for (const feat of geojson.features || []) {
        const cod = Number(feat.properties?.codarea);
        const cent = feat.properties?.centroide as
          | [number, number]
          | undefined;
        if (!Number.isNaN(cod) && cent) {
          centroidesRef.current.set(cod, cent);
        }
      }

      const COR_PADRAO_MAPA = COR_SEM_DADOS;
      let corPreenchimento: unknown = COR_PADRAO_MAPA;
      if (indices.length > 0) {
        const expressao: unknown[] = [
          "match",
          ["to-number", ["get", "codarea"]],
        ];
        for (const indice of indices) {
          expressao.push(indice.municipio_id, corDaNota(indice.nota_final));
        }
        expressao.push(COR_PADRAO_MAPA);
        corPreenchimento = expressao;
      }

      // Layer 1. Oceano (superfície única Neumorphism semi-transparente para o gradiente ambiental)
      map.addSource("ocean-source", { type: "geojson", data: FULL_WORLD_OCEAN });
      map.addLayer({
        id: "ocean-fill",
        type: "fill",
        source: "ocean-source",
        paint: {
          "fill-color": "#eef1f7",
          "fill-opacity": 0.58,
        },
      });

      // Layer 2. Terra fora da Bahia
      map.addSource("terra", { type: "geojson", data: terra });
      map.addLayer({
        id: "terra-fill",
        type: "fill",
        source: "terra",
        paint: {
          "fill-color": "#eef1f7",
          "fill-opacity": 0.40,
        },
      });

      // Layer 2.1 e 2.2. Sombras 3D em Relevo Neumórfico (Extrusão do contorno da Bahia)
      map.addSource("contorno", { type: "geojson", data: contorno });
      map.addLayer({
        id: "contorno-shadow-dark",
        type: "line",
        source: "contorno",
        paint: {
          "line-color": "rgba(170, 182, 208, 0.55)",
          "line-width": 18,
          "line-blur": 12,
          "line-translate": [8, 12],
        },
      });
      map.addLayer({
        id: "contorno-shadow-light",
        type: "line",
        source: "contorno",
        paint: {
          "line-color": "rgba(255, 255, 255, 0.95)",
          "line-width": 16,
          "line-blur": 10,
          "line-translate": [-6, -6],
        },
      });

      // Layer 3. Municípios da Bahia
      map.addSource("municipios", {
        type: "geojson",
        data: geojson,
        promoteId: "codarea",
      });

      map.addLayer({
        id: "municipios-fill",
        type: "fill",
        source: "municipios",
        paint: {
          "fill-color": corPreenchimento as never,
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0.92,
          ],
        },
      });

      map.addLayer({
        id: "municipios-line",
        type: "line",
        source: "municipios",
        paint: {
          "line-color": "#ffffff",
          "line-width": 1.2,
          "line-opacity": 0.9,
        },
      });
      map.addLayer({
        id: "contorno-line",
        type: "line",
        source: "contorno",
        paint: {
          "line-color": "#ffffff",
          "line-width": 2.5,
          "line-opacity": 1,
        },
      });

      // Layer 5. Destaque do município selecionado
      map.addLayer({
        id: "municipios-selecionado",
        type: "line",
        source: "municipios",
        filter: FILTRO_VAZIO,
        paint: {
          "line-color": "#2c3444",
          "line-width": 2.4,
        },
      });

      // Layer 6. Rótulos dos municípios
      map.addLayer({
        id: "municipios-label",
        type: "symbol",
        source: "municipios",
        minzoom: 6.4,
        layout: {
          "text-field": ["get", "nome"],
          "text-font": ["Open Sans Semibold"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6.4,
            9,
            8,
            11,
            10,
            13,
          ],
          "text-anchor": "center",
          "text-max-width": 7,
        },
        paint: {
          "text-color": "#2c3444",
          "text-halo-color": "rgba(255, 255, 255, 0.95)",
          "text-halo-width": 1.6,
        },
      });

      let hoveredId: number | null = null;

      map.on("mousemove", "municipios-fill", (event) => {
        map.getCanvas().style.cursor = "pointer";
        const feature = event.features?.[0];
        if (!feature) return;

        const id = Number(feature.id ?? feature.properties?.codarea);
        if (!Number.isNaN(id) && id !== hoveredId) {
          if (hoveredId !== null) {
            map.setFeatureState(
              { source: "municipios", id: hoveredId },
              { hover: false }
            );
          }
          hoveredId = id;
          map.setFeatureState(
            { source: "municipios", id: hoveredId },
            { hover: true }
          );
        }
      });

      map.on("mouseleave", "municipios-fill", () => {
        map.getCanvas().style.cursor = "";
        if (hoveredId !== null) {
          map.setFeatureState(
            { source: "municipios", id: hoveredId },
            { hover: false }
          );
          hoveredId = null;
        }
      });

      map.on("click", "municipios-fill", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;

        const codarea = feature.properties?.codarea;
        const municipioId = Number(feature.id ?? codarea);
        if (Number.isNaN(municipioId)) return;

        map.setFilter("municipios-selecionado", [
          "==",
          ["to-number", ["get", "codarea"]],
          municipioId,
        ] as never);

        const centroide = feature.properties?.centroide as
          | [number, number]
          | undefined;
        if (centroide) {
          map.flyTo({
            center: centroide,
            zoom: Math.max(map.getZoom(), 9.2),
            duration: 750,
            essential: true,
          });
        }

        setSelecao({ municipioId });
      });

      // Clique fora dos municípios fecha o card
      map.on("click", (event) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ["municipios-fill"],
        });
        if (features.length === 0) {
          map.setFilter("municipios-selecionado", FILTRO_VAZIO);
          setSelecao(null);
        }
      });

      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const indiceSelecionado = selecao
    ? (indicesPorMunicipio.get(selecao.municipioId) ?? null)
    : null;
  const nomeSelecionado = selecao
    ? (indicesPorMunicipio.get(selecao.municipioId)?.nome ??
       nomesPorMunicipio.get(selecao.municipioId) ??
       "Município")
    : "";

  const selecionarMunicipio = (id: number) => {
    const map = mapRef.current;
    if (map) {
      map.setFilter("municipios-selecionado", [
        "==",
        ["to-number", ["get", "codarea"]],
        id,
      ] as never);

      const cent = centroidesRef.current.get(id);
      if (cent) {
        map.flyTo({
          center: cent,
          zoom: Math.max(map.getZoom(), 9.2),
          duration: 750,
          essential: true,
        });
      }
    }
    setSelecao({ municipioId: id });
  };

  const idsFaixaSelecionada = useMemo(() => {
    if (!faixaSelecionada) return null;
    const set = new Set<number>();
    if (faixaSelecionada === "sem_avaliacao" || faixaSelecionada === "Sem Respostas") {
      for (const m of municipios) {
        if (!indicesPorMunicipio.has(m.id)) {
          set.add(m.id);
        }
      }
    } else {
      for (const ind of indices) {
        if (classificar(ind.nota_final).faixa === faixaSelecionada) {
          set.add(ind.municipio_id);
        }
      }
    }
    return set;
  }, [faixaSelecionada, indices, municipios, indicesPorMunicipio]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapLoaded || !map || !map.getLayer("municipios-fill")) return;

    if (!idsFaixaSelecionada) {
      map.setFilter("municipios-fill", null);
      return;
    }

    const arrayIds = Array.from(idsFaixaSelecionada);
    if (arrayIds.length === 0) {
      map.setFilter("municipios-fill", FILTRO_VAZIO);
      return;
    }

    const filtroMatch: unknown[] = [
      "match",
      ["to-number", ["get", "codarea"]],
    ];
    for (const id of arrayIds) filtroMatch.push(id, true);
    filtroMatch.push(false);

    map.setFilter("municipios-fill", filtroMatch as never);
  }, [mapLoaded, idsFaixaSelecionada]);

  return (
    <>
      <div
        ref={containerRef}
        className="map-container"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%" }}
        aria-label="Mapa da Bahia"
      />
      <MapLegend
        indices={indices}
        municipios={municipios}
        municipioSelecionadoId={selecao?.municipioId ?? null}
        onSelectMunicipio={selecionarMunicipio}
        faixaSelecionada={faixaSelecionada}
        onSelectFaixa={setFaixaSelecionada}
      />
      <button
        type="button"
        onClick={() => {
          mapRef.current?.setFilter("municipios-selecionado", FILTRO_VAZIO);
          setSelecao(null);
          mapRef.current?.fitBounds(BAHIA_BOUNDS, { padding: 50, duration: 800 });
        }}
        className="pointer-events-auto neuro-card fixed right-4 bottom-24 z-20 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold text-[#2c3444] shadow-md transition-transform active:scale-95 sm:right-6 sm:bottom-28"
        title="Ver toda a Bahia"
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-[#eef1f7] shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(178,190,214,0.45)]">
          🌐
        </span>
        <span>Ver toda a Bahia</span>
      </button>
      {selecao && (
        <MunicipioCard
          id={selecao.municipioId}
          nome={nomeSelecionado}
          indice={indiceSelecionado}
          onClose={() => {
            mapRef.current?.setFilter("municipios-selecionado", FILTRO_VAZIO);
            setSelecao(null);
          }}
        />
      )}
    </>
  );
}
