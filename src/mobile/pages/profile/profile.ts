import { initFooter } from '../../partials/footer/footer.js';
import { initHeader } from '../../partials/header/header.js';

const status = document.querySelector<HTMLElement>('#stub-status');

function announce(message: string): void {
	if (status) status.textContent = message;
}

void initHeader(document, announce);
void initFooter(document, announce);

function getInitials(firstName: string, lastName: string): string {
	return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

type ProfileDetails = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	memberSince: string;
};

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

// TODO: no profile/membership/enrollment endpoints exist yet in contracts/openapi.json; replace with real requests once the backend exposes them.
const placeholderProfile: ProfileDetails = {
	firstName: 'Anna',
	lastName: 'Kowalska',
	email: 'anna.kowalska@email.com',
	phone: '+48 512 345 678',
	memberSince: 'Wrzesień 2024'
};

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

async function fetchProfile(): Promise<ProfileDetails> {
	return placeholderProfile;
}

async function fetchMemberships(): Promise<Membership[]> {
	return placeholderMemberships;
}

async function fetchCourses(): Promise<EnrolledCourse[]> {
	return placeholderCourses;
}

function renderProfileCard(profile: ProfileDetails): void {
	const card = document.querySelector<HTMLElement>('[data-profile-card]');
	if (!card) return;

	card.innerHTML = `
		<div class="profile-avatar" aria-hidden="true">${getInitials(profile.firstName, profile.lastName)}</div>
		<dl>
			<div class="profile-info-row"><dt>Imię</dt><dd>${profile.firstName}</dd></div>
			<div class="profile-info-row"><dt>Nazwisko</dt><dd>${profile.lastName}</dd></div>
			<div class="profile-info-row"><dt>Email</dt><dd>${profile.email}</dd></div>
			<div class="profile-info-row"><dt>Telefon</dt><dd>${profile.phone}</dd></div>
			<div class="profile-info-row"><dt>Członek od</dt><dd>${profile.memberSince}</dd></div>
		</dl>
		<button class="button profile-card__edit" type="button" data-stub-action="edit-profile">Edytuj profil</button>
	`;
}

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
	const [profile, memberships, courses] = await Promise.all([fetchProfile(), fetchMemberships(), fetchCourses()]);
	renderProfileCard(profile);
	renderMemberships(memberships);
	renderCourses(courses);
}

void loadProfilePage();
