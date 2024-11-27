import { db } from '$lib/server/db';
import { usersTable } from '$lib/server/db/schema';

export async function createUser(data: { email: string; name: string; password: string }) {
	const result = await db.insert(usersTable).values(data).returning();

	return result[0];
}

export async function getUserByEmail(email: string) {
	return await db.query.usersTable.findFirst({
		where: (t, { eq }) => eq(t.email, email)
	});
}
