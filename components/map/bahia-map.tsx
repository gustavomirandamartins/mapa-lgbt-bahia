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

const ROSA_CHOQUE = "#ff1493";

/** Gerador de número pseudo-aleatório determinístico (seed fixo). */
function criarPrng(seed = 123456789) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cria uma textura de relevo terrestre: cinza escuro com sombreamento
 * topográfico e notas de rosa choque. Padrão 100% sem emendas.
 */
function criarTexturaTerra(tamanho = 128): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível criar o contexto 2D");
  const c = ctx;

  const prng = criarPrng(1969);

  // Base cinza escuro
  c.fillStyle = "#4a4a4a";
  c.fillRect(0, 0, tamanho, tamanho);

  // Linhas de contorno / relevo em tons de cinza (sempre com período divisível
  // pelo tamanho para manter o padrão sem emendas)
  c.lineWidth = 0.7;
  for (let i = 0; i < 10; i++) {
    const periodo = tamanho / (1 + Math.floor(prng() * 4));
    const amplitude = 3 + prng() * 7;
    const fase = prng() * Math.PI * 2;
    const yOffset = prng() * tamanho;
    const clareza = prng() > 0.5 ? 0.07 : -0.05;
    const base = 74;
    const valor = Math.max(0, Math.min(255, base + clareza * 255));
    c.strokeStyle = `rgb(${valor},${valor},${valor})`;
    c.beginPath();
    for (let x = 0; x <= tamanho + 1; x++) {
      const y = yOffset + amplitude * Math.sin((2 * Math.PI * x) / periodo + fase);
      if (x === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  }

  // Notas de rosa choque — pontos e traços pequenos, duplicados nas bordas para
  // evitar emendas visíveis
  c.fillStyle = ROSA_CHOQUE;
  c.strokeStyle = ROSA_CHOQUE;
  function desenharNota(x: number, y: number) {
    const tamanhoNota = 0.5 + prng() * 1.1;
    const forma = prng();
    if (forma < 0.5) {
      c.beginPath();
      c.arc(x, y, tamanhoNota, 0, Math.PI * 2);
      c.fill();
    } else {
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (prng() - 0.5) * 4, y + (prng() - 0.5) * 4);
      c.stroke();
    }
  }
  for (let i = 0; i < 30; i++) {
    const x = prng() * tamanho;
    const y = prng() * tamanho;
    const dx = x > tamanho - 4 ? x - tamanho : x < 4 ? x + tamanho : 0;
    const dy = y > tamanho - 4 ? y - tamanho : y < 4 ? y + tamanho : 0;
    desenharNota(x, y);
    if (dx) desenharNota(dx, y);
    if (dy) desenharNota(x, dy);
    if (dx && dy) desenharNota(dx, dy);
  }

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

    map.on("load", async () => {
      // Padrão de relevo terrestre (cinza escuro + rosa choque)
      const textura = criarTexturaTerra();
      map.addImage("terra-texture", textura, { pixelRatio: 1 });

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

      // 1. Terra de fundo (relevo cinza escuro + rosa choque) — fora da Bahia
      map.addSource("terra", { type: "geojson", data: terra });
      map.addLayer({
        id: "terra-fill",
        type: "fill",
        source: "terra",
        paint: {
          "fill-pattern": "terra-texture",
          "fill-opacity": 1,
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

      // 3.1 Glow rosa choque para municípios de referência (81–100)
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
            "line-color": ROSA_CHOQUE,
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
