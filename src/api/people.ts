import { apiClient } from './client.js';

/** Thrown when /api/people/me responds 401, meaning the session is missing or expired. */
export class UnauthorizedError extends Error {}

export async function fetchMyProfile(signal?: AbortSignal) {
	// no-store: this is private data and must never be served from the HTTP cache after logout.
	const { data, error, response } = await apiClient.GET('/api/people/me', { cache: 'no-store', signal });

	if (response.status === 401) {
		throw new UnauthorizedError('Not authenticated.');
	}
	if (error) {
		throw new Error('Nie udało się pobrać danych profilu.');
	}

	return data;
}
