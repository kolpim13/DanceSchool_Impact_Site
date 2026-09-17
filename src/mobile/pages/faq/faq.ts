import { initHeader } from '../../partials/header/header.js';

const status = document.querySelector<HTMLElement>('#stub-status');
function announce(message: string): void {
	if (status) status.textContent = message;
}

const faqButtons = document.querySelectorAll<HTMLButtonElement>('[data-faq-question]');
for (const button of faqButtons) {
	const answer = button.nextElementSibling as HTMLElement | null;
	if (!answer) continue;

	button.addEventListener('click', () => {
		const isExpanded = button.getAttribute('aria-expanded') === 'true';
		button.setAttribute('aria-expanded', String(!isExpanded));
		answer.hidden = isExpanded;
		button.closest('.faq-item')?.classList.toggle('faq-item--open', !isExpanded);
	});
}

initHeader(document, announce);
