/**
 * Slice: Criar leilão — camada de apresentação (Azure Function HTTP).
 * POST /api/leiloes
 */
import { app } from "@azure/functions";
import { leilaoRepository } from "../../main/container.js";
import { lerJson, ok, respostaDeErro } from "../../shared/http/respostaHttp.js";
import { CriarLeilaoUseCase } from "./CriarLeilaoUseCase.js";

app.http("leiloesCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "leiloes",
  handler: async (request, context) => {
    try {
      const dados = await lerJson(request);
      const useCase = new CriarLeilaoUseCase(leilaoRepository());
      return ok(await useCase.executar(dados), 201);
    } catch (erro) {
      return respostaDeErro(erro, context, "Falha ao inserir leilão");
    }
  },
});
