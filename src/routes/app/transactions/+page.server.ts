import type { Entities } from '$lib/types';
import type { PageServerLoad } from './$types';

const transactions: Entities.Transaction[] = [
	// Transações recorrentes
	{
		id: 1,
		name: 'Assinatura Netflix',
		value: 39.9,
		purchasedAt: new Date('2023-01-01'),
		firstChargeAt: new Date('2023-01-01'),
		tags: new Set(['entretenimento', 'assinatura']),
		category: 'expense',
		mode: 'recurrent'
	},
	{
		id: 2,
		name: 'Salário Mensal',
		value: 5000.0,
		purchasedAt: new Date('2023-10-01'),
		firstChargeAt: new Date('2023-10-01'),
		tags: new Set(['renda', 'mensal']),
		category: 'income',
		mode: 'recurrent'
	},
	{
		id: 3,
		name: 'Academia',
		value: 120.0,
		purchasedAt: new Date('2023-05-01'),
		firstChargeAt: new Date('2023-05-01'),
		tags: new Set(['saúde', 'assinatura']),
		category: 'expense',
		mode: 'recurrent'
	},

	// Transações de pagamento único
	{
		id: 4,
		name: 'Compra de Livro',
		value: 50.0,
		purchasedAt: new Date('2023-07-15'),
		firstChargeAt: new Date('2023-07-15'),
		tags: new Set(['educação', 'livros']),
		category: 'expense',
		mode: 'single-payment',
		numberOfInstallments: 1,
		endsAt: new Date('2023-07-15')
	},
	{
		id: 5,
		name: 'Venda de Bicicleta',
		value: 700.0,
		purchasedAt: new Date('2023-08-20'),
		firstChargeAt: new Date('2023-08-20'),
		tags: new Set(['renda', 'venda']),
		category: 'income',
		mode: 'single-payment',
		numberOfInstallments: 1,
		endsAt: new Date('2023-08-20')
	},
	{
		id: 6,
		name: 'Conserto do Carro',
		value: 800.0,
		purchasedAt: new Date('2023-09-10'),
		firstChargeAt: new Date('2023-09-10'),
		tags: new Set(['transporte', 'manutenção']),
		category: 'expense',
		mode: 'single-payment',
		numberOfInstallments: 1,
		endsAt: new Date('2023-09-10')
	},

	// Transações parceladas
	{
		id: 7,
		name: 'Compra de Celular',
		value: 3000.0,
		purchasedAt: new Date('2023-06-01'),
		firstChargeAt: new Date('2023-06-01'),
		tags: new Set(['tecnologia', 'parcelado']),
		category: 'expense',
		mode: 'in-installments',
		numberOfInstallments: 12,
		endsAt: new Date('2024-05-31')
	},
	{
		id: 8,
		name: 'Curso Online',
		value: 1500.0,
		purchasedAt: new Date('2023-03-01'),
		firstChargeAt: new Date('2023-03-01'),
		tags: new Set(['educação', 'curso']),
		category: 'expense',
		mode: 'in-installments',
		numberOfInstallments: 6,
		endsAt: new Date('2023-08-31')
	},
	{
		id: 9,
		name: 'Máquina de Lavar',
		value: 2500.0,
		purchasedAt: new Date('2023-04-15'),
		firstChargeAt: new Date('2023-04-15'),
		tags: new Set(['casa', 'eletrodoméstico']),
		category: 'expense',
		mode: 'in-installments',
		numberOfInstallments: 10,
		endsAt: new Date('2024-01-15')
	},

	// Mais transações variadas
	{
		id: 10,
		name: 'Freelance Design',
		value: 800.0,
		purchasedAt: new Date('2023-11-01'),
		firstChargeAt: new Date('2023-11-01'),
		tags: new Set(['renda', 'freelance']),
		category: 'income',
		mode: 'single-payment',
		numberOfInstallments: 1,
		endsAt: new Date('2023-11-01')
	},
	{
		id: 11,
		name: 'Pagamento de Conta de Luz',
		value: 120.0,
		purchasedAt: new Date('2023-09-05'),
		firstChargeAt: new Date('2023-09-05'),
		tags: new Set(['despesa', 'energia']),
		category: 'expense',
		mode: 'single-payment',
		numberOfInstallments: 1,
		endsAt: new Date('2023-09-05')
	},
	{
		id: 12,
		name: 'Plano de Saúde',
		value: 450.0,
		purchasedAt: new Date('2023-02-01'),
		firstChargeAt: new Date('2023-02-01'),
		tags: new Set(['saúde', 'mensalidade']),
		category: 'expense',
		mode: 'recurrent'
	},
	{
		id: 13,
		name: 'Investimento em Ações',
		value: 2000.0,
		purchasedAt: new Date('2023-06-10'),
		firstChargeAt: new Date('2023-06-10'),
		tags: new Set(['investimento', 'renda']),
		category: 'income',
		mode: 'single-payment',
		numberOfInstallments: 1,
		endsAt: new Date('2023-06-10')
	},
	{
		id: 14,
		name: 'Compra de Sapatos',
		value: 250.0,
		purchasedAt: new Date('2023-07-20'),
		firstChargeAt: new Date('2023-07-20'),
		tags: new Set(['vestuário', 'compra']),
		category: 'expense',
		mode: 'single-payment',
		numberOfInstallments: 1,
		endsAt: new Date('2023-07-20')
	},
	{
		id: 15,
		name: 'Plano de Internet',
		value: 89.9,
		purchasedAt: new Date('2023-01-01'),
		firstChargeAt: new Date('2023-01-01'),
		tags: new Set(['internet', 'assinatura']),
		category: 'expense',
		mode: 'recurrent'
	},
	{
		id: 16,
		name: 'Compra de Notebook',
		value: 6000.0,
		purchasedAt: new Date('2024-10-20'),
		firstChargeAt: new Date('2024-11-20'),
		tags: new Set(['tecnologia', 'trabalho']),
		category: 'expense',
		mode: 'in-installments',
		numberOfInstallments: 12,
		endsAt: new Date('2025-10-20')
	},
	{
		id: 17,
		name: 'Pacote de Viagem',
		value: 4500.0,
		purchasedAt: new Date('2024-11-20'),
		firstChargeAt: new Date('2024-11-20'),
		tags: new Set(['lazer', 'viagem']),
		category: 'expense',
		mode: 'in-installments',
		numberOfInstallments: 6,
		endsAt: new Date('2025-04-20')
	},
	{
		id: 18,
		name: 'Reforma da Cozinha',
		value: 8000.0,
		purchasedAt: new Date('2024-11-20'),
		firstChargeAt: new Date('2024-11-20'),
		tags: new Set(['casa', 'reforma']),
		category: 'expense',
		mode: 'in-installments',
		numberOfInstallments: 10,
		endsAt: new Date('2025-09-20')
	},
	{
		id: 19,
		name: 'Compra de Mesa de Jantar',
		value: 1500.0,
		purchasedAt: new Date('2024-11-20'),
		firstChargeAt: new Date('2024-11-20'),
		tags: new Set(['casa', 'móveis']),
		category: 'expense',
		mode: 'single-payment',
		numberOfInstallments: 1,
		endsAt: new Date('2024-11-20')
	},
	{
		id: 20,
		name: 'Consulta Médica',
		value: 300.0,
		purchasedAt: new Date('2024-11-20'),
		firstChargeAt: new Date('2024-11-20'),
		tags: new Set(['saúde', 'consulta']),
		category: 'expense',
		mode: 'single-payment',
		numberOfInstallments: 1,
		endsAt: new Date('2024-11-20')
	}
];

async function getTransactions() {
	return transactions;
}

export const load = (async (e) => {
	const transactionsPromise = getTransactions();

	const term = e.url.searchParams.get('term') || '';
	const tagsParam = e.url.searchParams.get('tags');
	const tags = tagsParam ? tagsParam.split(',') : [];

	const searchParams = {
		term,
		tags
	};

	return {
		transactions: await transactionsPromise,
		searchParams
	};
}) satisfies PageServerLoad;
