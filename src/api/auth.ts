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