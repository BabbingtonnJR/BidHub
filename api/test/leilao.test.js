const { test, describe } = require("node:test");
const assert = require("node:assert/strict");

const { Leilao } = require("../src/domain/leilao/Leilao");
const { InMemoryLeilaoRepository } = require("../src/infrastructure/persistence/InMemoryLeilaoRepository");
const { criarContainer } = require("../src/composition/container");
const { comTratamentoDeErros, lerId, lerCorpoJson } = require("../src/infrastructure/http/httpHandler");

const seed = () => [
  { id: 1, lote: "001", titulo: "Quadro", categoria: "Arte", vendedor: "Casa A", lanceInicial: 100, lanceAtual: 150, incrementoMinimo: 10, status: "ao-vivo", espectadores: 5, horario: "Hoje", imagem: "🖼️" },
  { id: 2, lote: "002", titulo: "Carro", categoria: "Veículos", vendedor: "Casa B", lanceInicial: 500, lanceAtual: 500, incrementoMinimo: 50, status: "agendado", espectadores: 0, horario: "Amanhã", imagem: "🚗" },
];

const novoContainer = () => criarContainer({ leilaoRepository: new InMemoryLeilaoRepository(seed()) });

describe("Entidade Leilao", () => {
  test("criar() define lance atual = inicial, status agendado e imagem padrão", () => {
    const l = Leilao.criar({ id: 9, lote: "9", titulo: "T", categoria: "C", vendedor: "V", lanceInicial: "200", incrementoMinimo: "20", horario: "H" });
    assert.equal(l.lanceAtual, 200);
    assert.equal(l.status, "agendado");
    assert.equal(l.espectadores, 0);
    assert.equal(l.imagem, "🏷️");
  });

  test("darLance() rejeita valor abaixo de lanceAtual + incremento", () => {
    const l = new Leilao(seed()[0]);
    assert.throws(() => l.darLance(155), { tipo: "regra-de-negocio", message: "Lance deve ser de pelo menos 160" });
    l.darLance(160);
    assert.equal(l.lanceAtual, 160);
  });

  test("alterarStatus() aceita só os status válidos", () => {
    const l = new Leilao(seed()[0]);
    assert.throws(() => l.alterarStatus("pausado"), { tipo: "regra-de-negocio" });
    l.alterarStatus("encerrado");
    assert.equal(l.status, "encerrado");
  });
});

describe("Slice listar-leiloes", () => {
  test("retorna todos em ordem de id, sem _id", async () => {
    const lista = await novoContainer().listarLeiloes().executar();
    assert.deepEqual(lista.map((l) => l.id), [1, 2]);
    assert.equal(lista[0]._id, undefined);
  });
});

describe("Slice criar-leilao", () => {
  test("gera próximo id e persiste", async () => {
    const c = novoContainer();
    const criado = await c.criarLeilao().executar({ lote: "003", titulo: "Relógio", categoria: "Colecionáveis", vendedor: "Casa C", lanceInicial: 300, incrementoMinimo: 30, horario: "Sexta" });
    assert.equal(criado.id, 3);
    assert.equal((await c.listarLeiloes().executar()).length, 3);
  });

  test("lista campos obrigatórios faltando", async () => {
    await assert.rejects(novoContainer().criarLeilao().executar({ lote: "1" }), {
      tipo: "validacao",
      message: "Campos obrigatórios faltando: titulo, categoria, vendedor, lanceInicial, incrementoMinimo, horario",
    });
  });
});

describe("Slice atualizar-leilao", () => {
  test("aplica lance e status juntos", async () => {
    const atualizado = await novoContainer().atualizarLeilao().executar(1, { lanceAtual: 200, status: "encerrado" });
    assert.equal(atualizado.lanceAtual, 200);
    assert.equal(atualizado.status, "encerrado");
  });

  test("exige lanceAtual ou status", async () => {
    await assert.rejects(novoContainer().atualizarLeilao().executar(1, {}), { tipo: "validacao" });
  });

  test("404 lógico para id inexistente", async () => {
    await assert.rejects(novoContainer().atualizarLeilao().executar(99, { status: "encerrado" }), { tipo: "nao-encontrado" });
  });

  test("lance inválido não altera o registro", async () => {
    const c = novoContainer();
    await assert.rejects(c.atualizarLeilao().executar(1, { lanceAtual: 1 }), { tipo: "regra-de-negocio" });
    const [primeiro] = await c.listarLeiloes().executar();
    assert.equal(primeiro.lanceAtual, 150);
  });
});

describe("Slice excluir-leilao", () => {
  test("remove e depois responde não encontrado", async () => {
    const c = novoContainer();
    assert.deepEqual(await c.excluirLeilao().executar(2), { removido: true, id: 2 });
    await assert.rejects(c.excluirLeilao().executar(2), { tipo: "nao-encontrado" });
  });
});

describe("Adaptador HTTP", () => {
  const contexto = { error: () => {} };

  test("traduz tipos de erro em 400/404/422 e inesperados em 500", async () => {
    const { ValidacaoError, NaoEncontradoError, RegraDeNegocioError } = require("../src/domain/errors/DomainError");
    const casos = [
      [new ValidacaoError("v"), 400],
      [new NaoEncontradoError("n"), 404],
      [new RegraDeNegocioError("r"), 422],
      [new Error("boom"), 500],
    ];
    for (const [erro, status] of casos) {
      const resposta = await comTratamentoDeErros("Falha", async () => { throw erro; })({}, contexto);
      assert.equal(resposta.status, status);
    }
  });

  test("lerId e lerCorpoJson validam a entrada", async () => {
    assert.equal(lerId({ params: { id: "7" } }), 7);
    assert.throws(() => lerId({ params: { id: "abc" } }), { tipo: "validacao" });
    await assert.rejects(lerCorpoJson({ json: async () => { throw new SyntaxError("x"); } }), { tipo: "validacao" });
  });
});
