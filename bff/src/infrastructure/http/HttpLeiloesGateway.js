import { ErroDeRegraDeNegocio, ErroServicoIndisponivel } from "../../domain/erros/ErrosDeDominio.js";
import { Leilao } from "../../domain/leilao/Leilao.js";
import { LeiloesGateway } from "../../domain/leilao/LeiloesGateway.js";

/**
 * Adaptador de infraestrutura: implementa a porta LeiloesGateway chamando
 * o microsserviço de leilões (Azure Functions) via HTTP.
 */
export class HttpLeiloesGateway extends LeiloesGateway {
  /**
   * @param {string} baseUrl ex.: https://purple-pond-09f931c10.3.azurestaticapps.net/api
   * @param {typeof fetch} [fetchImpl]
   */
  constructor(baseUrl, fetchImpl = globalThis.fetch) {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.fetch = fetchImpl;
  }

  async requisitar(caminho, opcoes) {
    let resposta;
    try {
      resposta = await this.fetch(`${this.baseUrl}${caminho}`, opcoes);
    } catch (erro) {
      throw new ErroServicoIndisponivel(`Microsserviço de leilões indisponível: ${erro.message}`);
    }
    const corpo = await resposta.json().catch(() => ({}));
    if (resposta.status === 422) throw new ErroDeRegraDeNegocio(corpo.erro ?? "Regra de negócio violada");
    if (!resposta.ok) {
      throw new ErroServicoIndisponivel(`Microsserviço de leilões respondeu ${resposta.status}`);
    }
    return corpo;
  }

  async listar() {
    const dados = await this.requisitar("/leiloes");
    return dados.map((d) => new Leilao(d));
  }

  async registrarLance(id, valor) {
    const dados = await this.requisitar(`/leiloes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lanceAtual: valor }),
    });
    return new Leilao(dados);
  }
}
