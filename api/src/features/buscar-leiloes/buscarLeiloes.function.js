/**
 * Slice: Buscar leilões — camada de apresentação (Azure Function HTTP).
 * GET /api/leiloes
 */
import { app } from "@azure/functions";
import { leilaoRepository } from "../../main/container.js";
import { ok, respostaDeErro } from "../../shared/http/respostaHttp.js";
import { BuscarLeiloesUseCase } from "./BuscarLeiloesUseCase.js";

app.http("leiloesSearch", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "leiloes",
  handler: async (_request, context) => {
    try {
      const useCase = new BuscarLeiloesUseCase(leilaoRepository());
      return ok(await useCase.executar());
    } catch (erro) {
      return respostaDeErro(erro, context, "Falha ao buscar leilões");
    }
  },
});
