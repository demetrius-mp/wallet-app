<script lang="ts" module>
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	const TransactionSchema = z
		.object({
			mode: z.enum(['RECURRENT', 'SINGLE_PAYMENT', 'IN_INSTALLMENTS']),
			name: z.string(),
			value: z.number().int().positive(),
			purchasedAt: z.string(),
			firstInstallmentAt: z.string(),
			numberOfInstallments: z.number().int().positive().nullish(),
			lastInstallmentAt: z.string().nullish(),
			tags: z.set(z.string()).default(new Set()),
			category: z.enum(['EXPENSE', 'INCOME'])
		})
		.superRefine((data, ctx) => {
			if (data.mode === 'IN_INSTALLMENTS' && (data.numberOfInstallments || 0) < 2) {
				ctx.addIssue({
					code: 'custom',
					message: 'Deve ser pelo menos 2',
					path: ['numberOfInstallments']
				});
			}
		});

	function getFormDefaults(transaction?: Entities.Transaction): z.infer<typeof TransactionSchema> {
		if (!transaction) {
			const todayDate = today(getLocalTimeZone());

			const firstChargeAt = startOfMonth(todayDate).add({ months: 1 });
			const endsAt = firstChargeAt.add({ months: 1 });

			return {
				mode: 'SINGLE_PAYMENT',
				name: '',
				category: 'EXPENSE',
				purchasedAt: todayDate.toString(),
				tags: new Set(),
				value: 0,
				numberOfInstallments: 2,
				firstInstallmentAt: firstChargeAt.toString(),
				lastInstallmentAt: endsAt.toString()
			};
		}

		switch (transaction.mode) {
			case 'RECURRENT':
				return {
					mode: 'RECURRENT',
					name: transaction.name,
					value: transaction.value,
					category: transaction.category,
					purchasedAt: dateToCalendarDate(transaction.purchasedAt).toString(),
					firstInstallmentAt: dateToCalendarDate(transaction.firstInstallmentAt).toString(),
					tags: transaction.tags
				};
			case 'SINGLE_PAYMENT':
				return {
					mode: 'SINGLE_PAYMENT',
					name: transaction.name,
					value: transaction.value,
					category: transaction.category,
					purchasedAt: dateToCalendarDate(transaction.purchasedAt).toString(),
					firstInstallmentAt: dateToCalendarDate(transaction.firstInstallmentAt).toString(),
					tags: transaction.tags,
					numberOfInstallments: 1,
					lastInstallmentAt: dateToCalendarDate(transaction.lastInstallmentAt).toString()
				};
			case 'IN_INSTALLMENTS':
				return {
					mode: 'IN_INSTALLMENTS',
					name: transaction.name,
					value: transaction.value,
					category: transaction.category,
					purchasedAt: dateToCalendarDate(transaction.purchasedAt).toString(),
					firstInstallmentAt: dateToCalendarDate(transaction.firstInstallmentAt).toString(),
					numberOfInstallments: transaction.numberOfInstallments,
					lastInstallmentAt: dateToCalendarDate(transaction.lastInstallmentAt).toString(),
					tags: transaction.tags
				};
		}
	}

	const createSuperFormData = (transaction?: Entities.Transaction) => {
		return defaults(getFormDefaults(transaction), zod(TransactionSchema));
	};
</script>

