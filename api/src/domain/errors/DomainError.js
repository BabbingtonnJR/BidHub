class DomainError extends Error {
  constructor(mensagem, tipo) {
    super(mensagem);
    this.name = this.constructor.name;
    this.tipo = tipo;
  }
}

class ValidacaoError extends DomainError {
  constructor(mensagem) {
    super(mensagem, "validacao");
  }
}

class RegraDeNegocioError extends DomainError {
  constructor(mensagem) {
    super(mensagem, "regra-de-negocio");
  }
}

class NaoEncontradoError extends DomainError {
  constructor(mensagem) {
    super(mensagem, "nao-encontrado");
  }
}

module.exports = { DomainError, ValidacaoError, RegraDeNegocioError, NaoEncontradoError };
