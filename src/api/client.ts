import createClient from 'openapi-fetch';
import type { paths } from './generated/schema.js';

// Session auth relies on the HttpOnly `impact_session` cookie; never handle the token in JS.
export const apiClient = createClient<paths>({ baseUrl: '', credentials: 'include' });
