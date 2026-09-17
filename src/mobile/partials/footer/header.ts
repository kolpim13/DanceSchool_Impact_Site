import { bindNavigationStubs } from '../../../shared/navigation.js';

export function initFooter(root: Document = document, announce: (message: string) => void = () => undefined): void {
	if (root.querySelector('[data-impact-footer]')) bindNavigationStubs(root, announce);
}
