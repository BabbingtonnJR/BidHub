/**
 * Testes unitários do BFF: casos de uso com gateway falso, adaptador HTTP com
 * fetch falso e rotas Express com supertest (sem subir o microsserviço).
 */
import request from "supertest";
import { Leilao } from "../../src/domain/leilao/Leilao.js";
import { LeiloesGateway } from "../../src/domain/leilao/LeiloesGateway.js";
import { ErroDeRegraDeNegocio } from "../../src/domain/erros/ErrosDeDominio.js";
import { CatalogoUseCase } from "../../src/features/catalogo/CatalogoUseCase.js";
import { DarLanceUseCase } from "../../src/features/dar-lance/DarLanceUseCase.js";
import { HttpLeiloesGateway } from "../../src/infrastructure/http/HttpLeiloesGateway.js";
import { criarApp } from "../../src/main/app.js";

const DADOS = [
  { id: 1, lote: "001", titulo: "Óleo sobre tela", status: "ao-vivo", lanceAtual: 34500, incrementoMinimo: 1000, espectadores: 214 },
  { id: 2, lote: "002", titulo: "Porsche 911", status: "agendado", lanceAtual: 220000, incrementoMinimo: 5000, espectadores: 0 },
  { id: 3, lote: "003", titulo: "Cobertura duplex", status: "encerrado", lanceAtual: 1120000, incrementoMinimo: 10000, espectadores: 0 },
];

class GatewayFalso extends LeiloesGateway {
  constructor() {
    super();
    this.dados = DADOS.map((d) => ({ ...d }));
    this.lances = [];
  }
  async listar() {
    return this.dados.map((d) => new Leilao(d));
  }
  async registrarLance(id, valor) {
    this.lances.push({ id, valor });
    const d = this.dados.find((x) => x.id === id);
    d.lanceAtual = valor;
    return new Leilao(d);
  }
}

describe("CatalogoUseCase", () => {
  it("separa leilões por status e calcula o lance mínimo", async () => {
    const catalogo = await new CatalogoUseCase(new GatewayFalso()).executar();
    expect(catalogo.totais).toEqual({ aoVivo: 1, agendados: 1, encerrados: 1 });
    expect(catalogo.aoVivo[0].lanceMinimo).toBe(35500);
  });
});

describe("DarLanceUseCase", () => {
  it("envia o lance ao microsserviço quando é válido", async () => {
    const gateway = new GatewayFalso();
    const resultado = await new DarLanceUseCase(gateway).executar("1", 35500);
    expect(gateway.lances).toEqual([{ id: 1, valor: 35500 }]);
    expect(resultado.proximoLanceMinimo).toBe(36500);
  });

  it("barra no BFF lance abaixo do mínimo, sem chamar o microsserviço", async () => {
    const gateway = new GatewayFalso();
    await expect(new DarLanceUseCase(gateway).executar("1", 35000)).rejects.toBeInstanceOf(ErroDeRegraDeNegocio);
    expect(gateway.lances).toHaveLength(0);
  });

  it("barra lance em leilão que não está ao vivo", async () => {
    await expect(new DarLanceUseCase(new GatewayFalso()).executar("2", 999999)).rejects.toBeInstanceOf(
      ErroDeRegraDeNegocio
    );
  });
});

describe("HttpLeiloesGateway", () => {
  it("chama GET /leiloes no microsserviço e devolve entidades de domínio", async () => {
    const chamadas = [];
    const fetchFalso = async (url) => {
      chamadas.push(url);
      return { ok: true, status: 200, json: async () => DADOS };
    };
    const leiloes = await new HttpLeiloesGateway("http://servico/api/", fetchFalso).listar();
    expect(chamadas).toEqual(["http://servico/api/leiloes"]);
    expect(leiloes[0]).toBeInstanceOf(Leilao);
  });
});

describe("Rotas do BFF (Express)", () => {
  const app = () => criarApp({ leiloesGateway: new GatewayFalso() });

  it("GET /bff/catalogo → 200", async () => {
    const res = await request(app()).get("/bff/catalogo");
    expect(res.status).toBe(200);
    expect(res.body.totais.aoVivo).toBe(1);
  });

  it("GET /bff/leiloes/99 → 404", async () => {
    const res = await request(app()).get("/bff/leiloes/99");
    expect(res.status).toBe(404);
  });

  it("POST /bff/leiloes/1/lances com lance baixo → 422", async () => {
    const res = await request(app()).post("/bff/leiloes/1/lances").send({ valor: 100 });
    expect(res.status).toBe(422);
  });

  it("POST /bff/leiloes/1/lances com lance válido → 201", async () => {
    const res = await request(app()).post("/bff/leiloes/1/lances").send({ valor: 36000 });
    expect(res.status).toBe(201);
    expect(res.body.lanceAtual).toBe(36000);
  });
});
