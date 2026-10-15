/**
 * Testes unitários de ARQUITETURA do BFF (ArchUnitTS).
 *
 * Camadas (Clean Architecture), de dentro para fora:
 *   domain               -> modelo de leitura, regras, porta LeiloesGateway
 *   features/*UseCase.js -> casos de uso (aplicação), um por slice
 *   features/*.routes.js + shared/http -> apresentação (Express)
 *   infrastructure       -> adaptador HTTP para o microsserviço de leilões
 *   main                 -> composition root (monta app e injeta dependências)
 *
 * Vertical Slice: cada pasta em src/features é uma fatia independente
 * (catalogo, leilao-ao-vivo, dar-lance).
 */
import fs from "node:fs";
import { projectFiles } from "archunit";

const SLICES = fs
  .readdirSync(new URL("../../src/features", import.meta.url), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const naoImportaFrameworks = (file) => !/from\s+["'](express|node-fetch|axios|supertest)["']/.test(file.content);

describe("Clean Architecture", () => {
  for (const camadaExterna of ["src/features/**", "src/infrastructure/**", "src/shared/**", "src/main/**"]) {
    it(`domain não depende de ${camadaExterna}`, async () => {
      const regra = projectFiles().inFolder("src/domain/**").shouldNot().dependOnFiles().inFolder(camadaExterna);
      await expect(regra).toPassAsync();
    });
  }

  it("domain não importa frameworks (Express, clientes HTTP)", async () => {
    const regra = projectFiles()
      .inFolder("src/domain/**")
      .should()
      .adhereTo(naoImportaFrameworks, "domain deve ser independente de frameworks");
    await expect(regra).toPassAsync();
  });

  for (const camadaExterna of ["src/infrastructure/**", "src/shared/**", "src/main/**"]) {
    it(`casos de uso não dependem de ${camadaExterna}`, async () => {
      const regra = projectFiles()
        .inFolder("src/features/**")
        .withName("*UseCase.js")
        .shouldNot()
        .dependOnFiles()
        .inFolder(camadaExterna);
      await expect(regra).toPassAsync();
    });
  }

  it("casos de uso não dependem das rotas (apresentação)", async () => {
    const regra = projectFiles()
      .inFolder("src/features/**")
      .withName("*UseCase.js")
      .shouldNot()
      .dependOnFiles()
      .withName("*.routes.js");
    await expect(regra).toPassAsync();
  });

  it("casos de uso não importam frameworks (Express, clientes HTTP)", async () => {
    const regra = projectFiles()
      .inFolder("src/features/**")
      .withName("*UseCase.js")
      .should()
      .adhereTo(naoImportaFrameworks, "caso de uso deve ser independente de frameworks");
    await expect(regra).toPassAsync();
  });

  it("rotas (apresentação) não acessam a infraestrutura diretamente", async () => {
    const regra = projectFiles()
      .inFolder("src/features/**")
      .withName("*.routes.js")
      .shouldNot()
      .dependOnFiles()
      .inFolder("src/infrastructure/**");
    await expect(regra).toPassAsync();
  });

  it("features não dependem do composition root (dependências são injetadas)", async () => {
    const regra = projectFiles().inFolder("src/features/**").shouldNot().dependOnFiles().inFolder("src/main/**");
    await expect(regra).toPassAsync();
  });

  it("infrastructure não depende de features nem da apresentação", async () => {
    await expect(
      projectFiles().inFolder("src/infrastructure/**").shouldNot().dependOnFiles().inFolder("src/features/**")
    ).toPassAsync();
    await expect(
      projectFiles().inFolder("src/infrastructure/**").shouldNot().dependOnFiles().inFolder("src/shared/**")
    ).toPassAsync();
  });
});

describe("Vertical Slice", () => {
  it("existem slices para analisar", () => {
    expect(SLICES.length).toBeGreaterThanOrEqual(3);
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
  it("rotas (*.routes.js) só existem dentro de um slice em src/features", async () => {
    const regra = projectFiles().withName("*.routes.js").should().beInFolder("src/features/**");
    await expect(regra).toPassAsync();
  });

  it("casos de uso (*UseCase.js) só existem dentro de um slice em src/features", async () => {
    const regra = projectFiles().withName("*UseCase.js").should().beInFolder("src/features/**");
    await expect(regra).toPassAsync();
  });

  it("adaptadores de gateway (*Gateway.js) concretos ficam em infrastructure; a porta fica em domain", async () => {
    const regra = projectFiles().withName("Http*Gateway.js").should().beInFolder("src/infrastructure/**");
    await expect(regra).toPassAsync();
  });

  it("não há dependências cíclicas no código-fonte", async () => {
    const regra = projectFiles().inFolder("src/**").should().haveNoCycles();
    await expect(regra).toPassAsync();
  });
});
