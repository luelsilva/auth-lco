const config = {
    port: process.env.PORT || 3000,
    corsOrigin: process.env.CORS_ORIGIN || '*',
    jwt: {
        secret: process.env.JWT_SECRET || 'secret-chave-padrao',
        accessTokenExpiresIn: '15m',
    },
    otp: {
        length: 6,
        expiryMinutes: 10,
    },
    resend: {
        apiKey: process.env.RESEND_API_KEY,
        from: process.env.RESEND_FROM || 'onboarding@resend.dev',
    }
};

export default config;
