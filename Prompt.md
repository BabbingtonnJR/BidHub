# Prompt.md

Ferramenta de IA generativa utilizada: **Claude (Anthropic)**.

## Prompt utilizado para gerar o frontend

> Tenho um documento de arquitetura (arc42) do sistema BidHub, uma plataforma de
> leilões ao vivo com vendedores verificados, leilões transmitidos ao vivo e
> lances em tempo real. Preciso de duas telas simples de frontend para um
> trabalho de PJBL:
> 1. Catálogo de leilões: lista os leilões (ao vivo, agendados e encerrados),
>    consumindo um endpoint GET de uma Azure Function (com dados mock).
> 2. Tela de leilão ao vivo: mostra o lote em destaque, o lance atual, permite
>    simular um novo lance e exibe o histórico de lances.
>
> Gere o frontend em HTML/CSS/JS puro (sem necessidade de build), pronto para
> publicar no Azure Static Web Apps, com uma identidade visual que remeta a uma
> casa de leilões (não um template genérico de SaaS), e com o fetch já
> estruturado para trocar facilmente entre o JSON mock local e a URL real da
> Azure Function.

## Uso da IA para a integração com a Azure Function

Depois de gerar o frontend, a IA também foi usada para:

- Definir a estrutura recomendada do repositório, com a Azure Function dentro
  de uma pasta `api/` (padrão de integração do Azure Static Web Apps).
- Gerar o conteúdo do endpoint `GET /api/leiloes` (`api/src/functions/leiloes.js`),
  retornando os mesmos dados mock usados no frontend.
- Diagnosticar e resolver problemas de instalação do Azure Functions Core Tools
  no Windows (conflito entre uma instalação via npm e a instalação via winget).
- Orientar o passo a passo de teste local com o Static Web Apps CLI
  (`swa start . --api-location api`), simulando o comportamento de produção.

## Ajustes feitos manualmente após a geração

- Troca do endpoint em `js/app.js`: em vez de uma URL externa configurável
  (`AZURE_FUNCTION_BASE_URL`), o frontend passou a chamar o caminho relativo
  `/api/leiloes`, já que a Function foi integrada ao mesmo Static Web App.
- Ajuste do `.gitignore` da pasta `api/` para não versionar `local.settings.json`
  nem `node_modules`.
- Revisão dos textos e nomes de vendedores para refletir os integrantes do grupo.
- Testes manuais das duas telas (catálogo e leilão ao vivo) via DevTools, para
  confirmar que os dados vêm da Azure Function e não de um arquivo local.

## Observação