<script lang="ts">
	import * as Tooltip from '$lib/shadcn/ui/tooltip';
	import * as Tabs from '$lib/shadcn/ui/tabs';
	import DateField from '$lib/components/form-fields/date-field.svelte';
	import MonthField from '$lib/components/form-fields/month-field.svelte';
	import TagsField from '$lib/components/form-fields/tags-field.svelte';
	import Button, { buttonVariants } from '$lib/shadcn/ui/button/button.svelte';
	import * as Form from '$lib/shadcn/ui/form';
	import Input from '$lib/shadcn/ui/input/input.svelte';
	import * as Popover from '$lib/shadcn/ui/popover';
	import {
		getLocalTimeZone,
		parseDate,
		startOfMonth,
		toCalendarDate,
		today,
		DateFormatter,
		CalendarDate
	} from '@internationalized/date';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import MinusIcon from 'lucide-svelte/icons/minus';
	import CircleHelpIcon from 'lucide-svelte/icons/circle-help';
	import DivideIcon from 'lucide-svelte/icons/divide';
	import { cn } from '$lib/shadcn/utils';
	import type { Entities } from '$lib/types';
	import { dateToCalendarDate } from '$lib/utils/dates';

	type Props = {
		transaction?: Entities.Transaction;
		onCancel?: () => void;
	};

	let { transaction, onCancel }: Props = $props();

	let touched = $state<{
		[key in keyof z.infer<typeof TransactionSchema>]?: boolean;
	}>({});

	const form = superForm(createSuperFormData(transaction), {
		SPA: true,
		dataType: 'json',
		validators: zod(TransactionSchema),
		validationMethod: 'onsubmit',
		onUpdate({ form }) {
			if (!form.valid) {
				return;
			}

			console.log(form.data);
		}
	});

	const { form: formData, enhance } = form;

	function updateFormDataEndsAt() {
		if ($formData.numberOfInstallments === null || $formData.numberOfInstallments === undefined) {
			return;
		}

		$formData.lastInstallmentAt = startOfMonth(
			toCalendarDate(parseDate($formData.firstInstallmentAt))
		)
			.add({
				months: $formData.numberOfInstallments - 1
			})
			.toString();
	}

	const dateFormatter = new DateFormatter('pt-BR', {
		year: 'numeric',
		month: '2-digit'
	});

	function formatDate(date: string) {
		return dateFormatter.format(
			startOfMonth(toCalendarDate(parseDate(date))).toDate(getLocalTimeZone())
		);
	}
</script>

<Tabs.Root
	bind:value={$formData.mode}
	onValueChange={() => {
		if ($formData.mode === 'IN_INSTALLMENTS') {
			$formData.numberOfInstallments = 2;

			updateFormDataEndsAt();
		}
	}}
>
	<Tabs.List class="grid w-full grid-cols-3">
		<Tabs.Trigger value="SINGLE_PAYMENT">À vista</Tabs.Trigger>
		<Tabs.Trigger value="RECURRENT">Recorrente</Tabs.Trigger>
		<Tabs.Trigger value="IN_INSTALLMENTS">Parcelada</Tabs.Trigger>
	</Tabs.List>
</Tabs.Root>

