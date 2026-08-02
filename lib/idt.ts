// ============================================================================
// Metodologia TGS-DT: Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal
// (SETUR-BA)
//
// Módulo autocontido e sem dependências de runtime para poder ser executado
// tanto no Next.js (client e server) quanto no Node.js puro (testes).
// Nota: O cálculo de notas e pesos foi removido conforme a nova metodologia.
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
  valor: string | number;
  rotulo: string;
}

export type IdtTipoPergunta = "radio" | "checkbox" | "text";

export interface IdtPergunta {
  id: string;
  texto: string;
  tipo: IdtTipoPergunta;
  opcoes?: IdtOpcao[];
  placeholder?: string;
}

export interface IdtEixo {
  id: IdtEixoId;
  nome: string;
  nomeCurto: string;
  peso: number; // 0 por padrão (sem pontuação)
  perguntas: IdtPergunta[];
  recomendacao?: string;
}

/** Tipo dos valores de resposta aceitos em uma pergunta. */
export type IdtValorResposta = string | string[] | boolean | number | null | undefined;

/** Mapa pergunta.id -> valor. */
export type IdtRespostas = Record<string, IdtValorResposta>;

export interface IdtResultadoEixo {
  eixoId: IdtEixoId;
  nome: string;
  nomeCurto: string;
  peso: number;
  pontos: number;
  maximo: number;
  percentual: number;
  ponderado: number;
  respostas: Record<string, IdtValorResposta>;
}

export interface IdtClassificacao {
  nivel: string;
  faixa: string;
  cor: string;
}

export interface IdtResultado {
  eixos: IdtResultadoEixo[];
  notaFinal: number;
  classificacao: IdtClassificacao;
  pontosFortes: string[];
  fragilidades: string[];
  recomendacoes: string[];
}

// ----------------------------------------------------------------------------
// Classificações (Mapeamento do Município)
// ----------------------------------------------------------------------------

export const CLASSIFICACOES: IdtClassificacao[] = [
  {
    nivel: "Mapeado",
    faixa: "Com Respostas",
    cor: "#10b981", // verde vibrante
  },
  {
    nivel: "Não Mapeado",
    faixa: "Sem Respostas",
    cor: "#94a3b8", // cinza neutro
  },
];

export const COR_SEM_DADOS = "#94a3b8";

export function classificar(notaFinal?: number | null): IdtClassificacao {
  if (notaFinal === undefined || notaFinal === null || notaFinal > 0) {
    return CLASSIFICACOES[0];
  }
  return CLASSIFICACOES[1];
}

export function corDaNota(notaFinal?: number | null): string {
  if (notaFinal === undefined || notaFinal === null || notaFinal > 0) {
    return CLASSIFICACOES[0].cor; // "#10b981" - Verde Mapeado
  }
  return CLASSIFICACOES[1].cor;
}

// ----------------------------------------------------------------------------
// Questionário oficial — 7 eixos, 49 perguntas (Apêndice D)
// ----------------------------------------------------------------------------

