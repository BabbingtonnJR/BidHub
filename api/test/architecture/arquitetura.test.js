/**
 * Testes unitários de ARQUITETURA do microsserviço de leilões (ArchUnitTS).
 *
 * Camadas (Clean Architecture), de dentro para fora:
 *   domain          -> entidades, regras de negócio, portas (interfaces)
 *   features/*UseCase.js -> casos de uso (aplicação), um por slice
 *   features/*.function.js + shared/http -> apresentação (Azure Functions HTTP)
 *   infrastructure  -> adaptadores (MongoDB)
 *   main            -> composition root (injeção de dependências)
 *
 * Vertical Slice: cada pasta em src/features é uma fatia independente
 * (buscar-leiloes, criar-leilao, atualizar-leilao, excluir-leilao).
 */
import fs from "node:fs";
import { projectFiles } from "archunit";

const SLICES = fs
  .readdirSync(new URL("../../src/features", import.meta.url), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const naoImportaFrameworks = (file) =>
  !/from\s+["'](mongodb|@azure\/functions|express)["']/.test(file.content);

describe("Clean Architecture", () => {
  it("domain não depende de features (aplicação/apresentação)", async () => {
    const regra = projectFiles().inFolder("src/domain/**").shouldNot().dependOnFiles().inFolder("src/features/**");
    await expect(regra).toPassAsync();
  });

  it("domain não depende de infrastructure", async () => {
    const regra = projectFiles().inFolder("src/domain/**").shouldNot().dependOnFiles().inFolder("src/infrastructure/**");
    await expect(regra).toPassAsync();
  });

  it("domain não depende da camada HTTP compartilhada nem do composition root", async () => {
    await expect(
      projectFiles().inFolder("src/domain/**").shouldNot().dependOnFiles().inFolder("src/shared/**")
    ).toPassAsync();
    await expect(
      projectFiles().inFolder("src/domain/**").shouldNot().dependOnFiles().inFolder("src/main/**")
    ).toPassAsync();
  });

  it("domain não importa frameworks (MongoDB, Azure Functions, Express)", async () => {
    const regra = projectFiles()
      .inFolder("src/domain/**")
      .should()
      .adhereTo(naoImportaFrameworks, "domain deve ser independente de frameworks");
    await expect(regra).toPassAsync();
  });

  it("casos de uso não dependem de infrastructure", async () => {
    const regra = projectFiles()
      .inFolder("src/features/**")
      .withName("*UseCase.js")
      .shouldNot()
      .dependOnFiles()
      .inFolder("src/infrastructure/**");
    await expect(regra).toPassAsync();
  });

  it("casos de uso não dependem da apresentação (HTTP) nem do composition root", async () => {
    const casosDeUso = () => projectFiles().inFolder("src/features/**").withName("*UseCase.js");
    await expect(casosDeUso().shouldNot().dependOnFiles().inFolder("src/shared/http/**")).toPassAsync();
    await expect(casosDeUso().shouldNot().dependOnFiles().inFolder("src/main/**")).toPassAsync();
    await expect(casosDeUso().shouldNot().dependOnFiles().withName("*.function.js")).toPassAsync();
  });

  it("casos de uso não importam frameworks (MongoDB, Azure Functions, Express)", async () => {
    const regra = projectFiles()
      .inFolder("src/features/**")
      .withName("*UseCase.js")
      .should()
      .adhereTo(naoImportaFrameworks, "caso de uso deve ser independente de frameworks");
    await expect(regra).toPassAsync();
  });

  it("infrastructure não depende de features", async () => {
    const regra = projectFiles().inFolder("src/infrastructure/**").shouldNot().dependOnFiles().inFolder("src/features/**");
    await expect(regra).toPassAsync();
  });
});

describe("Vertical Slice", () => {
  it("existem slices para analisar", () => {
    expect(SLICES.length).toBeGreaterThanOrEqual(4);
  });

  for (const slice of SLICES) {
    for (const outra of SLICES.filter((s) => s !== slice)) {
      it(`slice "${slice}" não depende do slice "${outra}"`, async () => {
        const regra = projectFiles()
          .inFolder(`src/features/${slice}/**`)
          .shouldNot()
          .dependOnFiles()
          .inFolder(`src/features/${outra}/**`);
        await expect(regra).toPassAsync();
      });
    }
  }
});

describe("Convenções", () => {
  it("Azure Functions (*.function.js) só existem dentro de um slice em src/features", async () => {
    const regra = projectFiles().withName("*.function.js").should().beInFolder("src/features/**");
    await expect(regra).toPassAsync();
  });

  it("casos de uso (*UseCase.js) só existem dentro de um slice em src/features", async () => {
    const regra = projectFiles().withName("*UseCase.js").should().beInFolder("src/features/**");
    await expect(regra).toPassAsync();
  });

  it("não há dependências cíclicas no código-fonte", async () => {
    const regra = projectFiles().inFolder("src/**").should().haveNoCycles();
    await expect(regra).toPassAsync();
  });
});
