import { test } from "node:test";
import assert from "node:assert/strict";

import {
  IDT_QUESTIONARIO,
  TOTAL_PERGUNTAS,
  calcularIdt,
  classificar,
  formatarRespostaTexto,
  validarRespostas,
  type IdtRespostas,
} from "./idt.ts";

/** Monta respostas válidas: primeira opção de cada rádio, resto omitido. */
function respostasValidas(extra: IdtRespostas = {}): IdtRespostas {
  const respostas: IdtRespostas = { ...extra };
  for (const eixo of IDT_QUESTIONARIO) {
    for (const pergunta of eixo.perguntas) {
      if (pergunta.tipo === "radio" && !(pergunta.id in respostas)) {
        respostas[pergunta.id] = pergunta.opcoes?.[0]?.valor ?? "Sim";
      }
    }
  }
  return respostas;
}

test("questionário oficial TGS-DT Plataforma de Mapeamento do Turismo LGBTQIAPN+ Municipal: 7 eixos e 49 perguntas", () => {
  assert.equal(IDT_QUESTIONARIO.length, 7);
  assert.equal(TOTAL_PERGUNTAS, 49);

  const totalPerguntas = IDT_QUESTIONARIO.reduce(
    (acc, eixo) => acc + eixo.perguntas.length,
    0
  );
  assert.equal(totalPerguntas, 49);

  // Eixos: 8, 4, 5, 7, 4, 4, 17
  const esperados = [8, 4, 5, 7, 4, 4, 17];
  IDT_QUESTIONARIO.forEach((eixo, idx) => {
    assert.equal(eixo.perguntas.length, esperados[idx]);
  });
});

test("calcularIdt processa respostas sem pontuação e classifica como Mapeado", () => {
  const respostas = respostasValidas({ q1: "Sim", q3: "Sim" });
  const resultado = calcularIdt(respostas);
  assert.equal(resultado.classificacao.nivel, "Mapeado");
  assert.equal(resultado.notaFinal, 100);
  assert.equal(resultado.eixos[0].respostas["q1"], "Sim");
  assert.equal(resultado.eixos[0].respostas["q3"], "Sim");
});

test("validarRespostas rejeita questionário vazio ou incompleto", () => {
  assert.throws(() => validarRespostas({}), /sem resposta/);
  assert.throws(() => validarRespostas(null as unknown as IdtRespostas));
  const parcial = respostasValidas();
  delete parcial.q1;
  assert.throws(() => validarRespostas(parcial), /q1/);
});

test("validarRespostas rejeita valor fora das opções do rádio", () => {
  assert.throws(
    () => validarRespostas(respostasValidas({ q1: "Talvez" })),
    /inválido/
  );
});

test("validarRespostas aceita checkbox e texto opcionais", () => {
  validarRespostas(respostasValidas({ q11: "Verão, Carnaval" }));
  const comCheckbox = respostasValidas();
  const eixoCheckbox = IDT_QUESTIONARIO.flatMap((e) => e.perguntas).find(
    (p) => p.tipo === "checkbox"
  );
  if (eixoCheckbox?.opcoes?.[0]) {
    comCheckbox[eixoCheckbox.id] = [String(eixoCheckbox.opcoes[0].valor)];
  }
  validarRespostas(comCheckbox);
});

test("classificar discrimina status Mapeado vs Não Mapeado", () => {
  assert.equal(classificar(100).nivel, "Mapeado");
  assert.equal(classificar(0).nivel, "Não Mapeado");
});

test("formatarRespostaTexto formata listas, booleanos, vazios e strings", () => {
  assert.equal(formatarRespostaTexto(["Sol e Praia", "Cultural"]), "Sol e Praia, Cultural");
  assert.equal(formatarRespostaTexto([]), "Não informado");
  assert.equal(formatarRespostaTexto(true), "Sim");
  assert.equal(formatarRespostaTexto(false), "Não");
  assert.equal(formatarRespostaTexto(""), "Não informado");
  assert.equal(formatarRespostaTexto("Texto de exemplo"), "Texto de exemplo");
});
