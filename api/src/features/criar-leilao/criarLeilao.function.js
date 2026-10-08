const { app } = require("@azure/functions");
const { comTratamentoDeErros, lerCorpoJson } = require("../../infrastructure/http/httpHandler");
const { container } = require("../../composition/container");

// POST /api/leiloes
app.http("leiloesCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "leiloes",
  handler: comTratamentoDeErros("Falha ao inserir leilão", async (request) => {
    const corpo = await lerCorpoJson(request);
    const leilao = await container.criarLeilao().executar(corpo);
    return { status: 201, jsonBody: leilao };
  }),
});
