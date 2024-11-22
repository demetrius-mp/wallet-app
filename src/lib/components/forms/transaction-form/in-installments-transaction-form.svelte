<script lang="ts">
	import {
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		startOfMonth,
		toCalendarDate
	} from '@internationalized/date';
	import CircleHelpIcon from 'lucide-svelte/icons/circle-help';
	import DivideIcon from 'lucide-svelte/icons/divide';
	import MinusIcon from 'lucide-svelte/icons/minus';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import {
		type FormOptions,
		type Infer,
		superForm,
		type SuperValidated
	} from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	import DateField from '$lib/components/form-fields/date-field.svelte';
	import MonthField from '$lib/components/form-fields/month-field.svelte';
	import TagsField from '$lib/components/form-fields/tags-field.svelte';
	import { InInstallmentsTransactionSchema } from '$lib/schemas';
	import Button, { buttonVariants } from '$lib/shadcn/ui/button/button.svelte';
	import * as Form from '$lib/shadcn/ui/form';
	import Input from '$lib/shadcn/ui/input/input.svelte';
	import * as Popover from '$lib/shadcn/ui/popover';
	import * as RadioGroup from '$lib/shadcn/ui/radio-group';
	import * as Tooltip from '$lib/shadcn/ui/tooltip';
	import { formatCurrency } from '$lib/utils/format-currency';

	type Props = {
		form: SuperValidated<Infer<typeof InInstallmentsTransactionSchema>>;
		formProps?: FormOptions<Infer<typeof InInstallmentsTransactionSchema>>;
		action: string;
	};

	let { form: data, formProps, action }: Props = $props();

	let touched = $state<{
		[key in keyof z.infer<typeof InInstallmentsTransactionSchema>]?: boolean;
	}>({});

	const form = superForm(data, {
		dataType: 'json',
		validators: zod(InInstallmentsTransactionSchema),
		validationMethod: 'onsubmit',
		...formProps
	});

	const { form: formData, enhance, submitting } = form;

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

<form method="POST" {action} use:enhance class="mt-4 flex flex-col gap-2">
	<input type="hidden" name="mode" value={$formData.mode} />

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
				</Form.Label>
				<Input
					class={$formData.mode === 'IN_INSTALLMENTS' ? 'pr-10' : ''}
					{...props}
					type="number"
					bind:value={$formData.value}
				/>

				<div class="absolute right-1 top-7">
					<Tooltip.Provider delayDuration={100}>
						<Tooltip.Root>
							<Tooltip.Trigger
								onclick={() => {
									$formData.value /= $formData.numberOfInstallments;
								}}
								class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-8' })}
							>
								<span class="sr-only"> Dividir pelas parcelas </span>
								<DivideIcon />
							</Tooltip.Trigger>
							<Tooltip.Content side="top" align="end">
								<p>Dividir pelas parcelas</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
			{/snippet}
		</Form.Control>

		<Form.Description>
			Valor total:
			<strong>
				{formatCurrency($formData.value * $formData.numberOfInstallments)}
			</strong>
		</Form.Description>

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

	<Form.Field {form} name="numberOfInstallments" class="relative">
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
					min={2}
					bind:value={$formData.numberOfInstallments}
				/>

				<div class="absolute right-1 top-7">
					<Tooltip.Provider delayDuration={100}>
						<Tooltip.Root>
							<Tooltip.Trigger
								onclick={() => {
									if ($formData.numberOfInstallments <= 2) {
										return;
									}

									$formData.numberOfInstallments -= 1;
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
				<Form.Label>Primeira parcela</Form.Label>
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

		<Form.Description>
			<span class="text-muted-foreground">
				Última parcela em
				<strong>
					{formatDate($formData.lastInstallmentAt)}
				</strong>.
			</span>
		</Form.Description>

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

	<Form.Fieldset {form} name="category" class="mt-1 space-y-3">
		<Form.Legend>Tipo da transação</Form.Legend>
		<RadioGroup.Root bind:value={$formData.category} class="flex space-x-4" name="category">
			<div class="flex items-center space-x-3 space-y-0">
				<Form.Control>
					{#snippet children({ props })}
						<RadioGroup.Item value="INCOME" {...props} />
						<Form.Label class="font-normal">Entrada</Form.Label>
					{/snippet}
				</Form.Control>
			</div>

			<div class="flex items-center space-x-3 space-y-0">
				<Form.Control>
					{#snippet children({ props })}
						<RadioGroup.Item value="EXPENSE" {...props} />
						<Form.Label class="font-normal">Saída</Form.Label>
					{/snippet}
				</Form.Control>
			</div>
		</RadioGroup.Root>
		<Form.FieldErrors />
	</Form.Fieldset>

	<div class="flex justify-end">
		<Button disabled={$submitting} type="submit">Salvar</Button>
	</div>
</form>
