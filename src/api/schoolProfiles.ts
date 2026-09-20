import { apiClient } from './client.js';

export async function fetchPublicSchoolProfiles(offset = 0, limit = 50) {
	const { data, error } = await apiClient.GET('/api/school-profiles/public', {
		params: { query: { offset, limit } }
	});

	if (error) {
		throw new Error('Nie udało się pobrać listy instruktorów.');
	}

	return data;
}
