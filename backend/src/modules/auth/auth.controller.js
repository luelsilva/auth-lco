import { AuthService } from './auth.service.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/tokenManager.js';

export const authController = {
    register: async (body, reqCtx) => {
        try {
            const user = await AuthService.registerUser(body, reqCtx);
            return Response.json(
                { message: 'Usuário registrado com sucesso', userId: user.id },
                { status: 201 }
            );
        } catch (error) {
            return Response.json({ error: error.message || 'Erro no registro' }, { status: 400 });
        }
    },

    login: async (body, reqCtx) => {
        try {
            const user = await AuthService.authenticate(body.email, body.password, reqCtx);
            const accessToken = generateAccessToken(user.id, user.email);
            const refreshToken = await generateRefreshToken(user.id, body.rememberMe);
            return Response.json({
                accessToken,
                refreshToken,
                user: { id: user.id, email: user.email, name: user.fullName },
            });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 401 });
        }
    },

    me: async (user) => {
        try {
            const data = await AuthService.getMe(user.id);
            return Response.json(data);
        } catch (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }
    },

    verifyOtp: async (body, reqCtx) => {
        try {
            await AuthService.verifyOTP(body.email, body.code, reqCtx);
            return Response.json({ message: 'Conta verificada com sucesso' });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }
    },

    resendOtp: async (body, reqCtx) => {
        try {
            await AuthService.resendOTP(body.email, reqCtx);
            return Response.json({ message: 'Código reenviado com sucesso' });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }
    },

    forgotPassword: async (body, reqCtx) => {
        try {
            await AuthService.forgotPassword(body.email, reqCtx);
            return Response.json({ message: 'Se o e-mail existir, um código foi enviado.' });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }
    },

    resetPassword: async (body, reqCtx) => {
        try {
            await AuthService.resetPassword(body.email, body.code, body.newPassword, reqCtx);
            return Response.json({ message: 'Senha redefinida com sucesso' });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }
    },

    refresh: async (body, reqCtx) => {
        try {
            const tokens = await AuthService.refresh(body.refreshToken, reqCtx);
            return Response.json(tokens);
        } catch (error) {
            return Response.json({ error: error.message }, { status: 401 });
        }
    },

    logout: async (body, reqCtx) => {
        try {
            await AuthService.logout(body.refreshToken, reqCtx);
            return Response.json({ message: 'Logout realizado' });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }
    },

    changePassword: async (body, user, reqCtx) => {
        try {
            await AuthService.changePassword(user.id, body.oldPassword, body.newPassword, reqCtx);
            return Response.json({ message: 'Senha alterada com sucesso' });
        } catch (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }
    },
};
