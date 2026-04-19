import { db } from '../../db/index.js';
import { profiles, otpCodes, refreshTokens } from '../../db/schema.js';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { generateOTP } from '../../utils/otpGenerator.js';
import emailService from '../../services/emailService.js';
import { formatarNome } from '../../utils/utils.js';
import { generateAccessToken, generateRefreshToken, validateRefreshToken, revokeRefreshToken } from '../../utils/tokenManager.js';
import { logActivity } from '../../services/activityLogger.js';

export class AuthService {
    static async registerUser({ email, password, full_name }, reqCtx = {}) {
        const normalizedEmail = email.trim().toLowerCase();
        const formattedFullName = formatarNome(full_name.trim());

        // Verificar se já existe
        const [existing] = await db.select().from(profiles).where(eq(profiles.email, normalizedEmail)).limit(1);
        if (existing) {
            throw new Error('Este e-mail já está cadastrado.');
        }

        // Hash Nativo do Bun (Mais rápido)
        const hashedPassword = await Bun.password.hash(password);

        const [user] = await db.insert(profiles).values({
            email: normalizedEmail,
            passwordHash: hashedPassword,
            fullName: formattedFullName
        }).returning();

        const otp = generateOTP();
        await db.insert(otpCodes).values({
            userId: user.id,
            code: otp,
            type: 'registration',
            expiresAt: new Date(Date.now() + 10 * 60000) // 10 min
        });
        await emailService.sendOTPEmail(email, otp, formattedFullName);

        logActivity({ userId: user.id, action: 'register', ...reqCtx });

        return user;
    }

    static async authenticate(email, password, reqCtx = {}) {
        const [user] = await db.select().from(profiles)
            .where(and(eq(profiles.email, email.toLowerCase()), isNull(profiles.deletedAt)))
            .limit(1);

        if (!user || !(await Bun.password.verify(password, user.passwordHash))) {
            logActivity({ action: 'login_failed', metadata: { email }, ...reqCtx });
            throw new Error('Credenciais inválidas');
        }

        if (!user.isVerified) {
            logActivity({ userId: user.id, action: 'login_failed_unverified', ...reqCtx });
            throw new Error('Email não verificado');
        }

        logActivity({ userId: user.id, action: 'login_success', ...reqCtx });

        return user;
    }

    static async getMe(userId) {
        const [user] = await db.select({
            id: profiles.id,
            email: profiles.email,
            fullName: profiles.fullName,
            isVerified: profiles.isVerified,
            createdAt: profiles.createdAt
        }).from(profiles).where(eq(profiles.id, userId)).limit(1);
        if (!user) throw new Error('Usuário não encontrado');
        return user;
    }

    static async verifyOTP(email, code, reqCtx = {}) {
        const normalizedEmail = email.toLowerCase();
        const [user] = await db.select().from(profiles).where(eq(profiles.email, normalizedEmail)).limit(1);
        if (!user) throw new Error('Usuário não encontrado');

        const [otpRecord] = await db.select().from(otpCodes)
            .where(and(
                eq(otpCodes.userId, user.id),
                eq(otpCodes.code, code),
                eq(otpCodes.type, 'registration'),
                gt(otpCodes.expiresAt, new Date())
            )).limit(1);

        if (!otpRecord) throw new Error('Código inválido ou expirado');

        await db.update(profiles).set({ isVerified: true }).where(eq(profiles.id, user.id));
        await db.delete(otpCodes).where(eq(otpCodes.id, otpRecord.id));

        logActivity({ userId: user.id, action: 'otp_verified', ...reqCtx });

        return { success: true };
    }

