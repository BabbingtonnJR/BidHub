# BidHub — BFF (Backend for Frontend)

BFF em Node.js/Express que atende as duas telas do frontend (catálogo e leilão ao vivo),
agregando e validando dados do **microsserviço de leilões** (`../api`, Azure Functions).

## Arquitetura: Vertical Slice + Clean Architecture

```
src/
├── domain/                      # núcleo: regras e portas (sem Express, sem HTTP)
│   ├── erros/ErrosDeDominio.js
│   └── leilao/
│       ├── Leilao.js            # lanceMinimo, aceitaLances, validarLance()
│       ├── LeiloesGateway.js    # PORTA para o microsserviço
│       └── buscarLeilao.js
├── features/                    # VERTICAL SLICES (uma pasta por funcionalidade)
│   ├── catalogo/                # GET  /bff/catalogo
│   │   ├── CatalogoUseCase.js   #   aplicação
│   │   └── catalogo.routes.js   #   apresentação
│   ├── leilao-ao-vivo/          # GET  /bff/leiloes/:id
│   └── dar-lance/               # POST /bff/leiloes/:id/lances
├── infrastructure/http/
│   └── HttpLeiloesGateway.js    # ADAPTADOR: implementa a porta via fetch
├── shared/http/tratarErros.js   # middleware: erro de domínio -> status HTTP
└── main/                        # composition root
    ├── app.js                   # cria gateway, injeta nos use cases, monta rotas
    └── server.js
```

Regra de dependência: `main → features/infrastructure → domain`. O domínio não conhece
ninguém; casos de uso só conhecem o domínio; rotas recebem o caso de uso por injeção.

## Rodando

```bash
cp .env.example .env     # ajuste LEILOES_SERVICE_URL
npm install
npm start                # http://localhost:3001
```

## Testes

```bash
npm test          # tudo
npm run test:arch # testes de arquitetura (ArchUnitTS)
npm run test:unit # casos de uso, gateway e rotas
```
