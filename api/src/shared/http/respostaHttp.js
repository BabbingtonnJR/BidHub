/**
 * Utilitários da camada de apresentação, compartilhados entre os slices.
 * Traduzem resultados e erros de domínio para respostas HTTP das Azure Functions.
 */
import {
  ErroDeRegraDeNegocio,
  ErroDeValidacao,
  ErroNaoEncontrado,
} from "../../domain/erros/ErrosDeDominio.js";

export function ok(corpo, status = 200) {
  return { status, jsonBody: corpo };
}

export function respostaDeErro(erro, context, mensagemPadrao) {
  if (erro instanceof ErroDeValidacao) return { status: 400, jsonBody: { erro: erro.message } };
  if (erro instanceof ErroNaoEncontrado) return { status: 404, jsonBody: { erro: erro.message } };
  if (erro instanceof ErroDeRegraDeNegocio) return { status: 422, jsonBody: { erro: erro.message } };

  context?.error?.(erro);
  return { status: 500, jsonBody: { erro: mensagemPadrao, detalhe: erro.message } };
}

export async function lerJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ErroDeValidacao("Corpo da requisição deve ser um JSON válido");
  }
}
