class ListarLeiloesUseCase {
  constructor(leilaoRepository) {
    this.leilaoRepository = leilaoRepository;
  }

  async executar() {
    const leiloes = await this.leilaoRepository.listar();
    return leiloes.map((leilao) => leilao.toJSON());
  }
}

module.exports = { ListarLeiloesUseCase };
