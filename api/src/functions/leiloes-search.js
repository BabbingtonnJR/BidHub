const { app } = require("@azure/functions");
const { getDb } = require("../shared/mongoClient");

app.http("leiloesSearch", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "leiloes",
  handler: async (request, context) => {
    try {
      const db = await getDb();
      const leiloes = await db.collection("leiloes").find({}).sort({ id: 1 }).toArray();
      return { status: 200, jsonBody: leiloes };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { erro: "Falha ao buscar leilões", detalhe: err.message } };
    }
  },
});