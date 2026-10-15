import { Leilao } from "../../domain/leilao/Leilao.js";
import { LeilaoRepository } from "../../domain/leilao/LeilaoRepository.js";

const COLECAO = "leiloes";

/**
 * Adaptador de infraestrutura: implementa a porta LeilaoRepository usando MongoDB.
 * Recebe uma função que devolve o banco, para facilitar testes e reaproveitar a conexão.
 */
export class MongoLeilaoRepository extends LeilaoRepository {
  constructor(obterDb) {
    super();
    this.obterDb = obterDb;
  }

  async colecao() {
    const db = await this.obterDb();
    return db.collection(COLECAO);
  }

  async listarTodos() {
    const colecao = await this.colecao();
    const registros = await colecao.find({}).sort({ id: 1 }).toArray();
    return registros.map((r) => Leilao.restaurar(r));
  }

  async buscarPorId(id) {
    const colecao = await this.colecao();
    const registro = await colecao.findOne({ id });
    return registro ? Leilao.restaurar(registro) : null;
  }

  async proximoId() {
    const colecao = await this.colecao();
    const ultimo = await colecao.find().sort({ id: -1 }).limit(1).toArray();
    return ultimo.length ? ultimo[0].id + 1 : 1;
  }

  async salvar(leilao) {
    const colecao = await this.colecao();
    await colecao.insertOne(leilao.toJSON());
  }

  async atualizar(leilao) {
    const colecao = await this.colecao();
    const { id, ...campos } = leilao.toJSON();
    await colecao.updateOne({ id }, { $set: campos });
  }

  async excluir(id) {
    const colecao = await this.colecao();
    const resultado = await colecao.deleteOne({ id });
    return resultado.deletedCount > 0;
  }
}
