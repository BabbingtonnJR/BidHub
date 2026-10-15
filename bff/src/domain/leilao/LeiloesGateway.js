/**
 * Porta de saída do BFF para o microsserviço de leilões.
 * Os casos de uso dependem desta abstração; a implementação HTTP real fica em
 * infrastructure/http (inversão de dependência).
 */
export class LeiloesGateway {
  /** @returns {Promise<import("./Leilao.js").Leilao[]>} */
  async listar() {
    throw new Error("Não implementado");
  }

  /** @returns {Promise<import("./Leilao.js").Leilao>} */
  async registrarLance(_id, _valor) {
    throw new Error("Não implementado");
  }
}