<form method="POST" use:enhance class="flex flex-col gap-2">
	<Form.Field {form} name="name">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Nome</Form.Label>
				<Input {...props} type="text" autocomplete="off" bind:value={$formData.name} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="value" class="relative">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="inline-flex items-center justify-between gap-2">
					{#if $formData.mode === 'IN_INSTALLMENTS'}
						Valor da parcela

						<Popover.Root>
							<Popover.Trigger
								class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-4' })}
							>
								<CircleHelpIcon class="text-muted-foreground" />
							</Popover.Trigger>
							<Popover.Content side="bottom" align="center">
								<p>
									Você pode colocar o valor total da compra e dividir pelas parcelas clicando no
									<strong>botão de divisão</strong>
									(<DivideIcon class="mb-0.5 inline size-4" />).
								</p>
							</Popover.Content>
						</Popover.Root>
					{:else if $formData.mode === 'RECURRENT'}
						Valor
					{:else}
						Valor
					{/if}
				</Form.Label>
				<Input
					class={$formData.mode === 'IN_INSTALLMENTS' ? 'pr-10' : ''}
					{...props}
					type="number"
					bind:value={$formData.value}
				/>

				{#if $formData.mode === 'IN_INSTALLMENTS'}
					<div class="absolute right-1 top-7">
						<Tooltip.Provider delayDuration={100}>
							<Tooltip.Root>
								<Tooltip.Trigger
									onclick={() => {
										if (
											$formData.numberOfInstallments === null ||
											$formData.numberOfInstallments === undefined
										) {
											return;
										}

										$formData.value /= $formData.numberOfInstallments;
									}}
									class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-8' })}
								>
									<DivideIcon />
								</Tooltip.Trigger>
								<Tooltip.Content side="top" align="end">
									<p>Dividir pelas parcelas</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>
				{/if}
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="purchasedAt">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Data da compra</Form.Label>
				<DateField
					{...props}
					bind:value={$formData.purchasedAt}
					onValueChange={(v) => {
						if (!v) return;
						if (touched.firstInstallmentAt) return;

						$formData.firstInstallmentAt = toCalendarDate(v).add({ months: 1 }).toString();

						updateFormDataEndsAt();
					}}
				/>
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field
		{form}
		name="numberOfInstallments"
		class={cn('relative', $formData.mode !== 'IN_INSTALLMENTS' && 'hidden')}
	>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Parcelas</Form.Label>
				<Input
					oninput={() => {
						if (!$formData.firstInstallmentAt || !$formData.numberOfInstallments) return;

						updateFormDataEndsAt();
					}}
					{...props}
					type="number"
					class="pr-20"
					min={$formData.mode === 'IN_INSTALLMENTS' ? 2 : 0}
					bind:value={$formData.numberOfInstallments}
				/>

				<div class="absolute right-1 top-7">
					<Tooltip.Provider delayDuration={100}>
						<Tooltip.Root>
							<Tooltip.Trigger
								onclick={() => {
									if (
										$formData.numberOfInstallments === null ||
										$formData.numberOfInstallments === undefined
									) {
										return;
									}

									if ($formData.numberOfInstallments > 2) {
										$formData.numberOfInstallments -= 1;
									}

									updateFormDataEndsAt();
								}}
								class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-8' })}
							>
								<MinusIcon />
							</Tooltip.Trigger>
							<Tooltip.Content side="top" align="end">
								<p>Diminuir</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>

					<Tooltip.Provider delayDuration={100}>
						<Tooltip.Root>
							<Tooltip.Trigger
								onclick={() => {
									if (
										$formData.numberOfInstallments === null ||
										$formData.numberOfInstallments === undefined
									) {
										return;
									}

									$formData.numberOfInstallments += 1;
									updateFormDataEndsAt();
								}}
								class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-8' })}
							>
								<PlusIcon />
							</Tooltip.Trigger>
							<Tooltip.Content side="top" align="end">
								<p>Aumentar</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="firstInstallmentAt">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>
					{#if $formData.mode === 'SINGLE_PAYMENT'}
						Data da cobrança
					{:else if $formData.mode === 'RECURRENT'}
						Primeiro pagamento
					{:else}
						Primeira parcela
					{/if}
				</Form.Label>
				<MonthField
					{...props}
					bind:value={$formData.firstInstallmentAt}
					minValue={startOfMonth(parseDate($formData.purchasedAt))}
					onValueChange={(date) => {
						if (!date || !$formData.numberOfInstallments) return;

						touched.firstInstallmentAt = true;

						updateFormDataEndsAt();
					}}
				/>
			{/snippet}
		</Form.Control>

		{#if $formData.mode === 'IN_INSTALLMENTS' && $formData.lastInstallmentAt}
			<Form.Description>
				<span class="text-muted-foreground">
					Última parcela em
					<strong>
						{formatDate($formData.lastInstallmentAt)}
					</strong>.
				</span>
			</Form.Description>
		{/if}

		<Form.FieldErrors />
	</Form.Field>

	<input type="hidden" name="lastInstallmentAt" value={$formData.lastInstallmentAt} />

	<Form.Field {form} name="tags">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Tags</Form.Label>

				<TagsField bind:value={$formData.tags} {...props} />
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<div class="mt-4 flex flex-row-reverse gap-4">
		<Button type="submit">Salvar</Button>
		<Button onclick={onCancel} variant="secondary" type="button">Cancelar</Button>
	</div>
</form>
