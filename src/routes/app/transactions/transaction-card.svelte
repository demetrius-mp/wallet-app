<script lang="ts">
	import type { Dayjs } from 'dayjs';
	import CheckIcon from 'lucide-svelte/icons/check';
	import CopyIcon from 'lucide-svelte/icons/copy';
	import EllipsisVerticalIcon from 'lucide-svelte/icons/ellipsis-vertical';
	import RepeatIcon from 'lucide-svelte/icons/repeat';
	import SquareIcon from 'lucide-svelte/icons/square';
	import SquareCheckIcon from 'lucide-svelte/icons/square-check';
	import SquarePenIcon from 'lucide-svelte/icons/square-pen';
	import TrashIcon from 'lucide-svelte/icons/trash';
	import { toast } from 'svelte-sonner';

	import { enhance } from '$app/forms';
	import { checkPaymentIsConfirmed, getTransactionModeLabel } from '$lib/models/transaction';
	import { badgeVariants } from '$lib/shadcn/ui/badge';
	import { buttonVariants } from '$lib/shadcn/ui/button';
	import * as Card from '$lib/shadcn/ui/card';
	import * as DropdownMenu from '$lib/shadcn/ui/dropdown-menu';
	import Separator from '$lib/shadcn/ui/separator/separator.svelte';
	import { cn } from '$lib/shadcn/utils';
	import type { Entities } from '$lib/types';
	import { dates } from '$lib/utils/dates';
	import { formatCurrency } from '$lib/utils/format-currency';

	import { useTransactionsContext } from './transactions-provider.svelte';

	type Props = {
		transaction: Entities.Transaction;
		date: Dayjs;
		selectedTags: Set<string>;
		transactionModeTags: Set<string>;
		onToggleTag: (tag: string) => void;
		onToggleTransactionModeTag: (mode: Entities.TransactionMode) => void;
	};

	let {
		transaction,
		date,
		selectedTags,
		transactionModeTags,
		onToggleTag,
		onToggleTransactionModeTag
	}: Props = $props();

	const paymentIsConfirmed = $derived(checkPaymentIsConfirmed(transaction, date));
	const matchesTransactionModeTag = $derived(transactionModeTags.has(transaction.mode));

	const { deleteTransaction, setTransactionPaymentConfirmation } = useTransactionsContext();

	const handleDelete: import('./[transactionId=int]/delete/$types').SubmitFunction = () => {
		return async ({ update, result }) => {
			if (result.type !== 'success') {
				return await update();
			}

			toast.success('Transação excluída com sucesso!');
			deleteTransaction(transaction.id);

			return await update();
		};
	};

	const handleToggleConfirmPayment: import('./[transactionId=int]/toggle-payment-confirmation/$types').SubmitFunction =
		() => {
			return async ({ update, result }) => {
				if (result.type === 'success' && result.data) {
					toast.success(result.data.message);

					const paymentConfirmationDate = result.data.paymentConfirmations.at(0)?.paidAt ?? null;

					setTransactionPaymentConfirmation(transaction.id, paymentConfirmationDate);
					return await update();
				}

				if (result.type === 'failure' && result.data) {
					toast.error(result.data.message);
					return await update();
				}

				return await update();
			};
		};
</script>

