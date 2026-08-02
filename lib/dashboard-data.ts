import type { IndicePublico } from "@/lib/public-data";
import type { IdtValorResposta } from "@/lib/idt";
import { DADOS_IBGE_BAHIA } from "@/lib/ibge-data";

export const TOTAL_MUNICIPIOS_BA = 417;

function obterResposta(indice: IndicePublico, key: string): IdtValorResposta {
  if (indice.respostas && key in indice.respostas) return indice.respostas[key];
  for (const eixo of (indice.notas_eixos || [])) {
    if (eixo.respostas && key in eixo.respostas) return eixo.respostas[key];
  }
  return undefined;
}

export function respostaIgual(indice: IndicePublico, key: string, valor: string): boolean {
  const resp = obterResposta(indice, key);
  if (typeof resp === 'string') {
    return resp.toLowerCase() === valor.toLowerCase();
  }
  return false;
}

export function contarSim(indices: IndicePublico[], key: string): number {
  return indices.filter(i => respostaIgual(i, key, 'Sim')).length;
}

function temRespostaTextoValida(indice: IndicePublico, key: string): boolean {
  const val = obterResposta(indice, key);
  if (typeof val === 'string') {
    const lower = val.trim().toLowerCase();
    return lower !== '' && lower !== 'não' && lower !== 'nao' && lower !== 'não se aplica' && lower !== 'n/a';
  }
  return false;
}

function temOpcaoCheckbox(indice: IndicePublico, key: string): boolean {
  const val = obterResposta(indice, key);
  return Array.isArray(val) && val.length > 0;
}

export interface EstatisticasGerais {
  totalMapeados: number;
  totalMunicipios: number;
  percentualCobertura: number;
  ultimaAtualizacao: string | null;
}

export interface KpiItem {
  rotulo: string;
  valor: number;
  total: number;
  icone: string;
  cor: string;
}

export interface ZonaTuristicaStats {
  zona: string;
  total: number;
  mapeados: number;
  percentual: number;
}

export interface EixoResumo {
  eixoId: string;
  nome: string;
  nomeCurto: string;
  indicadores: { rotulo: string; sim: number; total: number }[];
}

export interface DestaqueItem {
  texto: string;
  valor: number;
  icone: string;
  cor: string;
}

export function calcularEstatisticasGerais(indices: IndicePublico[]): EstatisticasGerais {
  const totalMapeados = indices.length;
  const percentualCobertura = (totalMapeados / TOTAL_MUNICIPIOS_BA) * 100;
  
  let ultimaAtualizacao = null;
  if (indices.length > 0) {
    const datas = indices
      .map(i => new Date(i.submitted_at).getTime())
      .filter(t => !isNaN(t));
    if (datas.length > 0) {
      ultimaAtualizacao = new Date(Math.max(...datas)).toISOString();
    }
  }

  return {
    totalMapeados,
    totalMunicipios: TOTAL_MUNICIPIOS_BA,
    percentualCobertura,
    ultimaAtualizacao
  };
}

export function calcularKpis(indices: IndicePublico[]): KpiItem[] {
  const total = indices.length;
  return [
    {
      rotulo: "Municípios Mapeados",
      valor: total,
      total: TOTAL_MUNICIPIOS_BA,
      icone: "MapPin",
      cor: "#10b981"
    },
    {
      rotulo: "Com Parada do Orgulho",
      valor: contarSim(indices, 'q18'),
      total,
      icone: "Flag",
      cor: "#bf5af2"
    },
    {
      rotulo: "Recebem turistas LGBTQIAPN+",
      valor: contarSim(indices, 'q9'),
      total,
      icone: "Users",
      cor: "#0a84ff"
    },
    {
      rotulo: "Ações de Capacitação",
      valor: contarSim(indices, 'q25'),
      total,
      icone: "GraduationCap",
      cor: "#ff9f0a"
    }
  ];
}

export function calcularZonasTuristicas(indices: IndicePublico[]): ZonaTuristicaStats[] {
  const zonasMap = new Map<string, { total: number; mapeados: number }>();
  
  Object.values(DADOS_IBGE_BAHIA).forEach(mun => {
    const zona = mun.zonaTuristica;
    if (!zonasMap.has(zona)) {
      zonasMap.set(zona, { total: 0, mapeados: 0 });
    }
    zonasMap.get(zona)!.total += 1;
  });

  indices.forEach(ind => {
    const ibgeData = DADOS_IBGE_BAHIA[ind.municipio_id];
    if (ibgeData) {
      const zona = ibgeData.zonaTuristica;
      if (zonasMap.has(zona)) {
        zonasMap.get(zona)!.mapeados += 1;
      }
    }
  });

  const stats: ZonaTuristicaStats[] = Array.from(zonasMap.entries()).map(([zona, data]) => ({
    zona,
    total: data.total,
    mapeados: data.mapeados,
    percentual: (data.total > 0) ? (data.mapeados / data.total) * 100 : 0
  }));

  return stats.sort((a, b) => b.percentual - a.percentual || b.mapeados - a.mapeados);
}

