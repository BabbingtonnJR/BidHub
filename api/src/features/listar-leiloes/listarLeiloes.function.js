const { app } = require("@azure/functions");
const { comTratamentoDeErros } = require("../../infrastructure/http/httpHandler");
const { container } = require("../../composition/container");

// GET /api/leiloes
app.http("leiloesSearch", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "leiloes",
  handler: comTratamentoDeErros("Falha ao buscar leilões", async () => {
    const leiloes = await container.listarLeiloes().executar();
    return { status: 200, jsonBody: leiloes };
  }),
});
