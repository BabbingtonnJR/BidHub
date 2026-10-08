const { ValidacaoError, NaoEncontradoError } = require("../../domain/errors/DomainError");

class AtualizarLeilaoUseCase {
  constructor(leilaoRepository) {
    this.leilaoRepository = leilaoRepository;
  }

  async executar(id, { lanceAtual, status } = {}) {
    const temLance = lanceAtual !== undefined;
    const temStatus = status !== undefined;
    if (!temLance && !temStatus) {
      throw new ValidacaoError("Envie lanceAtual e/ou status para atualizar");
    }

    const leilao = await this.leilaoRepository.buscarPorId(id);
    if (!leilao) {
      throw new NaoEncontradoError("Leilão não encontrado");
    }

    if (temLance) leilao.darLance(lanceAtual);
    if (temStatus) leilao.alterarStatus(status);

    await this.leilaoRepository.atualizar(leilao);
    return leilao.toJSON();
  }
}

module.exports = { AtualizarLeilaoUseCase };
