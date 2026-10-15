/**
 * Slice: Dar lance — camada de apresentação (rota Express).
 * POST /bff/leiloes/:id/lances   body: { "valor": 4400 }
 */
import { Router } from "express";

/** @param {{ darLanceUseCase: import("./DarLanceUseCase.js").DarLanceUseCase }} deps */
export function rotasDarLance({ darLanceUseCase }) {
  const router = Router();
  router.post("/bff/leiloes/:id/lances", async (req, res, next) => {
    try {
      res.status(201).json(await darLanceUseCase.executar(req.params.id, req.body?.valor));
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
