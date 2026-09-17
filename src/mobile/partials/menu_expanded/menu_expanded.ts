import { bindNavigationStubs } from '../../../shared/navigation.js';

export function initExpandedMenu(root: Document = document, announce: (message: string) => void = () => undefined): void {
	const menu = root.querySelector<HTMLElement>('[data-expanded-menu]');
	const toggle = root.querySelector<HTMLButtonElement>('[data-menu-toggle]');
	if (!menu || !toggle) return;

	const setOpen = (isOpen: boolean): void => {
		menu.classList.toggle('is-open', isOpen);
		menu.setAttribute('aria-hidden', String(!isOpen));
		toggle.setAttribute('aria-expanded', String(isOpen));
		toggle.setAttribute('aria-label', isOpen ? 'Zamknij menu' : 'Otwórz menu');
		if (isOpen) {
			menu.removeAttribute('inert');
			document.body.classList.add('menu-is-open');
		} else {
			menu.setAttribute('inert', '');
			document.body.classList.remove('menu-is-open');
		}
	};

	toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
	root.addEventListener('keydown', event => {
		if (event.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
	});
	bindNavigationStubs(menu, announce);
}
