import { initHeader } from '../../partials/header/header.js';

const status = document.querySelector<HTMLElement>('#stub-status');

function announce(message: string): void {
	if (status) status.textContent = message;
}

type ScheduleEntry = {
	time: string;
	duration: string;
	title: string;
	level: string;
	room: string;
	description: string;
	price: string;
	seats: string;
	cta: string;
};

const placeholderSchedule: Record<string, ScheduleEntry[]> = {
	mon: [
		{ time: '17:00–18:00', duration: '60 min', title: 'Salsa cubana', level: 'Od podstaw', room: 'Sala 1', description: 'Nie potrzebujesz partnera.', price: '35 zł', seats: '6 wolnych miejsc', cta: 'Zarezerwuj i zapłać' },
		{ time: '19:15–20:15', duration: '60 min', title: 'Latino Energy', level: 'Początkujący', room: 'Sala 2', description: 'Latino i rytm w energicznym tempie.', price: '40 zł', seats: '2 miejsca', cta: 'Zarezerwuj i zapłać' },
		{ time: '20:30–21:30', duration: '60 min', title: 'Pilates Core', level: 'Wszyscy', room: 'Studio', description: 'Silne core i lepsza postawa.', price: '45 zł', seats: '5 miejsc', cta: 'Zarezerwuj i zapłać' }
	],
	tue: [
		{ time: '17:30–18:30', duration: '60 min', title: 'Beginner Dance', level: 'Początkujący', room: 'Sala 1', description: 'Lekka rozgrzewka i początki tańca.', price: '30 zł', seats: '3 miejsca', cta: 'Zarezerwuj i zapłać' },
		{ time: '18:45–19:45', duration: '60 min', title: 'House Session', level: 'Zaawansowani', room: 'Sala 2', description: 'Płynność ruchu i rytm w połączeniu.', price: '42 zł', seats: '1 miejsce', cta: 'Zarezerwuj i zapłać' }
	],
	wed: [
		{ time: '18:00–19:00', duration: '60 min', title: 'Jazz Fusion', level: 'Poziom 2', room: 'Sala 1', description: 'Technika i ekspresja w jednym ruchu.', price: '38 zł', seats: '6 miejsc', cta: 'Zarezerwuj i zapłać' },
		{ time: '19:30–20:30', duration: '60 min', title: 'Stretch & Flow', level: 'Wszyscy', room: 'Studio', description: 'Rozciąganie i poprawa mobilności.', price: '35 zł', seats: '4 miejsca', cta: 'Zarezerwuj i zapłać' }
	],
	thu: [
		{ time: '17:45–18:45', duration: '60 min', title: 'Dance Warm Up', level: 'Początkujący', room: 'Sala 2', description: 'Przyjazna rozgrzewka przed treningiem.', price: '28 zł', seats: '7 miejsc', cta: 'Zarezerwuj i zapłać' },
		{ time: '19:00–20:00', duration: '60 min', title: 'Contemporary', level: 'Poziom 2', room: 'Sala 1', description: 'Kontrola, ekspresja i ciało w ruchu.', price: '40 zł', seats: '3 miejsca', cta: 'Zarezerwuj i zapłać' }
	],
	fri: [
		{ time: '18:30–19:30', duration: '60 min', title: 'Weekend Energy', level: 'Wszyscy', room: 'Sala 1', description: 'Energiczny trening na dobry start weekendu.', price: '39 zł', seats: '2 miejsca', cta: 'Zarezerwuj i zapłać' },
		{ time: '20:00–21:00', duration: '60 min', title: 'Open Practice', level: 'Poziom 1', room: 'Studio', description: 'Czas na ćwiczenie kroków i stylu.', price: '32 zł', seats: '6 miejsc', cta: 'Zarezerwuj i zapłać' }
	]
};

async function fetchSchedule(day: string): Promise<ScheduleEntry[]> {
	// TODO: replace with backend request when the schedule API is available.
	return placeholderSchedule[day] ?? placeholderSchedule.mon;
}

function renderSchedule(items: ScheduleEntry[]): void {
	const list = document.querySelector<HTMLElement>('[data-schedule-list]');
	if (!list) return;

	list.innerHTML = items.map(item => `
		<article class="schedule-card">
			<div class="schedule-card__time">${item.time} · ${item.duration}</div>
			<h2 class="schedule-card__title">${item.title}</h2>
			<div class="schedule-card__details">
				<span>Od ${item.level}</span>
				<span>·</span>
				<span>${item.room}</span>
			</div>
			<p class="schedule-card__description">${item.description}</p>
			<div class="schedule-card__footer">
				<div class="schedule-card__price-wrap">
					<span class="schedule-card__price">${item.price}</span>
					<span class="schedule-card__seats">• ${item.seats}</span>
				</div>
				<button class="schedule-card__cta" type="button" data-stub="booking">${item.cta}</button>
			</div>
		</article>
	`).join('');
}

const filterButtons = document.querySelectorAll<HTMLButtonElement>('[data-day]');
for (const button of filterButtons) {
	button.addEventListener('click', async () => {
		const day = button.dataset.day ?? 'mon';
		for (const item of filterButtons) {
			const isActive = item === button;
			item.classList.toggle('is-active', isActive);
			item.setAttribute('aria-selected', String(isActive));
		}
		const schedule = await fetchSchedule(day);
		renderSchedule(schedule);
		announce(`Załadowano placeholder grafiku dla ${day}.`);
	});
}

const defaultDay = document.querySelector<HTMLButtonElement>('[data-day].is-active')?.dataset.day ?? 'mon';
void fetchSchedule(defaultDay).then(renderSchedule);
initHeader(document, announce);
