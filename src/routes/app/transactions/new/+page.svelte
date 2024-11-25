<script lang="ts">
	import type { FormOptions } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { goto } from '$app/navigation';
	import Container from '$lib/components/container.svelte';
	import InInstallmentsTransactionForm from '$lib/components/forms/transaction-form/in-installments-transaction-form.svelte';
	import RecurrentTransactionForm from '$lib/components/forms/transaction-form/recurrent-transaction-form.svelte';
	import SinglePaymentTransactionForm from '$lib/components/forms/transaction-form/single-payment-transaction-form.svelte';
	import MetaTags from '$lib/components/meta-tags.svelte';
	import PageHeading from '$lib/components/page-heading.svelte';
	import { convertTransaction } from '$lib/models/transaction.js';
	import type { BaseTransactionSchema } from '$lib/schemas.js';
	import * as Tabs from '$lib/shadcn/ui/tabs';
	import type { Entities, GetActionResultFromActions } from '$lib/types.js';

	import { useTransactionsContext } from '../transactions-provider.svelte';

	let { data } = $props();

	let transactionMode = $state<Entities.TransactionMode>('SINGLE_PAYMENT');

	let baseFormData = $state<z.infer<typeof BaseTransactionSchema> | undefined>(undefined);

	const { addTransaction } = useTransactionsContext();

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

<Container>
	<PageHeading
		title="Nova transação"
		description="Crie uma nova transação informando os dados abaixo."
		returnTo={{
			href: '/app/transactions',
			label: 'Transações'
		}}
	/>

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
</Container>
