import { PUBLIC_API_URL } from '$env/static/public';

const BASE_URL = PUBLIC_API_URL;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        const refreshed = await attemptRefresh();
        if (refreshed) {
            // Retry the same request
            headers.set('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
            return fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
        } else {
            // Failed to refresh, must logout
            logout();
        }
    }

    return response;
}

export async function attemptRefresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            return true;
        }
    } catch (error) {
        console.error('Failed to refresh token', error);
    }
    return false;
}

export async function logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
        try {
            // Tenta avisar o backend, mas não trava o fluxo se der erro
            await fetch(`${BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
        } catch (e) {
            console.error('Erro ao deslogar no servidor', e);
        }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
}

export function isAuthenticated() {
    return !!localStorage.getItem('accessToken');
}
