# Backend do BidHub — Vertical Slice + Clean Architecture

Nessa branch a gente reorganizou a pasta `api/`. As rotas continuam as mesmas
(`GET/POST /api/leiloes`, `PUT/DELETE /api/leiloes/{id}`), então o front não mudou nada.

## Como ficou

```
api/src/
├── index.js                 registra as rotas
├── features/                uma pasta por funcionalidade
│   ├── listar-leiloes/
│   ├── criar-leilao/
│   ├── atualizar-leilao/
│   └── excluir-leilao/
├── domain/                  Leilao, StatusLeilao, ILeilaoRepository e os erros
├── infrastructure/          Mongo, repositório em memória e o tratamento de erros http
└── composition/container.js monta os casos de uso com o repositório
```

Antes cada function fazia tudo: validava, calculava o lance mínimo e falava direto com o Mongo.
Agora cada pasta de `features` tem a rota e o caso de uso dela, as regras ficaram na classe
`Leilao` e o acesso ao banco ficou no `MongoLeilaoRepository`.

**Vertical Slice:** pra mexer em "criar leilão" a gente só abre `features/criar-leilao`.
Funcionalidade nova = pasta nova.

**Clean Architecture:** o `domain` não importa nada de Mongo nem de Azure. Os casos de uso
recebem um repositório e não sabem qual banco está por trás.

**SOLID:**
- **S** — cada classe faz uma coisa (conexão, repositório, caso de uso, tratamento http).
- **O** — pra criar um erro novo é só dar um `tipo` pra ele e colocar o status na tabela do `httpHandler`.
- **L** — o repositório em memória substitui o do Mongo nos testes sem mudar nada nos casos de uso.
- **I** — os casos de uso só recebem o repositório, não recebem `request` nem conexão.
- **D** — os casos de uso dependem do `ILeilaoRepository`; quem escolhe o Mongo é o `container.js`.

Mudanças pequenas de comportamento: a resposta não manda mais o `_id` do Mongo e JSON inválido
volta 400 (antes dava 500).

Testes: `cd api && npm test` (13 testes).

## Diagrama de classes

![Diagrama de classes](diagramas/classes.png)

```mermaid
classDiagram
  direction LR

  namespace Feature_listar_leiloes {
    class ListarLeiloesUseCase {
      -leilaoRepository: ILeilaoRepository
      +executar() Promise~object[]~
    }
    class listarLeiloes_function {
      <<Azure Function GET /api/leiloes>>
      +handler(request, context)
    }
  }
  namespace Feature_criar_leilao {
    class CriarLeilaoUseCase {
      -leilaoRepository: ILeilaoRepository
      +executar(dados) Promise~object~
    }
    class criarLeilao_function {
      <<Azure Function POST /api/leiloes>>
      +handler(request, context)
    }
  }
  namespace Feature_atualizar_leilao {
    class AtualizarLeilaoUseCase {
      -leilaoRepository: ILeilaoRepository
      +executar(id, lanceAtual_status) Promise~object~
    }
    class atualizarLeilao_function {
      <<Azure Function PUT /api/leiloes/id>>
      +handler(request, context)
    }
  }
  namespace Feature_excluir_leilao {
    class ExcluirLeilaoUseCase {
      -leilaoRepository: ILeilaoRepository
      +executar(id) Promise~object~
    }
    class excluirLeilao_function {
      <<Azure Function DELETE /api/leiloes/id>>
      +handler(request, context)
    }
  }

  namespace Domain {
    class Leilao {
      <<Entity>>
      +id: number
      +lote: string
      +titulo: string
      +categoria: string
      +vendedor: string
      +lanceInicial: number
      +lanceAtual: number
      +incrementoMinimo: number
      +status: StatusLeilao
      +espectadores: number
      +horario: string
      +imagem: string
      +criar(dados)$ Leilao
      +lanceMinimo() number
      +darLance(valor) void
      +alterarStatus(status) void
      +toJSON() object
    }
    class StatusLeilao {
      <<enumeration>>
      AO_VIVO
      AGENDADO
      ENCERRADO
    }
    class ILeilaoRepository {
      <<interface>>
      +listar() Promise~Leilao[]~
      +buscarPorId(id) Promise~Leilao~
      +proximoId() Promise~number~
      +adicionar(leilao) Promise~void~
      +atualizar(leilao) Promise~void~
      +remover(id) Promise~boolean~
    }
    class DomainError {
      +tipo: string
    }
    class ValidacaoError
    class RegraDeNegocioError
    class NaoEncontradoError
  }

  namespace Infrastructure {
    class MongoConnection {
      -uri: string
      -dbName: string
      +getDb() Promise~Db~
    }
    class MongoLeilaoRepository {
      -connection: MongoConnection
      +paraEntidade(doc)$ Leilao
    }
    class InMemoryLeilaoRepository {
      -itens: Map
    }
    class httpHandler {
      <<module>>
      +comTratamentoDeErros(msg, handler)
      +lerId(request) number
      +lerCorpoJson(request) object
    }
  }

  namespace Composition {
    class container {
      <<Composition Root>>
      +criarContainer(opcoes)
      +listarLeiloes() ListarLeiloesUseCase
      +criarLeilao() CriarLeilaoUseCase
      +atualizarLeilao() AtualizarLeilaoUseCase
      +excluirLeilao() ExcluirLeilaoUseCase
    }
  }

  DomainError <|-- ValidacaoError
  DomainError <|-- RegraDeNegocioError
  DomainError <|-- NaoEncontradoError
  Leilao --> StatusLeilao
  Leilao ..> RegraDeNegocioError : lança

  ILeilaoRepository <|.. MongoLeilaoRepository : implementa
  ILeilaoRepository <|.. InMemoryLeilaoRepository : implementa
  MongoLeilaoRepository --> MongoConnection
  MongoLeilaoRepository ..> Leilao : mapeia
  InMemoryLeilaoRepository ..> Leilao : mapeia

  ListarLeiloesUseCase --> ILeilaoRepository
  CriarLeilaoUseCase --> ILeilaoRepository
  AtualizarLeilaoUseCase --> ILeilaoRepository
  ExcluirLeilaoUseCase --> ILeilaoRepository
  CriarLeilaoUseCase ..> Leilao : cria
  AtualizarLeilaoUseCase ..> Leilao : darLance / alterarStatus

  listarLeiloes_function ..> container
  criarLeilao_function ..> container
  atualizarLeilao_function ..> container
  excluirLeilao_function ..> container
  listarLeiloes_function ..> httpHandler
  criarLeilao_function ..> httpHandler
  atualizarLeilao_function ..> httpHandler
  excluirLeilao_function ..> httpHandler

  container ..> MongoLeilaoRepository : instancia
  container ..> ListarLeiloesUseCase : injeta repositório
  container ..> CriarLeilaoUseCase : injeta repositório
  container ..> AtualizarLeilaoUseCase : injeta repositório
  container ..> ExcluirLeilaoUseCase : injeta repositório
```

