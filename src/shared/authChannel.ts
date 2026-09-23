const CHANNEL_NAME = 'impact-auth';

type AuthBroadcastMessage = { type: 'logout' };

const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;

/** Tell other open tabs the session ended. Never send the session token or any private data. */
export function broadcastLogout(): void {
	channel?.postMessage({ type: 'logout' } satisfies AuthBroadcastMessage);
}

export function onRemoteLogout(callback: () => void): void {
	channel?.addEventListener('message', event => {
		const message = event.data as AuthBroadcastMessage;
		if (message?.type === 'logout') callback();
	});
}
