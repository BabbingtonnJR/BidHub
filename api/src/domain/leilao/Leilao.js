import { ErroDeRegraDeNegocio, ErroDeValidacao } from "../erros/ErrosDeDominio.js";
import { STATUS_VALIDOS, StatusLeilao, statusEhValido } from "./StatusLeilao.js";

const CAMPOS_OBRIGATORIOS = [
  "lote",
  "titulo",
  "categoria",
  "vendedor",
  "lanceInicial",
  "incrementoMinimo",
  "horario",
];

/**
 * Entidade Leilão: concentra as regras de negócio do leilão.
 * Não depende de banco de dados, framework HTTP nem Azure Functions.
 */
export class Leilao {
  constructor(props) {
    this.id = props.id;
    this.lote = props.lote;
    this.titulo = props.titulo;
    this.categoria = props.categoria;
    this.vendedor = props.vendedor;
    this.lanceInicial = Number(props.lanceInicial);
    this.lanceAtual = Number(props.lanceAtual ?? props.lanceInicial);
    this.incrementoMinimo = Number(props.incrementoMinimo);
    this.status = props.status ?? StatusLeilao.AGENDADO;
    this.espectadores = props.espectadores ?? 0;
    this.horario = props.horario;
    this.imagem = props.imagem ?? "🏷️";
  }

  /** Cria um leilão novo a partir dos dados de entrada, validando campos obrigatórios. */
  static criar(dados, id) {
    const faltando = CAMPOS_OBRIGATORIOS.filter(
      (campo) => dados?.[campo] === undefined || dados?.[campo] === ""
    );
    if (faltando.length) {
      throw new ErroDeValidacao(`Campos obrigatórios faltando: ${faltando.join(", ")}`);
    }
    if (dados.status !== undefined && !statusEhValido(dados.status)) {
      throw new ErroDeRegraDeNegocio(`status deve ser um de: ${STATUS_VALIDOS.join(", ")}`);
    }
    return new Leilao({ ...dados, id, lanceAtual: dados.lanceInicial, espectadores: 0 });
  }

  /** Recria a entidade a partir de um registro já persistido. */
  static restaurar(registro) {
    return new Leilao(registro);
  }

  lanceMinimo() {
    return this.lanceAtual + this.incrementoMinimo;
  }

  darLance(valor) {
    const novoLance = Number(valor);
    const minimo = this.lanceMinimo();
    if (!novoLance || novoLance < minimo) {
      throw new ErroDeRegraDeNegocio(`Lance deve ser de pelo menos ${minimo}`);
    }
    this.lanceAtual = novoLance;
  }

  alterarStatus(status) {
    if (!statusEhValido(status)) {
      throw new ErroDeRegraDeNegocio(`status deve ser um de: ${STATUS_VALIDOS.join(", ")}`);
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
