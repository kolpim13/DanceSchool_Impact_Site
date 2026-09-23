import { logout } from '../../../api/auth.js';
import { UnauthorizedError, fetchMyProfile } from '../../../api/people.js';
import { broadcastLogout, onRemoteLogout } from '../../../shared/authChannel.js';
import { initFooter } from '../../partials/footer/footer.js';
import { initHeader } from '../../partials/header/header.js';

const LOGIN_PATH = '/src/mobile/pages/login/index.html';

const status = document.querySelector<HTMLElement>('#stub-status');

function announce(message: string): void {
	if (status) status.textContent = message;
}

void initHeader(document, announce);
void initFooter(document, announce);

// Bumped on logout so in-flight profile responses from the old session are ignored, not rendered.
let sessionEpoch = 0;
let profileRequest: AbortController | null = null;
let logoutPending = false;

function clearPrivateProfileState(): void {
	const avatar = document.querySelector<HTMLElement>('[data-profile-avatar]');
	if (avatar) avatar.textContent = '';
	for (const field of ['first-name', 'last-name', 'email', 'phone']) {
		const cell = document.querySelector<HTMLElement>(`[data-profile-${field}]`);
		if (cell) cell.textContent = '';
	}
}

function goToLogin(): void {
	window.location.href = LOGIN_PATH;
}

async function handleLogout(): Promise<void> {
	if (logoutPending) return;
	logoutPending = true;
	sessionEpoch += 1;
	profileRequest?.abort();

	const button = document.querySelector<HTMLButtonElement>('[data-logout-button]');
	if (button) { button.disabled = true; button.textContent = 'Wylogowywanie…'; }

	try {
		await logout();
		clearPrivateProfileState();
		broadcastLogout();
		goToLogin();
	} catch (error) {
		logoutPending = false;
		if (button) { button.disabled = false; button.textContent = 'Wyloguj'; }
		announce(error instanceof Error ? error.message : 'Nie udało się wylogować. Spróbuj ponownie.');
	}
}

document.addEventListener('click', event => {
	if ((event.target as HTMLElement).closest('[data-logout-button]')) void handleLogout();
});

// Another tab logged out: this tab's session cookie is gone too, so stop showing private data.
onRemoteLogout(() => {
	sessionEpoch += 1;
	profileRequest?.abort();
	clearPrivateProfileState();
	goToLogin();
});

// Back/forward cache can restore this page with stale private data; revalidate the session.
window.addEventListener('pageshow', event => {
	if ((event as PageTransitionEvent).persisted) void loadProfilePage();
});

function getInitials(firstName: string, lastName: string): string {
	return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

// Memberships and courses are static placeholder markup in index.html (no backend endpoint yet, see AGENTS.md).
function setProfileFields(profile: Awaited<ReturnType<typeof fetchMyProfile>>): void {
	const avatar = document.querySelector<HTMLElement>('[data-profile-avatar]');
	const firstName = document.querySelector<HTMLElement>('[data-profile-first-name]');
	const lastName = document.querySelector<HTMLElement>('[data-profile-last-name]');
	const email = document.querySelector<HTMLElement>('[data-profile-email]');
	const phone = document.querySelector<HTMLElement>('[data-profile-phone]');

	if (avatar) avatar.textContent = getInitials(profile.first_name, profile.last_name);
	if (firstName) firstName.textContent = profile.first_name;
	if (lastName) lastName.textContent = profile.last_name;
	if (email) email.textContent = profile.contact_email ?? 'Brak danych';
	if (phone) phone.textContent = profile.phone ?? 'Brak danych';
}

document.addEventListener('click', event => {
	const target = (event.target as HTMLElement).closest<HTMLElement>('[data-stub-action]');
	if (!target) return;
	announce('Ta funkcja będzie dostępna po podłączeniu strony.');
});

async function loadProfilePage(): Promise<void> {
	const epoch = sessionEpoch;
	profileRequest?.abort();
	const controller = new AbortController();
	profileRequest = controller;

	let profile: Awaited<ReturnType<typeof fetchMyProfile>>;
	try {
		profile = await fetchMyProfile(controller.signal);
	} catch (error) {
		if (error instanceof DOMException && error.name === 'AbortError') return;
		if (epoch !== sessionEpoch) return;
		if (error instanceof UnauthorizedError) {
			window.location.href = `${LOGIN_PATH}?redirect=${encodeURIComponent(window.location.pathname)}`;
			return;
		}
		announce(error instanceof Error ? error.message : 'Nie udało się pobrać danych profilu.');
		return;
	}
	if (epoch !== sessionEpoch) return;

	setProfileFields(profile);
}

void loadProfilePage();
