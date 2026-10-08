const { ILeilaoRepository } = require("../../domain/leilao/ILeilaoRepository");
const { Leilao } = require("../../domain/leilao/Leilao");

// usado nos testes, pra não depender do Mongo
class InMemoryLeilaoRepository extends ILeilaoRepository {
  constructor(seed = []) {
    super();
    this.itens = new Map(seed.map((dados) => [dados.id, { ...dados }]));
  }

  async listar() {
    return [...this.itens.values()].sort((a, b) => a.id - b.id).map((d) => new Leilao(d));
  }

  async buscarPorId(id) {
    const dados = this.itens.get(id);
    return dados ? new Leilao(dados) : null;
  }

  async proximoId() {
    const ids = [...this.itens.keys()];
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  async adicionar(leilao) {
    this.itens.set(leilao.id, leilao.toJSON());
  }

  async atualizar(leilao) {
    this.itens.set(leilao.id, leilao.toJSON());
  }

  async remover(id) {
    return this.itens.delete(id);
  }
}

module.exports = { InMemoryLeilaoRepository };
