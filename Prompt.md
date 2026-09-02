# Prompt.md

Ferramenta de IA generativa utilizada: **Claude (Anthropic)**.

## Prompt utilizado

> Tenho um documento de arquitetura (arc42) do sistema BidHub, uma plataforma de
> leilões ao vivo com vendedores verificados, leilões transmitidos ao vivo e
> lances em tempo real. Preciso de duas telas simples de frontend para um
> trabalho de PJBL:
> 1. Catálogo de leilões — lista os leilões (ao vivo, agendados e encerrados),
>    consumindo um endpoint GET de uma Azure Function (com dados mock).
> 2. Tela de leilão ao vivo — mostra o lote em destaque, o lance atual, permite
>    simular um novo lance e exibe o histórico de lances.
>
> Gere o frontend em HTML/CSS/JS puro (sem necessidade de build), pronto para
> publicar no Azure Static Web Apps, com uma identidade visual que remeta a uma
> casa de leilões (não um template genérico de SaaS), e com o fetch já
> estruturado para trocar facilmente entre o JSON mock local e a URL real da
> Azure Function.

## Ajustes feitos manualmente após a geração

- Ajuste da URL do endpoint (`AZURE_FUNCTION_BASE_URL` em `js/app.js`) para
  apontar para a Function/mock real do grupo.
- Revisão dos textos e nomes de vendedores para refletir os integrantes do grupo.
- Testes de responsividade e ajuste fino de cores.

## Observação

Documentar aqui qualquer prompt adicional utilizado por outros integrantes do
grupo (ex.: para gerar a Azure Function, os mocks no Apidog, ou o pipeline de
deploy).
