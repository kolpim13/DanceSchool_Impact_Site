import { UnauthorizedError, fetchMyProfile } from '../../../api/people.js';
import { bindNavigationStubs } from '../../../shared/navigation.js';
import { initExpandedMenu } from '../menu_expanded/menu_expanded.js';

const LOGIN_PATH = '/src/mobile/pages/login/index.html';
const PROFILE_PATH = '/src/mobile/pages/profile/index.html';

async function goToProfileOrLogin(): Promise<void> {
	try {
		await fetchMyProfile();
		window.location.href = PROFILE_PATH;
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			window.location.href = `${LOGIN_PATH}?redirect=${encodeURIComponent(PROFILE_PATH)}`;
			return;
		}
		window.location.href = PROFILE_PATH;
	}
}

export async function initHeader(root: Document = document, announce: (message: string) => void = () => undefined): Promise<void> {
	const headerHost = root.querySelector<HTMLElement>('[data-header-host]');
	if (!headerHost || headerHost.querySelector('[data-impact-header]')) {
		bindHeader(root, announce);
		return;
	}

	const response = await fetch('/src/mobile/partials/header/index.html');
	if (!response.ok) return;
	headerHost.innerHTML = await response.text();
	bindHeader(root, announce);
}

function bindHeader(root: Document, announce: (message: string) => void): void {
	const header = root.querySelector('[data-impact-header]');
	if (!header) return;

	bindNavigationStubs(header, announce);
	root.querySelector<HTMLButtonElement>('[data-profile-link]')?.addEventListener('click', () => {
		void goToProfileOrLogin();
	});

	const menuHost = root.querySelector<HTMLElement>('[data-expanded-menu-host]');
	if (!menuHost || menuHost.querySelector('[data-expanded-menu]')) {
		initExpandedMenu(root, announce);
		return;
	}

	void fetch('/src/mobile/partials/menu_expanded/index.html').then(async menuResponse => {
		if (!menuResponse.ok) return;
		menuHost.innerHTML = await menuResponse.text();
		initExpandedMenu(root, announce);
	});
}
