import { initHeader } from '../../partials/header/header.js';
import { initFooter } from '../../partials/footer/header.js';

const status = document.querySelector<HTMLElement>('#stub-status');

function announce(message: string): void {
	if (status) status.textContent = message;
}

initHeader(document, announce);
initFooter(document, announce);
