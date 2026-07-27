// ============================================================================
// Motor do Índice de Desenvolvimento do Turismo LGBTQIAPN+ (IDT-LGBT)
// Fonte: docs/IDT_LGBT_Calculo.md e docs/IDT_LGBT_Completo.md (SETUR-BA)
//
// Módulo autocontido e sem dependências de runtime para poder ser executado
// tanto no Next.js (client e server) quanto no Node.js puro (testes).
// ============================================================================

export type IdtEixoId =
  | "governanca"
  | "legislacao"
  | "pesquisa"
  | "qualificacao"
  | "promocao"
  | "seguranca"
  | "oferta";

export interface IdtOpcao {
  valor: number;
  rotulo: string;
}

export interface IdtPergunta {
  id: string;
  texto: string;
  opcoes: IdtOpcao[];
}

export interface IdtEixo {
  id: IdtEixoId;
  nome: string;
  nomeCurto: string;
  /** Peso na composição do índice (fração de 1). Ex.: 0.20 = 20%. */
  peso: number;
  perguntas: IdtPergunta[];
  /** Recomendação automática exibida quando o eixo está abaixo de 50%. */
  recomendacao: string;
}

/** Mapa pergunta.id -> valor escolhido (0 a 4). */
export type IdtRespostas = Record<string, number>;

export interface IdtResultadoEixo {
  eixoId: IdtEixoId;
  nome: string;
  nomeCurto: string;
  peso: number;
  pontos: number;
  maximo: number;
  /** 0–100: pontos / maximo. */
  percentual: number;
  /** 0–(peso*100): contribuição do eixo para a nota final. */
  ponderado: number;
}

export interface IdtClassificacao {
  nivel: string;
  faixa: string;
  cor: string;
}

export interface IdtResultado {
  eixos: IdtResultadoEixo[];
  /** 0–100, soma dos ponderados. */
  notaFinal: number;
  classificacao: IdtClassificacao;
  pontosFortes: string[];
  fragilidades: string[];
  recomendacoes: string[];
}

// ----------------------------------------------------------------------------
// Escalas de resposta (metodologia: 0 = não existe ... 4 = existe e é monitorado)
// ----------------------------------------------------------------------------

/** Eixos 3–7: escala completa 0|1|2|3|4. */
export const ESCALA_MATURIDADE: IdtOpcao[] = [
  { valor: 0, rotulo: "Não existe" },
  { valor: 1, rotulo: "Existe de forma inicial" },
  { valor: 2, rotulo: "Existe parcialmente" },
  { valor: 3, rotulo: "Existe de forma consolidada" },
  { valor: 4, rotulo: "Existe e é monitorado" },
];

/** Eixos 1–2 (exceto 1a pergunta do Eixo 1): escala 0|2|4. */
export const ESCALA_SIM_NAO: IdtOpcao[] = [
  { valor: 0, rotulo: "Não" },
  { valor: 2, rotulo: "Sim, de forma inicial ou parcial" },
  { valor: 4, rotulo: "Sim, de forma consolidada" },
];

// ----------------------------------------------------------------------------
// Questionário oficial — 7 eixos, 35 perguntas
// ----------------------------------------------------------------------------

