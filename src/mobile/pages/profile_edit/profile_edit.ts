import { UnauthorizedError, fetchMyProfile } from '../../../api/people.js';
import { initFooter } from '../../partials/footer/footer.js';
import { initHeader } from '../../partials/header/header.js';

const LOGIN_PATH = '/src/mobile/pages/login/index.html';

const status = document.querySelector<HTMLElement>('#stub-status');
const formStatus = document.querySelector<HTMLElement>('[data-profile-edit-status]');

function announce(message: string): void {
	if (status) status.textContent = message;
	if (formStatus) formStatus.textContent = message;
}

void initHeader(document, announce);
void initFooter(document, announce);

function getInitials(firstName: string, lastName: string): string {
	return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function setProfileFields(profile: Awaited<ReturnType<typeof fetchMyProfile>>): void {
	const firstName = document.querySelector<HTMLInputElement>('#profile-first-name');
	const lastName = document.querySelector<HTMLInputElement>('#profile-last-name');
	const email = document.querySelector<HTMLInputElement>('#profile-email');
	const phone = document.querySelector<HTMLInputElement>('#profile-phone');
	const avatar = document.querySelector<HTMLElement>('[data-profile-avatar]');

	if (firstName) firstName.value = profile.first_name;
	if (lastName) lastName.value = profile.last_name;
	if (email) email.value = profile.contact_email ?? '';
	if (phone) phone.value = profile.phone?.replace(/^\+48\s*/, '') ?? '';
	if (avatar) avatar.textContent = getInitials(profile.first_name, profile.last_name);
}

const form = document.querySelector<HTMLFormElement>('[data-profile-edit-form]');
form?.addEventListener('submit', event => {
	event.preventDefault();
	announce('Zapisywanie zmian będzie dostępne po podłączeniu endpointu API.');
});

document.addEventListener('click', event => {
	const target = (event.target as HTMLElement).closest<HTMLElement>('[data-stub-action]');
	if (!target) return;
	announce('Ta funkcja będzie dostępna po podłączeniu strony.');
});

async function loadProfileEditPage(): Promise<void> {
	try {
		const profile = await fetchMyProfile();
		setProfileFields(profile);
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			window.location.href = `${LOGIN_PATH}?redirect=${encodeURIComponent(window.location.pathname)}`;
			return;
		}
		announce(error instanceof Error ? error.message : 'Nie udało się pobrać danych profilu.');
	}
}

void loadProfileEditPage();
