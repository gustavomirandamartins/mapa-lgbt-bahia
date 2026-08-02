import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Flag,
  Users,
  GraduationCap,
  Map,
  Building,
  Megaphone,
  ShieldCheck,
  FileBarChart,
  TrendingUp,
} from "lucide-react";

import { getIndicesPublicos } from "@/lib/public-data";
import { PrideLogo } from "@/components/pride-logo";
import {
  calcularEstatisticasGerais,
  calcularKpis,
  calcularZonasTuristicas,
  calcularResumosPorEixo,
  extrairDestaques,
  TOTAL_MUNICIPIOS_BA,
} from "@/lib/dashboard-data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard — Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal",
  description:
    "Panorama dos resultados do mapeamento do Turismo LGBTQIAPN+ nos municípios da Bahia — SETUR-BA.",
};

export const revalidate = 0;

/** Map icon name strings to lucide-react components */
const ICONE_MAP: Record<string, React.ReactNode> = {
  MapPin: <MapPin className="size-5" />,
  Flag: <Flag className="size-5" />,
  Users: <Users className="size-5" />,
  GraduationCap: <GraduationCap className="size-5" />,
  Map: <Map className="size-5" />,
  Building: <Building className="size-5" />,
  Megaphone: <Megaphone className="size-5" />,
  ShieldCheck: <ShieldCheck className="size-5" />,
  FileBarChart: <FileBarChart className="size-5" />,
};

/** Colors assigned to each of the 7 axes (pride-inspired) */
const CORES_EIXOS = [
  "#ff453a", // Governança → red
  "#ff9f0a", // Demanda → orange
  "#ffd60a", // Pesquisa → yellow
  "#34c759", // Eventos → green
  "#0a84ff", // Qualificação → blue
  "#bf5af2", // Promoção → purple
  "#5e5ce6", // Segurança → indigo
];

export default async function DashboardPage() {
  const indices = await getIndicesPublicos();

  const estatisticas = calcularEstatisticasGerais(indices);
  const kpis = calcularKpis(indices);
  const zonas = calcularZonasTuristicas(indices);
  const eixos = calcularResumosPorEixo(indices);
  const destaques = extrairDestaques(indices);

  const dataAtualizada = estatisticas.ultimaAtualizacao
    ? new Date(estatisticas.ultimaAtualizacao).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <main className="app-backdrop min-h-dvh">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* ────────────── Header ────────────── */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="neuro-pill flex size-10 items-center justify-center rounded-full transition-transform active:scale-95"
              aria-label="Voltar ao mapa"
            >
              <ArrowLeft className="size-4 text-[#2c3444]" />
            </Link>
            <PrideLogo size={48} />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#2c3444] sm:text-2xl">
                Dashboard
              </h1>
              <p className="text-xs font-semibold text-[#64748b] sm:text-sm">
                Retrato do Turismo <span className="pride-text">LGBTQIAPN+</span> na Bahia
              </p>
            </div>
          </div>
          <div className="neuro-card rounded-2xl px-5 py-3 text-center">
            <p className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">
              Última atualização
            </p>
            <p className="text-sm font-extrabold text-[#2c3444]">{dataAtualizada}</p>
          </div>
        </header>

        {/* ────────────── KPIs ────────────── */}
        <section aria-label="Indicadores principais">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-[#64748b] uppercase">
            <TrendingUp className="size-4" />
            Indicadores Principais
          </h2>
          <DashboardClient
            kpis={kpis}
            estatisticas={estatisticas}
            zonas={zonas}
            eixos={eixos}
            destaques={destaques}
            iconeMap={Object.fromEntries(
              Object.entries(ICONE_MAP).map(([k]) => [k, k])
            )}
            coresEixos={CORES_EIXOS}
            totalMunicipios={TOTAL_MUNICIPIOS_BA}
          />
        </section>

        {/* ────────────── Footer ────────────── */}
        <footer className="border-t border-[#cbd5e1]/30 pt-6 pb-10 text-center">
          <p className="text-xs font-medium text-[#94a3b8]">
            Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal — SETUR-BA
          </p>
          <p className="mt-1 text-[10px] text-[#b4bcd0]">
            {estatisticas.totalMapeados} de {TOTAL_MUNICIPIOS_BA} municípios mapeados
          </p>
        </footer>
      </div>
    </main>
  );
}
