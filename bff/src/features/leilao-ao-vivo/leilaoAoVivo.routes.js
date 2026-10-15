/**
 * Slice: Leilão ao vivo — camada de apresentação (rota Express).
 * GET /bff/leiloes/:id
 */
import { Router } from "express";

/** @param {{ leilaoAoVivoUseCase: import("./LeilaoAoVivoUseCase.js").LeilaoAoVivoUseCase }} deps */
export function rotasLeilaoAoVivo({ leilaoAoVivoUseCase }) {
  const router = Router();
  router.get("/bff/leiloes/:id", async (req, res, next) => {
    try {
      res.json(await leilaoAoVivoUseCase.executar(req.params.id));
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
