const { app } = require("@azure/functions");
const { getDb } = require("../shared/mongoClient");

const STATUS_VALIDOS = ["ao-vivo", "agendado", "encerrado"];

app.http("leiloesUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "leiloes/{id}",
  handler: async (request, context) => {
    try {
      const id = Number(request.params.id);
      if (!Number.isInteger(id)) {
        return { status: 400, jsonBody: { erro: "id inválido" } };
      }

      const body = await request.json();
      const temLance = body.lanceAtual !== undefined;
      const temStatus = body.status !== undefined;

      if (!temLance && !temStatus) {
        return { status: 400, jsonBody: { erro: "Envie lanceAtual e/ou status para atualizar" } };
      }

      const db = await getDb();
      const colecao = db.collection("leiloes");

      const leilaoAtual = await colecao.findOne({ id });
      if (!leilaoAtual) {
        return { status: 404, jsonBody: { erro: "Leilão não encontrado" } };
      }

      const camposParaAtualizar = {};

      if (temLance) {
        const novoLance = Number(body.lanceAtual);
        const minimo = leilaoAtual.lanceAtual + leilaoAtual.incrementoMinimo;
        if (!novoLance || novoLance < minimo) {
          return { status: 422, jsonBody: { erro: `Lance deve ser de pelo menos ${minimo}` } };
        }
        camposParaAtualizar.lanceAtual = novoLance;
      }

      if (temStatus) {
        if (!STATUS_VALIDOS.includes(body.status)) {
          return { status: 422, jsonBody: { erro: `status deve ser um de: ${STATUS_VALIDOS.join(", ")}` } };
        }
        camposParaAtualizar.status = body.status;
      }

      await colecao.updateOne({ id }, { $set: camposParaAtualizar });
      const atualizado = await colecao.findOne({ id });

      return { status: 200, jsonBody: atualizado };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { erro: "Falha ao atualizar leilão", detalhe: err.message } };
    }
  },
});