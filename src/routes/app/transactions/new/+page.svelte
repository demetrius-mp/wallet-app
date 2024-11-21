<script lang="ts">
	import InInstallmentsTransactionForm from '$lib/components/forms/transaction-form/in-installments-transaction-form.svelte';
	import RecurrentTransactionForm from '$lib/components/forms/transaction-form/recurrent-transaction-form.svelte';
	import SinglePaymentTransactionForm from '$lib/components/forms/transaction-form/single-payment-transaction-form.svelte';
	import PageHeading from '$lib/components/page-heading.svelte';
	import * as Tabs from '$lib/shadcn/ui/tabs';
	import type { Entities } from '$lib/types.js';

	let { data } = $props();

	let transactionMode = $state<Entities.TransactionMode>('SINGLE_PAYMENT');
</script>

<svelte:head>
	<title>Nova transação</title>
</svelte:head>

<div class="p-4">
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
			form={data.inInstallmentsTransactionForm}
			action="?/inInstallments"
		/>
	{:else if transactionMode === 'RECURRENT'}
		<RecurrentTransactionForm form={data.recurrentTransactionForm} action="?/recurrent" />
	{:else if transactionMode === 'SINGLE_PAYMENT'}
		<SinglePaymentTransactionForm
			form={data.singlePaymentTransactionForm}
			action="?/singlePayment"
		/>
	{/if}
</div>
