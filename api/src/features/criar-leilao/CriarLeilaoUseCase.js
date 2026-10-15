import { Leilao } from "../../domain/leilao/Leilao.js";

/**
 * Slice: Criar leilão — caso de uso (camada de aplicação).
 * As regras de validação ficam na entidade Leilao; o caso de uso orquestra.
 */
export class CriarLeilaoUseCase {
  /** @param {import("../../domain/leilao/LeilaoRepository.js").LeilaoRepository} leilaoRepository */
  constructor(leilaoRepository) {
    this.leilaoRepository = leilaoRepository;
  }

  async executar(dados) {
    const id = await this.leilaoRepository.proximoId();
    const leilao = Leilao.criar(dados, id);
    await this.leilaoRepository.salvar(leilao);
    return leilao.toJSON();
  }
}
