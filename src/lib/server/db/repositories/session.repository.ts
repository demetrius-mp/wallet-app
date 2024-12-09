import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { sessionsTable, usersTable } from '$lib/server/db/schema';
import type { Entities } from '$lib/types';

export class SessionRepository {
	async createSession(props: Entities.Session): Promise<Entities.Session> {
		await db.insert(sessionsTable).values(props);

		return props;
	}

	async getSessionAndUser(props: {
		sessionId: string;
	}): Promise<{ session: Entities.Session; user: Entities.User } | null> {
		const { sessionId } = props;

		const result = await db
			.select({ user: usersTable, session: sessionsTable })
			.from(sessionsTable)
			.innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
			.where(eq(sessionsTable.id, sessionId));

		const data = result.at(0);

		if (data === undefined) {
			return null;
		}

		return data;
	}

	async deleteSession(props: { sessionId: string }): Promise<void> {
		const { sessionId } = props;

		await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
	}

	async updateSessionExpiration(props: { sessionId: string; expiresAt: Date }): Promise<void> {
		const { sessionId, expiresAt } = props;

		await db
			.update(sessionsTable)
			.set({
				expiresAt
			})
			.where(eq(sessionsTable.id, sessionId));
	}
}
