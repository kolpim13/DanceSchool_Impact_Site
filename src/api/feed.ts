import { apiClient } from './client.js';
import type { components } from './generated/schema.js';

export type FeedPost = components['schemas']['PostRead'];
export type FeedPage = components['schemas']['FeedRead'];

export async function fetchFacebookFeed(offset: number, limit: number): Promise<FeedPage | null> {
	const { data, error, response } = await apiClient.GET('/api/facebook/posts', {
		params: { query: { offset, limit } }
	});

	if (response.status === 416) {
		return null;
	}

	if (error || !data) {
		throw new Error('Nie udało się pobrać aktualności.');
	}

	return data;
}
