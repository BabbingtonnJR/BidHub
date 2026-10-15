import { encontrarLeilao } from "../../domain/leilao/buscarLeilao.js";

/**
 * Slice: Leilão ao vivo — caso de uso.
 * Devolve os dados da tela de leilão: lote em destaque, lance atual,
 * próximo lance mínimo e se o formulário de lance deve ficar habilitado.
 */
export class LeilaoAoVivoUseCase {
  /** @param {import("../../domain/leilao/LeiloesGateway.js").LeiloesGateway} leiloesGateway */
  constructor(leiloesGateway) {
    this.leiloesGateway = leiloesGateway;
  }

  async executar(id) {
    const leilao = encontrarLeilao(await this.leiloesGateway.listar(), id);
    return {
      id: leilao.id,
      lote: leilao.lote,
      titulo: leilao.titulo,
      categoria: leilao.categoria,
      vendedor: leilao.vendedor,
      imagem: leilao.imagem,
      status: leilao.status,
      espectadores: leilao.espectadores,
      lanceAtual: leilao.lanceAtual,
      incrementoMinimo: leilao.incrementoMinimo,
      lanceMinimo: leilao.lanceMinimo,
      aceitaLances: leilao.aceitaLances,
    };
  }
}
