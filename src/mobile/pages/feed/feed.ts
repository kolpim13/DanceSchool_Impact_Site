import { fetchFacebookFeed, type FeedPost } from '../../../api/feed.js';
import { initFooter } from '../../partials/footer/footer.js';
import { initHeader } from '../../partials/header/header.js';

const PAGE_SIZE = 5;
const status = document.querySelector<HTMLElement>('#feed-status');
const listView = document.querySelector<HTMLElement>('[data-feed-list-view]');
const detailView = document.querySelector<HTMLElement>('[data-feed-detail-view]');
const list = document.querySelector<HTMLElement>('[data-feed-list]');
const loadState = document.querySelector<HTMLElement>('[data-feed-load-state]');
const sentinel = document.querySelector<HTMLElement>('[data-feed-sentinel]');
const detail = document.querySelector<HTMLElement>('[data-feed-detail]');

let posts: FeedPost[] = [];
let isLoading = false;
let hasMore = true;

function announce(message: string): void {
	if (status) status.textContent = message;
}

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Data publikacji niedostępna';

	return new Intl.DateTimeFormat('pl-PL', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);
}

function createTextElement(tagName: string, className: string, text: string): HTMLElement {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = text;
	return element;
}

function createPostCard(post: FeedPost): HTMLElement {
	const card = document.createElement('article');
	card.className = 'feed-card';

	if (post.preview_url) {
		const image = document.createElement('img');
		image.className = 'feed-card__image';
		image.src = post.preview_url;
		image.alt = '';
		image.loading = 'lazy';
		image.decoding = 'async';
		image.addEventListener('error', () => image.remove(), { once: true });
		card.append(image);
	}

	const body = document.createElement('div');
	body.className = 'feed-card__body';
	body.append(createTextElement('p', 'feed-card__date', formatDate(post.published_at)));
	body.append(createTextElement('p', 'feed-card__excerpt', post.text));

	const button = document.createElement('button');
	button.className = 'feed-card__action';
	button.type = 'button';
	button.textContent = 'Czytaj więcej';
	button.addEventListener('click', () => showPost(post, true));
	body.append(button);
	card.append(body);
	return card;
}

function renderPosts(items: FeedPost[]): void {
	if (!list) return;
	list.replaceChildren(...items.map(createPostCard));
}

function renderLoadState(message = ''): void {
	if (loadState) loadState.textContent = message;
}

function showPost(post: FeedPost, addHistoryEntry: boolean): void {
	if (!listView || !detailView || !detail) return;

	detail.replaceChildren();
	if (post.preview_url) {
		const image = document.createElement('img');
		image.className = 'feed-detail__image';
		image.src = post.preview_url;
		image.alt = '';
		image.addEventListener('error', () => image.remove(), { once: true });
		detail.append(image);
	}
	detail.append(
		createTextElement('p', 'feed-detail__date', formatDate(post.published_at)),
		createTextElement('h1', 'feed-detail__title', 'Szczegóły posta'),
		createTextElement('p', 'feed-detail__text', post.text)
	);

	if (post.permalink) {
		const sourceLink = document.createElement('a');
		sourceLink.className = 'feed-detail__source';
		sourceLink.href = post.permalink;
		sourceLink.target = '_blank';
		sourceLink.rel = 'noopener noreferrer';
		sourceLink.textContent = 'Zobacz oryginalny post';
		detail.append(sourceLink);
	}

	listView.hidden = true;
	detailView.hidden = false;
	if (addHistoryEntry) history.pushState({ postId: post.id }, '', `#post-${encodeURIComponent(post.id)}`);
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showFeed(): void {
	if (!listView || !detailView) return;
	detailView.hidden = true;
	listView.hidden = false;
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadMorePosts(): Promise<void> {
	if (isLoading || !hasMore) return;

	isLoading = true;
	renderLoadState(posts.length === 0 ? 'Ładowanie aktualności...' : 'Ładowanie kolejnych aktualności...');
	try {
		const page = await fetchFacebookFeed(posts.length, PAGE_SIZE);
		if (!page) {
			hasMore = false;
			renderLoadState('');
			return;
		}

		posts = [...posts, ...page.items];
		renderPosts(posts);
		hasMore = page.items.length === PAGE_SIZE;
		renderLoadState(hasMore ? '' : posts.length === 0 ? 'Brak aktualności.' : 'To już wszystkie aktualności.');
	} catch (error) {
		renderLoadState('Nie udało się załadować aktualności. Spróbuj ponownie później.');
		announce(error instanceof Error ? error.message : 'Nie udało się pobrać aktualności.');
	} finally {
		isLoading = false;
	}
}

document.querySelector<HTMLButtonElement>('[data-feed-back]')?.addEventListener('click', () => {
	history.back();
});

window.addEventListener('popstate', event => {
	const postId = (event.state as { postId?: string } | null)?.postId;
	const post = postId ? posts.find(item => item.id === postId) : undefined;
	if (post) showPost(post, false);
	else showFeed();
});

if (sentinel) {
	const observer = new IntersectionObserver(entries => {
		if (entries.some(entry => entry.isIntersecting)) void loadMorePosts();
	}, { rootMargin: '240px 0px' });
	observer.observe(sentinel);
}

void initHeader(document, announce);
void initFooter(document, announce);
void loadMorePosts();
