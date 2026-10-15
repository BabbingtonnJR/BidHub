/**
 * Slice: Catálogo — camada de apresentação (rota Express).
 * GET /bff/catalogo
 */
import { Router } from "express";

/** @param {{ catalogoUseCase: import("./CatalogoUseCase.js").CatalogoUseCase }} deps */
export function rotasCatalogo({ catalogoUseCase }) {
  const router = Router();
  router.get("/bff/catalogo", async (_req, res, next) => {
    try {
      res.json(await catalogoUseCase.executar());
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
