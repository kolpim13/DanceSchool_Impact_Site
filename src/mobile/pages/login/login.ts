// import { login } from '../../../api/auth.js';
import { development_login } from '../../../api/auth.js';
import { initFooter } from '../../partials/footer/footer.js';
import { initHeader } from '../../partials/header/header.js';

const PROFILE_PATH = '/src/mobile/pages/profile/index.html';

const status = document.querySelector<HTMLElement>('#stub-status');
const formStatus = document.querySelector<HTMLElement>('#login-form-status');

function announce(message: string): void {
	if (status) status.textContent = message;
	if (formStatus) formStatus.textContent = message;
}

void initHeader(document, announce);
void initFooter(document, announce);

/** Only allow same-origin relative paths to prevent an open redirect. */
function getRedirectTarget(): string {
	const requested = new URLSearchParams(window.location.search).get('redirect');
	return requested && requested.startsWith('/') && !requested.startsWith('//') ? requested : PROFILE_PATH;
}

const form = document.querySelector<HTMLFormElement>('[data-login-form]');
form?.addEventListener('submit', event => {
	event.preventDefault();
	const email = form.querySelector<HTMLInputElement>('#login-email')?.value ?? '';
	// const password = form.querySelector<HTMLInputElement>('#login-password')?.value ?? '';

    // Use development login at the moment just for tests
    development_login(email)
        .then(() => {
            window.location.href = getRedirectTarget();
        })
        .catch(error => announce(error instanceof Error ? error.message : 'Nie udało się zalogować. Spróbuj ponownie później.'));
	
        // login(email, password)
	// 	.then(() => {
	// 		window.location.href = getRedirectTarget();
	// 	})
	// 	.catch(error => announce(error instanceof Error ? error.message : 'Nie udało się zalogować. Spróbuj ponownie później.'));
});