export const IDT_QUESTIONARIO: IdtEixo[] = [
  {
    id: "governanca",
    nome: "Estrutura Turística do Município",
    nomeCurto: "Estrutura",
    peso: 0,
    perguntas: [
      {
        id: "q1",
        texto: "1. O município integra o Mapa do Turismo Brasileiro?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
          { valor: "Em processo de inclusão", rotulo: "Em processo de inclusão" },
        ],
      },
      {
        id: "q2",
        texto: "2. Caso não integre, informe o motivo.",
        tipo: "text",
        placeholder: "Descreva o motivo (se aplicável)...",
      },
      {
        id: "q3",
        texto: "3. O município possui Conselho Municipal de Turismo ativo?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q4",
        texto: "4. O município possui Plano Municipal de Turismo vigente?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
          { valor: "Em elaboração", rotulo: "Em elaboração" },
        ],
      },
      {
        id: "q5",
        texto: "5. O município possui órgão ou secretaria responsável pelo turismo?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q6",
        texto: "6. O município recebe fluxo turístico regularmente?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Apenas em eventos", rotulo: "Apenas em eventos" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q7",
        texto: "7. Existe estimativa do número de visitantes anuais?",
        tipo: "text",
        placeholder: "Informe a estimativa anual de visitantes (se houver)...",
      },
      {
        id: "q8",
        texto: "8. Quais segmentos turísticos são desenvolvidos no município?",
        tipo: "checkbox",
        opcoes: [
          { valor: "Sol e Praia", rotulo: "Sol e Praia" },
          { valor: "Cultural", rotulo: "Cultural" },
          { valor: "Natureza", rotulo: "Natureza" },
          { valor: "Ecoturismo", rotulo: "Ecoturismo" },
          { valor: "Aventura", rotulo: "Aventura" },
          { valor: "Rural", rotulo: "Rural" },
          { valor: "Religioso", rotulo: "Religioso" },
          { valor: "Náutico", rotulo: "Náutico" },
          { valor: "Negócios e Eventos", rotulo: "Negócios e Eventos" },
          { valor: "Turismo de Base Comunitária", rotulo: "Turismo de Base Comunitária" },
          { valor: "LGBTQIAPN+", rotulo: "LGBTQIAPN+" },
          { valor: "Outro", rotulo: "Outro" },
        ],
      },
    ],
  },
  {
    id: "legislacao",
    nome: "Turismo LGBTQIAPN+",
    nomeCurto: "Turismo LGBT+",
    peso: 0,
    perguntas: [
      {
        id: "q9",
        texto: "9. O município recebe turistas LGBTQIAPN+?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
          { valor: "Não sabe informar", rotulo: "Não sabe informar" },
        ],
      },
      {
        id: "q10",
        texto: "10. A origem predominante desse público é:",
        tipo: "radio",
        opcoes: [
          { valor: "Regional", rotulo: "Regional" },
          { valor: "Nacional", rotulo: "Nacional" },
          { valor: "Internacional", rotulo: "Internacional" },
          { valor: "Não sabe informar", rotulo: "Não sabe informar" },
        ],
      },
      {
        id: "q11",
        texto: "11. Existem períodos do ano com maior fluxo desse público? Se sim, quais?",
        tipo: "text",
        placeholder: "Ex.: Verão, Carnaval, Festivais (ou 'Não')...",
      },
      {
        id: "q12",
        texto: "12. O município integra ou mantém parceria com redes nacionais ou internacionais de turismo LGBTQIAPN+? Se sim, quais?",
        tipo: "text",
        placeholder: "Ex.: IGLTA, Câmara de Comércio LGBT, etc. (ou 'Não')...",
      },
    ],
  },
  {
    id: "pesquisa",
    nome: "Oferta Turística",
    nomeCurto: "Oferta",
    peso: 0,
    perguntas: [
      {
        id: "q13",
        texto: "13. Existem empreendimentos reconhecidos como LGBTQIAPN+ friendly? Quais?",
        tipo: "text",
        placeholder: "Liste os empreendimentos (ou 'Não')...",
      },
      {
        id: "q14",
        texto: "14. Há empreendimentos que possuem políticas de diversidade ou atendimento inclusivo? Quais?",
        tipo: "text",
        placeholder: "Liste os empreendimentos (ou 'Não')...",
      },
      {
        id: "q15",
        texto: "15. Algum empreendimento participa de redes nacionais ou internacionais de turismo LGBTQIAPN+? Quais?",
        tipo: "text",
        placeholder: "Liste os empreendimentos e redes (ou 'Não')...",
      },
      {
        id: "q16",
        texto: "16. Existem atrativos ou espaços reconhecidos pela comunidade LGBTQIAPN+?",
        tipo: "text",
        placeholder: "Descreva os atrativos ou espaços (ou 'Não')...",
      },
      {
        id: "q17",
        texto: "17. Existem roteiros ou experiências turísticas voltadas ao segmento? Quais?",
        tipo: "text",
        placeholder: "Descreva os roteiros ou experiências (ou 'Não')...",
      },
    ],
  },
  {
    id: "qualificacao",
    nome: "Festejos e Celebrações",
    nomeCurto: "Festejos",
    peso: 0,
    perguntas: [
      {
        id: "q18",
        texto: "18. O município realiza Parada do Orgulho LGBTQIAPN+?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q19",
        texto: "19. Ano de criação da Parada (se aplicável)",
        tipo: "text",
        placeholder: "Ex.: 2018 (ou 'Não se aplica')...",
      },
      {
        id: "q20",
        texto: "20. Público estimado na Parada",
        tipo: "text",
        placeholder: "Ex.: 5.000 pessoas...",
      },
      {
        id: "q21",
        texto: "21. Quem organiza a Parada?",
        tipo: "text",
        placeholder: "Ex.: ONG local, Coletivo, Prefeitura...",
      },
      {
        id: "q22",
        texto: "22. A Prefeitura apoia institucionalmente ou financeiramente?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q23",
        texto: "23. O evento gera fluxo turístico?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
          { valor: "Não sabe informar", rotulo: "Não sabe informar" },
        ],
      },
      {
        id: "q24",
        texto: "24. Existem outros eventos LGBTQIAPN+? Quais?",
        tipo: "text",
        placeholder: "Liste festivais da diversidade, semanas culturais, etc...",
      },
    ],
  },
  {
    id: "promocao",
    nome: "Qualificação",
    nomeCurto: "Qualificação",
    peso: 0,
    perguntas: [
      {
        id: "q25",
        texto: "25. O município já realizou capacitações sobre atendimento ao turista LGBTQIAPN+?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q26",
        texto: "26. Quem promoveu as capacitações?",
        tipo: "checkbox",
        opcoes: [
          { valor: "SETUR-BA", rotulo: "SETUR-BA" },
          { valor: "Ministério do Turismo", rotulo: "Ministério do Turismo" },
          { valor: "Prefeitura", rotulo: "Prefeitura" },
          { valor: "Sebrae", rotulo: "Sebrae" },
          { valor: "Câmara de Comércio e Turismo LGBT do Brasil", rotulo: "Câmara de Comércio e Turismo LGBT do Brasil" },
          { valor: "IGLTA", rotulo: "IGLTA" },
          { valor: "Outro", rotulo: "Outro" },
        ],
      },
      {
        id: "q27",
        texto: "27. Quantos profissionais foram capacitados?",
        tipo: "text",
        placeholder: "Ex.: 150 profissionais...",
      },
      {
        id: "q28",
        texto: "28. Quais segmentos participaram?",
        tipo: "checkbox",
        opcoes: [
          { valor: "Meios de hospedagem", rotulo: "Meios de hospedagem" },
          { valor: "Restaurantes", rotulo: "Restaurantes" },
          { valor: "Guias de Turismo", rotulo: "Guias de Turismo" },
          { valor: "Agências", rotulo: "Agências" },
          { valor: "Condutores", rotulo: "Condutores" },
          { valor: "CAT", rotulo: "CAT" },
          { valor: "Segurança Pública", rotulo: "Segurança Pública" },
          { valor: "Guarda Municipal", rotulo: "Guarda Municipal" },
          { valor: "Comércio", rotulo: "Comércio" },
          { valor: "Outros", rotulo: "Outros" },
        ],
      },
    ],
  },
  {
    id: "seguranca",
    nome: "Promoção Turística",
    nomeCurto: "Promoção",
    peso: 0,
    perguntas: [
      {
        id: "q29",
        texto: "29. O município realiza ações de promoção voltadas ao Turismo LGBTQIAPN+?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q30",
        texto: "30. Possui material promocional inclusivo?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q31",
        texto: "31. Participa de feiras ou eventos do segmento? Quais?",
        tipo: "text",
        placeholder: "Informe feiras ou eventos (ou 'Não')...",
      },
      {
        id: "q32",
        texto: "32. Tem interesse em integrar roteiros estaduais de Turismo LGBTQIAPN+?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
    ],
  },
  {
    id: "oferta",
    nome: "Direitos Humanos, Proteção e Rede de Acolhimento",
    nomeCurto: "Direitos & Acolhim.",
    peso: 0,
    perguntas: [
      {
        id: "q33",
        texto: "33. Existe Coordenadoria, Diretoria ou setor responsável pelas políticas LGBTQIAPN+?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q34",
        texto: "34. Existe Conselho Municipal LGBTQIAPN+?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q35",
        texto: "35. Existe Centro de Referência LGBTQIAPN+?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q36",
        texto: "36. Existe articulação entre a Secretaria de Turismo e a política municipal LGBTQIAPN+?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q37",
        texto: "37. O município possui protocolo de atendimento às vítimas de LGBTfobia?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q38",
        texto: "38. Existe fluxo de encaminhamento desses casos?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q39",
        texto: "39. Existem canais municipais para denúncia?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q40",
        texto: "40. Esses canais são divulgados aos turistas?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q41",
        texto: "41. Existe articulação com Guarda Municipal, Polícia Militar, Polícia Civil, Ministério Público ou Defensoria Pública?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q42",
        texto: "42. Quais equipamentos integram a rede de atendimento?",
        tipo: "checkbox",
        opcoes: [
          { valor: "Centro de Referência LGBTQIAPN+", rotulo: "Centro de Referência LGBTQIAPN+" },
          { valor: "CRAS", rotulo: "CRAS" },
          { valor: "CREAS", rotulo: "CREAS" },
          { valor: "Defensoria Pública", rotulo: "Defensoria Pública" },
          { valor: "Ministério Público", rotulo: "Ministério Público" },
          { valor: "Delegacia Especializada", rotulo: "Delegacia Especializada" },
          { valor: "Ouvidoria", rotulo: "Ouvidoria" },
          { valor: "Outros", rotulo: "Outros" },
        ],
      },
      {
        id: "q43",
        texto: "43. Existem organizações da sociedade civil que atuam na defesa dos direitos LGBTQIAPN+? Quais?",
        tipo: "text",
        placeholder: "Liste as organizações (ou 'Não')...",
      },
      {
        id: "q44",
        texto: "44. O município mantém cadastro dessas organizações?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q45",
        texto: "45. Os profissionais da rede recebem capacitação sobre diversidade sexual e identidade de gênero?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q46",
        texto: "46. Os profissionais do turismo conhecem os fluxos de encaminhamento em casos de discriminação?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q47",
        texto: "47. O município registra ocorrências relacionadas à LGBTfobia?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q48",
        texto: "48. Existem relatórios ou estatísticas sobre essas ocorrências?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
      {
        id: "q49",
        texto: "49. As informações são compartilhadas entre os órgãos municipais?",
        tipo: "radio",
        opcoes: [
          { valor: "Sim", rotulo: "Sim" },
          { valor: "Não", rotulo: "Não" },
        ],
      },
    ],
  },
];

export const TOTAL_PERGUNTAS = IDT_QUESTIONARIO.reduce(
  (acc, eixo) => acc + eixo.perguntas.length,
  0
);

/**
 * Processa/calcula o resultado do mapeamento municipal a partir das respostas.
 * Não existem pesos ou pontuação — o resultado agrega as respostas organizadas.
 */
export function calcularIdt(respostas: IdtRespostas): IdtResultado {
  const eixos: IdtResultadoEixo[] = IDT_QUESTIONARIO.map((eixo) => {
    const resEixo: Record<string, IdtValorResposta> = {};
    for (const perg of eixo.perguntas) {
      if (perg.id in respostas) {
        resEixo[perg.id] = respostas[perg.id];
      }
    }
    return {
      eixoId: eixo.id,
      nome: eixo.nome,
      nomeCurto: eixo.nomeCurto,
      peso: 0,
      pontos: 0,
      maximo: 0,
      percentual: 100,
      ponderado: 0,
      respostas: resEixo,
    };
  });

  return {
    eixos,
    notaFinal: 100, // Valor padrão para compatibilidade de schema SQL
    classificacao: CLASSIFICACOES[0], // "Mapeado"
    pontosFortes: [],
    fragilidades: [],
    recomendacoes: [],
  };
}

/**
 * Retorna o texto formatado para exibição de uma resposta na interface.
 */
export function formatarRespostaTexto(resposta: IdtValorResposta): string {
  if (resposta === null || resposta === undefined || resposta === "") {
    return "Não informado";
  }
  if (Array.isArray(resposta)) {
    return resposta.length > 0 ? resposta.join(", ") : "Não informado";
  }
  if (typeof resposta === "boolean") {
    return resposta ? "Sim" : "Não";
  }
  return String(resposta);
}
