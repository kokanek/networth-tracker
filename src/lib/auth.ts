const AUTH_TOKEN_KEY = 'nwt_auth_token';

export function getAuthToken(): string {
    if (typeof localStorage === 'undefined') return '';
    return localStorage.getItem(AUTH_TOKEN_KEY) ?? '';
}

export function setAuthToken(token: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}
