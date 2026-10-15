import { ErroDeValidacao } from "../erros/ErrosDeDominio.js";

/** Converte e valida o identificador numérico de um leilão. */
export function paraIdLeilao(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id)) {
    throw new ErroDeValidacao("id inválido");
  }
  return id;
}
