import { ErroDeRegraDeNegocio } from "../erros/ErrosDeDominio.js";

export const StatusLeilao = Object.freeze({
  AO_VIVO: "ao-vivo",
  AGENDADO: "agendado",
  ENCERRADO: "encerrado",
});

/**
 * Modelo de leitura do leilão no BFF, com as regras que a tela precisa
 * (lance mínimo, se aceita lances). Independente de Express e de HTTP.
 */
export class Leilao {
  constructor(dados) {
    Object.assign(this, dados);
    this.lanceAtual = Number(dados.lanceAtual);
    this.incrementoMinimo = Number(dados.incrementoMinimo);
  }

  get lanceMinimo() {
    return this.lanceAtual + this.incrementoMinimo;
  }

  get aceitaLances() {
    return this.status === StatusLeilao.AO_VIVO;
  }

  /** Valida um lance antes de enviá-lo ao microsserviço (falha rápida no BFF). */
  validarLance(valor) {
    if (!this.aceitaLances) {
      throw new ErroDeRegraDeNegocio("Só é possível dar lances em leilões ao vivo");
    }
    const lance = Number(valor);
    if (!lance || lance < this.lanceMinimo) {
      throw new ErroDeRegraDeNegocio(`Lance deve ser de pelo menos ${this.lanceMinimo}`);
    }
    return lance;
  }
}
