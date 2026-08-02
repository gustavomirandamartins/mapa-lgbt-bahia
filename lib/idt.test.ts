import { test } from "node:test";
import assert from "node:assert/strict";

import {
  IDT_QUESTIONARIO,
  TOTAL_PERGUNTAS,
  calcularIdt,
  classificar,
  formatarRespostaTexto,
  type IdtRespostas,
} from "./idt.ts";

test("questionário oficial TGS-DT PLATUR-LGBT+: 7 eixos e 49 perguntas", () => {
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
  const respostas: IdtRespostas = {
    q1: "Sim",
    q2: "",
    q3: "Sim",
  };
  const resultado = calcularIdt(respostas);
  assert.equal(resultado.classificacao.nivel, "Mapeado");
  assert.equal(resultado.notaFinal, 100);
  assert.equal(resultado.eixos[0].respostas["q1"], "Sim");
  assert.equal(resultado.eixos[0].respostas["q3"], "Sim");
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
