const { ILeilaoRepository } = require("../../domain/leilao/ILeilaoRepository");
const { Leilao } = require("../../domain/leilao/Leilao");

const COLECAO = "leiloes";

class MongoLeilaoRepository extends ILeilaoRepository {
  constructor(mongoConnection) {
    super();
    this.connection = mongoConnection;
  }

  async colecao() {
    const db = await this.connection.getDb();
    return db.collection(COLECAO);
  }

  static paraEntidade(doc) {
    if (!doc) return null;
    const { _id, ...dados } = doc;
    return new Leilao(dados);
  }

  async listar() {
    const docs = await (await this.colecao()).find({}).sort({ id: 1 }).toArray();
    return docs.map(MongoLeilaoRepository.paraEntidade);
  }

  async buscarPorId(id) {
    const doc = await (await this.colecao()).findOne({ id });
    return MongoLeilaoRepository.paraEntidade(doc);
  }

  async proximoId() {
    const [ultimo] = await (await this.colecao()).find().sort({ id: -1 }).limit(1).toArray();
    return ultimo ? ultimo.id + 1 : 1;
  }

  async adicionar(leilao) {
    await (await this.colecao()).insertOne(leilao.toJSON());
  }

  async atualizar(leilao) {
    const { id, ...campos } = leilao.toJSON();
    await (await this.colecao()).updateOne({ id }, { $set: campos });
  }

  async remover(id) {
    const resultado = await (await this.colecao()).deleteOne({ id });
    return resultado.deletedCount > 0;
  }
}

module.exports = { MongoLeilaoRepository };
