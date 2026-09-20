import createClient from 'openapi-fetch';
import type { paths } from './generated/schema.js';

export const apiClient = createClient<paths>({ baseUrl: '' });
