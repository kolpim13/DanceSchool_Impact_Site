import { bindNavigationStubs } from '../../../shared/navigation.js';

// Unused function at the moment to modify Footer in TS - No need [17.09.2026]!
export const defaultFooterData = {
	brand: 'impact / studio tańca',
	tagline: 'Ruszaj się. Poznawaj. Tańcz.',
	links: [
		{ label: 'Kontakt', href: '#contact', stub: 'contact' },
		{ label: 'Instagram', href: '#instagram', stub: 'instagram' },
		{ label: 'Facebook', href: '#facebook', stub: 'facebook' }
	],
	metaLinks: [
		{ label: 'Regulamin', href: '#terms', stub: 'terms' },
		{ label: 'Prywatność', href: '#privacy', stub: 'privacy' }
	]
};

export function createFooterMarkup(data = defaultFooterData): string {
	const links = data.links.map(link => `<a href="${link.href}" data-stub="${link.stub}">${link.label}</a>`).join('   ');
	const metaLinks = data.metaLinks.map(link => `<a href="${link.href}" data-stub="${link.stub}">${link.label}</a>`).join(' · ');
	return `
		<footer class="site-footer" data-impact-footer>
			<p class="footer-brand">${data.brand}</p>
			<p class="footer-tagline">${data.tagline}</p>
			<div class="footer-links caption">
				<p>${links}</p>
				<p>${metaLinks}</p>
			</div>
		</footer>
	`;
}

export function initFooter(root: ParentNode = document, data = defaultFooterData, announce: (message: string) => void = () => undefined): Element | null {
	const container = root.querySelector('[data-impact-footer]');
	if (!container) return null;
	container.outerHTML = createFooterMarkup(data);
	bindNavigationStubs(document, announce);
	return root.querySelector('[data-impact-footer]');
}
