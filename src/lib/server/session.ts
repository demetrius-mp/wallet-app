import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { sessionsTable, usersTable } from '$lib/server/db/schema';
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

	await db.insert(sessionsTable).values(session);

	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult | null> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const result = await db
		.select({ user: usersTable, session: sessionsTable })
		.from(sessionsTable)
		.innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
		.where(eq(sessionsTable.id, sessionId));

	const data = result.at(0);

	if (data === undefined) {
		return null;
	}

	const { user, session } = data;

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));

		return null;
	}

	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

		await db
			.update(sessionsTable)
			.set({
				expiresAt: session.expiresAt
			})
			.where(eq(sessionsTable.id, session.id));
	}

	return {
		...session,
		user
	};
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
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

export type SessionValidationResult = Entities.Session & { user: Entities.User };
