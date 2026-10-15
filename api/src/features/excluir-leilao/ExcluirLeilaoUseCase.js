import { ErroNaoEncontrado } from "../../domain/erros/ErrosDeDominio.js";
import { paraIdLeilao } from "../../domain/leilao/idLeilao.js";

/**
 * Slice: Excluir leilão — caso de uso (camada de aplicação).
 */
export class ExcluirLeilaoUseCase {
  /** @param {import("../../domain/leilao/LeilaoRepository.js").LeilaoRepository} leilaoRepository */
  constructor(leilaoRepository) {
    this.leilaoRepository = leilaoRepository;
  }

  async executar(idBruto) {
    const id = paraIdLeilao(idBruto);
    const removido = await this.leilaoRepository.excluir(id);
    if (!removido) {
      throw new ErroNaoEncontrado("Leilão não encontrado");
    }
    return { removido: true, id };
  }
}
