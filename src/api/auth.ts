import { apiClient } from './client.js';

export async function login(loginEmail: string, password: string): Promise<void> {
	const { error } = await apiClient.POST('/api/auth/login', {
		body: { 
            login_email: loginEmail, 
            password: password 
        }
	});

	if (error) {
		throw new Error('Nieprawidłowy e-mail lub hasło.');
	}
}

export async function development_login(loginEmail: string): Promise<void> {
	const { error } = await apiClient.POST('/api/auth/dev-login', {
		body: { 
            login_email: loginEmail, 
        }
	});

	if (error) {
		throw new Error('Nieprawidłowy e-mail lub hasło.');
	}
}

// No separate CSRF token exists in contracts/openapi.json; the session cookie set by the backend
// (SameSite + credentials: 'include' on apiClient) is the only CSRF-relevant mechanism available.
export async function logout(signal?: AbortSignal): Promise<void> {
	const { error, response } = await apiClient.POST('/api/auth/logout', { cache: 'no-store', signal });

	if (error || (!response.ok && response.status !== 204)) {
		throw new Error('Nie udało się wylogować. Spróbuj ponownie.');
	}
}