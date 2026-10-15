/**
 * Erros de domínio (camada mais interna).
 * Não conhecem HTTP: quem traduz para status code é a camada de apresentação.
 */
export class ErroDeDominio extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = this.constructor.name;
  }
}

/** Dados de entrada inválidos (ex.: campo obrigatório faltando, id inválido). */
export class ErroDeValidacao extends ErroDeDominio {}

/** Uma regra de negócio foi violada (ex.: lance abaixo do mínimo). */
export class ErroDeRegraDeNegocio extends ErroDeDominio {}

/** O recurso procurado não existe. */
export class ErroNaoEncontrado extends ErroDeDominio {}
