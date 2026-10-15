/**
 * Composition root do BFF: único lugar que conhece todas as peças.
 * Cria o gateway concreto, injeta nos casos de uso e monta as rotas de cada slice.
 */
import express from "express";
import { CatalogoUseCase } from "../features/catalogo/CatalogoUseCase.js";
import { rotasCatalogo } from "../features/catalogo/catalogo.routes.js";
import { DarLanceUseCase } from "../features/dar-lance/DarLanceUseCase.js";
import { rotasDarLance } from "../features/dar-lance/darLance.routes.js";
import { LeilaoAoVivoUseCase } from "../features/leilao-ao-vivo/LeilaoAoVivoUseCase.js";
import { rotasLeilaoAoVivo } from "../features/leilao-ao-vivo/leilaoAoVivo.routes.js";
import { HttpLeiloesGateway } from "../infrastructure/http/HttpLeiloesGateway.js";
import { tratarErros } from "../shared/http/tratarErros.js";

/**
 * @param {{ leiloesGateway?: import("../domain/leilao/LeiloesGateway.js").LeiloesGateway }} [deps]
 */
export function criarApp(deps = {}) {
  const leiloesGateway =
    deps.leiloesGateway ??
    new HttpLeiloesGateway(process.env.LEILOES_SERVICE_URL ?? "http://localhost:7071/api");

  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use(rotasCatalogo({ catalogoUseCase: new CatalogoUseCase(leiloesGateway) }));
  app.use(rotasLeilaoAoVivo({ leilaoAoVivoUseCase: new LeilaoAoVivoUseCase(leiloesGateway) }));
  app.use(rotasDarLance({ darLanceUseCase: new DarLanceUseCase(leiloesGateway) }));

  app.use(tratarErros);
  return app;
}
