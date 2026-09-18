import { initFooter } from '../../partials/footer/footer.js';
import { initHeader } from '../../partials/header/header.js';

const status = document.querySelector<HTMLElement>('#stub-status');
function announce(message: string): void {
	if (status) status.textContent = message;
}

void initHeader(document, announce);
void initFooter(document, announce);
