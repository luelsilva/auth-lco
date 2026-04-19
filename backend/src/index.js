import config from './config.js';
import { handleAuthRoutes } from './modules/auth/auth.routes.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const getCorsHeaders = (req) => {
    // Agora usando estritamente o que estiver no config.corsOrigin
    const allowedOrigin = config.corsOrigin;

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    };
};

function withCors(res, req) {
    const corsHeaders = getCorsHeaders(req);
    const headers = new Headers(res.headers);
    for (const [key, value] of Object.entries(corsHeaders)) {
        headers.set(key, value);
    }
    return new Response(res.body, { status: res.status, headers });
}

// Carrega o spec uma vez na inicialização
const openapiSpec = readFileSync(resolve(import.meta.dir, '../openapi.json'), 'utf-8');

const SWAGGER_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>LCO Auth API – Documentação</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/openapi.json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
      deepLinking: true,
    });
  </script>
</body>
</html>`;

Bun.serve({
    port: config.port,

    async fetch(req) {
        const { pathname } = new URL(req.url);

        // Log de requisição para debug de CORS/Conexão
        const origin = req.headers.get('Origin');
        console.log(`[${new Date().toISOString()}] ${req.method} ${pathname} - Origin: ${origin || 'N/A'}`);

        // Preflight CORS
        if (req.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: getCorsHeaders(req) });
        }

        let res;

        if (pathname === '/') {
            res = Response.json({ message: 'LCO Auth API voando com Bun! 🚀' });
        } else if (pathname === '/openapi.json') {
            res = new Response(openapiSpec, { headers: { 'Content-Type': 'application/json' } });
        } else if (pathname === '/docs' || pathname === '/docs/') {
            res = new Response(SWAGGER_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        } else if (pathname.startsWith('/api/auth')) {
            res = await handleAuthRoutes(req, pathname);
        } else {
            res = Response.json({ error: 'Rota não encontrada' }, { status: 404 });
        }

        return withCors(res, req);
    },

    error(err) {
        console.error('Erro no servidor:', err);
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    },
});

console.log(`🚀 Servidor rodando em: http://localhost:${config.port}`);
console.log(`📄 Documentação:        http://localhost:${config.port}/docs`);
console.log(`🌐 CORS permitido para: ${config.corsOrigin}`);
