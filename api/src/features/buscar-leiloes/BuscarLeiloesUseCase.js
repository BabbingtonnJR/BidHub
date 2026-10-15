/**
 * Slice: Buscar leilões — caso de uso (camada de aplicação).
 * Depende apenas da porta LeilaoRepository (domínio), nunca do MongoDB.
 */
export class BuscarLeiloesUseCase {
  /** @param {import("../../domain/leilao/LeilaoRepository.js").LeilaoRepository} leilaoRepository */
  constructor(leilaoRepository) {
    this.leilaoRepository = leilaoRepository;
  }

  async executar() {
    const leiloes = await this.leilaoRepository.listarTodos();
    return leiloes.map((leilao) => leilao.toJSON());
  }
}
