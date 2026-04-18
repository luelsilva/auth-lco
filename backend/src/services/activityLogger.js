import { db } from '../db/index.js';
import { activityLogs } from '../db/schema.js';

/**
 * Registra uma ação no log de atividades de forma assíncrona e silenciosa.
 * Nunca joga um erro — falhas de log não devem impactar o fluxo principal.
 *
 * @param {object} params
 * @param {string|null} params.userId
 * @param {string}      params.action      - Ex: 'login_success', 'logout', 'password_changed'
 * @param {string|null} params.ipAddress
 * @param {string|null} params.userAgent
 * @param {object|null} params.metadata    - Dados extras livres por tipo de ação
 */
export async function logActivity({ userId = null, action, ipAddress = null, userAgent = null, metadata = null }) {
    try {
        await db.insert(activityLogs).values({
            userId,
            action,
            ipAddress,
            userAgent,
            metadata,
        });
    } catch (err) {
        console.error('[ACTIVITY LOG ERROR]', err.message);
    }
}
