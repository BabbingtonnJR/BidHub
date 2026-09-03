require("dotenv").config();
const { MongoClient } = require("mongodb");

const leiloesIniciais = [
  {
    id: 1,
    lote: "001",
    titulo: "Óleo sobre tela, Retrato ao entardecer",
    categoria: "Arte",
    vendedor: "Casa Meridian Leilões",
    lanceInicial: 18000,
    lanceAtual: 34500,
    incrementoMinimo: 1000,
    status: "ao-vivo",
    espectadores: 214,
    horario: "Hoje, 19:00",
    imagem: "🖼️",
  },
  {
    id: 2,
    lote: "002",
    titulo: "Porsche 911 Carrera 1988, restaurado",
    categoria: "Veículos",
    vendedor: "Despachante Autêntica Clássicos",
    lanceInicial: 220000,
    lanceAtual: 220000,
    incrementoMinimo: 5000,
    status: "agendado",
    espectadores: 0,
    horario: "Amanhã, 20:30",
    imagem: "🚗",
  },
  {
    id: 3,
    lote: "003",
    titulo: "Cobertura duplex, vista para o parque",
    categoria: "Imóveis",
    vendedor: "Marcel Araújo Imóveis Premium",
    lanceInicial: 950000,
    lanceAtual: 1120000,
    incrementoMinimo: 10000,
    status: "encerrado",
    espectadores: 0,
    horario: "Ontem, 18:00",
    imagem: "🏙️",
  },
  {
    id: 4,
    lote: "004",
    titulo: "Relógio de bolso suíço, século XIX",
    categoria: "Colecionáveis",
    vendedor: "André Gustavo Antiguidades",
    lanceInicial: 4200,
    lanceAtual: 4200,
    incrementoMinimo: 200,
    status: "agendado",
    espectadores: 0,
    horario: "Sexta, 17:00",
    imagem: "⏱️",
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Defina MONGODB_URI como variável de ambiente antes de rodar (ver instruções abaixo).");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("bidhub");
  const colecao = db.collection("leiloes");

  await colecao.deleteMany({});
  await colecao.insertMany(leiloesIniciais);

  console.log(`${leiloesIniciais.length} leilões inseridos com sucesso.`);
  await client.close();
}

seed().catch((err) => {
  console.error("Erro ao popular o banco:", err);
  process.exit(1);
});