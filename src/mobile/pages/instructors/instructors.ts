import { fetchPublicSchoolProfiles } from '../../../api/schoolProfiles.js';
import { initFooter } from '../../partials/footer/footer.js';
import { initHeader } from '../../partials/header/header.js';

const API_BASE_URL = window.location.origin;
const status = document.querySelector<HTMLElement>('#stub-status');
function announce(message: string): void {
	if (status) status.textContent = message;
}

void initHeader(document, announce);
void initFooter(document, announce);

function getInitials(displayName: string): string {
	return displayName
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map(part => part[0] ?? '')
		.join('')
		.toUpperCase();
}

function appendText(parent: Element, tagName: string, className: string, text: string): HTMLElement {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = text;
	parent.append(element);
	return element;
}

function getPhotoUrl(photoPath: string): string | null {
	try {
		return new URL(photoPath, API_BASE_URL).href;
	} catch {
		return null;
	}
}

function appendPositionBadge(parent: Element, position: string): void {
	appendText(parent, 'span', 'instructor-card__position', position);
}

function renderInstructors(profiles: Awaited<ReturnType<typeof fetchPublicSchoolProfiles>>): void {
	const list = document.querySelector<HTMLElement>('[data-instructors-list]');
	if (!list) return;
	list.replaceChildren();

	for (const profile of profiles) {
		const card = document.createElement('article');
		card.className = 'instructor-card';

		const portrait = document.createElement('div');
		portrait.className = 'instructor-card__portrait';
		portrait.setAttribute('aria-hidden', 'true');
		const photoUrl = profile.photo_path?.trim() ? getPhotoUrl(profile.photo_path.trim()) : null;
		if (photoUrl) {
			const image = document.createElement('img');
			portrait.classList.add('instructor-card__portrait--photo');
			image.src = photoUrl;
			image.alt = profile.display_name;
			image.loading = 'lazy';
			image.decoding = 'async';
			image.addEventListener('error', () => {
				portrait.classList.remove('instructor-card__portrait--photo');
				portrait.textContent = getInitials(profile.display_name);
				appendPositionBadge(portrait, profile.position);
			}, { once: true });
			portrait.append(image);
			appendPositionBadge(portrait, profile.position);
		} else {
			portrait.textContent = getInitials(profile.display_name);
			appendPositionBadge(portrait, profile.position);
		}
		card.append(portrait);

		const body = document.createElement('div');
		body.className = 'instructor-card__body';
		appendText(body, 'h2', 'instructor-card__name', profile.display_name);
		appendText(body, 'p', 'instructor-card__bio', profile.short_bio);
		card.append(body);
		list.append(card);
	}
}

async function loadInstructors(): Promise<void> {
	try {
		const profiles = await fetchPublicSchoolProfiles();
		renderInstructors(profiles);
	} catch (error) {
		const list = document.querySelector<HTMLElement>('[data-instructors-list]');
		if (list) {
			list.replaceChildren();
			appendText(list, 'p', 'instructors-state instructors-state--error', 'Nie udało się załadować instruktorów. Spróbuj ponownie później.');
		}
		announce(error instanceof Error ? error.message : 'Nie udało się pobrać listy instruktorów.');
	}
}

void loadInstructors();
