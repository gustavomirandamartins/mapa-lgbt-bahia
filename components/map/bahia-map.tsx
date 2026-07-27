"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { COR_SEM_DADOS, corDaNota } from "@/lib/idt";
import type { IndicePublico } from "@/lib/public-data";
import type { Municipio } from "@/lib/auth-guards";
import { MunicipioCard } from "@/components/map/municipio-card";

/**
 * Estilo 100% local: sem tiles externos — o próprio GeoJSON dos municípios
 * é o mapa. Carrega instantaneamente e funciona offline (PWA).
 * Apenas os glifos dos rótulos são externos (degrada sem quebrar o mapa).
 */
const ESTILO_LOCAL: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#dbeafe" },
    },
  ],
};

/** Cores suaves do arco-íris para o padrão de fundo (muted pride). */
const PRIDE_COLORS = [
  "#e57373", // vermelho
  "#ffb74d", // laranja
  "#fff176", // amarelo
  "#81c784", // verde
  "#64b5f6", // azul
  "#ba68c8", // roxo
  "#f06292", // rosa
];

/** Cria um padrão de arco-íris horizontal fino e sem emendas para fill-pattern. */
function criarTexturaArcoIris(tamanho = 128): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível criar o contexto 2D");

  const totalFaixas = PRIDE_COLORS.length * 4;
  const alturaFaixa = tamanho / totalFaixas;

  // Faixas horizontais sem emendas
  for (let i = 0; i < totalFaixas; i++) {
    ctx.fillStyle = PRIDE_COLORS[i % PRIDE_COLORS.length];
    ctx.fillRect(0, i * alturaFaixa, tamanho, alturaFaixa + 0.5);
  }

  // Camada branca semi-transparente para suavizar as cores (efeito "muted")
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.fillRect(0, 0, tamanho, tamanho);

  return ctx.getImageData(0, 0, tamanho, tamanho);
}

/** Bounding box do estado da Bahia. */
const BAHIA_BOUNDS: [[number, number], [number, number]] = [
  [-46.62, -18.35],
  [-37.34, -8.53],
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
  const [selecao, setSelecao] = useState<Selecao | null>(null);

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
      fitBoundsOptions: { padding: 24 },
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
      "top-right"
    );

    map.on("error", (event) => {
      // Glifos ausentes não quebram o mapa; outros erros vão para o console.
      console.error("[mapa]", event.error?.message ?? event);
    });

    map.on("load", async () => {
      // Padrão de arco-íris como fill-pattern
      const textura = criarTexturaArcoIris();
      map.addImage("rainbow", textura, { pixelRatio: 1 });

      const [terra, agua, geojson, contorno] = await Promise.all([
        fetch("/geo/terra.geojson").then((r) => r.json()),
        fetch("/geo/agua.geojson").then((r) => r.json()),
        fetch("/geo/bahia-municipios.geojson").then((r) => r.json()),
        fetch("/geo/bahia-contorno.geojson").then((r) => r.json()),
      ]);

      // Expressão de cor: codarea (string) -> número -> cor da faixa do IDT.
      // Com zero avaliações, usa cor única (match sem ramos é inválido).
      let corPreenchimento: unknown = COR_SEM_DADOS;
      if (indices.length > 0) {
        const expressao: unknown[] = [
          "match",
          ["to-number", ["get", "codarea"]],
        ];
        for (const indice of indices) {
          expressao.push(indice.municipio_id, corDaNota(indice.nota_final));
        }
        expressao.push(COR_SEM_DADOS);
        corPreenchimento = expressao;
      }

      // 1. Terra de fundo (arco-íris suave) — visível fora da Bahia
      map.addSource("terra", { type: "geojson", data: terra });
      map.addLayer({
        id: "terra-fill",
        type: "fill",
        source: "terra",
        paint: {
          "fill-pattern": "rainbow",
          "fill-opacity": 0.16,
        },
      });

      // 2. Máscara de água para "carvar" o mar e a baía por cima do arco-íris
      map.addSource("agua", { type: "geojson", data: agua });
      map.addLayer({
        id: "agua-fill",
        type: "fill",
        source: "agua",
        paint: { "fill-color": "#dbeafe" },
      });

      // 3. Municípios da Bahia
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
          "line-width": 1.1,
          "line-opacity": 1,
        },
      });

      // 4. Contorno do estado
      map.addSource("contorno", { type: "geojson", data: contorno });
      map.addLayer({
        id: "contorno-line",
        type: "line",
        source: "contorno",
        paint: {
          "line-color": "#3b5f8a",
          "line-width": 2.2,
          "line-opacity": 0.8,
        },
      });

      // 5. Contorno de destaque do município selecionado
      map.addLayer({
        id: "municipios-selecionado",
        type: "line",
        source: "municipios",
        filter: FILTRO_VAZIO,
        paint: {
          "line-color": "#1c1c1e",
          "line-width": 2.4,
        },
      });

      // 6. Rótulos dos municípios (aparecem conforme o zoom)
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
            10,
            12.5,
          ],
        },
        paint: {
          "text-color": "#52525b",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.4,
        },
      });

      // Hover com feature-state
      let hoverId: string | number | undefined;
      map.on("mousemove", "municipios-fill", (event) => {
        map.getCanvas().style.cursor = "pointer";
        const feature = event.features?.[0];
        if (!feature) return;
        if (hoverId !== undefined) {
          map.setFeatureState(
            { source: "municipios", id: hoverId },
            { hover: false }
          );
        }
        hoverId = feature.id;
        map.setFeatureState(
          { source: "municipios", id: hoverId },
          { hover: true }
        );
      });
      map.on("mouseleave", "municipios-fill", () => {
        map.getCanvas().style.cursor = "";
        if (hoverId !== undefined) {
          map.setFeatureState(
            { source: "municipios", id: hoverId },
            { hover: false }
          );
        }
        hoverId = undefined;
      });

      map.on("click", "municipios-fill", (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const municipioId = Number(feature.properties?.codarea);
        if (!municipioId) return;

        map.setFilter("municipios-selecionado", [
          "==",
          ["to-number", ["get", "codarea"]],
          municipioId,
        ] as never);

        const centroide = feature.properties?.centroide as
          | [number, number]
          | undefined;
        if (centroide) {
          map.easeTo({ center: centroide, duration: 450 });
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

  return (
    <>
      <div
        ref={containerRef}
        className="map-container"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%" }}
        aria-label="Mapa da Bahia"
      />
      {selecao && (
        <MunicipioCard
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
