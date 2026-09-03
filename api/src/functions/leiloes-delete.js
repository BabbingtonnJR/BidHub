const { app } = require("@azure/functions");
const { getDb } = require("../shared/mongoClient");

app.http("leiloesDelete", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "leiloes/{id}",
  handler: async (request, context) => {
    try {
      const id = Number(request.params.id);
      if (!Number.isInteger(id)) {
        return { status: 400, jsonBody: { erro: "id inválido" } };
      }

      const db = await getDb();
      const resultado = await db.collection("leiloes").deleteOne({ id });

      if (resultado.deletedCount === 0) {
        return { status: 404, jsonBody: { erro: "Leilão não encontrado" } };
      }

      return { status: 200, jsonBody: { removido: true, id } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { erro: "Falha ao excluir leilão", detalhe: err.message } };
    }
  },
});