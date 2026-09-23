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
	const card = document.querySelector<HTMLElement>('[data-profile-card]');
	if (card) card.innerHTML = '';
	const memberships = document.querySelector<HTMLElement>('[data-membership-list]');
	if (memberships) memberships.innerHTML = '';
	const courses = document.querySelector<HTMLElement>('[data-course-list]');
	if (courses) courses.innerHTML = '';
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

type Membership = {
	id: string;
	title: string;
	status: 'active' | 'expired';
	validUntil: string;
	visitsUsed: number;
	visitsTotal: number;
};

type EnrolledCourse = {
	id: string;
	title: string;
	level: string;
	schedule: string;
	instructor: string;
};

// TODO: no membership/enrollment endpoints exist yet in contracts/openapi.json; replace with real requests once the backend exposes them.
const placeholderMemberships: Membership[] = [
	{ id: 'm1', title: 'Karnet Miesięczny — Salsa & Bachata', status: 'active', validUntil: '15.10.2026', visitsUsed: 8, visitsTotal: 12 },
	{ id: 'm2', title: 'Karnet Pojedynczy — Kizomba', status: 'active', validUntil: '22.09.2026', visitsUsed: 1, visitsTotal: 1 },
	{ id: 'm3', title: 'Karnet Miesięczny — Salsa Open', status: 'expired', validUntil: '01.08.2026', visitsUsed: 0, visitsTotal: 8 }
];

const placeholderCourses: EnrolledCourse[] = [
	{ id: 'c1', title: 'Salsa Początkujący', level: 'Początkujący', schedule: 'Pon & Śr 19:00–20:00', instructor: 'Carlos Martinez' },
	{ id: 'c2', title: 'Bachata Średniozaawansowany', level: 'Średniozaawansowany', schedule: 'Wt & Czw 20:00–21:00', instructor: 'Maria Santos' },
	{ id: 'c3', title: 'Kizomba Intro', level: 'Początkujący', schedule: 'Pt 18:00–19:00', instructor: 'João Silva' }
];

async function fetchMemberships(): Promise<Membership[]> {
	return placeholderMemberships;
}

async function fetchCourses(): Promise<EnrolledCourse[]> {
	return placeholderCourses;
}

// ToDo: Make most part of static
function renderProfileCard(profile: Awaited<ReturnType<typeof fetchMyProfile>>): void {
	const card = document.querySelector<HTMLElement>('[data-profile-card]');
	if (!card) return;

	card.innerHTML = `
		<div class="profile-avatar" aria-hidden="true">${getInitials(profile.first_name, profile.last_name)}</div>
		<dl>
			<div class="profile-info-row"><dt>Imię</dt><dd>${profile.first_name}</dd></div>
			<div class="profile-info-row"><dt>Nazwisko</dt><dd>${profile.last_name}</dd></div>
			<div class="profile-info-row"><dt>Email</dt><dd>${profile.contact_email ?? 'Brak danych'}</dd></div>
			<div class="profile-info-row"><dt>Telefon</dt><dd>${profile.phone ?? 'Brak danych'}</dd></div>
		</dl>

		<a class="button profile-card__edit" href="/src/mobile/pages/profile_edit/index.html">Edytuj profil</a>
		<button class="button profile-card__logout" type="button" data-logout-button>Wyloguj</button>
	`;
}

// ToDo: Make most part of static
function renderMemberships(memberships: Membership[]): void {
	const list = document.querySelector<HTMLElement>('[data-membership-list]');
	if (!list) return;

	list.innerHTML = memberships.map(membership => `
		<article class="membership-card">
			<div class="membership-card__header">
				<h3 class="membership-card__title">${membership.title}</h3>
				<span class="badge ${membership.status === 'active' ? 'badge--active' : 'badge--expired'}">${membership.status === 'active' ? 'Aktywny' : 'Wygasły'}</span>
			</div>
			<dl class="membership-card__meta">
				<div>
					<dt>Ważność</dt>
					<dd>${membership.validUntil}</dd>
				</div>
				<div>
					<dt>Pozostało wejść</dt>
					<dd class="${membership.status === 'expired' ? 'is-muted' : ''}">${membership.visitsUsed}/${membership.visitsTotal}</dd>
				</div>
			</dl>
		</article>
	`).join('');
}

// ToDo: Make most part of static
function renderCourses(courses: EnrolledCourse[]): void {
	const list = document.querySelector<HTMLElement>('[data-course-list]');
	if (!list) return;

	list.innerHTML = courses.map(course => `
		<article class="course-card">
			<div class="course-card__header">
				<h3 class="course-card__title">${course.title}</h3>
				<span class="badge badge--level">${course.level}</span>
			</div>
			<p class="course-card__schedule">${course.schedule}</p>
			<div class="course-card__footer">
				<p class="course-card__instructor">Prowadzący: <strong>${course.instructor}</strong></p>
				<button class="course-card__cancel" type="button" data-stub-action="cancel-course" data-course-id="${course.id}">Zrezygnuj</button>
			</div>
		</article>
	`).join('');
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

	renderProfileCard(profile);
	const [memberships, courses] = await Promise.all([fetchMemberships(), fetchCourses()]);
	if (epoch !== sessionEpoch) return;
	renderMemberships(memberships);
	renderCourses(courses);
}

void loadProfilePage();
