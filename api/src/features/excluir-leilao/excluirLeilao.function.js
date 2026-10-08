const { app } = require("@azure/functions");
const { comTratamentoDeErros, lerId } = require("../../infrastructure/http/httpHandler");
const { container } = require("../../composition/container");

// DELETE /api/leiloes/{id}
app.http("leiloesDelete", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "leiloes/{id}",
  handler: comTratamentoDeErros("Falha ao excluir leilão", async (request) => {
    const id = lerId(request);
    const resultado = await container.excluirLeilao().executar(id);
    return { status: 200, jsonBody: resultado };
  }),
});
