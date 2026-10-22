# Imagem do BidHub BFF (Node 22 + Express)
FROM node:22-alpine

WORKDIR /app

# Instala só as dependências de produção (aproveita o cache do Docker)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia o código-fonte
COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000
# Microsserviço de leilões publicado no Azure (pode ser trocado na hora de rodar)
ENV LEILOES_SERVICE_URL=https://purple-pond-09f931c10.3.azurestaticapps.net/api

EXPOSE 3000

# Roda como usuário sem privilégios (exigido pelo OpenShift)
USER node

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/main/server.js"]
