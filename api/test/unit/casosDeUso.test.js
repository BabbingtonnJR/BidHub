/**
 * Testes unitários dos casos de uso, usando um repositório em memória.
 * Só é possível testar assim porque os casos de uso dependem da porta
 * LeilaoRepository, e não do MongoDB (benefício direto da Clean Architecture).
 */
import { Leilao } from "../../src/domain/leilao/Leilao.js";
import { LeilaoRepository } from "../../src/domain/leilao/LeilaoRepository.js";
import {
  ErroDeRegraDeNegocio,
  ErroDeValidacao,
  ErroNaoEncontrado,
} from "../../src/domain/erros/ErrosDeDominio.js";
import { BuscarLeiloesUseCase } from "../../src/features/buscar-leiloes/BuscarLeiloesUseCase.js";
import { CriarLeilaoUseCase } from "../../src/features/criar-leilao/CriarLeilaoUseCase.js";
import { AtualizarLeilaoUseCase } from "../../src/features/atualizar-leilao/AtualizarLeilaoUseCase.js";
import { ExcluirLeilaoUseCase } from "../../src/features/excluir-leilao/ExcluirLeilaoUseCase.js";

class LeilaoRepositoryEmMemoria extends LeilaoRepository {
  constructor(registros = []) {
    super();
    this.registros = new Map(registros.map((r) => [r.id, { ...r }]));
  }
  async listarTodos() {
    return [...this.registros.values()].sort((a, b) => a.id - b.id).map((r) => Leilao.restaurar(r));
  }
  async buscarPorId(id) {
    const r = this.registros.get(id);
    return r ? Leilao.restaurar(r) : null;
  }
  async proximoId() {
    return this.registros.size ? Math.max(...this.registros.keys()) + 1 : 1;
  }
  async salvar(leilao) {
    this.registros.set(leilao.id, leilao.toJSON());
  }
  async atualizar(leilao) {
    this.registros.set(leilao.id, leilao.toJSON());
  }
  async excluir(id) {
    return this.registros.delete(id);
  }
}

const relogio = {
  id: 4,
  lote: "004",
  titulo: "Relógio de bolso suíço, século XIX",
  categoria: "Colecionáveis",
  vendedor: "André Gustavo Antiguidades",
  lanceInicial: 4200,
  lanceAtual: 4200,
  incrementoMinimo: 200,
  status: "agendado",
  espectadores: 0,
  horario: "Sexta, 17:00",
  imagem: "⏱️",
};

describe("BuscarLeiloesUseCase", () => {
  it("lista os leilões ordenados por id", async () => {
    const repo = new LeilaoRepositoryEmMemoria([{ ...relogio, id: 2 }, { ...relogio, id: 1 }]);
    const resultado = await new BuscarLeiloesUseCase(repo).executar();
    expect(resultado.map((l) => l.id)).toEqual([1, 2]);
  });
});

describe("CriarLeilaoUseCase", () => {
  it("cria leilão com próximo id e lance atual igual ao inicial", async () => {
    const repo = new LeilaoRepositoryEmMemoria([relogio]);
    const { id: _ignorado, lanceAtual: _la, ...dados } = relogio;
    const criado = await new CriarLeilaoUseCase(repo).executar(dados);
    expect(criado.id).toBe(5);
    expect(criado.lanceAtual).toBe(4200);
    expect(criado.status).toBe("agendado");
  });

  it("rejeita quando faltam campos obrigatórios", async () => {
    const repo = new LeilaoRepositoryEmMemoria();
    await expect(new CriarLeilaoUseCase(repo).executar({ titulo: "x" })).rejects.toBeInstanceOf(ErroDeValidacao);
  });
});

describe("AtualizarLeilaoUseCase", () => {
  it("aceita lance maior ou igual ao mínimo (atual + incremento)", async () => {
    const repo = new LeilaoRepositoryEmMemoria([relogio]);
    const atualizado = await new AtualizarLeilaoUseCase(repo).executar("4", { lanceAtual: 4400 });
    expect(atualizado.lanceAtual).toBe(4400);
  });

  it("rejeita lance abaixo do mínimo", async () => {
    const repo = new LeilaoRepositoryEmMemoria([relogio]);
    await expect(new AtualizarLeilaoUseCase(repo).executar("4", { lanceAtual: 4300 })).rejects.toBeInstanceOf(
      ErroDeRegraDeNegocio
    );
  });

  it("rejeita status inválido", async () => {
    const repo = new LeilaoRepositoryEmMemoria([relogio]);
    await expect(new AtualizarLeilaoUseCase(repo).executar("4", { status: "pausado" })).rejects.toBeInstanceOf(
      ErroDeRegraDeNegocio
    );
  });

  it("retorna não encontrado para id inexistente", async () => {
    const repo = new LeilaoRepositoryEmMemoria([relogio]);
    await expect(new AtualizarLeilaoUseCase(repo).executar("99", { status: "ao-vivo" })).rejects.toBeInstanceOf(
      ErroNaoEncontrado
    );
  });
});

describe("ExcluirLeilaoUseCase", () => {
  it("remove leilão existente", async () => {
    const repo = new LeilaoRepositoryEmMemoria([relogio]);
    expect(await new ExcluirLeilaoUseCase(repo).executar("4")).toEqual({ removido: true, id: 4 });
  });

  it("rejeita id inválido", async () => {
    const repo = new LeilaoRepositoryEmMemoria([relogio]);
    await expect(new ExcluirLeilaoUseCase(repo).executar("abc")).rejects.toBeInstanceOf(ErroDeValidacao);
  });
});