    static async resendOTP(email, reqCtx = {}) {
        const normalizedEmail = email.toLowerCase();
        const [user] = await db.select().from(profiles).where(eq(profiles.email, normalizedEmail)).limit(1);
        if (!user) throw new Error('Usuário não encontrado');
        if (user.isVerified) throw new Error('Usuário já verificado');

        await db.delete(otpCodes).where(and(eq(otpCodes.userId, user.id), eq(otpCodes.type, 'registration')));

        const otp = generateOTP();
        await db.insert(otpCodes).values({
            userId: user.id,
            code: otp,
            type: 'registration',
            expiresAt: new Date(Date.now() + 10 * 60000)
        });
        await emailService.sendOTPEmail(normalizedEmail, otp, user.fullName);

        logActivity({ userId: user.id, action: 'otp_resent', ...reqCtx });

        return { success: true };
    }

    static async forgotPassword(email, reqCtx = {}) {
        const normalizedEmail = email.toLowerCase();
        const [user] = await db.select().from(profiles).where(eq(profiles.email, normalizedEmail)).limit(1);
        if (!user) {
            return { success: true };
        }

        await db.delete(otpCodes).where(and(eq(otpCodes.userId, user.id), eq(otpCodes.type, 'password_reset')));

        const otp = generateOTP();
        await db.insert(otpCodes).values({
            userId: user.id,
            code: otp,
            type: 'password_reset',
            expiresAt: new Date(Date.now() + 15 * 60000)
        });
        await emailService.sendOTPEmail(normalizedEmail, otp, user.fullName);

        logActivity({ userId: user.id, action: 'password_reset_requested', ...reqCtx });

        return { success: true };
    }

    static async resetPassword(email, code, newPassword, reqCtx = {}) {
        const normalizedEmail = email.toLowerCase();
        const [user] = await db.select().from(profiles).where(eq(profiles.email, normalizedEmail)).limit(1);
        if (!user) throw new Error('Dados inválidos');

        const [otpRecord] = await db.select().from(otpCodes)
            .where(and(
                eq(otpCodes.userId, user.id),
                eq(otpCodes.code, code),
                eq(otpCodes.type, 'password_reset'),
                gt(otpCodes.expiresAt, new Date())
            )).limit(1);

        if (!otpRecord) throw new Error('Código inválido ou expirado');

        const hashedPassword = await Bun.password.hash(newPassword);
        await db.update(profiles).set({ passwordHash: hashedPassword, mustChangePassword: false }).where(eq(profiles.id, user.id));
        await db.delete(otpCodes).where(eq(otpCodes.id, otpRecord.id));

        logActivity({ userId: user.id, action: 'password_reset', ...reqCtx });

        return { success: true };
    }

    static async changePassword(userId, oldPassword, newPassword, reqCtx = {}) {
        const [user] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
        if (!user || !(await Bun.password.verify(oldPassword, user.passwordHash))) {
            throw new Error('Senha atual incorreta');
        }

        const hashedPassword = await Bun.password.hash(newPassword);
        await db.update(profiles).set({ passwordHash: hashedPassword, mustChangePassword: false }).where(eq(profiles.id, userId));

        logActivity({ userId, action: 'password_changed', ...reqCtx });

        return { success: true };
    }

    static async refresh(token, reqCtx = {}) {
        const userId = await validateRefreshToken(token);
        if (!userId) throw new Error('Refresh token inválido ou expirado');

        const [user] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
        if (!user) throw new Error('Usuário não encontrado');

        await revokeRefreshToken(token);

        const accessToken = generateAccessToken(user.id, user.email);
        const refreshToken = await generateRefreshToken(user.id, false);

        logActivity({ userId, action: 'token_refreshed', ...reqCtx });

        return { accessToken, refreshToken };
    }

    static async logout(token, reqCtx = {}) {
        if (token) {
            const tokenHash = (await import('crypto')).default.createHash('sha256').update(token).digest('hex');
            const [tokenData] = await db.select({ userId: refreshTokens.userId })
                .from(refreshTokens)
                .where(eq(refreshTokens.tokenHash, tokenHash))
                .limit(1);

            await revokeRefreshToken(token);

            if (tokenData) {
                logActivity({ userId: tokenData.userId, action: 'logout', ...reqCtx });
            }
        }
        return { success: true };
    }
}
