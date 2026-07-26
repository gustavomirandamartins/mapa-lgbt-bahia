import { test } from "node:test";
import assert from "node:assert/strict";

import {
  IDT_QUESTIONARIO,
  TOTAL_PERGUNTAS,
  calcularIdt,
  classificar,
  validarRespostas,
  type IdtRespostas,
} from "./idt.ts";

function respostasCom(valor: number): IdtRespostas {
  const respostas: IdtRespostas = {};
  for (const eixo of IDT_QUESTIONARIO) {
    for (const pergunta of eixo.perguntas) {
      respostas[pergunta.id] = valor;
    }
  }
  return respostas;
}

test("questionário oficial: 7 eixos, 35 perguntas e pesos somando 100%", () => {
  assert.equal(IDT_QUESTIONARIO.length, 7);
  assert.equal(TOTAL_PERGUNTAS, 35);
  const somaPesos = IDT_QUESTIONARIO.reduce((acc, eixo) => acc + eixo.peso, 0);
  assert.ok(Math.abs(somaPesos - 1) < 1e-9, `pesos somam ${somaPesos}`);
  for (const eixo of IDT_QUESTIONARIO) {
    assert.equal(eixo.perguntas.length, 5, `eixo ${eixo.id} deve ter 5 perguntas`);
  }
});

test("todas as respostas no máximo => nota 100 e classificação Referência", () => {
  const resultado = calcularIdt(respostasCom(4));
  assert.equal(resultado.notaFinal, 100);
  assert.equal(resultado.classificacao.nivel, "Município Referência em Turismo LGBTQIAPN+");
  assert.equal(resultado.recomendacoes.length, 0);
});

test("todas as respostas zero => nota 0 e classificação Inexistente", () => {
  const resultado = calcularIdt(respostasCom(0));
  assert.equal(resultado.notaFinal, 0);
  assert.equal(resultado.classificacao.nivel, "Município Inexistente");
  // todos os 7 eixos abaixo de 50% => 7 recomendações
  assert.equal(resultado.recomendacoes.length, 7);
});

test("exemplo oficial do documento: Governança 15/20 e Legislação 10/20", () => {
  // Governança 15 pontos: 4+4+4+3+0 — mas a escala do eixo é 0|2|4; usar 4+4+4+2+1 não é
  // permitido (valores restritos). Usar combinação válida: 4+4+4+2+0 = 14? Não: o exemplo
  // usa pontos brutos. Aqui validamos a fórmula com valores permitidos:
  // Governança: 4,4,4,2,0 = 14 -> 14/20 = 70% -> 70*0.20 = 14
  // Legislação: 2,2,2,2,2 = 10 -> 10/20 = 50% -> 50*0.15 = 7.5
  const respostas: IdtRespostas = { ...respostasCom(0) };
  const gov = IDT_QUESTIONARIO[0].perguntas.map((p) => p.id);
  const leg = IDT_QUESTIONARIO[1].perguntas.map((p) => p.id);
  [4, 4, 4, 2, 0].forEach((v, i) => (respostas[gov[i]] = v));
  leg.forEach((id) => (respostas[id] = 2));

  const resultado = calcularIdt(respostas);
  const governanca = resultado.eixos.find((e) => e.eixoId === "governanca");
  const legislacao = resultado.eixos.find((e) => e.eixoId === "legislacao");

  assert.equal(governanca?.percentual, 70);
  assert.equal(governanca?.ponderado, 14);
  assert.equal(legislacao?.percentual, 50);
  assert.equal(legislacao?.ponderado, 7.5);
  assert.equal(resultado.notaFinal, 21.5);
});

test("validação rejeita resposta ausente", () => {
  const respostas = respostasCom(4);
  delete respostas["gov_1"];
  assert.throws(() => validarRespostas(respostas), /sem resposta/);
});

test("validação rejeita valor fora da escala da pergunta", () => {
  // gov_1 aceita apenas 0|2|4
  const respostas = { ...respostasCom(4), gov_1: 3 };
  assert.throws(() => validarRespostas(respostas), /inválido/);
});

test("faixas de classificação respeitam os limites oficiais", () => {
  assert.equal(classificar(0).nivel, "Município Inexistente");
  assert.equal(classificar(20).nivel, "Município Inexistente");
  assert.equal(classificar(21).nivel, "Município Sensibilizado");
  assert.equal(classificar(40).nivel, "Município Sensibilizado");
  assert.equal(classificar(41).nivel, "Município Estruturante");
  assert.equal(classificar(60).nivel, "Município Estruturante");
  assert.equal(classificar(61).nivel, "Município Consolidado");
  assert.equal(classificar(80).nivel, "Município Consolidado");
  assert.equal(classificar(81).nivel, "Município Referência em Turismo LGBTQIAPN+");
  assert.equal(classificar(100).nivel, "Município Referência em Turismo LGBTQIAPN+");
});

test("pontos fortes e fragilidades refletem os maiores e menores percentuais", () => {
  const respostas = respostasCom(0);
  // Qualificação e Promoção no máximo
  for (const eixoId of ["qualificacao", "promocao"]) {
    const eixo = IDT_QUESTIONARIO.find((e) => e.id === eixoId);
    eixo?.perguntas.forEach((p) => (respostas[p.id] = 4));
  }
  const resultado = calcularIdt(respostas);
  assert.deepEqual(new Set(resultado.pontosFortes), new Set(["Qualificação", "Promoção Turística"]));
  assert.equal(resultado.fragilidades.length, 2);
});
