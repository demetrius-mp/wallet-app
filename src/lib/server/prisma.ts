import { Prisma, PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient().$extends({
	model: {
		$allModels: {
			async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
				// Get the current model at runtime
				const context = Prisma.getExtensionContext(this);

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const result = await (context as any).findFirst({ where });
				return result !== null;
			}
		}
	}
});
