# Usar Alpine para ser o mais leve possível na OCI
FROM oven/bun:alpine as builder
WORKDIR /app

# Instalar dependências
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copiar o restante e buildar
COPY . .
RUN bun run build

# Stage de execução
FROM oven/bun:alpine
WORKDIR /app

# Copiar apenas o necessário do stage de build
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expõe a porta que o adapter-node usa por padrão (3000)
# Mas como o backend já usa a 3000, vamos configurar para outra porta no compose
EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Comando para rodar a aplicação
CMD ["bun", "./build/index.js"]
