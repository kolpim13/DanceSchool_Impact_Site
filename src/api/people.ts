import { apiClient } from './client.js';

/** Thrown when /api/people/me responds 401, meaning the session is missing or expired. */
export class UnauthorizedError extends Error {}

export async function fetchMyProfile() {
	const { data, error, response } = await apiClient.GET('/api/people/me');

	if (response.status === 401) {
		throw new UnauthorizedError('Not authenticated.');
	}
	if (error) {
		throw new Error('Nie udało się pobrać danych profilu.');
	}

	return data;
}
