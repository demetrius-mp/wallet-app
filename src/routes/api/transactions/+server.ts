import { json, type RequestHandler } from '@sveltejs/kit';
import { parse } from 'devalue';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { z } from 'zod';

import { formDataToCreateDBTransaction } from '$lib/models/transaction';
import { TransactionSchema } from '$lib/schemas';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async (e) => {
	const body = parse(await e.request.text()) as z.infer<typeof TransactionSchema>;

	const form = await superValidate(body, zod(TransactionSchema));

	if (!form.valid) {
		return json(
			{ form },
			{
				status: 400
			}
		);
	}

	const data = formDataToCreateDBTransaction(form.data);

	const transaction = await prisma.transaction.create({
		data
	});

	return json({
		transaction
	});
};
