import "dotenv/config";
import { criarApp } from "./app.js";

const porta = Number(process.env.PORT ?? 3001);

criarApp().listen(porta, () => {
  console.log(`BidHub BFF ouvindo em http://localhost:${porta}`);
  console.log(`Microsserviço de leilões: ${process.env.LEILOES_SERVICE_URL ?? "http://localhost:7071/api"}`);
});
