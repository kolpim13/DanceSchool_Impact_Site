import { initFooter } from '../../partials/footer/footer.js';
import { initHeader } from '../../partials/header/header.js';

// Local form contract. Map it to the generated API schema when registration is connected.
type RegistrationInput = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	terms_accepted: boolean;
	marketing_consent: boolean;
};

const status = document.querySelector<HTMLElement>('#stub-status');
const form = document.querySelector<HTMLFormElement>('[data-register-form]');
const button = document.querySelector<HTMLButtonElement>('[data-register-button]');
const registrationStatus = document.querySelector<HTMLElement>('#register-status');
const password = document.querySelector<HTMLInputElement>('#register-password');
const passwordConfirm = document.querySelector<HTMLInputElement>('#register-password-confirm');
let registrationPending = false;

function announce(message: string): void {
	if (status) status.textContent = message;
}

void initHeader(document, announce);
void initFooter(document, announce);

function showRegistrationStatus(message: string): void {
	if (!registrationStatus) return;
	registrationStatus.hidden = false;
	registrationStatus.textContent = message;
	registrationStatus.focus();
}

function validatePasswords(): void {
	passwordConfirm?.setCustomValidity(passwordConfirm.value && passwordConfirm.value !== password?.value ? 'Hasła muszą być takie same.' : '');
}

// Backend stub: no request, credentials logging, browser storage or simulated account creation.
async function registerAccount(_input: RegistrationInput): Promise<void> {
	// TODO: Call the registration API and map its validation errors to the form.
	// TODO: Handle the API's actual outcome (e.g. email verification) before redirecting.
	throw new Error('Rejestracja nie jest jeszcze dostępna. Konto nie zostało utworzone. Spróbuj ponownie później.');
}

async function handleRegistration(): Promise<void> {
	if (!form || !button || registrationPending) return;
	validatePasswords();
	if (!form.reportValidity()) return;

	const data = new FormData(form);
	const input: RegistrationInput = {
		first_name: String(data.get('first_name') ?? '').trim(),
		last_name: String(data.get('last_name') ?? '').trim(),
		email: String(data.get('email') ?? '').trim(),
		password: String(data.get('password') ?? ''),
		terms_accepted: data.get('terms_accepted') === 'on',
		marketing_consent: data.get('marketing_consent') === 'on',
	};

	if (!input.first_name || !input.last_name) {
		showRegistrationStatus('Podaj imię i nazwisko. Pola nie mogą zawierać samych spacji.');
		return;
	}

	registrationPending = true;
	button.disabled = true;
	button.textContent = 'Tworzenie konta…';
	form.setAttribute('aria-busy', 'true');
	if (registrationStatus) registrationStatus.hidden = true;

	try {
		await registerAccount(input);
	} catch (error) {
		showRegistrationStatus(error instanceof Error ? error.message : 'Nie udało się utworzyć konta. Spróbuj ponownie.');
	} finally {
		registrationPending = false;
		button.disabled = false;
		button.textContent = 'Utwórz konto';
		form.removeAttribute('aria-busy');
	}
}

password?.addEventListener('input', validatePasswords);
passwordConfirm?.addEventListener('input', validatePasswords);

form?.addEventListener('submit', event => {
	event.preventDefault();
	void handleRegistration();
});

// Enable only after the submit handler is attached, preventing native GET submission of passwords.
if (form && button) button.disabled = false;
