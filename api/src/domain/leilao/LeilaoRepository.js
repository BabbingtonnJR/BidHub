/**
 * Porta (interface) de persistência de leilões.
 * O domínio e os casos de uso dependem desta abstração; a implementação
 * concreta (MongoDB) fica na camada de infraestrutura (inversão de dependência).
 */
export class LeilaoRepository {
  /** @returns {Promise<import("./Leilao.js").Leilao[]>} */
  async listarTodos() {
    throw new Error("Não implementado");
  }

  /** @returns {Promise<import("./Leilao.js").Leilao | null>} */
  async buscarPorId(_id) {
    throw new Error("Não implementado");
  }

  /** @returns {Promise<number>} */
  async proximoId() {
    throw new Error("Não implementado");
  }

  async salvar(_leilao) {
    throw new Error("Não implementado");
  }

  async atualizar(_leilao) {
    throw new Error("Não implementado");
  }

  /** @returns {Promise<boolean>} true se removeu algum registro */
  async excluir(_id) {
    throw new Error("Não implementado");
  }
}
