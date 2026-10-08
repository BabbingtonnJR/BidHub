const { Leilao } = require("../../domain/leilao/Leilao");
const { ValidacaoError } = require("../../domain/errors/DomainError");

const CAMPOS_OBRIGATORIOS = Object.freeze([
  "lote",
  "titulo",
  "categoria",
  "vendedor",
  "lanceInicial",
  "incrementoMinimo",
  "horario",
]);

class CriarLeilaoUseCase {
  constructor(leilaoRepository) {
    this.leilaoRepository = leilaoRepository;
  }

  async executar(dados) {
    const faltando = CAMPOS_OBRIGATORIOS.filter((c) => dados[c] === undefined || dados[c] === "");
    if (faltando.length) {
      throw new ValidacaoError(`Campos obrigatórios faltando: ${faltando.join(", ")}`);
    }

    const id = await this.leilaoRepository.proximoId();
    const leilao = Leilao.criar({ ...dados, id });
    await this.leilaoRepository.adicionar(leilao);
    return leilao.toJSON();
  }
}

module.exports = { CriarLeilaoUseCase, CAMPOS_OBRIGATORIOS };
