import { StatusLeilao } from "../../domain/leilao/Leilao.js";

/**
 * Slice: Catálogo — caso de uso.
 * Agrega os leilões do microsserviço no formato que a tela de catálogo precisa:
 * separados por status, com o lance mínimo já calculado e totais por seção.
 */
export class CatalogoUseCase {
  /** @param {import("../../domain/leilao/LeiloesGateway.js").LeiloesGateway} leiloesGateway */
  constructor(leiloesGateway) {
    this.leiloesGateway = leiloesGateway;
  }

  async executar() {
    const leiloes = await this.leiloesGateway.listar();
    const cartao = (l) => ({
      id: l.id,
      lote: l.lote,
      titulo: l.titulo,
      categoria: l.categoria,
      imagem: l.imagem,
      horario: l.horario,
      lanceAtual: l.lanceAtual,
      lanceMinimo: l.lanceMinimo,
      espectadores: l.espectadores,
    });
    const doStatus = (status) => leiloes.filter((l) => l.status === status).map(cartao);

    const aoVivo = doStatus(StatusLeilao.AO_VIVO);
    const agendados = doStatus(StatusLeilao.AGENDADO);
    const encerrados = doStatus(StatusLeilao.ENCERRADO);

    return {
      aoVivo,
      agendados,
      encerrados,
      totais: { aoVivo: aoVivo.length, agendados: agendados.length, encerrados: encerrados.length },
    };
  }
}
