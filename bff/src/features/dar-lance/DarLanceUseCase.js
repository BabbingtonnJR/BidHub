import { encontrarLeilao } from "../../domain/leilao/buscarLeilao.js";

/**
 * Slice: Dar lance — caso de uso.
 * Valida o lance no BFF (regras do domínio) e só então delega ao microsserviço.
 */
export class DarLanceUseCase {
  /** @param {import("../../domain/leilao/LeiloesGateway.js").LeiloesGateway} leiloesGateway */
  constructor(leiloesGateway) {
    this.leiloesGateway = leiloesGateway;
  }

  async executar(id, valor) {
    const leilao = encontrarLeilao(await this.leiloesGateway.listar(), id);
    const lance = leilao.validarLance(valor);
    const atualizado = await this.leiloesGateway.registrarLance(leilao.id, lance);
    return {
      id: atualizado.id,
      lanceAtual: atualizado.lanceAtual,
      proximoLanceMinimo: atualizado.lanceMinimo,
    };
  }
}
