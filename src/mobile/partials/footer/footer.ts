import { bindNavigationStubs } from '../../../shared/navigation.js';

export async function initFooter(root: Document = document, announce: (message: string) => void = () => undefined): Promise<void> {
	const host = root.querySelector<HTMLElement>('[data-footer-host]');
	if (!host || host.querySelector('[data-impact-footer]')) {
		return;
	}

	const response = await fetch('/src/mobile/partials/footer/index.html');
	if (!response.ok) return;
	
	host.innerHTML = await response.text();
	bindNavigationStubs(host, announce);
}
