/**
 * Composition root: único lugar que conhece as implementações concretas.
 * As Functions (camada de apresentação de cada slice) pedem as dependências aqui
 * e as injetam nos casos de uso.
 */
import { getDb } from "../infrastructure/mongo/mongoClient.js";
import { MongoLeilaoRepository } from "../infrastructure/mongo/MongoLeilaoRepository.js";

let repositorio;

export function leilaoRepository() {
  if (!repositorio) repositorio = new MongoLeilaoRepository(getDb);
  return repositorio;
}