<Card.Root class="w-full">
	<Card.Header class="p-4 pb-3">
		<div class="flex items-start justify-between">
			<Card.Title class="max-w-[calc(100%-5rem)] break-words break-all pr-2">
				<a href="/app/transactions/{transaction.id}">
					{transaction.name}
				</a>
			</Card.Title>

			<div class="flex items-center gap-2">
				<form
					method="post"
					action="/app/transactions/{transaction.id}/toggle-payment-confirmation"
					use:enhance={handleToggleConfirmPayment}
				>
					<input type="hidden" name="paymentDate" value={date.format('YYYY-MM-DD')} />

					<button
						class={cn(
							buttonVariants({ variant: 'ghost' }),
							'size-8 p-0',
							paymentIsConfirmed && 'text-green-800 hover:text-green-800'
						)}
						type="submit"
					>
						{#if paymentIsConfirmed}
							<span class="sr-only">
								{transaction.category === 'EXPENSE'
									? 'Marcar como não pago'
									: 'Marcar como não recebido'}
							</span>
							<SquareCheckIcon />
						{:else}
							<span class="sr-only">
								{transaction.category === 'EXPENSE' ? 'Marcar como pago' : 'Marcar como recebido'}
							</span>
							<SquareIcon />
						{/if}
					</button>
				</form>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger class={cn(buttonVariants({ variant: 'ghost' }), 'size-8 p-0')}>
						<span class="sr-only"> Opções </span>
						<EllipsisVerticalIcon />
					</DropdownMenu.Trigger>

					<DropdownMenu.Content align="end" side="bottom">
						<DropdownMenu.Group>
							<DropdownMenu.Item class="cursor-pointer">
								{#snippet child({ props })}
									<a href="/app/transactions/{transaction.id}" {...props}>
										<SquarePenIcon class="mr-2 size-4" />
										<span>Editar</span>
									</a>
								{/snippet}
							</DropdownMenu.Item>

							<DropdownMenu.Item class="cursor-pointer">
								<CopyIcon class="mr-2 size-4" />
								<span>Copiar</span>
							</DropdownMenu.Item>

							<DropdownMenu.Item class="cursor-pointer">
								{#snippet child({ props })}
									<a href="/app/transactions/new?copyFrom={transaction.id}" {...props}>
										<RepeatIcon class="mr-2 size-4" />
										<span>Repetir</span>
									</a>
								{/snippet}
							</DropdownMenu.Item>

							<DropdownMenu.Separator />

							<DropdownMenu.Item
								class="w-full cursor-pointer text-destructive data-[highlighted]:text-destructive"
							>
								{#snippet child({ props })}
									<form
										method="post"
										action="/app/transactions/{transaction.id}/delete"
										use:enhance={handleDelete}
									>
										<button {...props} type="submit">
											<TrashIcon class="mr-2 size-4" />
											<span>Excluir</span>
										</button>
									</form>
								{/snippet}
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>
	</Card.Header>

	<Card.Content class="p-4 pt-0">
		<div class="flex items-center justify-between gap-2">
			<div>
				<span class="text-xl font-bold">
					{formatCurrency(transaction.value)}
				</span>
			</div>

			<div>
				<button
					class={cn(
						badgeVariants({
							variant: matchesTransactionModeTag ? 'default' : 'outline'
						})
					)}
					onclick={() => onToggleTransactionModeTag(transaction.mode)}
				>
					{getTransactionModeLabel(transaction.mode)}
				</button>
			</div>
		</div>

		{#if transaction.mode === 'IN_INSTALLMENTS'}
			<div class="mt-2 flex justify-between">
				<span class="text-sm text-muted-foreground">
					Total:
					{formatCurrency(transaction.value * transaction.numberOfInstallments)}
				</span>

				<span
					class={cn(
						'flex items-center gap-1 text-sm',
						transaction.paidInstallments === transaction.numberOfInstallments
							? 'text-green-800'
							: 'text-muted-foreground'
					)}
				>
					{#if transaction.paidInstallments === transaction.numberOfInstallments}
						<CheckIcon class="!size-3.5" />
					{/if}

					{#if transaction.paidInstallments === 0}
						Nenhuma parcela paga
					{:else}
						{transaction.paidInstallments} de {transaction.numberOfInstallments} parcelas
					{/if}
				</span>
			</div>
		{/if}

		<Separator class="my-4" />

		<div class="grid grid-cols-2 gap-2 text-sm">
			<span class="text-muted-foreground">Data da transação:</span>
			<span class="text-end">
				{dates.utc(transaction.purchasedAt).format('DD/MM/YYYY')}
			</span>

			{#if transaction.mode === 'IN_INSTALLMENTS'}
				<span class="text-muted-foreground">Primeira parcela:</span>
				<span class="text-end">
					{dates.utc(transaction.firstInstallmentAt).format('MM/YYYY')}
				</span>

				{#if transaction.numberOfInstallments !== transaction.paidInstallments}
					{#if transaction.lastPaymentConfirmationAt}
						<span class="text-muted-foreground">Última confirmação:</span>
						<span class="text-end">
							{dates.utc(transaction.lastPaymentConfirmationAt).format('MM/YYYY')}
						</span>
					{/if}

					<span class="text-muted-foreground">Finaliza em:</span>
					<span class="text-end">
						{dates.utc(transaction.lastInstallmentAt).format('MM/YYYY')}
					</span>

					<span class="text-muted-foreground">
						{#if transaction.category === 'EXPENSE'}
							Valor total pago:
						{:else if transaction.category === 'INCOME'}
							Valor total recebido
						{/if}
					</span>
					<span class="text-end">
						{formatCurrency(transaction.value * transaction.paidInstallments)}
					</span>

					<span class="text-muted-foreground">Valor restante:</span>
					<span class="text-end">
						{formatCurrency(
							transaction.value * (transaction.numberOfInstallments - transaction.paidInstallments)
						)}
					</span>
				{/if}
			{:else if transaction.mode === 'SINGLE_PAYMENT'}
				<span class="text-muted-foreground">
					{#if transaction.category === 'EXPENSE'}
						Data de pagamento:
					{:else if transaction.category === 'INCOME'}
						Data de recebimento
					{/if}
				</span>
				<span class="text-end">
					{dates.utc(transaction.firstInstallmentAt).format('MM/YYYY')}
				</span>
			{/if}
		</div>
	</Card.Content>

	{#if transaction.tags.size > 0}
		<Card.Footer class="block p-4 pt-0">
			<Separator class="mb-2.5" />

			<div class="flex flex-wrap items-center gap-2">
				<span class="mb-0.5"> Tags: </span>
				{#each transaction.tags as tag}
					{@const isSelected = selectedTags.has(tag)}

					<button
						class={cn(
							badgeVariants({
								variant: isSelected ? 'default' : 'outline'
							})
						)}
						onclick={() => onToggleTag(tag)}
					>
						{tag}
					</button>
				{/each}
			</div>
		</Card.Footer>
	{/if}
</Card.Root>
