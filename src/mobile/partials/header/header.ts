import { bindNavigationStubs } from '../../../shared/navigation.js';
import { initExpandedMenu } from '../menu_expanded/menu_expanded.js';

export async function initHeader(root: Document = document, announce: (message: string) => void = () => undefined): Promise<void> {
	const header = root.querySelector('[data-impact-header]');
	if (!header) return;

	bindNavigationStubs(header, announce);
	const host = root.querySelector<HTMLElement>('[data-expanded-menu-host]');
	if (!host || host.querySelector('[data-expanded-menu]')) {
		initExpandedMenu(root, announce);
		return;
	}

	const response = await fetch('/src/mobile/partials/menu_expanded/index.html');
	if (!response.ok) return;
	host.innerHTML = await response.text();
	initExpandedMenu(root, announce);
}
