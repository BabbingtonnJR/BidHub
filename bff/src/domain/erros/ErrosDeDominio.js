/** Erros de domínio do BFF. Não conhecem HTTP nem Express. */
export class ErroDeDominio extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = this.constructor.name;
  }
}

export class ErroDeValidacao extends ErroDeDominio {}
export class ErroDeRegraDeNegocio extends ErroDeDominio {}
export class ErroNaoEncontrado extends ErroDeDominio {}

/** O microsserviço de leilões respondeu com erro ou está fora do ar. */
export class ErroServicoIndisponivel extends ErroDeDominio {}
