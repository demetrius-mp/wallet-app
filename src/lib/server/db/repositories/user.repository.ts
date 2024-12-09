import { db } from '$lib/server/db';
import { usersTable } from '$lib/server/db/schema';

export class UserRepository {
	async createUser(props: { email: string; name: string; password: string }) {
		const result = await db.insert(usersTable).values(props).returning();

		return result[0];
	}

	async getUserByEmail(props: { email: string }) {
		const { email } = props;

		return await db.query.usersTable.findFirst({
			where: (t, { eq }) => eq(t.email, email)
		});
	}
}
