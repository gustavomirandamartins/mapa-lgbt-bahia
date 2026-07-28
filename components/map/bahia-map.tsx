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
      paint: { "background-color": "#0284c7" },
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

const COR_GLOW = "#ef4444";

/** Gerador de número pseudo-aleatório determinístico (seed fixo). */
function criarPrng(seed = 123456789) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ----------------------------------------------------------------------------
// Efeito visual do mar (animado) e da terra fora da Bahia (estático).
// Utilizam a mesma estrutura de gradientes radiais em movimento/composição.
// ----------------------------------------------------------------------------

const TONS_MAR = [
  [255, 255, 255], // brilho do sol / espuma
  [224, 242, 254], // blue-100
  [125, 211, 252], // sky-300
  [56, 189, 248],  // sky-400
  [37, 99, 235],   // blue-600
] as const;

const TONS_TERRA_ROSA = [
  [255, 20, 147],  // rosa choque / hot pink
  [244, 63, 94],   // rose-500
  [236, 72, 153],  // pink-500
  [217, 70, 239],  // fuchsia-500
  [136, 19, 55],   // rose-900
] as const;

interface BolhaGradiente {
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  freq: number;
  fase: number;
  cor: readonly [number, number, number];
  alpha: number;
}

function criarBolhasGradiente(
  seed: number,
  quantidade: number,
  paleta: readonly (readonly [number, number, number])[]
): BolhaGradiente[] {
  const prng = criarPrng(seed);
  const bolhas: BolhaGradiente[] = [];
  for (let i = 0; i < quantidade; i++) {
    bolhas.push({
      x: prng() * 256,
      y: prng() * 256,
      r: 36 + prng() * 68,
      dx: 22 + prng() * 38,
      dy: 22 + prng() * 38,
      freq: 0.6 + prng() * 0.7,
      fase: prng() * Math.PI * 2,
      cor: paleta[Math.floor(prng() * paleta.length)],
      alpha: 0.25 + prng() * 0.3,
    });
  }
  return bolhas;
}

function desenharGradientes(
  c: CanvasRenderingContext2D,
  t: number,
  tamanho: number,
  corFundo: string,
  bolhas: BolhaGradiente[]
) {
  c.fillStyle = corFundo;
  c.fillRect(0, 0, tamanho, tamanho);
  for (const b of bolhas) {
    const x = b.x + Math.sin(t * b.freq + b.fase) * b.dx;
    const y = b.y + Math.cos(t * b.freq * 0.82 + b.fase) * b.dy;
    // Desenha espelhado em matriz 3x3 para manter o padrão 100% sem emendas (seamless tiling)
    for (const ox of [-tamanho, 0, tamanho]) {
      for (const oy of [-tamanho, 0, tamanho]) {
        const [r, g, bCor] = b.cor;
        const grad = c.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, b.r);
        grad.addColorStop(0, `rgba(${r},${g},${bCor},${b.alpha})`);
        grad.addColorStop(1, `rgba(${r},${g},${bCor},0)`);
        c.fillStyle = grad;
        c.fillRect(0, 0, tamanho, tamanho);
      }
    }
  }
}

/** Cria a textura estática da terra fora da Bahia (preto → rosa choque com gradientes). */
function criarTexturaTerra(tamanho = 256): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível criar o contexto 2D");

  const bolhas = criarBolhasGradiente(1969, 12, TONS_TERRA_ROSA);
  desenharGradientes(ctx, 0, tamanho, "#09090b", bolhas);

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
      "bottom-right"
    );

    map.on("error", (event) => {
      // Glifos ausentes não quebram o mapa; outros erros vão para o console.
      console.error("[mapa]", event.error?.message ?? event);
    });

    // Canvas do mar animado
    const tamanhoMar = 256;
    const canvasMar = document.createElement("canvas");
    canvasMar.width = tamanhoMar;
    canvasMar.height = tamanhoMar;
    const ctxMar = canvasMar.getContext("2d");
    const bolhasMar = criarBolhasGradiente(2024, 12, TONS_MAR);
    let intervaloMar: number | undefined;

    map.on("load", async () => {
      // 1. Textura estática para a terra fora da Bahia (preto + rosa choque)
      const texturaTerra = criarTexturaTerra(256);
      map.addImage("terra-pattern", texturaTerra, { pixelRatio: 1 });

      // 2. Registra a imagem do mar animado e inicia a animação contínua
      if (ctxMar) {
        desenharGradientes(ctxMar, 0, tamanhoMar, "#0369a1", bolhasMar);
        map.addImage(
          "mar-anim",
          ctxMar.getImageData(0, 0, tamanhoMar, tamanhoMar),
          { pixelRatio: 1 }
        );

        let frame = 0;
        intervaloMar = window.setInterval(() => {
          if (mapRef.current !== map) return;
          frame += 1;
          desenharGradientes(ctxMar, frame * 0.08, tamanhoMar, "#0369a1", bolhasMar);
          map.updateImage(
            "mar-anim",
            ctxMar.getImageData(0, 0, tamanhoMar, tamanhoMar)
          );
          map.triggerRepaint();
        }, 80);
      }

      const [terra, geojson, contorno] = await Promise.all([
        fetch("/geo/terra.geojson").then((r) => r.json()),
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

      // Layer 1. Oceano Infinito (fundo da viewport inteira com mar animado)
      map.addSource("ocean-source", { type: "geojson", data: FULL_WORLD_OCEAN });
      map.addLayer({
        id: "ocean-fill",
        type: "fill",
        source: "ocean-source",
        paint: { "fill-pattern": "mar-anim" },
      });

      // Layer 2. Terra fora da Bahia (gradientes preto → rosa choque, estático)
      map.addSource("terra", { type: "geojson", data: terra });
      map.addLayer({
        id: "terra-fill",
        type: "fill",
        source: "terra",
        paint: { "fill-pattern": "terra-pattern" },
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

      // Layer 3.1 Glow para municípios de referência (81–100)
      const idsReferencia = indices
        .filter((i) => i.nota_final >= 81)
        .map((i) => i.municipio_id);
      if (idsReferencia.length > 0) {
        const filtroGlow: unknown[] = [
          "match",
          ["to-number", ["get", "codarea"]],
        ];
        for (const id of idsReferencia) filtroGlow.push(id, true);
        filtroGlow.push(false);
        map.addLayer({
          id: "municipios-glow",
          type: "line",
          source: "municipios",
          filter: filtroGlow as never,
          paint: {
            "line-color": COR_GLOW,
            "line-width": 4,
            "line-blur": 3,
            "line-opacity": 0.85,
          },
        });
      }

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

      // Layer 4. Contorno da Bahia com Glow Branco Intenso
      map.addSource("contorno", { type: "geojson", data: contorno });
      map.addLayer({
        id: "contorno-glow",
        type: "line",
        source: "contorno",
        paint: {
          "line-color": "#ffffff",
          "line-width": 14,
          "line-blur": 10,
          "line-opacity": 0.95,
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
          "line-color": "#1c1c1e",
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
      if (intervaloMar !== undefined) window.clearInterval(intervaloMar);
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
