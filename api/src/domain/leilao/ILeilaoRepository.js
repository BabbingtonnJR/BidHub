// "interface" do repositório; Mongo e memória implementam ela
class ILeilaoRepository {
  async listar() {
    throw new Error("ILeilaoRepository.listar não implementado");
  }

  async buscarPorId(_id) {
    throw new Error("ILeilaoRepository.buscarPorId não implementado");
  }

  async proximoId() {
    throw new Error("ILeilaoRepository.proximoId não implementado");
  }

  async adicionar(_leilao) {
    throw new Error("ILeilaoRepository.adicionar não implementado");
  }

  async atualizar(_leilao) {
    throw new Error("ILeilaoRepository.atualizar não implementado");
  }

  async remover(_id) {
    throw new Error("ILeilaoRepository.remover não implementado");
  }
}

module.exports = { ILeilaoRepository };
