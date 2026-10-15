/**
 * Middleware de erros (apresentação, compartilhado entre os slices).
 * Traduz erros de domínio para status HTTP.
 */
import {
  ErroDeRegraDeNegocio,
  ErroDeValidacao,
  ErroNaoEncontrado,
  ErroServicoIndisponivel,
} from "../../domain/erros/ErrosDeDominio.js";

// eslint-disable-next-line no-unused-vars
export function tratarErros(erro, _req, res, _next) {
  if (erro instanceof ErroDeValidacao) return res.status(400).json({ erro: erro.message });
  if (erro instanceof ErroNaoEncontrado) return res.status(404).json({ erro: erro.message });
  if (erro instanceof ErroDeRegraDeNegocio) return res.status(422).json({ erro: erro.message });
  if (erro instanceof ErroServicoIndisponivel) return res.status(502).json({ erro: erro.message });
  console.error(erro);
  return res.status(500).json({ erro: "Erro interno no BFF" });
}