export const IDT_QUESTIONARIO: IdtEixo[] = [
  {
    id: "governanca",
    nome: "Governança",
    nomeCurto: "Govern.",
    peso: 0.2,
    recomendacao:
      "Elaborar Plano Municipal de Turismo Inclusivo e institucionalizar a governança do segmento (responsável formal, conselho e orçamento).",
    perguntas: [
      {
        id: "gov_1",
        texto: "Existe responsável pelo Turismo LGBTQIAPN+ no município?",
        opcoes: [
          { valor: 0, rotulo: "Não" },
          { valor: 2, rotulo: "Existe de maneira informal" },
          { valor: 4, rotulo: "Existe formalmente" },
        ],
      },
      { id: "gov_2", texto: "O Plano Municipal de Turismo contempla o segmento LGBTQIAPN+?", opcoes: ESCALA_SIM_NAO },
      { id: "gov_3", texto: "Existe Conselho Municipal LGBT?", opcoes: ESCALA_SIM_NAO },
      { id: "gov_4", texto: "Existe grupo de trabalho intersetorial?", opcoes: ESCALA_SIM_NAO },
      { id: "gov_5", texto: "O município possui orçamento destinado ao segmento?", opcoes: ESCALA_SIM_NAO },
    ],
  },
  {
    id: "legislacao",
    nome: "Legislação e Direitos Humanos",
    nomeCurto: "Legislação",
    peso: 0.15,
    recomendacao:
      "Criar legislação municipal antidiscriminatória e políticas públicas específicas para a população LGBTQIAPN+.",
    perguntas: [
      { id: "leg_1", texto: "Existe legislação antidiscriminatória?", opcoes: ESCALA_SIM_NAO },
      { id: "leg_2", texto: "Existe política municipal LGBT?", opcoes: ESCALA_SIM_NAO },
      { id: "leg_3", texto: "Existe protocolo de combate à LGBTfobia?", opcoes: ESCALA_SIM_NAO },
      { id: "leg_4", texto: "Existe centro de referência ou equipamento de atendimento?", opcoes: ESCALA_SIM_NAO },
      { id: "leg_5", texto: "Existe plano de direitos humanos com ações LGBTQIAPN+?", opcoes: ESCALA_SIM_NAO },
    ],
  },
  {
    id: "pesquisa",
    nome: "Pesquisa e Dados",
    nomeCurto: "Pesquisa",
    peso: 0.15,
    recomendacao:
      "Inserir variáveis de orientação sexual e identidade de gênero nas pesquisas turísticas e publicar relatórios periódicos.",
    perguntas: [
      { id: "pes_1", texto: "O município realiza pesquisa de demanda turística?", opcoes: ESCALA_MATURIDADE },
      { id: "pes_2", texto: "Coleta informações sobre orientação sexual?", opcoes: ESCALA_MATURIDADE },
      { id: "pes_3", texto: "Coleta informações sobre identidade de gênero?", opcoes: ESCALA_MATURIDADE },
      { id: "pes_4", texto: "Produz indicadores do segmento?", opcoes: ESCALA_MATURIDADE },
      { id: "pes_5", texto: "Publica relatórios periódicos?", opcoes: ESCALA_MATURIDADE },
    ],
  },
  {
    id: "qualificacao",
    nome: "Qualificação",
    nomeCurto: "Qualific.",
    peso: 0.15,
    recomendacao:
      "Implementar programa permanente de capacitação do trade turístico, servidores públicos e forças de segurança.",
    perguntas: [
      { id: "qua_1", texto: "O município capacita o trade turístico?", opcoes: ESCALA_MATURIDADE },
      { id: "qua_2", texto: "Capacita servidores públicos?", opcoes: ESCALA_MATURIDADE },
      { id: "qua_3", texto: "Capacita forças de segurança?", opcoes: ESCALA_MATURIDADE },
      { id: "qua_4", texto: "Possui curso permanente?", opcoes: ESCALA_MATURIDADE },
      { id: "qua_5", texto: "Mais de 50 profissionais capacitados?", opcoes: ESCALA_MATURIDADE },
    ],
  },
  {
    id: "promocao",
    nome: "Promoção Turística",
    nomeCurto: "Promoção",
    peso: 0.1,
    recomendacao:
      "Desenvolver estratégia de promoção do destino: materiais específicos, campanhas de diversidade e presença em feiras do segmento.",
    perguntas: [
      { id: "pro_1", texto: "O município divulga o segmento em seu site?", opcoes: ESCALA_MATURIDADE },
      { id: "pro_2", texto: "Participa de feiras de turismo LGBTQIAPN+?", opcoes: ESCALA_MATURIDADE },
      { id: "pro_3", texto: "Possui materiais promocionais específicos?", opcoes: ESCALA_MATURIDADE },
      { id: "pro_4", texto: "Desenvolve campanhas de diversidade?", opcoes: ESCALA_MATURIDADE },
      { id: "pro_5", texto: "Possui marca de destino inclusivo?", opcoes: ESCALA_MATURIDADE },
    ],
  },
  {
    id: "seguranca",
    nome: "Segurança e Proteção",
    nomeCurto: "Segurança",
    peso: 0.15,
    recomendacao:
      "Implantar protocolo de segurança: atendimento às vítimas de LGBTfobia, canal de denúncia e rede de acolhimento.",
    perguntas: [
      { id: "seg_1", texto: "Existe protocolo de atendimento às vítimas de LGBTfobia?", opcoes: ESCALA_MATURIDADE },
      { id: "seg_2", texto: "Existe rede de acolhimento?", opcoes: ESCALA_MATURIDADE },
      { id: "seg_3", texto: "Existe canal de denúncia?", opcoes: ESCALA_MATURIDADE },
      { id: "seg_4", texto: "Existe monitoramento de ocorrências?", opcoes: ESCALA_MATURIDADE },
      { id: "seg_5", texto: "Há capacitação das forças de segurança?", opcoes: ESCALA_MATURIDADE },
    ],
  },
  {
    id: "oferta",
    nome: "Oferta Turística",
    nomeCurto: "Oferta",
    peso: 0.1,
    recomendacao:
      "Mapear empreendimentos, criar roteiros e experiências de turismo inclusivo e estruturar calendário de eventos LGBTQIAPN+.",
    perguntas: [
      { id: "ofe_1", texto: "Existem eventos LGBTQIAPN+ no município?", opcoes: ESCALA_MATURIDADE },
      { id: "ofe_2", texto: "Existem empreendimentos mapeados?", opcoes: ESCALA_MATURIDADE },
      { id: "ofe_3", texto: "Existem roteiros turísticos?", opcoes: ESCALA_MATURIDADE },
      { id: "ofe_4", texto: "Existem experiências de turismo inclusivo?", opcoes: ESCALA_MATURIDADE },
      { id: "ofe_5", texto: "Existe calendário de eventos?", opcoes: ESCALA_MATURIDADE },
    ],
  },
];

