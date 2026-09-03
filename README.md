# BidHub — frontend (PJBL)

Frontend de demonstração do BidHub, plataforma de leilões ao vivo. Duas telas:

1. **Catálogo de leilões** (`view-catalogo`) — lista leilões ao vivo, agendados
   e encerrados. Consome um GET em uma Azure Function (dados mock).
2. **Leilão ao vivo** (`view-live`) — lote em destaque, lance atual, formulário
   de lance (simulado) e histórico de lances.

## Como rodar localmente

Basta servir a pasta como site estático, por exemplo:

```bash
npx serve .
# ou
python3 -m http.server 8080
```

Abra `http://localhost:8080`.

## Configurando o endpoint da Azure Function

Em `js/app.js`, defina a constante `AZURE_FUNCTION_BASE_URL` com a URL da sua
Function publicada (ex.: `https://bidhub-func.azurewebsites.net`). Enquanto
essa variável estiver vazia, o app usa o mock local em `data/leiloes.json`.

- **Site publicado (Azure Static Web Apps):** https://purple-pond-09f931c10.3.azurestaticapps.net
- **Azure Function (GET /api/leiloes):** https://purple-pond-09f931c10.3.azurestaticapps.net/api/leiloes
- **Mock no Apidog (se utilizado):** não utilizado — o GET obrigatório usa uma Azure Function real, integrada ao mesmo Static Web App
- **Repositório GitHub:** https://github.com/BabbingtonnJR/BidHub

## Estrutura

```
bidhub/
├── index.html
├── css/styles.css
├── js/app.js
├── data/leiloes.json   # mock local (fallback)
├── data/lances.json    # mock do histórico de lances
├── GRUPO.md
├── Prompt.md
└── README.md
```
