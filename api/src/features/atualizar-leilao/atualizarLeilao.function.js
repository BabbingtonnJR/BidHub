/**
 * Slice: Atualizar leilão — camada de apresentação (Azure Function HTTP).
 * PUT /api/leiloes/{id}
 */
import { app } from "@azure/functions";
import { leilaoRepository } from "../../main/container.js";
import { lerJson, ok, respostaDeErro } from "../../shared/http/respostaHttp.js";
import { AtualizarLeilaoUseCase } from "./AtualizarLeilaoUseCase.js";

app.http("leiloesUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "leiloes/{id}",
  handler: async (request, context) => {
    try {
      const dados = await lerJson(request);
      const useCase = new AtualizarLeilaoUseCase(leilaoRepository());
      return ok(await useCase.executar(request.params.id, dados));
    } catch (erro) {
      return respostaDeErro(erro, context, "Falha ao atualizar leilão");
    }
  },
});
