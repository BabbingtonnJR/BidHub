/**
 * Slice: Excluir leilão — camada de apresentação (Azure Function HTTP).
 * DELETE /api/leiloes/{id}
 */
import { app } from "@azure/functions";
import { leilaoRepository } from "../../main/container.js";
import { ok, respostaDeErro } from "../../shared/http/respostaHttp.js";
import { ExcluirLeilaoUseCase } from "./ExcluirLeilaoUseCase.js";

app.http("leiloesDelete", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "leiloes/{id}",
  handler: async (request, context) => {
    try {
      const useCase = new ExcluirLeilaoUseCase(leilaoRepository());
      return ok(await useCase.executar(request.params.id));
    } catch (erro) {
      return respostaDeErro(erro, context, "Falha ao excluir leilão");
    }
  },
});
