<script lang="ts">
	import type { FormOptions } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { goto } from '$app/navigation';
	import InInstallmentsTransactionForm from '$lib/components/forms/transaction-form/in-installments-transaction-form.svelte';
	import RecurrentTransactionForm from '$lib/components/forms/transaction-form/recurrent-transaction-form.svelte';
	import SinglePaymentTransactionForm from '$lib/components/forms/transaction-form/single-payment-transaction-form.svelte';
	import MetaTags from '$lib/components/meta-tags.svelte';
	import * as PageHeading from '$lib/components/page-heading';
	import { convertTransaction } from '$lib/models/transaction.js';
	import type { BaseTransactionSchema } from '$lib/schemas.js';
	import * as Tabs from '$lib/shadcn/ui/tabs';
	import type { Entities, GetActionResultFromActions } from '$lib/types.js';
	import { dates } from '$lib/utils/dates';

	import { useTransactionsContext } from '../transactions-provider.svelte';

	let { data } = $props();

	let transactionMode = $state<Entities.TransactionMode>('SINGLE_PAYMENT');

	let baseFormData = $state<z.infer<typeof BaseTransactionSchema> | undefined>(undefined);

	const { addTransaction, getTransactionById } = useTransactionsContext();

	if (data.copyFrom !== null) {
		const transaction = getTransactionById(data.copyFrom);

		if (transaction) {
			console.log(transaction.tags);
			baseFormData = {
				name: transaction.name,
				category: transaction.category,
				firstInstallmentAt: dates().utc(true).format('YYYY-MM-DD'),
				purchasedAt: dates().utc(true).format('YYYY-MM-DD'),
				tags: transaction.tags,
				value: transaction.value
			};
		}
	}

	const formProps: FormOptions = {
		onUpdate: async (e) => {
			const result = e.result as GetActionResultFromActions<
				typeof import('./+page.server.js').actions
			>;
			if (result.type !== 'success') return;

			if (!result.data) return;

			const transaction = convertTransaction({
				...result.data.transaction,
				paymentConfirmations: []
			});

			addTransaction(transaction);
			await goto('/app/transactions');
		}
	};
</script>

<MetaTags title="Nova transação" />

<PageHeading.Root>
	<PageHeading.Return href="/app/transactions">Transações</PageHeading.Return>

	<PageHeading.Title>Nova transação</PageHeading.Title>

	<PageHeading.Description>
		Crie uma nova transação informando os dados abaixo.
	</PageHeading.Description>
</PageHeading.Root>

<Tabs.Root bind:value={transactionMode}>
	<Tabs.List class="grid w-full grid-cols-3">
		<Tabs.Trigger value="SINGLE_PAYMENT">À vista</Tabs.Trigger>
		<Tabs.Trigger value="RECURRENT">Recorrente</Tabs.Trigger>
		<Tabs.Trigger value="IN_INSTALLMENTS">Parcelada</Tabs.Trigger>
	</Tabs.List>
</Tabs.Root>

{#if transactionMode === 'IN_INSTALLMENTS'}
	<InInstallmentsTransactionForm
		bind:baseFormData
		form={data.inInstallmentsTransactionForm}
		action="?/inInstallments"
		{formProps}
	/>
{:else if transactionMode === 'RECURRENT'}
	<RecurrentTransactionForm
		bind:baseFormData
		form={data.recurrentTransactionForm}
		action="?/recurrent"
		{formProps}
	/>
{:else if transactionMode === 'SINGLE_PAYMENT'}
	<SinglePaymentTransactionForm
		bind:baseFormData
		form={data.singlePaymentTransactionForm}
		action="?/singlePayment"
		{formProps}
	/>
{/if}