## Diagrama de componentes

![Diagrama de componentes](diagramas/componentes.png)

```mermaid
flowchart TB
  FE["Frontend estático<br/>index.html · js/app.js"]
  DB[("MongoDB Atlas<br/>db bidhub<br/>coleção leiloes")]

  subgraph API["api/ · Azure Functions v4 (Azure Static Web Apps)"]
    direction TB
    IDX["src/index.js<br/>registra as fatias"]

    subgraph FEAT["src/features — Vertical Slices"]
      direction LR
      subgraph S1["listar-leiloes"]
        direction LR
        F1["listarLeiloes.function<br/>GET /api/leiloes"] --> U1["ListarLeiloesUseCase"]
      end
      subgraph S2["criar-leilao"]
        direction LR
        F2["criarLeilao.function<br/>POST /api/leiloes"] --> U2["CriarLeilaoUseCase"]
      end
      subgraph S3["atualizar-leilao"]
        direction LR
        F3["atualizarLeilao.function<br/>PUT /api/leiloes/{id}"] --> U3["AtualizarLeilaoUseCase"]
      end
      subgraph S4["excluir-leilao"]
        direction LR
        F4["excluirLeilao.function<br/>DELETE /api/leiloes/{id}"] --> U4["ExcluirLeilaoUseCase"]
      end
    end

    CT["src/composition/container<br/>Composition Root (DI)"]

    subgraph DOM["src/domain — núcleo (sem dependências externas)"]
      direction TB
      ENT["Leilao · StatusLeilao"]
      PORT(["«porta» ILeilaoRepository"])
      ERR["DomainError<br/>Validacao · RegraDeNegocio · NaoEncontrado"]
    end

    subgraph INF["src/infrastructure — adaptadores"]
      direction TB
      HTTP["http/httpHandler<br/>erro de domínio → status HTTP"]
      MREPO["persistence/MongoLeilaoRepository"]
      MCONN["persistence/MongoConnection"]
      IMREPO["persistence/InMemoryLeilaoRepository<br/>(testes)"]
    end
  end

  FE == "HTTPS / JSON" ==> FEAT
  IDX --> FEAT
  FEAT -- "depende de" --> DOM
  FEAT -. "usa adaptador HTTP" .-> HTTP
  FEAT -. "obtém casos de uso" .-> CT
  CT -. "injeta" .-> MREPO
  MREPO -. "implementa" .-> PORT
  IMREPO -. "implementa" .-> PORT
  HTTP -. "traduz" .-> ERR
  MREPO --> MCONN --> DB
```
