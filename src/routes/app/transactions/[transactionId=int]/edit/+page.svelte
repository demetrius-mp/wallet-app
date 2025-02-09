<script lang="ts">
	import type { FormOptions } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { goto } from '$app/navigation';
	import InInstallmentsTransactionForm from '$lib/components/forms/transaction-form/in-installments-transaction-form.svelte';
	import RecurrentTransactionForm from '$lib/components/forms/transaction-form/recurrent-transaction-form.svelte';
	import SinglePaymentTransactionForm from '$lib/components/forms/transaction-form/single-payment-transaction-form.svelte';
	import UpdateTransactionForm from '$lib/components/forms/transaction-form/update-transaction-form.svelte';
	import MetaTags from '$lib/components/meta-tags.svelte';
	import * as PageHeading from '$lib/components/page-heading';
	import { convertTransaction } from '$lib/models/transaction.js';
	import type { BaseTransactionSchema } from '$lib/schemas.js';
	import * as Tabs from '$lib/shadcn/ui/tabs';
	import type { Entities, GetActionResultFromActions } from '$lib/types.js';

	import { useTransactionsContext } from '../../transactions-provider.svelte';

	let { data } = $props();

	let transactionMode = $state<Entities.TransactionMode>(data.transaction.mode);
	let baseFormData = $state<z.infer<typeof BaseTransactionSchema> | undefined>(undefined);

	const { updateTransaction } = useTransactionsContext();

	const formProps: FormOptions = {
		onUpdate: async (e) => {
			const result = e.result as GetActionResultFromActions<
				typeof import('./+page.server.js').actions
			>;
			if (result.type !== 'success') return;

			if (!result.data) return;

			const { lastPaymentConfirmationAt, ...transaction } = convertTransaction({
				...result.data.transaction,
				paymentConfirmations: []
			});

			updateTransaction(data.transaction.id, {
				...transaction,
				lastPaymentConfirmationAt: data.transaction.lastPaymentConfirmationAt
			});

			await goto('/app/transactions');
		}
	};
</script>

<MetaTags title="Transações - Editar transação" />

{#if data.transaction.lastPaymentConfirmationAt !== null}
	<PageHeading.Root>
		<PageHeading.Return href="/app/transactions">Transações</PageHeading.Return>

		<PageHeading.Title>Editar transação</PageHeading.Title>

		<PageHeading.Description>
			Essa transação já possui uma confirmação de pagamento, então você não poderá alterar
			informações como número de parcelas ou datas.
		</PageHeading.Description>
	</PageHeading.Root>

	<UpdateTransactionForm form={data.updateTransactionForm} {formProps} action="?/update" />
{:else}
	<PageHeading.Root>
		<PageHeading.Return href="/app/transactions">Transações</PageHeading.Return>

		<PageHeading.Title>Editar transação</PageHeading.Title>

		<PageHeading.Description>Edite abaixo os dados da transação.</PageHeading.Description>
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
{/if}
