const { app } = require("@azure/functions");
const { getDb } = require("../shared/mongoClient");

app.http("leiloesCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "leiloes",
  handler: async (request, context) => {
    try {
      const body = await request.json();

      const camposObrigatorios = ["lote", "titulo", "categoria", "vendedor", "lanceInicial", "incrementoMinimo", "horario"];
      const faltando = camposObrigatorios.filter((c) => body[c] === undefined || body[c] === "");
      if (faltando.length) {
        return { status: 400, jsonBody: { erro: `Campos obrigatórios faltando: ${faltando.join(", ")}` } };
      }

      const db = await getDb();
      const colecao = db.collection("leiloes");

      const ultimo = await colecao.find().sort({ id: -1 }).limit(1).toArray();
      const proximoId = ultimo.length ? ultimo[0].id + 1 : 1;

      const novoLeilao = {
        id: proximoId,
        lote: body.lote,
        titulo: body.titulo,
        categoria: body.categoria,
        vendedor: body.vendedor,
        lanceInicial: Number(body.lanceInicial),
        lanceAtual: Number(body.lanceInicial),
        incrementoMinimo: Number(body.incrementoMinimo),
        status: body.status || "agendado",
        espectadores: 0,
        horario: body.horario,
        imagem: body.imagem || "🏷️",
      };

      await colecao.insertOne(novoLeilao);

      return { status: 201, jsonBody: novoLeilao };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { erro: "Falha ao inserir leilão", detalhe: err.message } };
    }
  },
});