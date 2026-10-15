import { ErroDeValidacao, ErroNaoEncontrado } from "../../domain/erros/ErrosDeDominio.js";
import { paraIdLeilao } from "../../domain/leilao/idLeilao.js";

/**
 * Slice: Atualizar leilão (novo lance e/ou mudança de status) — caso de uso.
 */
export class AtualizarLeilaoUseCase {
  /** @param {import("../../domain/leilao/LeilaoRepository.js").LeilaoRepository} leilaoRepository */
  constructor(leilaoRepository) {
    this.leilaoRepository = leilaoRepository;
  }

  async executar(idBruto, dados) {
    const id = paraIdLeilao(idBruto);
    const temLance = dados?.lanceAtual !== undefined;
    const temStatus = dados?.status !== undefined;

    if (!temLance && !temStatus) {
      throw new ErroDeValidacao("Envie lanceAtual e/ou status para atualizar");
    }

    const leilao = await this.leilaoRepository.buscarPorId(id);
    if (!leilao) {
      throw new ErroNaoEncontrado("Leilão não encontrado");
    }

    if (temLance) leilao.darLance(dados.lanceAtual);
    if (temStatus) leilao.alterarStatus(dados.status);

    await this.leilaoRepository.atualizar(leilao);
    return leilao.toJSON();
  }
}
