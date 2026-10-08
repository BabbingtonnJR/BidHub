const { StatusLeilao, STATUS_VALIDOS, isStatusValido } = require("./StatusLeilao");
const { RegraDeNegocioError } = require("../errors/DomainError");

class Leilao {
  constructor({
    id,
    lote,
    titulo,
    categoria,
    vendedor,
    lanceInicial,
    lanceAtual,
    incrementoMinimo,
    status,
    espectadores,
    horario,
    imagem,
  }) {
    this.id = id;
    this.lote = lote;
    this.titulo = titulo;
    this.categoria = categoria;
    this.vendedor = vendedor;
    this.lanceInicial = Number(lanceInicial);
    this.lanceAtual = Number(lanceAtual);
    this.incrementoMinimo = Number(incrementoMinimo);
    this.status = status;
    this.espectadores = espectadores;
    this.horario = horario;
    this.imagem = imagem;
  }

  // leilão novo começa com o lance atual igual ao inicial
  static criar({ id, lote, titulo, categoria, vendedor, lanceInicial, incrementoMinimo, horario, status, imagem }) {
    const statusInicial = status || StatusLeilao.AGENDADO;
    if (!isStatusValido(statusInicial)) {
      throw new RegraDeNegocioError(`status deve ser um de: ${STATUS_VALIDOS.join(", ")}`);
    }
    return new Leilao({
      id,
      lote,
      titulo,
      categoria,
      vendedor,
      lanceInicial,
      lanceAtual: lanceInicial,
      incrementoMinimo,
      status: statusInicial,
      espectadores: 0,
      horario,
      imagem: imagem || "🏷️",
    });
  }

  get lanceMinimo() {
    return this.lanceAtual + this.incrementoMinimo;
  }

  darLance(valor) {
    const novoLance = Number(valor);
    if (!novoLance || novoLance < this.lanceMinimo) {
      throw new RegraDeNegocioError(`Lance deve ser de pelo menos ${this.lanceMinimo}`);
    }
    this.lanceAtual = novoLance;
  }

  alterarStatus(status) {
    if (!isStatusValido(status)) {
      throw new RegraDeNegocioError(`status deve ser um de: ${STATUS_VALIDOS.join(", ")}`);
    }
    this.status = status;
  }

  toJSON() {
    return {
      id: this.id,
      lote: this.lote,
      titulo: this.titulo,
      categoria: this.categoria,
      vendedor: this.vendedor,
      lanceInicial: this.lanceInicial,
      lanceAtual: this.lanceAtual,
      incrementoMinimo: this.incrementoMinimo,
      status: this.status,
      espectadores: this.espectadores,
      horario: this.horario,
      imagem: this.imagem,
    };
  }
}

module.exports = { Leilao };
