const { MongoClient, ServerApiVersion } = require("mongodb");

// reaproveita a mesma conexão entre as execuções da function
class MongoConnection {
  constructor({ uri, dbName = "bidhub" }) {
    this.uri = uri;
    this.dbName = dbName;
    this.dbPromise = null;
  }

  async getDb() {
    if (!this.uri) {
      throw new Error("MONGODB_URI não configurada (local.settings.json ou Application Settings do Azure).");
    }
    if (!this.dbPromise) {
      const client = new MongoClient(this.uri, {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
      });
      this.dbPromise = client
        .connect()
        .then(() => client.db(this.dbName))
        .catch((err) => {
          this.dbPromise = null; // se falhar, tenta de novo na próxima requisição
          throw err;
        });
    }
    return this.dbPromise;
  }
}

module.exports = { MongoConnection };
