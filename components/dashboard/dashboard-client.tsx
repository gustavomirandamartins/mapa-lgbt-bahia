"use client";

import {
  MapPin,
  Flag,
  Users,
  GraduationCap,
  Map,
  Building,
  Megaphone,
  ShieldCheck,
  FileBarChart,
  Sparkles,
} from "lucide-react";

import {
  StatCard,
  ProgressRing,
  HorizontalBarChart,
  CountUp,
} from "@/components/dashboard/dashboard-charts";
import type {
  EstatisticasGerais,
  KpiItem,
  ZonaTuristicaStats,
  EixoResumo,
  DestaqueItem,
} from "@/lib/dashboard-data";

/** Map icon name strings to lucide-react components */
const ICONE_COMPONENTS: Record<string, React.ReactNode> = {
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
  "#ff453a",
  "#ff9f0a",
  "#ffd60a",
  "#34c759",
  "#0a84ff",
  "#bf5af2",
  "#5e5ce6",
];

interface DashboardClientProps {
  kpis: KpiItem[];
  estatisticas: EstatisticasGerais;
  zonas: ZonaTuristicaStats[];
  eixos: EixoResumo[];
  destaques: DestaqueItem[];
  iconeMap: Record<string, string>;
  coresEixos: string[];
  totalMunicipios: number;
}

export function DashboardClient({
  kpis,
  estatisticas,
  zonas,
  eixos,
  destaques,
}: DashboardClientProps) {
  return (
    <div className="space-y-8">
      {/* ──── KPI Cards ──── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((kpi, i) => (
          <StatCard
            key={i}
            icon={ICONE_COMPONENTS[kpi.icone] ?? <MapPin className="size-5" />}
            value={kpi.valor}
            total={kpi.total}
            label={kpi.rotulo}
            color={kpi.cor}
          />
        ))}
      </div>

      {/* ──── Cobertura Geral ──── */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Progress ring */}
        <div className="neuro-card flex flex-col items-center justify-center rounded-3xl p-8">
          <ProgressRing
            value={estatisticas.percentualCobertura}
            size={160}
            strokeWidth={14}
            color="#10b981"
            label="dos municípios"
          />
          <p className="mt-4 text-sm font-bold text-[#2c3444]">
            Cobertura do Mapeamento
          </p>
          <p className="text-xs text-[#64748b]">
            <CountUp end={estatisticas.totalMapeados} className="font-bold" /> de{" "}
            {estatisticas.totalMunicipios} municípios
          </p>
        </div>

        {/* Zonas Turísticas */}
        <div className="neuro-card rounded-3xl p-6">
          <h3 className="mb-4 text-sm font-bold tracking-widest text-[#64748b] uppercase">
            Cobertura por Zona Turística
          </h3>
          <HorizontalBarChart
            bars={zonas
              .filter((z) => z.mapeados > 0 || z.total > 0)
              .slice(0, 10)
              .map((z) => ({
                label: z.zona,
                value: z.mapeados,
                maxValue: z.total,
              }))}
            maxBars={10}
          />
          {zonas.length === 0 && (
            <p className="py-6 text-center text-sm text-[#94a3b8]">
              Nenhum município mapeado ainda.
            </p>
          )}
        </div>
      </div>

      {/* ──── Panorama por Eixo ──── */}
      <section aria-label="Panorama por eixo">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-[#64748b] uppercase">
          <Sparkles className="size-4" />
          Panorama por Eixo Temático
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eixos.map((eixo, idx) => {
            const cor = CORES_EIXOS[idx % CORES_EIXOS.length];
            return (
              <div key={eixo.eixoId} className="neuro-card rounded-2xl p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="flex size-8 items-center justify-center rounded-full text-xs font-extrabold text-white"
                    style={{ backgroundColor: cor }}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#2c3444]">
                      {eixo.nome}
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {eixo.indicadores.map((ind, j) => {
                    const pct = ind.total > 0 ? (ind.sim / ind.total) * 100 : 0;
                    return (
                      <div key={j}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#64748b]">{ind.rotulo}</span>
                          <span className="font-bold text-[#2c3444]">
                            {ind.sim}
                            <span className="font-normal text-[#94a3b8]">
                              /{ind.total}
                            </span>
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#e2e6f0] shadow-[inset_1px_1px_3px_rgba(175,188,212,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: cor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──── Destaques ──── */}
      <section aria-label="Destaques">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-widest text-[#64748b] uppercase">
          <Flag className="size-4" />
          Destaques e Conquistas
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {destaques.map((d, i) => {
            const IconComp =
              ICONE_COMPONENTS[d.icone] ?? <MapPin className="size-5" />;
            return (
              <div
                key={i}
                className="neuro-card flex items-center gap-4 rounded-2xl p-4"
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${d.cor}22`,
                    color: d.cor,
                  }}
                >
                  {IconComp}
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-extrabold text-[#2c3444]">
                    <CountUp end={d.valor} />
                  </p>
                  <p className="truncate text-xs font-medium text-[#64748b]">
                    {d.texto}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
