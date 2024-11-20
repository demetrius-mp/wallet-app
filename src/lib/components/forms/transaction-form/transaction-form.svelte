<script lang="ts" module>
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	const TransactionSchema = z
		.object({
			mode: z.enum(['recurrent', 'single-payment', 'in-installments']),
			name: z.string(),
			value: z.number().int().positive(),
			purchasedAt: z.string(),
			firstChargeAt: z.string(),
			numberOfInstallments: z.number().int().positive().nullish(),
			endsAt: z.string().nullish(),
			tags: z.set(z.string()).default(new Set()),
			category: z.enum(['expense', 'income'])
		})
		.superRefine((data, ctx) => {
			if (data.mode === 'in-installments' && (data.numberOfInstallments || 0) < 2) {
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
				mode: 'single-payment',
				name: '',
				category: 'expense',
				purchasedAt: todayDate.toString(),
				tags: new Set(),
				value: 0,
				numberOfInstallments: 2,
				firstChargeAt: firstChargeAt.toString(),
				endsAt: endsAt.toString()
			};
		}

		switch (transaction.mode) {
			case 'recurrent':
				return {
					mode: 'recurrent',
					name: transaction.name,
					value: transaction.value,
					category: transaction.category,
					purchasedAt: dateToCalendarDate(transaction.purchasedAt).toString(),
					firstChargeAt: dateToCalendarDate(transaction.firstChargeAt).toString(),
					tags: transaction.tags
				};
			case 'single-payment':
				return {
					mode: 'single-payment',
					name: transaction.name,
					value: transaction.value,
					category: transaction.category,
					purchasedAt: dateToCalendarDate(transaction.purchasedAt).toString(),
					firstChargeAt: dateToCalendarDate(transaction.firstChargeAt).toString(),
					tags: transaction.tags,
					numberOfInstallments: 1,
					endsAt: dateToCalendarDate(transaction.endsAt).toString()
				};
			case 'in-installments':
				return {
					mode: 'in-installments',
					name: transaction.name,
					value: transaction.value,
					category: transaction.category,
					purchasedAt: dateToCalendarDate(transaction.purchasedAt).toString(),
					firstChargeAt: dateToCalendarDate(transaction.firstChargeAt).toString(),
					numberOfInstallments: transaction.numberOfInstallments,
					endsAt: dateToCalendarDate(transaction.endsAt).toString(),
					tags: transaction.tags
				};
		}
	}

	const createSuperFormData = (transaction?: Entities.Transaction) => {
		return defaults(getFormDefaults(transaction), zod(TransactionSchema));
	};

	function dateToCalendarDate(date: Date) {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();

		return new CalendarDate(year, month, day);
	}
</script>

<script lang="ts">
	import * as Tabs from '$lib/shadcn/ui/tabs';
	import DateField from '$lib/components/form-fields/date-field.svelte';
	import MonthField from '$lib/components/form-fields/month-field.svelte';
	import TagsField from '$lib/components/form-fields/tags-field.svelte';
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import * as Form from '$lib/shadcn/ui/form';
	import Input from '$lib/shadcn/ui/input/input.svelte';
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
	import { cn } from '$lib/shadcn/utils';
	import type { Entities } from '$lib/types';

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

		$formData.endsAt = startOfMonth(toCalendarDate(parseDate($formData.firstChargeAt)))
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
		if ($formData.mode === 'in-installments') {
			$formData.numberOfInstallments = 2;

			updateFormDataEndsAt();
		}
	}}
>
	<Tabs.List class="grid w-full grid-cols-3">
		<Tabs.Trigger value="single-payment">À vista</Tabs.Trigger>
		<Tabs.Trigger value="recurrent">Recorrente</Tabs.Trigger>
		<Tabs.Trigger value="in-installments">Parcelada</Tabs.Trigger>
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

	<Form.Field {form} name="value">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>
					{#if $formData.mode === 'in-installments'}
						Valor da parcela
					{:else if $formData.mode === 'recurrent'}
						Valor
					{:else}
						Valor
					{/if}
				</Form.Label>
				<Input {...props} type="number" bind:value={$formData.value} />
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
						if (touched.firstChargeAt) return;

						$formData.firstChargeAt = toCalendarDate(v).add({ months: 1 }).toString();

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
		class={cn('relative', $formData.mode !== 'in-installments' && 'hidden')}
	>
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Parcelas</Form.Label>
				<Input
					onchange={() => {
						if (!$formData.firstChargeAt || !$formData.numberOfInstallments) return;

						updateFormDataEndsAt();
					}}
					{...props}
					type="number"
					class="pr-20"
					min={$formData.mode === 'in-installments' ? 2 : 0}
					bind:value={$formData.numberOfInstallments}
				/>

				<div class="absolute right-1 top-7">
					<Button
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
						}}
						variant="ghost"
						size="icon"
						class="size-8"
					>
						<MinusIcon />
					</Button>

					<Button
						onclick={() => {
							if (
								$formData.numberOfInstallments === null ||
								$formData.numberOfInstallments === undefined
							) {
								return;
							}

							$formData.numberOfInstallments += 1;
						}}
						variant="ghost"
						size="icon"
						class="size-8"
					>
						<PlusIcon />
					</Button>
				</div>
			{/snippet}
		</Form.Control>

		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="firstChargeAt">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>
					{#if $formData.mode === 'single-payment'}
						Data da cobrança
					{:else if $formData.mode === 'recurrent'}
						Primeiro pagamento
					{:else}
						Primeira parcela
					{/if}
				</Form.Label>
				<MonthField
					{...props}
					bind:value={$formData.firstChargeAt}
					minValue={startOfMonth(parseDate($formData.purchasedAt))}
					onValueChange={(date) => {
						if (!date || !$formData.numberOfInstallments) return;

						touched.firstChargeAt = true;

						updateFormDataEndsAt();
					}}
				/>
			{/snippet}
		</Form.Control>

		{#if $formData.mode === 'in-installments' && $formData.endsAt}
			<Form.Description>
				<span class="text-muted-foreground">
					Última parcela em
					<strong>
						{formatDate($formData.endsAt)}
					</strong>.
				</span>
			</Form.Description>
		{/if}

		<Form.FieldErrors />
	</Form.Field>

	<input type="hidden" name="endsAt" value={$formData.endsAt} />

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
