const { MongoConnection } = require("../infrastructure/persistence/MongoConnection");
const { MongoLeilaoRepository } = require("../infrastructure/persistence/MongoLeilaoRepository");
const { ListarLeiloesUseCase } = require("../features/listar-leiloes/ListarLeiloesUseCase");
const { CriarLeilaoUseCase } = require("../features/criar-leilao/CriarLeilaoUseCase");
const { AtualizarLeilaoUseCase } = require("../features/atualizar-leilao/AtualizarLeilaoUseCase");
const { ExcluirLeilaoUseCase } = require("../features/excluir-leilao/ExcluirLeilaoUseCase");

// aqui é o único lugar que sabe que o banco é o Mongo
function criarContainer({ leilaoRepository } = {}) {
  let repositorio = leilaoRepository;

  const repo = () => {
    if (!repositorio) {
      const conexao = new MongoConnection({ uri: process.env.MONGODB_URI });
      repositorio = new MongoLeilaoRepository(conexao);
    }
    return repositorio;
  };

  return {
    listarLeiloes: () => new ListarLeiloesUseCase(repo()),
    criarLeilao: () => new CriarLeilaoUseCase(repo()),
    atualizarLeilao: () => new AtualizarLeilaoUseCase(repo()),
    excluirLeilao: () => new ExcluirLeilaoUseCase(repo()),
  };
}

const container = criarContainer();

module.exports = { container, criarContainer };
