import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';

import { SessionRepository } from '$lib/server/db/repositories/session.repository';
import type { Entities } from '$lib/types';

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);

	return token;
}

export async function createSession(token: string, userId: number): Promise<Entities.Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const session: Entities.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};

	const repository = new SessionRepository();

	await repository.createSession(session);

	return session;
}

export async function validateSessionToken(token: string): Promise<Entities.AuthSession | null> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const repository = new SessionRepository();
	const data = await repository.getSessionAndUser({ sessionId });

	if (data === null) return null;

	const { user, session } = data;

	if (Date.now() >= session.expiresAt.getTime()) {
		await repository.deleteSession({ sessionId });

		return null;
	}

	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

		await repository.updateSessionExpiration({
			sessionId: session.id,
			expiresAt: session.expiresAt
		});
	}

	return {
		...session,
		user
	};
}

export async function invalidateSession(sessionId: string): Promise<void> {
	const repository = new SessionRepository();

	await repository.deleteSession({ sessionId });
}

const SESSION_COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: 'lax',
	path: '/'
} as const;

const SESSION_COOKIE_NAME = 'session';

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set(SESSION_COOKIE_NAME, token, {
		...SESSION_COOKIE_OPTIONS,
		expires: expiresAt
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set(SESSION_COOKIE_NAME, '', {
		...SESSION_COOKIE_OPTIONS,
		maxAge: 0
	});
}
