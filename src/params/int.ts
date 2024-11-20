import type { ParamMatcher } from '@sveltejs/kit';
import { z } from 'zod';

const IntSchema = z.coerce.number().int().min(1);

export const match: ParamMatcher = (param) => {
	return IntSchema.safeParse(param).success;
};
