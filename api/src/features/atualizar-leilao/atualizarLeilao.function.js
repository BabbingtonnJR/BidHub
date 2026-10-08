const { app } = require("@azure/functions");
const { comTratamentoDeErros, lerId, lerCorpoJson } = require("../../infrastructure/http/httpHandler");
const { container } = require("../../composition/container");

// PUT /api/leiloes/{id}
app.http("leiloesUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "leiloes/{id}",
  handler: comTratamentoDeErros("Falha ao atualizar leilão", async (request) => {
    const id = lerId(request);
    const corpo = await lerCorpoJson(request);
    const leilao = await container.atualizarLeilao().executar(id, corpo);
    return { status: 200, jsonBody: leilao };
  }),
});