export const TOTAL_PERGUNTAS = IDT_QUESTIONARIO.reduce(
  (acc, eixo) => acc + eixo.perguntas.length,
  0
);

// ----------------------------------------------------------------------------
// Classificação (faixas oficiais)
// ----------------------------------------------------------------------------

export const COR_SEM_DADOS = "#9ca3af";

export const CLASSIFICACOES: (IdtClassificacao & { min: number; max: number })[] = [
  { min: 0, max: 20, nivel: "Município Inexistente", faixa: "0–20", cor: "#3b82f6" },
  { min: 20, max: 40, nivel: "Município Sensibilizado", faixa: "21–40", cor: "#22c55e" },
  { min: 40, max: 60, nivel: "Município Estruturante", faixa: "41–60", cor: "#facc15" },
  { min: 60, max: 80, nivel: "Município Consolidado", faixa: "61–80", cor: "#f97316" },
  { min: 80, max: 100, nivel: "Município Referência em Turismo LGBTQIAPN+", faixa: "81–100", cor: "#ef4444" },
];

export function classificar(nota: number): IdtClassificacao {
  for (const faixa of CLASSIFICACOES) {
    if (nota <= faixa.max) {
      return { nivel: faixa.nivel, faixa: faixa.faixa, cor: faixa.cor };
    }
  }
  const ultima = CLASSIFICACOES[CLASSIFICACOES.length - 1];
  return { nivel: ultima.nivel, faixa: ultima.faixa, cor: ultima.cor };
}

/** Cor do município no mapa (choropleth) a partir da nota 0–100. */
export function corDaNota(nota: number | null | undefined): string {
  if (nota === null || nota === undefined || Number.isNaN(nota)) return COR_SEM_DADOS;
  return classificar(nota).cor;
}

// ----------------------------------------------------------------------------
// Cálculo
// ----------------------------------------------------------------------------

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * Valida as respostas contra o questionário oficial.
 * Lança Error quando falta resposta ou o valor não é permitido.
 */
export function validarRespostas(respostas: IdtRespostas): void {
  if (!respostas || typeof respostas !== "object") {
    throw new Error("Respostas ausentes ou em formato inválido.");
  }
  for (const eixo of IDT_QUESTIONARIO) {
    for (const pergunta of eixo.perguntas) {
      const valor = respostas[pergunta.id];
      if (valor === undefined || valor === null) {
        throw new Error(`Pergunta sem resposta: ${pergunta.id}`);
      }
      if (!pergunta.opcoes.some((opcao) => opcao.valor === valor)) {
        throw new Error(`Valor inválido (${valor}) para a pergunta ${pergunta.id}`);
      }
    }
  }
}

/**
 * Calcula o IDT-LGBT a partir das respostas do questionário.
 *
 * Para cada eixo: percentual = (pontos / máximo) * 100; ponderado = percentual * peso.
 * Nota final = soma dos ponderados (0–100).
 */
export function calcularIdt(respostas: IdtRespostas): IdtResultado {
  validarRespostas(respostas);

  const eixos: IdtResultadoEixo[] = IDT_QUESTIONARIO.map((eixo) => {
    const pontos = eixo.perguntas.reduce(
      (acc, pergunta) => acc + respostas[pergunta.id],
      0
    );
    const maximo = eixo.perguntas.length * 4;
    const percentual = (pontos / maximo) * 100;
    const ponderado = percentual * eixo.peso;
    return {
      eixoId: eixo.id,
      nome: eixo.nome,
      nomeCurto: eixo.nomeCurto,
      peso: eixo.peso,
      pontos,
      maximo,
      percentual: arredondar(percentual),
      ponderado: arredondar(ponderado),
    };
  });

  const notaFinal = arredondar(eixos.reduce((acc, eixo) => acc + eixo.ponderado, 0));
  const classificacao = classificar(notaFinal);

  const ordenados = [...eixos].sort((a, b) => b.percentual - a.percentual);
  const pontosFortes = ordenados.slice(0, 2).map((eixo) => eixo.nome);
  const fragilidades = ordenados
    .slice(-2)
    .reverse()
    .map((eixo) => eixo.nome);

  const recomendacoes = IDT_QUESTIONARIO.filter((eixo) => {
    const resultado = eixos.find((item) => item.eixoId === eixo.id);
    return resultado !== undefined && resultado.percentual < 50;
  }).map((eixo) => eixo.recomendacao);

  return { eixos, notaFinal, classificacao, pontosFortes, fragilidades, recomendacoes };
}
