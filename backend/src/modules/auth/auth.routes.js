import { authController } from './auth.controller.js';
import jwt from 'jsonwebtoken';
import config from '../../config.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function isValidEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isString(value, minLength = 0) {
    return typeof value === 'string' && value.length >= minLength;
}

function badRequest(message) {
    return Response.json({ error: message }, { status: 400 });
}

async function parseBody(req) {
    try {
        return await req.json();
    } catch {
        return null;
    }
}

// ── Auth Middleware ────────────────────────────────────────────────────────

function extractUser(req) {
    const auth = req.headers.get('authorization') ?? '';
    if (!auth.startsWith('Bearer ')) {
        return { error: Response.json({ error: 'Não autorizado' }, { status: 401 }) };
    }
    const token = auth.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        return { user: decoded };
    } catch {
        return { error: Response.json({ error: 'Token inválido ou expirado' }, { status: 401 }) };
    }
}

// ── Context da Requisição ─────────────────────────────────────────────────
// Extraído de cada request e repassado até o service para fins de log.
// O cliente deve enviar o header X-App-ID identificando qual app está chamando a API.

function extractReqCtx(req) {
    return {
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0].trim()
                ?? req.headers.get('x-real-ip')
                ?? null,
        userAgent: req.headers.get('user-agent') ?? null,
    };
}

// ── Router ─────────────────────────────────────────────────────────────────

export async function handleAuthRoutes(req, fullPath) {
    const path = fullPath.replace('/api/auth', '') || '/';
    const method = req.method;
    const reqCtx = extractReqCtx(req);

    // POST /register
    if (method === 'POST' && path === '/register') {
        const body = await parseBody(req);
        if (!body) return badRequest('Body inválido');
        if (!isValidEmail(body.email)) return badRequest('E-mail inválido');
        if (!isString(body.password, 8)) return badRequest('A senha deve ter ao menos 8 caracteres');
        if (!isString(body.full_name, 5)) return badRequest('O nome deve ter ao menos 5 caracteres');
        return authController.register(body, reqCtx);
    }

    // POST /login
    if (method === 'POST' && path === '/login') {
        const body = await parseBody(req);
        if (!body) return badRequest('Body inválido');
        if (!isValidEmail(body.email)) return badRequest('E-mail inválido');
        if (!isString(body.password, 1)) return badRequest('Senha obrigatória');
        return authController.login(body, reqCtx);
    }

    // POST /verify-otp
    if (method === 'POST' && path === '/verify-otp') {
        const body = await parseBody(req);
        if (!body) return badRequest('Body inválido');
        if (!isValidEmail(body.email)) return badRequest('E-mail inválido');
        if (!isString(body.code, 6) || body.code.length > 6) return badRequest('Código deve ter 6 caracteres');
        return authController.verifyOtp(body, reqCtx);
    }

    // POST /resend-otp
    if (method === 'POST' && path === '/resend-otp') {
        const body = await parseBody(req);
        if (!body) return badRequest('Body inválido');
        if (!isValidEmail(body.email)) return badRequest('E-mail inválido');
        return authController.resendOtp(body, reqCtx);
    }

    // POST /forgot-password
    if (method === 'POST' && path === '/forgot-password') {
        const body = await parseBody(req);
        if (!body) return badRequest('Body inválido');
        if (!isValidEmail(body.email)) return badRequest('E-mail inválido');
        return authController.forgotPassword(body, reqCtx);
    }

    // POST /reset-password
    if (method === 'POST' && path === '/reset-password') {
        const body = await parseBody(req);
        if (!body) return badRequest('Body inválido');
        if (!isValidEmail(body.email)) return badRequest('E-mail inválido');
        if (!isString(body.code, 6) || body.code.length > 6) return badRequest('Código deve ter 6 caracteres');
        if (!isString(body.newPassword, 8)) return badRequest('A nova senha deve ter ao menos 8 caracteres');
        return authController.resetPassword(body, reqCtx);
    }

    // POST /refresh
    if (method === 'POST' && path === '/refresh') {
        const body = await parseBody(req);
        if (!body) return badRequest('Body inválido');
        if (!isString(body.refreshToken, 1)) return badRequest('refreshToken obrigatório');
        return authController.refresh(body, reqCtx);
    }

    // POST /logout
    if (method === 'POST' && path === '/logout') {
        const body = await parseBody(req);
        if (!body) return badRequest('Body inválido');
        if (!isString(body.refreshToken, 1)) return badRequest('refreshToken obrigatório');
        return authController.logout(body, reqCtx);
    }

    // ── Rotas protegidas (requerem JWT) ──────────────────────────────────

    const { user, error } = extractUser(req);
    if (error) return error;

    // GET /me
    if (method === 'GET' && path === '/me') {
        return authController.me(user);
    }

    // POST /change-password
    if (method === 'POST' && path === '/change-password') {
        const body = await parseBody(req);
        if (!body) return badRequest('Body inválido');
        if (!isString(body.oldPassword, 1)) return badRequest('Senha atual obrigatória');
        if (!isString(body.newPassword, 8)) return badRequest('A nova senha deve ter ao menos 8 caracteres');
        return authController.changePassword(body, user, reqCtx);
    }

    return Response.json({ error: 'Rota não encontrada' }, { status: 404 });
}
