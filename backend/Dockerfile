# Usar Alpine para ser o mais leve possível na OCI
FROM oven/bun:alpine as base
WORKDIR /app

# Instalar dependências primeiro para aproveitar o cache das camadas do Docker
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copiar o restante dos arquivos (respeitando o .dockerignore)
COPY . .

# Expõe a porta que configuramos no config.js (default 3000)
EXPOSE 3000

# Variáveis de ambiente de produção
ENV NODE_ENV=production

# Comando para rodar a aplicação
CMD ["bun", "src/index.js"]
