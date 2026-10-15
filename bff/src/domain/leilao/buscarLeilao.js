import { ErroDeValidacao, ErroNaoEncontrado } from "../erros/ErrosDeDominio.js";

/** Regra de domínio: localizar um leilão pelo id dentro de uma lista. */
export function encontrarLeilao(leiloes, idBruto) {
  const id = Number(idBruto);
  if (!Number.isInteger(id)) {
    throw new ErroDeValidacao("id inválido");
  }
  const leilao = leiloes.find((l) => l.id === id);
  if (!leilao) {
    throw new ErroNaoEncontrado("Leilão não encontrado");
  }
  return leilao;
}
