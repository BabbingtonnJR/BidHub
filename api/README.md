# BidHub — Microsserviço de Leilões (Azure Functions + MongoDB)

CRUD de leilões exposto como Azure Functions HTTP (modelo v4, ESM), publicado junto
com o Static Web App em `/api/leiloes`.

## Arquitetura: Vertical Slice + Clean Architecture

```
src/
├── domain/                          # núcleo: entidades, regras e portas
│   ├── erros/ErrosDeDominio.js
│   └── leilao/
│       ├── Leilao.js                # criar(), darLance(), alterarStatus()
│       ├── LeilaoRepository.js      # PORTA de persistência
│       ├── StatusLeilao.js
│       └── idLeilao.js
├── features/                        # VERTICAL SLICES
│   ├── buscar-leiloes/              # GET    /api/leiloes
│   │   ├── BuscarLeiloesUseCase.js  #   aplicação
│   │   └── buscarLeiloes.function.js#   apresentação (Azure Function)
│   ├── criar-leilao/                # POST   /api/leiloes
│   ├── atualizar-leilao/            # PUT    /api/leiloes/{id}
│   └── excluir-leilao/              # DELETE /api/leiloes/{id}
├── infrastructure/mongo/
│   ├── mongoClient.js
│   └── MongoLeilaoRepository.js     # ADAPTADOR: implementa a porta com MongoDB
├── shared/http/respostaHttp.js      # erro de domínio -> status HTTP
└── main/container.js                # composition root
```

O `package.json` aponta `main` para `src/features/*/*.function.js`, então o host do
Azure Functions registra automaticamente cada slice.

## Rodando

```bash
npm install
func start         # ou: swa start .. --api-location api (na raiz)
```

## Testes

```bash
npm test           # tudo
npm run test:arch  # testes de arquitetura (ArchUnitTS)
npm run test:unit  # casos de uso com repositório em memória
```
