import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';

import { DATABASE_URL } from '$env/static/private';

import * as schema from './schema';

export const db = drizzle(DATABASE_URL, {
	schema
});