export function calcularResumosPorEixo(indices: IndicePublico[]): EixoResumo[] {
  const total = indices.length;

  return [
    {
      eixoId: "1",
      nome: "Governança e Gestão",
      nomeCurto: "Governança",
      indicadores: [
        { rotulo: "Integra Mapa do Turismo", sim: contarSim(indices, 'q1'), total },
        { rotulo: "Conselho de Turismo ativo", sim: contarSim(indices, 'q3'), total },
        { rotulo: "Órgão de Turismo exclusivo", sim: contarSim(indices, 'q5'), total }
      ]
    },
    {
      eixoId: "2",
      nome: "Demanda Turística",
      nomeCurto: "Demanda",
      indicadores: [
        { rotulo: "Recebe turistas LGBTQIAPN+", sim: contarSim(indices, 'q9'), total },
        { 
          rotulo: "Origem predominante externa", 
          sim: indices.filter(i => respostaIgual(i, 'q10', 'nacional') || respostaIgual(i, 'q10', 'internacional') || respostaIgual(i, 'q10', 'nacional e internacional')).length, 
          total 
        }
      ]
    },
    {
      eixoId: "3",
      nome: "Pesquisa e Monitoramento",
      nomeCurto: "Pesquisa",
      indicadores: [
        { rotulo: "Pesquisa sobre perfil turístico", sim: indices.filter(i => temRespostaTextoValida(i, 'q13')).length, total },
        { rotulo: "Monitoramento de impactos", sim: indices.filter(i => temRespostaTextoValida(i, 'q16')).length, total },
        { rotulo: "Mapeamento de melhorias", sim: indices.filter(i => temRespostaTextoValida(i, 'q17')).length, total }
      ]
    },
    {
      eixoId: "4",
      nome: "Eventos e Cultura",
      nomeCurto: "Eventos",
      indicadores: [
        { rotulo: "Parada do Orgulho", sim: contarSim(indices, 'q18'), total },
        { rotulo: "Apoio da Prefeitura à Parada", sim: contarSim(indices, 'q22'), total },
        { rotulo: "Parada gera fluxo turístico", sim: contarSim(indices, 'q23'), total }
      ]
    },
    {
      eixoId: "5",
      nome: "Qualificação e Capacitação",
      nomeCurto: "Qualificação",
      indicadores: [
        { rotulo: "Capacitações realizadas", sim: contarSim(indices, 'q25'), total },
        { rotulo: "Segmentos participantes", sim: indices.filter(i => temOpcaoCheckbox(i, 'q28')).length, total }
      ]
    },
    {
      eixoId: "6",
      nome: "Promoção Turística",
      nomeCurto: "Promoção",
      indicadores: [
        { rotulo: "Ações de promoção", sim: contarSim(indices, 'q29'), total },
        { rotulo: "Material promocional inclusivo", sim: contarSim(indices, 'q30'), total },
        { rotulo: "Interesse em roteiros", sim: contarSim(indices, 'q32'), total }
      ]
    },
    {
      eixoId: "7",
      nome: "Segurança e Proteção",
      nomeCurto: "Segurança",
      indicadores: [
        { rotulo: "Coordenadoria LGBTQIAPN+", sim: contarSim(indices, 'q33'), total },
        { rotulo: "Centro de Referência", sim: contarSim(indices, 'q35'), total },
        { rotulo: "Protocolo para vítimas", sim: contarSim(indices, 'q37'), total },
        { rotulo: "Canais de denúncia", sim: contarSim(indices, 'q39'), total }
      ]
    }
  ];
}

export function extrairDestaques(indices: IndicePublico[]): DestaqueItem[] {
  return [
    {
      texto: "Municípios com Parada do Orgulho LGBTQIAPN+",
      valor: contarSim(indices, 'q18'),
      icone: "Flag",
      cor: "#bf5af2"
    },
    {
      texto: "Interesse em compor roteiros estaduais",
      valor: contarSim(indices, 'q32'),
      icone: "Map",
      cor: "#0a84ff"
    },
    {
      texto: "Possuem Centro de Referência LGBTQIAPN+",
      valor: contarSim(indices, 'q35'),
      icone: "Building",
      cor: "#30d158"
    },
    {
      texto: "Material promocional inclusivo",
      valor: contarSim(indices, 'q30'),
      icone: "Megaphone",
      cor: "#ff9f0a"
    },
    {
      texto: "Protocolo de atendimento a vítimas de LGBTfobia",
      valor: contarSim(indices, 'q37'),
      icone: "ShieldCheck",
      cor: "#ff453a"
    },
    {
      texto: "Registram estatísticas de ocorrências",
      valor: contarSim(indices, 'q47'),
      icone: "FileBarChart",
      cor: "#5e5ce6"
    }
  ];
}
