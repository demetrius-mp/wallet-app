<script lang="ts">
	import type { ActionFailure } from '@sveltejs/kit';
	import type { FormOptions } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { goto } from '$app/navigation';
	import InInstallmentsTransactionForm from '$lib/components/forms/transaction-form/in-installments-transaction-form.svelte';
	import RecurrentTransactionForm from '$lib/components/forms/transaction-form/recurrent-transaction-form.svelte';
	import SinglePaymentTransactionForm from '$lib/components/forms/transaction-form/single-payment-transaction-form.svelte';
	import MetaTags from '$lib/components/meta-tags.svelte';
	import PageHeading from '$lib/components/page-heading.svelte';
	import type { BaseTransactionSchema } from '$lib/schemas.js';
	import * as Tabs from '$lib/shadcn/ui/tabs';
	import type { Entities } from '$lib/types.js';

	let { data } = $props();

	let transactionMode = $state<Entities.TransactionMode>('SINGLE_PAYMENT');

	let baseFormData = $state<z.infer<typeof BaseTransactionSchema> | undefined>(undefined);

	type ActionsExport = typeof import('./+page.server.js').actions;

	type ExcludeActionFailure<T> = T extends ActionFailure<any> ? never : T extends void ? never : T;

	type ActionsSuccess<T extends Record<string, (...args: any) => any>> = {
		[Key in keyof T]: ExcludeActionFailure<Awaited<ReturnType<T[Key]>>>;
	}[keyof T];

	type ExtractActionFailure<T> =
		T extends ActionFailure<infer X> ? (X extends void ? never : X) : never;

	type ActionsFailure<T extends Record<string, (...args: any) => any>> = {
		[Key in keyof T]: Exclude<ExtractActionFailure<Awaited<ReturnType<T[Key]>>>, void>;
	}[keyof T];

	type S = ActionsSuccess<ActionsExport>['transaction'];
	type V = ActionsFailure<ActionsExport>;

	const formProps: FormOptions = {
		onUpdate: async ({ result }) => {
			if (result.type !== 'success') return;

			const transaction = result.data.transaction;

			await goto('/app/transactions');
		}
	};
</script>

<MetaTags title="Nova transação" />

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
</div>
