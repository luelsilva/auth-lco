import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config.js';
import { db } from '../db/index.js';
import { refreshTokens } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';

/**
 * Gera um access token JWT
 */
export function generateAccessToken(userId, email) {
    return jwt.sign(
        { id: userId, email },
        config.jwt.secret,
        { expiresIn: config.jwt.accessTokenExpiresIn }
    );
}

/**
 * Gera um refresh token único e o salva no banco
 */
export async function generateRefreshToken(userId, rememberMe = false) {
    // Gerar token aleatório
    const token = crypto.randomBytes(64).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Calcular expiração (30 dias padrão, ou 90 dias se "lembrar-me")
    const expiresAt = new Date();
    const days = rememberMe ? 90 : 30;
    expiresAt.setDate(expiresAt.getDate() + days);

    // Salvar no banco
    await db.insert(refreshTokens).values({
        userId,
        tokenHash,
        expiresAt
    });

    return token;
}

/**
 * Valida um refresh token e retorna o userId se válido
 */
export async function validateRefreshToken(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [tokenData] = await db.select()
        .from(refreshTokens)
        .where(
            and(
                eq(refreshTokens.tokenHash, tokenHash),
                eq(refreshTokens.isRevoked, false),
                gt(refreshTokens.expiresAt, new Date())
            )
        )
        .limit(1);

    return tokenData ? tokenData.userId : null;
}

/**
 * Revoga um refresh token específico
 */
export async function revokeRefreshToken(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await db.update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.tokenHash, tokenHash));
}

