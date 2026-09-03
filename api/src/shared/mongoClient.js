const { MongoClient, ServerApiVersion } = require("mongodb");

let client;
let dbInstance;

async function getDb() {
  if (dbInstance) return dbInstance;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI não configurada (local.settings.json ou Application Settings do Azure).");
  }

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  await client.connect();
  dbInstance = client.db("bidhub");
  return dbInstance;
}

module.exports = { getDb };