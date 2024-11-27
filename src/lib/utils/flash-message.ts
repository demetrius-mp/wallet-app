import type { Cookies } from '@sveltejs/kit';
import { serialize } from 'cookie';
import { parse, stringify } from 'devalue';

import { browser } from '$app/environment';

const FLASH_MESSAGE_COOKIE_NAME = 'flashMessage';

const FLASH_MESSAGE_COOKIE_OPTIONS = {
	path: '/',
	sameSite: 'strict',
	httpOnly: false
} as const;

/**
 * Sets a flash message on the server. Can be used from within server actions or server load functions.
 * @param options Options for the flash message
 * @param event Server event
 */
export function setFlashMessage(event: { cookies: Cookies }, options: App.FlashMessage) {
	const stringified = stringify(options);

	event.cookies.set(FLASH_MESSAGE_COOKIE_NAME, stringified, {
		...FLASH_MESSAGE_COOKIE_OPTIONS,
		maxAge: 120
	});
}

/**
 * Gets the flash message, if any, from the cookies. Use this in your root `+layout.server.ts` to pass the message to the `+layout.svelte`.
 * @param cookies Cookies object
 */
export function getFlashMessage(cookies: Cookies): App.FlashMessage | null {
	const value = cookies.get(FLASH_MESSAGE_COOKIE_NAME);

	if (!value) return null;

	return parse(value);
}

/**
 * Clears the flash message cookie. Use this in your root `+layout.svelte` after you have displayed the flash message.
 */
export function clearFlashMessage() {
	if (!browser) return;

	document.cookie = serialize(FLASH_MESSAGE_COOKIE_NAME, '', {
		...FLASH_MESSAGE_COOKIE_OPTIONS,
		maxAge: 0
	});
}
